const API_KEY = "1af59869ecf3636058fdad7f638642ef";

const BASE_URL =
"https://api.openweathermap.org/data/2.5";

let weatherTemp = 0;
let weatherHumidity = 0;
let weatherCondition = "";
let weatherRain = 0;
let rainProbability = 0;

async function fetchWeather(city){

    try{

        const weatherRes =
        await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const currentData =
        await weatherRes.json();

        console.log(currentData.main.humidity);

        if(!weatherRes.ok){
            throw new Error(
                currentData.message ||
                "Unable to fetch weather data."
            );
        }

        const forecastRes =
        await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );

        const forecastData =
        await forecastRes.json();

        if(!forecastRes.ok){
            throw new Error(
                forecastData.message ||
                "Unable to fetch forecast data."
            );
        }

        if(
            forecastData.list &&
            forecastData.list.length > 0
        ){

            rainProbability =
            Math.round(
                (forecastData.list[0].pop || 0)
                * 100
            );
        }

        weatherTemp =
        currentData.main.temp;

        weatherHumidity =
        currentData.main.humidity;

        weatherCondition =
        currentData.weather[0].main;

        const temperatureElement =
        document.getElementById(
            "temperature"
        );

        const humidityElement =
        document.getElementById(
            "humidity"
        );

        const weatherConditionElement =
        document.getElementById(
            "weatherCondition"
        );

        const rainElement =
        document.getElementById(
            "rain"
        );

        if(temperatureElement){
            temperatureElement.innerText =
            weatherTemp + "°C";
        }

        if(humidityElement){
            humidityElement.innerText =
            weatherHumidity + "%";
        }

        if(weatherConditionElement){
            weatherConditionElement.innerText =
            weatherCondition;
        }

        if(rainElement){

            rainElement.innerText =
            rainProbability + "%";
        }

    }
    catch(error){

        console.error(
            "Weather update failed:",
            error.message
        );

    }
}

fetchWeather("Bhopal").then(() => {

    if(typeof updateAIRecommendation === "function"){

        updateAIRecommendation();

    }

});
