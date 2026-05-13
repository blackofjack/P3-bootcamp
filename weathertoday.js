// let WEATHER_API_KEY = "";

// fetch("./config.json")
// .then(response => response.json())
// .then(config => {

//     WEATHER_API_KEY =
//     config.WEATHER_API_KEY;
    
//     getWeather();
// });


const WEATHER_API_KEY =
import.meta.env.VITE_WEATHER_API_KEY;

async function getWeather() {
   const result = document.getElementById('weatherResult');
  
    try {
       const response = await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=15.1873&lon=120.5491&appid=${WEATHER_API_KEY}&units=metric`
);

        if(!response.ok){
            throw new Error('failed to fetch weather');
        }
        const data = await response.json();
        // console.log(data);
        // console.log(data.weather[0].main);
        // console.log(data.weather[0].icon);
        result.innerHTML = `
        <div class="weather-status">
    <img 
        src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png"
        alt="${data.weather[0].main}"
        class="mini-icon">
        </div>
        <h2>${data.name}</h2>
        <h1>${data.main.temp}°C</h1>
        <h2>${data.weather[0].main}</h2>`;
        

        setBackground(
       data.weather[0].main,
       data.weather[0].icon

        )

    }catch(error){
         console.error(error.message);
    }
}

getWeather();

//changing color

const setBackground = (condition, icon) => {
    const body = document.body;
    const weather = condition.toLowerCase();
    const isDay = icon.includes('d');

     body.className = '';

    if (weather === 'clear' && isDay){
        body.classList.add('clear-day');
    }
    else if (weather === 'clear' && !isDay){
        body.classList.add('clear-night');
    }
      else if (weather === 'rain') {
         body.classList.add('clear-day');
    } 
    else if (weather === 'clouds') {
         body.classList.add('clouds');
    } 
    else if (weather === 'wind') {
        body.classList.add('winds');
    } 
    else {
        body.classList.add('default-weather');
    }
    

};