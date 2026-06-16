// Remplace cette clé par la tienne récupérée sur OpenWeatherMap
const apiKey = '47c727b5e192b4fc5c837bc25007c07e'; 

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherResult = document.getElementById('weather-result');
const errorMessage = document.getElementById('error-message');

const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');

// Déclencher la recherche au clic sur le bouton
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city !== "") {
        getWeather(city);
    }
});

// Déclencher la recherche en appuyant sur la touche "Entrée"
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city !== "") {
            getWeather(city);
        }
    }
});

async function getWeather(city) {
    // Paramètres : unités en Celsius (metric) et langue en Français (lang=fr)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

    try {
        const response = await fetch(url);
        
        // Si la ville n'est pas trouvée (ex: erreur 404)
        if (!response.ok) {
            throw new Error('Ville non trouvée');
        }
        
        const data = await response.json();
        
        // Injection des données dans le HTML
        cityName.textContent = data.name;
        // Arrondir la température (ex: 22.4 devient 22)
        temperature.textContent = Math.round(data.main.temp); 
        description.textContent = data.weather[0].description;
        
        // Chargement de l'icône météo officielle
        const iconCode = data.weather[0].icon;
        weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        // Afficher les résultats et cacher l'erreur
        weatherResult.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        
    } catch (error) {
        // En cas d'erreur, on cache les résultats et on affiche le message
        weatherResult.classList.add('hidden');
        errorMessage.classList.remove('hidden');
    }
}