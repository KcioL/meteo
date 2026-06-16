// Remplace cette clé par la tienne récupérée sur OpenWeatherMap
const apiKey = '47c727b5e192b4fc5c837bc25007c07e'; 

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherResult = document.getElementById('weather-result');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const forecastContainer = document.getElementById('forecast-container');

// Nouveaux éléments du DOM
const hourlyResult = document.getElementById('hourly-result');
const hourlyContainer = document.getElementById('hourly-container');
const hourlyTitle = document.getElementById('hourly-title');

window.addEventListener('DOMContentLoaded', () => {
    getWeather('Pau');
});

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
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

    try {
        const response = await fetch(url);
        if (response.status === 401) throw new Error('Clé API non valide ou en cours d\'activation.');
        if (response.status === 404) throw new Error('Ville introuvable. Vérifie l\'orthographe.');
        if (!response.ok) throw new Error('Une erreur s\'est produite.');
        
        const data = await response.json();
        cityName.textContent = data.city.name;
        forecastContainer.innerHTML = ''; 
        hourlyResult.classList.add('hidden'); // On cache les détails si on cherche une nouvelle ville

        const dailyData = {};
        
        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0]; 
            if (!dailyData[date]) dailyData[date] = [];
            dailyData[date].push(item);
        });

        const days = Object.keys(dailyData).slice(0, 5);

        days.forEach(dateString => {
            const forecastsForDay = dailyData[dateString];
            
            let maxTemp = -Infinity;
            let iconCode = '';

            forecastsForDay.forEach(forecast => {
                if (forecast.main.temp_max > maxTemp) {
                    maxTemp = forecast.main.temp_max;
                    iconCode = forecast.weather[0].icon; 
                }
            });

            const dateObj = new Date(dateString);
            const dayShort = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });
            // Version longue du jour pour le titre des détails (ex: "lundi")
            const dayLong = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });

            const card = document.createElement('div');
            card.className = 'day-card';
            const dayIconCode = iconCode.replace('n', 'd');

            card.innerHTML = `
                <div class="day-name">${dayShort}</div>
                <img class="day-icon" src="https://openweathermap.org/img/wn/${dayIconCode}@2x.png" alt="icone">
                <div class="day-temp">${Math.round(maxTemp)}°C</div>
            `;
            
            // --- GESTION DU CLIC SUR LA CARTE ---
            card.addEventListener('click', () => {
                // 1. Enlever l'effet "sélectionné" de toutes les cartes
                document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
                
                // 2. Mettre en surbrillance la carte cliquée
                card.classList.add('active');
                
                // 3. Afficher le détail des heures pour ce jour
                showHourlyForecast(forecastsForDay, dayLong);
            });

            forecastContainer.appendChild(card);
        });

        weatherResult.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        
    } catch (error) {
        weatherResult.classList.add('hidden');
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    }
}

// --- FONCTION QUI GÉNÈRE LES DÉTAILS PAR HEURE ---
function showHourlyForecast(forecasts, dayName) {
    hourlyContainer.innerHTML = ''; // On vide les anciens résultats
    hourlyTitle.textContent = `Prévisions pour ${dayName}`;

    forecasts.forEach(forecast => {
        // Extrait l'heure (ex: "15:00") à partir de "2026-06-16 15:00:00"
        const time = forecast.dt_txt.split(' ')[1].substring(0, 5);
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;

        const hourlyCard = document.createElement('div');
        hourlyCard.className = 'hourly-card';
        hourlyCard.innerHTML = `
            <div class="hourly-time">${time}</div>
            <img class="hourly-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icone">
            <div class="hourly-temp">${temp}°C</div>
        `;
        
        hourlyContainer.appendChild(hourlyCard);
    });

    // On fait apparaître la section en dessous
    hourlyResult.classList.remove('hidden');
}
