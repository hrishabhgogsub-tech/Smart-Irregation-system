console.log("script.js loaded");

const ESP32_URL = "http://10.146.167.96";
if(
    localStorage.getItem(
        "loggedIn"
    ) !== "true"
){

    window.location.href =
    "login.html";
}
const cropThresholds = {

    Rice: 60,
    Wheat: 40,
    Tomato: 35,
    Cotton: 30

};

let moistureValue = 32;

function speak(text, language = "en-IN") {

    const speech =
    new SpeechSynthesisUtterance(text);

    const voices =
    speechSynthesis.getVoices();

    if(language === "hi-IN"){

        const hindiVoice =
        voices.find(
            voice => voice.lang === "hi-IN"
        );

        if(hindiVoice){
            speech.voice =
            hindiVoice;
        }
    }

    speech.lang =
    language;

    speech.rate = 1;

    speech.pitch = 1;

    speechSynthesis.speak(
        speech
    );
}

async function startPump(){

    try{
        await fetch(`${ESP32_URL}/pump/on`);
        localStorage.setItem("mode", "Manual");
        autoMode = false;
        setPumpStatus("ON", "Manual");
        updateModeDisplay("MANUAL");
        addHistory("Manual Pump Started");
        showToast("🚿 Pump Started");
        fetchESP32Data();
    }
    catch(error){
        showToast("⚠ ESP32 not reachable");
        console.log(error);
    }
}

async function stopPump(){

    try{
        await fetch(`${ESP32_URL}/pump/off`);
        localStorage.setItem("mode", "Manual");
        autoMode = false;
        setPumpStatus("OFF", "Manual");
        updateModeDisplay("MANUAL");
        addHistory("Manual Pump Stopped");
        showToast("🛑 Pump Stopped");
        fetchESP32Data();
    }
    catch(error){
        showToast("⚠ ESP32 not reachable");
        console.log(error);
    }
}

function addHistory(message){

    const list = document.getElementById("historyList");

    if(!list){
        return;
    }

    const time = new Date().toLocaleString();
    const entry = `${time} - ${message}`;

    const history = JSON.parse(localStorage.getItem("irrigationHistory")) || [];
    history.unshift(entry);
    localStorage.setItem("irrigationHistory", JSON.stringify(history.slice(0, 20)));

    const item = document.createElement("li");
    item.innerText = entry;
    list.prepend(item);
}

function updateMoisture(value){

    moistureValue = Number(value);

    document.getElementById(
        "sliderValue"
    ).innerText =
    value + "%";

    document.getElementById(
        "soilMoisture"
    ).innerText =
    value + "%";

    updateAIRecommendation();

    if(autoMode){

        runAutoMode();
    }
}

function getRecommendation(
    moisture,
    rainProbability,
    crop
){

    const threshold =
    cropThresholds[crop];

    if(
        moisture < threshold &&
        rainProbability < 70
    ){
        return "💧 Water Now";
    }

    if(rainProbability >= 70){
        return "🌧 Wait For Rain";
    }

    return "📊 Monitor Conditions";
}

const selectedCrop =
localStorage.getItem("crop")
|| "Tomato";

const selectedThreshold =
localStorage.getItem("threshold")
|| 35;

const cropCard =
document.getElementById(
    "cropName"
);

if(cropCard){

    cropCard.innerText =
    selectedCrop;
}

const thresholdCard =
document.getElementById(
    "thresholdDisplay"
);

if(thresholdCard){

    thresholdCard.innerText =
    selectedThreshold + "%";
}

let autoMode = localStorage.getItem("mode") === "Auto";

let lastPumpStatus = document.getElementById("pumpStatus")?.innerText || "OFF";

function setPumpStatus(status, source){

    const pumpStatus = document.getElementById("pumpStatus");

    if(!pumpStatus){
        return;
    }

    if(lastPumpStatus !== status){
        addHistory(`${source} Pump ${status === "ON" ? "Started" : "Stopped"}`);
    }

    pumpStatus.innerText = status;
    lastPumpStatus = status;
}

function loadHistory(){

    const list = document.getElementById("historyList");
    if(!list){
        return;
    }

    list.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("irrigationHistory")) || [];

    history.forEach(entry => {
        const item = document.createElement("li");
        item.innerText = entry;
        list.appendChild(item);
    });
}

function toggleSidebar(){
    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".overlay");

    if(sidebar){
        sidebar.classList.toggle("open");
    }

    if(overlay){
        overlay.classList.toggle("show");
    }
}

function closeSidebar(){
    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".overlay");

    if(sidebar){
        sidebar.classList.remove("open");
    }

    if(overlay){
        overlay.classList.remove("show");
    }
}


function updateModeDisplay(mode){
    const autoModeElement = document.getElementById("autoMode");
    if(autoModeElement){
        autoModeElement.innerText = mode;
    }
}

function updateLiveSoilValue(rawSoil){
    const soilElement = document.getElementById("soilMoisture");
    if(soilElement){
        soilElement.innerText = rawSoil;
    }

    // Keep the local AI card roughly aligned with raw data.
    // Dry is high on this sensor. 4095 is dry, 1100 is wet.
    const moisturePercent = Math.max(0, Math.min(100, Math.round((4095 - Number(rawSoil)) / (4095 - 1100) * 100)));
    moistureValue = moisturePercent;

    const sliderValue = document.getElementById("sliderValue");
    if(sliderValue){
        sliderValue.innerText = moisturePercent + "%";
    }

    const slider = document.getElementById("moistureSlider");
    if(slider){
        slider.value = moisturePercent;
    }
}

async function fetchESP32Data(){
    try{
        const response = await fetch(`${ESP32_URL}/data`, { cache: "no-store" });
        const data = await response.json();

        updateLiveSoilValue(data.soil);
        setPumpStatus(data.pump, "ESP32");
        updateModeDisplay(data.mode);
        autoMode = data.mode === "AUTO";
        localStorage.setItem("mode", autoMode ? "Auto" : "Manual");
        updateAIRecommendation();

        return data;
    }
    catch(error){
        console.log("ESP32 offline", error);
        const pumpElement = document.getElementById("pumpStatus");
        if(pumpElement){
            pumpElement.innerText = "OFFLINE";
        }
    }
}

function createBottomNav(){
    if(document.querySelector(".bottom-nav")){
        return;
    }

    const current = window.location.pathname.split("/").pop() || "dashboard.html";

    const links = [
        ["dashboard.html", "🏠", "Dashboard"],
        ["analytics.html", "📈", "Analytics"],
        ["action.html", "🚿", "Actions"],
        ["info.html", "ℹ", "Info"],
        ["settings.html", "⚙", "Settings"]
    ];

    const nav = document.createElement("nav");
    nav.className = "bottom-nav";

    links.forEach(link => {
        const anchor = document.createElement("a");
        anchor.href = link[0];

        if(current === link[0] || (current === "" && link[0] === "dashboard.html")){
            anchor.className = "active";
        }

        anchor.innerHTML = `<span>${link[1]}</span><span>${link[2]}</span>`;
        nav.appendChild(anchor);
    });

    document.body.appendChild(nav);
}

let lastAnnouncement = "";

function updateAIRecommendation(){

    let moisture =
    moistureValue;

    let recommendation =
    getRecommendation(
        moisture,
        rainProbability,
        selectedCrop
    );

    const recommendationElement =
    document.getElementById(
        "recommendation"
    );

    if(recommendationElement){

        recommendationElement.innerText =
        recommendation;
    }

    const aiReason =
    document.getElementById(
        "aiReason"
    );

    if(aiReason){

        aiReason.innerText =
        `Rain Probability: ${rainProbability}% | Threshold: ${cropThresholds[selectedCrop]}%`;
    }

}

const ctx = document.getElementById('moistureChart');

if(ctx && window.Chart){
    new Chart(ctx, {
        type: 'line',

        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

            datasets: [{
                label: 'Soil Moisture (%)',
                data: [32, 35, 28, 40, 38, 45]
            }]
        }
    });
}



async function enableAutoMode(){

    try{
        await fetch(`${ESP32_URL}/auto`);
        autoMode = true;
        localStorage.setItem("mode", "Auto");
        updateModeDisplay("AUTO");
        addHistory("Auto Mode Enabled");
        showToast("🤖 Auto Mode Enabled");
        fetchESP32Data();
    }
    catch(error){
        showToast("⚠ ESP32 not reachable");
        console.log(error);
    }
}

function toggleAutoMode(){
    enableAutoMode();
}

function announceDecision(
    moisture,
    threshold,
    rainProbability
){

    let message = "";

    if(rainProbability >= 70){

        message =
        "कल बारिश की संभावना अधिक है। सिंचाई रोक दी गई है।";

    }
    else if(moisture < threshold){

        message =
        "मिट्टी में नमी कम है। सिंचाई शुरू की जा रही है।";

    }
    else{

        message =
        "सिंचाई की आवश्यकता नहीं है।";
    }

    if(message !== lastAnnouncement){

        lastAnnouncement =
        message;

        speak(
            message,
            "hi-IN"
        );
    }
}

function runAutoMode(){

    let moisture =
    moistureValue;

    let rain =
    rainProbability;

    let crop = selectedCrop;

    let threshold =
    cropThresholds[crop];

    announceDecision(
        moisture,
        threshold,
        rainProbability
    );

    if(autoMode){

        if(
            weatherCondition === "Rain"
        ){
            setPumpStatus("OFF", "Auto");

            return;
        }

        if(moisture < threshold && rain < 50){
            setPumpStatus("ON", "Auto");
        }
        else{
            setPumpStatus("OFF", "Auto");
        }
    }
}

function startVoiceRecognition(){

    const recognition =
    new webkitSpeechRecognition();

    recognition.lang =
    document.getElementById("voiceLanguage").value;

    recognition.start();

    document.getElementById(
        "voiceStatus"
    ).innerText =
    "🎤 Listening...";

    recognition.onresult =
    function(event){

        const command =
        event.results[0][0]
        .transcript
        .toLowerCase();

        console.log(command);

        alert(command);

        document.getElementById(
            "voiceStatus"
        ).innerText =
        command;

        processVoiceCommand(
            command
        );

    };
}

function processVoiceCommand(command){

    command = command.trim().toLowerCase();

    console.log(command);
    console.log("Detected:", command);

    if(command.includes("ऑटो मोड चालू")){

        if(!autoMode){

            toggleAutoMode();
        }

        speak(
            "ऑटो मोड चालू कर दिया गया है",
            "hi-IN"
        );

        return;
    }

    if(command.includes("ऑटो मोड बंद")){

        if(autoMode){

            toggleAutoMode();
        }

        speak(
            "ऑटो मोड बंद कर दिया गया है",
            "hi-IN"
        );

        return;
    }

    if(
        command.includes("turn on pump") ||
        command.includes("start pump")
    ){
        startPump();

        speak(
            "Pump turned on",
            "en-IN"
        );

        return;
    }

    if(command.includes("पंप चालू")){
        startPump();

        speak(
            "पंप चालू कर दिया गया है",
            "hi-IN"
        );

        return;
    }

    if(
        command.includes("turn off pump") ||
        command.includes("stop pump")
    ){
        stopPump();

        speak(
            "Pump turned off",
            "en-IN"
        );

        return;
    }

    if(command.includes("पंप बंद")){
        stopPump();

        speak(
            "पंप बंद कर दिया गया है",
            "hi-IN"
        );

        return;
    }

}

function showVoices(){

    const voices =
    speechSynthesis.getVoices();

    console.log(voices);

    voices.forEach((voice, index) => {

        console.log(
            index,
            voice.name,
            voice.lang
        );

    });
}

if("serviceWorker" in navigator){

    window.addEventListener(
        "load",
        () => {

            navigator
            .serviceWorker
            .register(
                "service-worker.js"
            )

            .then(() => {

                console.log(
                    "Service Worker Registered"
                );

            })

            .catch(error => {

                console.log(
                    error
                );

            });

        }
    );

}
function logout(){

    localStorage.removeItem(
        "loggedIn"
    );

    window.location.href =
    "login.html";
}
function showToast(message){

    const toast =
    document.getElementById(
        "toast"
    );

    if(!toast){
        return;
    }

    toast.innerText =
    message;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);
}

function toggleTheme(){

    document.body.classList.toggle(
        "dark-mode"
    );

    localStorage.setItem(
        "theme",
        document.body.classList.contains(
            "dark-mode"
        )
    );
}

if(
    localStorage.getItem(
        "theme"
    ) === "true"
){
    document.body.classList.add(
        "dark-mode"
    );
}

setInterval(() => {

    const clock =
    document.getElementById("clock");

    if(clock){

        clock.innerText =
        new Date()
        .toLocaleTimeString();

    }

}, 1000);

window.addEventListener(
    "load",
    () => {

        createBottomNav();

        loadHistory();

        const autoModeElement = document.getElementById("autoMode");
        if(autoModeElement){
            autoModeElement.innerText = autoMode ? "AUTO" : "MANUAL";
        }

        fetchESP32Data();
        setInterval(fetchESP32Data, 1000);

        const loader = document.getElementById("loader");
        if(loader){
            setTimeout(() => {
                loader.style.display = "none";
            }, 1200);
        }

    }
);
console.log("END OF SCRIPT");