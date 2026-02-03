// ============================================
// CONFIGURATION & API KEY
// ============================================
const API_KEY = 'f8bccfb52b8d4b085126434bccd0034a'; // Replace with your OpenWeather API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0';
const DEMO_MODE = true; // Set to false when API key is activated

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    voiceBtn: document.getElementById('voiceBtn'),
    themeBtn: document.getElementById('themeBtn'),
    weatherDisplay: document.getElementById('weatherDisplay'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    getStartedBtn: document.getElementById('getStartedBtn'),
    suggestions: document.getElementById('suggestions'),
    compareInput: document.getElementById('compareInput'),
    addCompareBtn: document.getElementById('addCompareBtn'),
    comparisonGrid: document.getElementById('comparisonGrid'),
    retryBtn: document.getElementById('retryBtn')
};

// ============================================
// STATE MANAGEMENT
// ============================================
let currentCity = null;
let compareCities = [];
let weatherData = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeParticles();
    loadThemePreference();
});

// ============================================
// FEATURE CARD INTERACTIVITY
// ============================================
function initializeFeatureCards() {
    const features = document.querySelectorAll('.feature');
    
    features.forEach((feature, index) => {
        // Add staggered animation
        feature.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
        feature.style.opacity = '0';
        
        // Add click handler
        feature.addEventListener('click', () => {
            handleFeatureClick(index);
        });
        
        // Add ripple effect on click
        feature.addEventListener('click', createRipple);
    });
}

function handleFeatureClick(index) {
    const featureNames = ['AI Mood Analysis', 'Activity Suggestions', 'Air Quality Tracking', 'City Comparison'];
    const messages = [
        'Our AI analyzes weather conditions to understand how they affect your mood! 😊',
        'Get personalized activity recommendations based on current weather! 🏃',
        'Monitor air quality with detailed pollution metrics and health tips! 💨',
        'Compare weather across multiple cities at once! 🏙️'
    ];
    
    // Create a tooltip notification
    showFeatureTooltip(featureNames[index], messages[index]);
    
    // Add bounce animation
    const features = document.querySelectorAll('.feature');
    features[index].style.animation = 'bounce 0.6s ease';
    setTimeout(() => {
        features[index].style.animation = '';
    }, 600);
}

function showFeatureTooltip(title, message) {
    // Remove existing tooltip
    const existing = document.querySelector('.feature-tooltip');
    if (existing) existing.remove();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'feature-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        tooltip.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
    `;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function initializeApp() {
    // Event Listeners
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    elements.cityInput.addEventListener('input', handleCityInput);
    elements.locationBtn.addEventListener('click', getUserLocation);
    elements.voiceBtn.addEventListener('click', handleVoiceSearch);
    elements.themeBtn.addEventListener('click', toggleTheme);
    elements.getStartedBtn.addEventListener('click', () => {
        elements.welcomeScreen.classList.add('hidden');
        elements.cityInput.focus();
    });
    elements.addCompareBtn.addEventListener('click', addCityToCompare);
    elements.retryBtn.addEventListener('click', () => {
        elements.error.classList.add('hidden');
        elements.welcomeScreen.classList.remove('hidden');
    });

    // Show API activation notice if in demo mode
    if (DEMO_MODE) {
        showDemoModeAlert();
    } else if (API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        showApiKeyAlert();
    }
    
    // Add interactivity to welcome screen features
    initializeFeatureCards();
    
    console.log('WeatherMood initialized! All buttons ready.');
}

// ============================================
// DEMO MODE ALERT
// ============================================
function showDemoModeAlert() {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f59e0b;
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 600px;
        text-align: center;
    `;
    alertDiv.innerHTML = `
        <h3 style="margin-bottom: 10px;"><i class="fas fa-clock"></i> Demo Mode Active</h3>
        <p style="margin-bottom: 15px;">Your API key is activating (takes up to 2 hours). Using demo data for now. Try searching for cities!</p>
        <button onclick="this.parentElement.remove()" style="background: white; color: #f59e0b; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">Got it!</button>
    `;
    document.body.appendChild(alertDiv);
}

// ============================================
// API KEY ALERT
// ============================================
function showApiKeyAlert() {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 600px;
        text-align: center;
    `;
    alertDiv.innerHTML = `
        <h3 style="margin-bottom: 10px;"><i class="fas fa-exclamation-circle"></i> API Key Required</h3>
        <p style="margin-bottom: 15px;">Please get a free API key from <a href="https://openweathermap.org/api" target="_blank" style="color: #fef3c7; text-decoration: underline;">OpenWeather</a> and replace 'YOUR_OPENWEATHER_API_KEY' in script.js</p>
        <button onclick="this.parentElement.remove()" style="background: white; color: #ef4444; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">Got it!</button>
    `;
    document.body.appendChild(alertDiv);
}

// ============================================
// THEME MANAGEMENT
// ============================================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    elements.themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        elements.themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// ============================================
// PARTICLE ANIMATION
// ============================================
function initializeParticles() {
    const particles = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.cssText = `
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 15}s;
            animation-duration: ${Math.random() * 10 + 10}s;
        `;
        particles.appendChild(particle);
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
async function handleSearch() {
    const city = elements.cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    await fetchWeatherData(city);
}

function handleCityInput(e) {
    const value = e.target.value.trim();
    if (value.length >= 3) {
        // Show suggestions (could be enhanced with a city database)
        elements.suggestions.classList.add('show');
    } else {
        elements.suggestions.classList.remove('show');
    }
}

// ============================================
// VOICE SEARCH
// ============================================
function handleVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showError('Voice search is not supported in your browser');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    elements.voiceBtn.classList.add('listening');

    recognition.onresult = (event) => {
        const city = event.results[0][0].transcript;
        elements.cityInput.value = city;
        elements.voiceBtn.classList.remove('listening');
        handleSearch();
    };

    recognition.onerror = () => {
        elements.voiceBtn.classList.remove('listening');
        showError('Voice recognition failed. Please try again.');
    };

    recognition.onend = () => {
        elements.voiceBtn.classList.remove('listening');
    };

    recognition.start();
}

// ============================================
// GEOLOCATION
// ============================================
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    // In demo mode, use a default city
    if (DEMO_MODE) {
        showLoading();
        elements.welcomeScreen.classList.add('hidden');
        elements.error.classList.add('hidden');
        setTimeout(() => {
            loadDemoData('Accra'); // Default demo city
        }, 1000);
        return;
    }

    showLoading();
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoords(latitude, longitude);
        },
        () => {
            hideLoading();
            showError('Unable to retrieve your location. Please enter a city name instead.');
        }
    );
}

// ============================================
// API CALLS
// ============================================
async function fetchWeatherData(city) {
    showLoading();
    elements.welcomeScreen.classList.add('hidden');
    elements.error.classList.add('hidden');

    // DEMO MODE: Use sample data
    if (DEMO_MODE) {
        setTimeout(() => {
            loadDemoData(city);
        }, 1000);
        return;
    }

    try {
        // Get coordinates for the city
        const geoResponse = await fetch(
            `${GEO_API_URL}/direct?q=${city}&limit=1&appid=${API_KEY}`
        );
        
        if (!geoResponse.ok) {
            throw new Error('Failed to connect to weather service');
        }
        
        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            throw new Error('City not found. Please check the spelling and try again.');
        }

        const { lat, lon, name, country } = geoData[0];
        currentCity = { name, country, lat, lon };

        // Fetch all weather data in parallel
        const [currentWeather, forecast, airQuality] = await Promise.all([
            fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(async r => {
                if (!r.ok) throw new Error('Weather data unavailable');
                return r.json();
            }),
            fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(async r => {
                if (!r.ok) throw new Error('Forecast data unavailable');
                return r.json();
            }),
            fetch(`${API_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(async r => {
                if (!r.ok) return { list: [{ main: { aqi: 0 }, components: { co: 0, no2: 0, o3: 0, pm2_5: 0, pm10: 0, so2: 0 } }] };
                return r.json();
            })
        ]);

        if (currentWeather.cod && currentWeather.cod !== 200) {
            throw new Error(currentWeather.message || 'Failed to fetch weather data');
        }

        weatherData = { currentWeather, forecast, airQuality };
        displayWeatherData();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to fetch weather data');
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        // Fetch all weather data
        const [currentWeather, forecast, airQuality, geoReverse] = await Promise.all([
            fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(async r => {
                if (!r.ok) throw new Error('Weather data unavailable');
                return r.json();
            }),
            fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(async r => {
                if (!r.ok) throw new Error('Forecast data unavailable');
                return r.json();
            }),
            fetch(`${API_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(async r => {
                if (!r.ok) return { list: [{ main: { aqi: 0 }, components: { co: 0, no2: 0, o3: 0, pm2_5: 0, pm10: 0, so2: 0 } }] };
                return r.json();
            }),
            fetch(`${GEO_API_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`).then(async r => {
                if (!r.ok) return [];
                return r.json();
            })
        ]);

        if (currentWeather.cod && currentWeather.cod !== 200) {
            throw new Error(currentWeather.message || 'Failed to fetch weather data');
        }

        if (geoReverse && geoReverse.length > 0) {
            currentCity = { name: geoReverse[0].name, country: geoReverse[0].country, lat, lon };
        } else {
            currentCity = { name: 'Your Location', country: '', lat, lon };
        }

        weatherData = { currentWeather, forecast, airQuality };
        displayWeatherData();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to fetch weather data');
    }
}

// ============================================
// DISPLAY WEATHER DATA
// ============================================
function displayWeatherData() {
    const { currentWeather, forecast, airQuality } = weatherData;

    // Update background based on weather
    updateBackground(currentWeather);

    // Display current weather
    displayCurrentWeather(currentWeather);

    // Display hourly forecast
    displayHourlyForecast(forecast);

    // Display 5-day forecast
    displayWeeklyForecast(forecast);

    // Display air quality
    displayAirQuality(airQuality);

    // Display mood & activities (unique feature)
    displayMoodAndActivities(currentWeather);

    // Show weather display
    elements.weatherDisplay.classList.remove('hidden');
    elements.weatherDisplay.classList.add('fade-in');
}

function displayCurrentWeather(data) {
    const { name } = currentCity;
    const { main, weather, wind, visibility, dt } = data;

    document.getElementById('cityName').textContent = `${name}, ${currentCity.country}`;
    document.getElementById('dateTime').textContent = formatDateTime(dt);
    document.getElementById('temperature').textContent = `${Math.round(main.temp)}°`;
    document.getElementById('weatherDescription').textContent = weather[0].description;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
    document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    document.getElementById('pressure').textContent = `${main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
    
    // UV Index (simulated - would need UV API for real data)
    const uvIndex = calculateUVIndex(weather[0].icon);
    document.getElementById('uvIndex').textContent = uvIndex;
}

function displayHourlyForecast(data) {
    const hourlyContainer = document.getElementById('hourlyForecast');
    hourlyContainer.innerHTML = '';

    // Get next 12 hours
    const hourlyData = data.list.slice(0, 12);

    hourlyData.forEach(item => {
        const time = new Date(item.dt * 1000).getHours();
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;

        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <div class="time">${time}:00</div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather">
            <div class="temp">${temp}°C</div>
        `;
        hourlyContainer.appendChild(hourlyItem);
    });
}

function displayWeeklyForecast(data) {
    const forecastContainer = document.getElementById('forecastGrid');
    forecastContainer.innerHTML = '';

    // Get daily forecasts (every 8th item = 24 hours)
    const dailyData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(item.main.temp);
        const tempMin = Math.round(item.main.temp_min);
        const tempMax = Math.round(item.main.temp_max);
        const icon = item.weather[0].icon;
        const description = item.weather[0].description;

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <div class="day">${day}</div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <div class="temp-range">
                <span class="high">${tempMax}°</span> / 
                <span class="low">${tempMin}°</span>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

function displayAirQuality(data) {
    const aqiContainer = document.getElementById('aqiContent');
    
    // Check if data exists
    if (!data || !data.list || !data.list[0]) {
        aqiContainer.innerHTML = '<p>Air quality data unavailable</p>';
        return;
    }
    
    const aqi = data.list[0].main?.aqi || 0;
    const components = data.list[0].components || {};

    // AQI Labels
    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiColors = ['#10b981', '#84cc16', '#f59e0b', '#ef4444', '#991b1b'];

    document.getElementById('aqiValue').textContent = aqi || '--';
    document.getElementById('aqiLabel').textContent = aqi > 0 ? aqiLabels[aqi - 1] : 'Unknown';
    document.querySelector('.aqi-meter').style.background = aqi > 0 ? aqiColors[aqi - 1] : '#6b7280';

    // Display components
    const componentsContainer = document.getElementById('aqiComponents');
    componentsContainer.innerHTML = `
        <div class="aqi-component">
            <div class="label">CO</div>
            <div class="value">${(components.co || 0).toFixed(1)}</div>
        </div>
        <div class="aqi-component">
            <div class="label">NO₂</div>
            <div class="value">${(components.no2 || 0).toFixed(1)}</div>
        </div>
        <div class="aqi-component">
            <div class="label">O₃</div>
            <div class="value">${(components.o3 || 0).toFixed(1)}</div>
        </div>
        <div class="aqi-component">
            <div class="label">PM2.5</div>
            <div class="value">${(components.pm2_5 || 0).toFixed(1)}</div>
        </div>
        <div class="aqi-component">
            <div class="label">PM10</div>
            <div class="value">${(components.pm10 || 0).toFixed(1)}</div>
        </div>
        <div class="aqi-component">
            <div class="label">SO₂</div>
            <div class="value">${(components.so2 || 0).toFixed(1)}</div>
        </div>
    `;
}

// ============================================
// MOOD & ACTIVITIES (UNIQUE FEATURE)
// ============================================
function displayMoodAndActivities(data) {
    const { main, weather } = data;
    const temp = main.temp;
    const condition = weather[0].main.toLowerCase();

    // Determine mood based on weather
    let mood = { emoji: '😊', text: 'Perfect weather vibes!' };
    let activities = [];

    if (condition.includes('clear') && temp > 20 && temp < 30) {
        mood = { emoji: '🤩', text: 'Amazing weather today!' };
        activities = [
            { icon: 'fa-person-biking', text: 'Go for a bike ride' },
            { icon: 'fa-camera', text: 'Take photos outside' },
            { icon: 'fa-basketball', text: 'Play outdoor sports' },
            { icon: 'fa-ice-cream', text: 'Grab some ice cream' }
        ];
    } else if (condition.includes('rain')) {
        mood = { emoji: '☔', text: 'Cozy indoor weather' };
        activities = [
            { icon: 'fa-book', text: 'Read a good book' },
            { icon: 'fa-mug-hot', text: 'Enjoy hot chocolate' },
            { icon: 'fa-film', text: 'Watch a movie' },
            { icon: 'fa-gamepad', text: 'Play video games' }
        ];
    } else if (condition.includes('cloud')) {
        mood = { emoji: '😌', text: 'Nice and mild!' };
        activities = [
            { icon: 'fa-person-walking', text: 'Take a walk' },
            { icon: 'fa-camera', text: 'Photography session' },
            { icon: 'fa-coffee', text: 'Café hopping' },
            { icon: 'fa-shopping-bag', text: 'Go shopping' }
        ];
    } else if (condition.includes('snow')) {
        mood = { emoji: '⛄', text: 'Winter wonderland!' };
        activities = [
            { icon: 'fa-person-skiing', text: 'Go skiing' },
            { icon: 'fa-snowflake', text: 'Build a snowman' },
            { icon: 'fa-mug-hot', text: 'Hot cocoa time' },
            { icon: 'fa-fire', text: 'Cozy by the fire' }
        ];
    } else if (temp > 30) {
        mood = { emoji: '🥵', text: 'Stay cool!' };
        activities = [
            { icon: 'fa-person-swimming', text: 'Go swimming' },
            { icon: 'fa-fan', text: 'Stay indoors (AC)' },
            { icon: 'fa-glass-water', text: 'Drink lots of water' },
            { icon: 'fa-umbrella-beach', text: 'Beach day' }
        ];
    } else if (temp < 10) {
        mood = { emoji: '🥶', text: 'Bundle up!' };
        activities = [
            { icon: 'fa-mug-hot', text: 'Warm beverages' },
            { icon: 'fa-book', text: 'Indoor reading' },
            { icon: 'fa-fire', text: 'Stay warm inside' },
            { icon: 'fa-hat-winter', text: 'Wear warm clothes' }
        ];
    }

    // Update mood display
    document.getElementById('moodEmoji').textContent = mood.emoji;
    document.getElementById('moodText').textContent = mood.text;

    // Update activities
    const activitiesContainer = document.getElementById('activitySuggestions');
    activitiesContainer.innerHTML = '';
    activities.forEach(activity => {
        const card = document.createElement('div');
        card.classList.add('activity-card');
        card.innerHTML = `
            <i class="fas ${activity.icon}"></i>
            <p>${activity.text}</p>
        `;
        activitiesContainer.appendChild(card);
    });
}

// ============================================
// COMPARE CITIES (UNIQUE FEATURE)
// ============================================
async function addCityToCompare() {
    const city = elements.compareInput.value.trim();
    if (!city) return;

    if (compareCities.some(c => c.name.toLowerCase() === city.toLowerCase())) {
        showError('City already added to comparison');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        if (data.cod === '404') {
            throw new Error('City not found');
        }

        compareCities.push({
            name: data.name,
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed * 3.6)
        });

        displayComparisonCities();
        elements.compareInput.value = '';
    } catch (error) {
        showError('Failed to add city to comparison');
    }
}

function displayComparisonCities() {
    const grid = elements.comparisonGrid;
    grid.innerHTML = '';

    compareCities.forEach((city, index) => {
        const card = document.createElement('div');
        card.classList.add('comparison-card');
        card.innerHTML = `
            <button class="remove-btn" onclick="removeCompareCity(${index})">
                <i class="fas fa-times"></i>
            </button>
            <h4>${city.name}</h4>
            <img src="https://openweathermap.org/img/wn/${city.icon}@2x.png" alt="${city.description}">
            <div class="temp">${city.temp}°C</div>
            <div class="details">
                ${city.description}<br>
                💧 ${city.humidity}% | 💨 ${city.wind} km/h
            </div>
        `;
        grid.appendChild(card);
    });
}

function removeCompareCity(index) {
    compareCities.splice(index, 1);
    displayComparisonCities();
}

// Make removeCompareCity global
window.removeCompareCity = removeCompareCity;

// ============================================
// BACKGROUND EFFECTS - MOOD-BASED COLORS
// ============================================
function updateBackground(data) {
    const background = document.getElementById('weatherBackground');
    const condition = data.weather[0].main.toLowerCase();
    const description = data.weather[0].description.toLowerCase();
    const isNight = data.weather[0].icon.includes('n');
    const temp = data.main.temp;

    background.className = 'weather-background';

    // Night mode - calm, dark, peaceful mood
    if (isNight) {
        background.classList.add('night');
    } 
    // Clear & Hot - energetic, vibrant mood
    else if (condition.includes('clear') && temp > 28) {
        background.classList.add('hot-sunny');
    }
    // Clear & Pleasant - happy, cheerful mood
    else if (condition.includes('clear')) {
        background.classList.add('sunny');
    } 
    // Partly Cloudy - calm, relaxed mood
    else if (condition.includes('cloud') && description.includes('few')) {
        background.classList.add('partly-cloudy');
    }
    // Cloudy - cozy, mellow mood
    else if (condition.includes('cloud')) {
        background.classList.add('cloudy');
    } 
    // Rainy - cozy, introspective mood
    else if (condition.includes('rain') || condition.includes('drizzle')) {
        background.classList.add('rainy');
    } 
    // Thunderstorm - dramatic, intense mood
    else if (condition.includes('thunderstorm')) {
        background.classList.add('stormy');
    }
    // Snowy - magical, peaceful mood
    else if (condition.includes('snow')) {
        background.classList.add('snowy');
    }
    // Cold - crisp, fresh mood
    else if (temp < 10) {
        background.classList.add('cold');
    }
    // Default - neutral, pleasant mood
    else {
        background.classList.add('default');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function calculateUVIndex(icon) {
    // Simulated UV index based on time of day
    if (icon.includes('n')) return '0';
    if (icon === '01d') return '8';
    if (icon === '02d') return '6';
    return '4';
}

function showLoading() {
    elements.loading.classList.remove('hidden');
    elements.weatherDisplay.classList.add('hidden');
    elements.error.classList.add('hidden');
}

function hideLoading() {
    elements.loading.classList.add('hidden');
}

function showError(message) {
    elements.error.classList.remove('hidden');
    elements.weatherDisplay.classList.add('hidden');
    elements.loading.classList.add('hidden');
    document.getElementById('errorText').textContent = message;
}

// ============================================
// AUTO-UPDATE WEATHER (Every 10 minutes)
// ============================================
setInterval(() => {
    if (currentCity && !DEMO_MODE) {
        fetchWeatherByCoords(currentCity.lat, currentCity.lon);
    }
}, 600000); // 10 minutes

// ============================================
// DEMO MODE DATA
// ============================================
function loadDemoData(cityName) {
    const demoData = {
        'accra': {
            name: 'Accra',
            country: 'GH',
            temp: 28,
            feels_like: 31,
            description: 'partly cloudy',
            icon: '02d',
            humidity: 75,
            wind_speed: 12,
            pressure: 1012,
            visibility: 10000
        },
        'london': {
            name: 'London',
            country: 'GB',
            temp: 12,
            feels_like: 10,
            description: 'light rain',
            icon: '10d',
            humidity: 82,
            wind_speed: 18,
            pressure: 1015,
            visibility: 8000
        },
        'new york': {
            name: 'New York',
            country: 'US',
            temp: 15,
            feels_like: 13,
            description: 'clear sky',
            icon: '01d',
            humidity: 65,
            wind_speed: 15,
            pressure: 1018,
            visibility: 10000
        },
        'tokyo': {
            name: 'Tokyo',
            country: 'JP',
            temp: 20,
            feels_like: 19,
            description: 'few clouds',
            icon: '02d',
            humidity: 70,
            wind_speed: 10,
            pressure: 1013,
            visibility: 10000
        }
    };

    const cityKey = cityName.toLowerCase();
    const demo = demoData[cityKey] || {
        name: cityName,
        country: 'XX',
        temp: 22,
        feels_like: 24,
        description: 'clear sky',
        icon: '01d',
        humidity: 70,
        wind_speed: 10,
        pressure: 1013,
        visibility: 10000
    };

    currentCity = { name: demo.name, country: demo.country, lat: 0, lon: 0 };

    // Create demo weather data
    const currentWeather = {
        name: demo.name,
        dt: Math.floor(Date.now() / 1000),
        main: {
            temp: demo.temp,
            feels_like: demo.feels_like,
            humidity: demo.humidity,
            pressure: demo.pressure
        },
        weather: [{
            main: demo.description.includes('rain') ? 'Rain' : demo.description.includes('cloud') ? 'Clouds' : 'Clear',
            description: demo.description,
            icon: demo.icon
        }],
        wind: {
            speed: demo.wind_speed / 3.6
        },
        visibility: demo.visibility
    };

    // Create demo forecast
    const forecast = {
        list: []
    };

    // Generate 40 items (5 days * 8 items per day)
    for (let i = 0; i < 40; i++) {
        const temp = demo.temp + Math.random() * 6 - 3;
        forecast.list.push({
            dt: Math.floor(Date.now() / 1000) + (i * 3 * 3600),
            main: {
                temp: temp,
                temp_min: temp - 2,
                temp_max: temp + 2
            },
            weather: [{
                icon: demo.icon,
                description: demo.description
            }]
        });
    }

    // Create demo air quality
    const airQuality = {
        list: [{
            main: { aqi: 2 },
            components: {
                co: 230.5,
                no2: 15.3,
                o3: 45.2,
                pm2_5: 12.5,
                pm10: 18.7,
                so2: 8.3
            }
        }]
    };

    weatherData = { currentWeather, forecast, airQuality };
    displayWeatherData();
    hideLoading();
}
