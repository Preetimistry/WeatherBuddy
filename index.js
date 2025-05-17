document.addEventListener("DOMContentLoaded", function () {
const apikey = "df33135f516b027d50cc71665792fee2";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const voiceBtn = document.getElementById("voice-btn");
const weatherIcon = document.querySelector(".weather-icon")
const suggestionBox = document.querySelector(".suggestion");
const plantCareBox = document.querySelector(".plant-care"); 
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false; 
recognition.lang = "en-US"; 
recognition.interimResults = false; 
recognition.maxAlternatives = 1; 

const themeToggleBtn = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");
const currentHour = new Date().getHours();
if (savedTheme === "dark" || (!savedTheme && currentHour >= 18)) {
    document.body.classList.add("dark-mode");
    themeToggleBtn.textContent = "☀️ Light Mode"; 
}
themeToggleBtn.addEventListener("click", () => {
 document.body.classList.toggle("dark-mode"); 

    const isDark = document.body.classList.contains("dark-mode");
    themeToggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode"; 
    localStorage.setItem("theme", isDark ? "dark" : "light"); 
});
function updateSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

  history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
  history.unshift(city);
  history = history.slice(0, 5);

  localStorage.setItem("weatherHistory", JSON.stringify(history));
  displaySearchHistory();
}

   function displaySearchHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  history.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.className = "history-btn";
    btn.addEventListener("click", () => checkWeather(city));
    historyDiv.appendChild(btn);
  });
}
displaySearchHistory();

function getClothingSuggestion(temp, rain) {
      if (rain) return "Carry an umbrella and wear a waterproof jacket!";
      if (temp > 30) return "Wear light cotton clothes and stay hydrated!";
      if (temp > 20) return "T-shirt and jeans should be fine.";
      if (temp > 10) return "Wear a sweater or light jacket.";
      return "Bundle up! It's really cold.";
    }

    function plantCareTips(temp, rain) {
    if (rain) return "No need to water your plants today.";
    if (temp < 5) return "Bring sensitive plants indoors to avoid frost damage.";
    if (temp > 30) return "Water your plants early morning or late evening.";
    return "Normal plant care is fine today.";
}
recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    alert("Sorry, I couldn't understand that. Please try again.");
};

async function checkWeather(city) {
   try {
      const response = await fetch(`${apiUrl}${city}&appid=${apikey}`);
     if (!response.ok) throw new Error("City not found");

      const data = await response.json();

              const temp = data.main.temp;
        const weatherCondition = data.weather[0].main.toLowerCase();
        



      document.querySelector(".city").innerHTML = data.name;
      updateSearchHistory(data.name);
       document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
      document.querySelector(".humidity").innerHTML = `Humidity: ${data.main.humidity}%`;
      document.querySelector(".wind").innerHTML = `Wind: ${data.wind.speed} km/h`;
      

      switch (weatherCondition) {
     case "clouds":
      weatherIcon.src = "images/clouds.png";
        break;
      case "clear":
        weatherIcon.src = "images/clear.png";
        break;
      case "rain":
        weatherIcon.src = "images/rain.png";
        break;
      case "drizzle":
        weatherIcon.src = "images/drizzle.png";
        break;
      case "mist":
        weatherIcon.src = "images/mist.png";
        break;
      default:
        weatherIcon.src = "images/clear.png";
    }
           const isRaining = ["rain", "drizzle", "mist"].includes(weatherCondition);
            suggestionBox.innerHTML = `
            <p>${getClothingSuggestion(temp, isRaining)}</p>
            <p>${plantCareTips(temp, isRaining)}</p>
             `;
       document.querySelector(".weather").style.display= "block";
        document.querySelector(".weather").classList.add("active");
        document.querySelector(".error").style.display = "none";




        searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

voiceBtn.addEventListener("click", () => {
  recognition.start();
});

recognition.onresult = function (event) {
  const transcript = event.results[0][0].transcript.toLowerCase();
  console.log("Voice Input:", transcript);
  
  
  if (transcript.includes("weather in")) {
    const city = transcript.split("weather in")[1].trim();
    searchBox.value = city;
    checkWeather(city);
  } else {
    alert("Please say something like 'weather in Bhopal'");
  }
};

recognition.onerror = function (event) {
  console.error("Speech recognition error:", event.error);
};


      await getForecast(city);

   } 
   
   catch (error) {
          alert("City not found or network error.");

              document.querySelector(".weather").style.display = "none";
        document.querySelector(".error").style.display = "block";
            document.querySelector(".forecast").style.display = "none";

         console.error(error);
   }





}

async function getForecast(city) {
  try {
    const response = await fetch(`${forecastApiUrl}${city}&appid=${apikey}`);
    if (!response.ok) throw new Error("Forecast data not available");

    const data = await response.json();
    const forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.innerHTML = ""; 

    const dailyForecast = data.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));

    dailyForecast.forEach(day => {
      const date = new Date(day.dt * 1000);
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      const dayName = date.toLocaleDateString(undefined, options);
      const temp = Math.round(day.main.temp);
      const icon = day.weather[0].icon;
      const description = day.weather[0].description;

      const forecastCard = document.createElement("div");
      forecastCard.classList.add("forecast-card");
      forecastCard.innerHTML = `
        <h3>${dayName}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
        <p>${temp}°C</p>
        <p>${description}</p>
      `;
      forecastContainer.appendChild(forecastCard);
    });

    document.querySelector(".forecast").style.display = "block";
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    document.querySelector(".forecast").style.display = "none";
  }
}


searchBtn.addEventListener("click", () => {
   const city = searchBox.value.trim();
   if (city === "") {
      alert("Please enter a city name.");
      return;
   }
   checkWeather(city);
   
});
});
