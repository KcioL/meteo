// Remplace cette clé par la tienne récupérée sur OpenWeatherMap
const apiKey = '47c727b5e192b4fc5c837bc25007c07e'; 

// Le dictionnaire qui traduit le code de l'API en Émoji
const weatherEmojis = {
    '01d': '☀️', '01n': '🌙',       // Ciel clair (jour/nuit)
    '02d': '🌤️', '02n': '🌤️',       // Quelques nuages
    '03d': '☁️', '03n': '☁️',       // Nuageux
    '04d': '🌥️', '04n': '🌥️',       // Très nuageux
    '09d': '🌧️', '09n': '🌧️',       // Averses
    '10d': '🌦️', '10n': '🌧️',       // Pluie (avec soleil de jour)
    '11d': '⛈️', '11n': '⛈️',       // Orage
    '13d': '❄️', '13n': '❄️',       // Neige
    '50d': '🌫️', '50n': '🌫️'       // Brouillard
};

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherResult = document.getElementById('weather-result');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const forecastContainer = document.getElementById('forecast-container');
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
        hourlyResult.classList.add('hidden'); 

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
            const dayLong = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });

            const card = document.createElement('div');
            card.className = 'day-card';
            
            // On force le mode jour pour l'affichage de la carte principale
            const dayIconCode = iconCode.replace('n', 'd');
            
            // On récupère l'émoji correspondant, ou un soleil par défaut si le code est inconnu
            const emoji = weatherEmojis[dayIconCode] || '☀️';

            // Injection du HTML avec le div contenant l'émoji
            card.innerHTML = `
                <div class="day-name">${dayShort}</div>
                <div class="emoji-icon">${emoji}</div>
                <div class="day-temp">${Math.round(maxTemp)}°C</div>
            `;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
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

function showHourlyForecast(forecasts, dayName) {
    hourlyContainer.innerHTML = ''; 
    hourlyTitle.textContent = `Prévisions pour ${dayName}`;

    forecasts.forEach(forecast => {
        const time = forecast.dt_txt.split(' ')[1].substring(0, 5);
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        
        // Ici on laisse l'icône originale (jour ou nuit) car c'est heure par heure
        const emoji = weatherEmojis[icon] || '☀️';

        const hourlyCard = document.createElement('div');
        hourlyCard.className = 'hourly-card';
        
        // Injection de la version "petite" de l'émoji
        hourlyCard.innerHTML = `
            <div class="hourly-time">${time}</div>
            <div class="emoji-icon-small">${emoji}</div>
            <div class="hourly-temp">${temp}°C</div>
        `;
        
        hourlyContainer.appendChild(hourlyCard);
    });

    hourlyResult.classList.remove('hidden');
}
