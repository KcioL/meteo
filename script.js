// Remplace cette clé par la tienne récupérée sur OpenWeatherMap
const apiKey = '47c727b5e192b4fc5c837bc25007c07e'; 

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherResult = document.getElementById('weather-result');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const forecastContainer = document.getElementById('forecast-container');

// 1. Lancer la recherche pour Pau par défaut au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    getWeather('Pau');
});

// Événements pour le bouton et la touche "Entrée"
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city !== "") getWeather(city);
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city !== "") getWeather(city);
    }
});

async function getWeather(city) {
    // Attention : on utilise l'endpoint "forecast" au lieu de "weather"
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

    try {
        const response = await fetch(url);
        
        if (response.status === 401) throw new Error('Clé API non valide ou en cours d\'activation.');
        if (response.status === 404) throw new Error('Ville introuvable. Vérifie l\'orthographe.');
        if (!response.ok) throw new Error('Une erreur s\'est produite.');
        
        const data = await response.json();
        
        // Afficher le nom de la ville
        cityName.textContent = data.city.name;
        
        // Vider la grille avant d'ajouter les nouveaux jours
        forecastContainer.innerHTML = ''; 

        // Filtrer pour ne garder qu'une prévision par jour (celle de 12:00:00)
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

        // Créer une carte pour chaque jour récupéré
        dailyForecasts.forEach(day => {
            // Transformer la date (ex: "2026-06-17 12:00:00") en nom de jour (ex: "mer.")
            const date = new Date(day.dt_txt);
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });

            const temp = Math.round(day.main.temp);
            const iconCode = day.weather[0].icon;

            // Construire le HTML de la petite carte
            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `
                <div class="day-name">${dayName}</div>
                <img class="day-icon" src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="icone">
                <div class="day-temp">${temp}°C</div>
            `;
            
            // Ajouter la carte dans le conteneur
            forecastContainer.appendChild(card);
        });

        // Afficher les résultats
        weatherResult.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        
    } catch (error) {
        weatherResult.classList.add('hidden');
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    }
}
