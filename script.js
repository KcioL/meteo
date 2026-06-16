// Remplace cette clé par la tienne récupérée sur OpenWeatherMap
const apiKey = '47c727b5e192b4fc5c837bc25007c07e'; 

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherResult = document.getElementById('weather-result');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const forecastContainer = document.getElementById('forecast-container');

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

        // 1. Organiser les données jour par jour
        const dailyData = {};
        
        data.list.forEach(item => {
            // Extrait la date (ex: "2026-06-16") de "2026-06-16 15:00:00"
            const date = item.dt_txt.split(' ')[0]; 
            
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        });

        // 2. Prendre uniquement les 5 premiers jours
        const days = Object.keys(dailyData).slice(0, 5);

        // 3. Calculer le maximum pour chaque jour
        days.forEach(dateString => {
            const forecastsForDay = dailyData[dateString];
            
            let maxTemp = -Infinity; // On commence par la température la plus basse possible
            let iconCode = '';

            forecastsForDay.forEach(forecast => {
                // Si la température de cette tranche horaire est plus haute que notre max actuel
                if (forecast.main.temp_max > maxTemp) {
                    maxTemp = forecast.main.temp_max;
                    // On garde l'icône associée au moment le plus chaud de la journée
                    iconCode = forecast.weather[0].icon; 
                }
            });

            // Formatage de la date pour l'affichage
            const dateObj = new Date(dateString);
            const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });

            // Création de la carte HTML
            const card = document.createElement('div');
            card.className = 'day-card';
            
            // On remplace le "n" (nuit) par "d" (jour/day) dans le code de l'icône 
            // pour éviter d'afficher une lune si le moment le plus chaud est à 18h en hiver
            const dayIconCode = iconCode.replace('n', 'd');

            card.innerHTML = `
                <div class="day-name">${dayName}</div>
                <img class="day-icon" src="https://openweathermap.org/img/wn/${dayIconCode}@2x.png" alt="icone">
                <div class="day-temp">${Math.round(maxTemp)}°C</div>
            `;
            
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
