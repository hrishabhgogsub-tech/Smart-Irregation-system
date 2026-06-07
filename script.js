console.log("script.js loaded");
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

function startPump(){

    document.getElementById(
        "pumpStatus"
    ).innerText = "ON";

    showToast(
        "🚿 Pump Started"
    );
}

function stopPump(){

    document.getElementById(
        "pumpStatus"
    ).innerText = "OFF";

    showToast(
        "🛑 Pump Stopped"
    );
}

function addHistory(message){

    const list =
    document.getElementById(
        "historyList"
    );

    const item =
    document.createElement("li");

    const time =
    new Date()
    .toLocaleTimeString();

    item.innerText =
    `${time} - ${message}`;

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

let autoMode = false;

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



function toggleAutoMode() {

    autoMode = !autoMode;

    document.getElementById("autoMode")
        .innerText = autoMode ? "ON" : "OFF";

    addHistory(
        autoMode
        ? "Auto Mode Enabled"
        : "Auto Mode Disabled"
    );

    runAutoMode();            
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
            document.getElementById(
                "pumpStatus"
            ).innerText = "OFF";

            return;
        }

        if(moisture < threshold && rain < 50){
            document.getElementById("pumpStatus")
                .innerText = "ON";
        }
        else{
            document.getElementById("pumpStatus")
                .innerText = "OFF";
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

        setTimeout(() => {

            document
            .getElementById(
                "loader"
            )
            .style.display =
            "none";

        }, 2000);

    }
);
console.log("END OF SCRIPT");