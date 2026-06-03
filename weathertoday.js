const WEATHER_CLASSES = [
    "clear-day",
    "clear-night",
    "rain",
    "clouds",
    "default-weather"
];

const WEATHER_COORDINATES = {
    lat: "15.1873",
    lon: "120.5491"
};

const result = document.getElementById("weatherResult");
const WEATHER_ENDPOINT = "/.netlify/functions/weather";

function createTextElement(tagName, text) {
    const element = document.createElement(tagName);
    element.textContent = text;
    return element;
}

function renderWeather(data) {
    const weatherMain = data?.weather?.[0]?.main || "Unknown";
    const weatherIcon = data?.weather?.[0]?.icon || "01d";
    const locationName = data?.name || "Unknown location";
    const temperature = Math.round(data?.main?.temp ?? 0);

    const status = document.createElement("div");
    const icon = document.createElement("img");
    const city = createTextElement("h2", locationName);
    const temp = createTextElement("h1", `${temperature}\u00B0C`);
    const summary = createTextElement("h2", weatherMain);

    status.className = "weather-status";

    icon.src = `https://openweathermap.org/img/wn/${weatherIcon}.png`;
    icon.alt = weatherMain;
    icon.className = "mini-icon";

    status.appendChild(icon);
    result.replaceChildren(status, city, temp, summary);

    setBackground(weatherMain, weatherIcon);
}

function renderWeatherError(message) {
    console.error(message);

    const error = createTextElement("p", message);
    result.replaceChildren(error);

    setBackground();
}

async function getWeather() {
    const url = new URL(WEATHER_ENDPOINT, window.location.origin);
    url.searchParams.set("lat", WEATHER_COORDINATES.lat);
    url.searchParams.set("lon", WEATHER_COORDINATES.lon);

    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.error || `Failed to fetch weather: ${response.status}`);
    }

    return data;
}

function setBackground(condition = "", icon = "") {
    const weather = condition.toLowerCase();
    const isDay = icon.includes("d");

    document.body.classList.remove(...WEATHER_CLASSES);

    if (weather === "clear") {
        document.body.classList.add(isDay ? "clear-day" : "clear-night");
        return;
    }

    if (["rain", "drizzle", "thunderstorm"].includes(weather)) {
        document.body.classList.add("rain");
        return;
    }

    if (["clouds", "mist", "smoke", "haze", "dust", "fog", "sand", "ash", "squall", "tornado"].includes(weather)) {
        document.body.classList.add("clouds");
        return;
    }

    document.body.classList.add("default-weather");
}

async function initWeather() {
    if (!result) {
        console.error("Weather container was not found.");
        return;
    }

    try {
        const data = await getWeather();
        renderWeather(data);
    } catch (error) {
        renderWeatherError(error.message || "Weather unavailable.");
    }
}

initWeather();
