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
    retryBtn: document.getElementById('retryBtn'),
    cityInfoBadge: document.getElementById('cityInfoBadge'),
    cityInfoPanel: document.getElementById('cityInfoPanel'),
    closeInfoBtn: document.getElementById('closeInfoBtn')
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
    elements.cityInfoBadge.addEventListener('click', toggleCityInfo);
    elements.closeInfoBtn.addEventListener('click', toggleCityInfo);

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

        const { lat, lon, name, country, state } = geoData[0];
        currentCity = { 
            name, 
            country, 
            state: state || '', 
            lat, 
            lon 
        };

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
            currentCity = { 
                name: geoReverse[0].name, 
                country: geoReverse[0].country, 
                state: geoReverse[0].state || '', 
                lat, 
                lon 
            };
        } else {
            currentCity = { name: 'Your Location', country: '', state: '', lat, lon };
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

    // Display city information
    displayCityInformation(currentWeather);

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
// CITY INFORMATION (UNIQUE FEATURE)
// ============================================
function displayCityInformation(data) {
    const { name, country, state, lat, lon } = currentCity;
    const countryNames = {
        'GH': 'Ghana', 'GB': 'United Kingdom', 'US': 'United States', 
        'JP': 'Japan', 'FR': 'France', 'DE': 'Germany', 'CN': 'China',
        'IN': 'India', 'BR': 'Brazil', 'AU': 'Australia', 'CA': 'Canada',
        'IT': 'Italy', 'ES': 'Spain', 'MX': 'Mexico', 'KR': 'South Korea',
        'NG': 'Nigeria', 'ZA': 'South Africa', 'EG': 'Egypt', 'KE': 'Kenya'
    };

    // Get timezone offset
    const timezoneOffset = data.timezone || 0;
    const timezoneHours = timezoneOffset / 3600;
    const timezoneString = `UTC${timezoneHours >= 0 ? '+' : ''}${timezoneHours}`;

    // City data
    const cityData = getCityData(name);

    // Update city info panel
    document.getElementById('infoCountry').textContent = countryNames[country] || country || '---';
    document.getElementById('infoRegion').textContent = state || cityData.region || '---';
    document.getElementById('infoCoordinates').textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    document.getElementById('infoTimezone').textContent = timezoneString;
    document.getElementById('infoElevation').textContent = cityData.elevation || 'N/A';
    document.getElementById('infoPopulation').textContent = cityData.population || 'N/A';
    document.getElementById('cityDescription').innerHTML = `<p>${cityData.description}</p>`;
}

function toggleCityInfo() {
    const panel = elements.cityInfoPanel;
    panel.classList.toggle('hidden');
    panel.classList.toggle('slide-in');
}

function getCityData(cityName) {
    const cityDatabase = {
        // Ghana
        'Accra': {
            region: 'Greater Accra',
            elevation: '61 m',
            population: '2.5 million',
            description: "Accra is the capital and largest city of Ghana. It's a vibrant coastal city known for its beaches, markets, and colonial architecture. The city serves as the economic and administrative hub of Ghana."
        },
        'Kumasi': {
            region: 'Ashanti Region',
            elevation: '250 m',
            population: '3.3 million',
            description: "Kumasi is the capital of the Ashanti Region and Ghana's second-largest city. Known as the 'Garden City,' it's the cultural heartland of the Ashanti people, famous for the Manhyia Palace and vibrant markets."
        },
        'Tamale': {
            region: 'Northern Region',
            elevation: '183 m',
            population: '537,000',
            description: "Tamale is the capital of the Northern Region of Ghana. A major commercial hub in northern Ghana, it's known for its markets, cultural festivals, and as a gateway to national parks and traditional villages."
        },
        'Takoradi': {
            region: 'Western Region',
            elevation: '7 m',
            population: '445,000',
            description: "Takoradi is a coastal city and the capital of Western Region. A major seaport and industrial hub, it's known for its beaches, oil and gas industry, and vibrant fishing communities."
        },
        'Cape Coast': {
            region: 'Central Region',
            elevation: '13 m',
            population: '169,000',
            description: "Cape Coast is the capital of Central Region with rich colonial history. Famous for Cape Coast Castle (UNESCO site), it played a significant role in the trans-Atlantic slave trade and is a major tourist destination."
        },
        'Tema': {
            region: 'Greater Accra',
            elevation: '10 m',
            population: '402,000',
            description: "Tema is a planned city and Ghana's main seaport. Built in the 1950s, it's an industrial hub known for its modern harbor, fishing industry, and as the gateway for Ghana's imports and exports."
        },
        
        // Nigeria
        'Lagos': {
            region: 'Lagos State',
            elevation: '41 m',
            population: '15 million',
            description: "Lagos is Nigeria's largest city and economic hub. A vibrant megacity on the Atlantic coast, it's known for its dynamic music scene, markets, beaches, and as a major financial center in Africa."
        },
        'Abuja': {
            region: 'Federal Capital Territory',
            elevation: '840 m',
            population: '3.6 million',
            description: "Abuja is the capital of Nigeria, planned and built in the 1980s. Known for its modern architecture, including the iconic Aso Rock, it serves as the political and administrative center of Nigeria."
        },
        'Kano': {
            region: 'Kano State',
            elevation: '484 m',
            population: '4.1 million',
            description: "Kano is one of Nigeria's oldest cities and commercial centers in the north. Famous for its ancient city walls, vibrant markets, traditional textile industry (adire), and rich Islamic heritage."
        },
        'Ibadan': {
            region: 'Oyo State',
            elevation: '200 m',
            population: '3.6 million',
            description: "Ibadan is one of Nigeria's largest cities and the capital of Oyo State. Known as a major educational center, home to the University of Ibadan, cocoa trade, and rich Yoruba culture."
        },
        'Port Harcourt': {
            region: 'Rivers State',
            elevation: '12 m',
            population: '3.2 million',
            description: "Port Harcourt is the oil and gas capital of Nigeria. A major port city in the Niger Delta, it's the economic hub of southern Nigeria, known for its petroleum industry and waterfront location."
        },
        
        // Kenya
        'Nairobi': {
            region: 'Nairobi County',
            elevation: '1,795 m',
            population: '4.4 million',
            description: "Nairobi is the capital of Kenya and a major hub in East Africa. Known for its wildlife (Nairobi National Park), vibrant culture, and as a center for business and innovation in the region."
        },
        'Mombasa': {
            region: 'Mombasa County',
            elevation: '17 m',
            population: '1.2 million',
            description: "Mombasa is Kenya's second-largest city and main seaport. A historic coastal city with beautiful beaches, it's known for Fort Jesus (UNESCO site), Swahili culture, and as a major tourist destination."
        },
        'Kisumu': {
            region: 'Kisumu County',
            elevation: '1,131 m',
            population: '610,000',
            description: "Kisumu is Kenya's third-largest city on Lake Victoria's shores. A major port and commercial center in western Kenya, known for fishing, sugar industry, and as a gateway to regional tourism."
        },
        
        // South Africa
        'Cape Town': {
            region: 'Western Cape',
            elevation: '25 m',
            population: '4.6 million',
            description: "Cape Town is a coastal city in South Africa. Famous for Table Mountain, beautiful beaches, and vibrant waterfront, it's known for its natural beauty, wine regions, and diverse culture."
        },
        'Johannesburg': {
            region: 'Gauteng',
            elevation: '1,753 m',
            population: '5.7 million',
            description: "Johannesburg is South Africa's largest city and economic hub. Known as the 'City of Gold' due to its mining history, it's a major financial center with vibrant culture and rich history."
        },
        'Durban': {
            region: 'KwaZulu-Natal',
            elevation: '5 m',
            population: '3.9 million',
            description: "Durban is a coastal city known for its beaches and harbor. A major port city with diverse culture, Indian influence, surfing beaches, and warm subtropical climate year-round."
        },
        'Pretoria': {
            region: 'Gauteng',
            elevation: '1,339 m',
            population: '2.5 million',
            description: "Pretoria is South Africa's administrative capital. Known as the 'Jacaranda City' for its purple blooms, it's home to government buildings, museums, and beautiful gardens."
        },
        
        // Egypt
        'Cairo': {
            region: 'Cairo Governorate',
            elevation: '23 m',
            population: '21 million',
            description: "Cairo is the capital of Egypt and the largest city in the Arab world. Home to the nearby Pyramids of Giza and the Sphinx, it's a bustling metropolis blending ancient history with modern urban life."
        },
        'Alexandria': {
            region: 'Alexandria Governorate',
            elevation: '3 m',
            population: '5.3 million',
            description: "Alexandria is Egypt's second-largest city and main seaport. A historic Mediterranean city founded by Alexander the Great, known for the ancient Lighthouse and Library of Alexandria."
        },
        
        // Ethiopia
        'Addis Ababa': {
            region: 'Addis Ababa Region',
            elevation: '2,355 m',
            population: '5.2 million',
            description: "Addis Ababa is the capital of Ethiopia and diplomatic capital of Africa (AU headquarters). A high-altitude city known for its culture, history, coffee, and as a major hub for East Africa."
        },
        
        // Tanzania
        'Dar es Salaam': {
            region: 'Dar es Salaam Region',
            elevation: '13 m',
            population: '6.7 million',
            description: "Dar es Salaam is Tanzania's largest city and main port. A coastal city with vibrant markets, beaches, and as a gateway to Zanzibar and safari destinations like Serengeti."
        },
        
        // Morocco
        'Casablanca': {
            region: 'Casablanca-Settat',
            elevation: '50 m',
            population: '3.8 million',
            description: "Casablanca is Morocco's largest city and economic hub. Known for the Hassan II Mosque, Art Deco architecture, vibrant medina, and as a major port and commercial center."
        },
        'Marrakech': {
            region: 'Marrakech-Safi',
            elevation: '466 m',
            population: '1 million',
            description: "Marrakech is a major Moroccan city known for its vibrant souks, historic medina (UNESCO site), gardens, palaces, and as a major tourist destination with rich cultural heritage."
        },
        
        // Senegal
        'Dakar': {
            region: 'Dakar Region',
            elevation: '22 m',
            population: '3.1 million',
            description: "Dakar is the capital of Senegal on the Cape Verde Peninsula. Known for its music scene, Gorée Island (UNESCO site), vibrant markets, and as West Africa's westernmost city."
        },
        
        // Uganda
        'Kampala': {
            region: 'Central Region',
            elevation: '1,190 m',
            population: '1.7 million',
            description: "Kampala is the capital of Uganda built on seven hills. A vibrant city known for its friendly people, nightlife, markets, and as the gateway to gorilla trekking and national parks."
        },
        
        // Rwanda
        'Kigali': {
            region: 'Kigali Province',
            elevation: '1,567 m',
            population: '1.2 million',
            description: "Kigali is the capital of Rwanda, known as Africa's cleanest city. A modern, organized city with rolling hills, genocide memorials, vibrant culture, and remarkable post-conflict development."
        },
        
        // Zimbabwe
        'Harare': {
            region: 'Harare Province',
            elevation: '1,483 m',
            population: '1.5 million',
            description: "Harare is the capital of Zimbabwe. A city with wide streets, parks, and jacaranda trees, known for its history, culture, and as a gateway to Victoria Falls and wildlife parks."
        },
        
        // Ivory Coast
        'Abidjan': {
            region: 'Lagunes District',
            elevation: '10 m',
            population: '4.9 million',
            description: "Abidjan is the economic capital of Ivory Coast. A major port city with modern skyline, vibrant nightlife, French influence, and known as the 'Paris of West Africa.'"
        },
        
        // Europe
        'London': {
            region: 'England',
            elevation: '11 m',
            population: '9.7 million',
            description: "London is the capital and largest city of England and the United Kingdom. A global hub for culture, finance, and history, it's home to iconic landmarks like Big Ben, the Tower of London, and Buckingham Palace."
        },
        'Paris': {
            region: 'Île-de-France',
            elevation: '35 m',
            population: '2.2 million',
            description: "Paris, the capital of France, is renowned as the 'City of Light' and 'City of Love.' Famous for the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral, it's a global center for art, fashion, and culture."
        },
        'Berlin': {
            region: 'Brandenburg',
            elevation: '34 m',
            population: '3.7 million',
            description: "Berlin is the capital of Germany and a major European cultural hub. Known for its art scene, modern architecture, vibrant nightlife, and historical landmarks including the Berlin Wall and Brandenburg Gate."
        },
        'Rome': {
            region: 'Lazio',
            elevation: '21 m',
            population: '2.9 million',
            description: "Rome is the capital of Italy and one of the world's oldest cities. Known as the 'Eternal City,' it's home to the Colosseum, Vatican City, and countless historical treasures from ancient times."
        },
        'Madrid': {
            region: 'Community of Madrid',
            elevation: '667 m',
            population: '3.3 million',
            description: "Madrid is the capital of Spain and one of Europe's most vibrant cities. Known for its art museums (Prado, Reina Sofia), beautiful parks, lively nightlife, and passionate football culture."
        },
        'Amsterdam': {
            region: 'North Holland',
            elevation: '-2 m',
            population: '872,000',
            description: "Amsterdam is the capital of the Netherlands. Famous for its canals, historic architecture, museums (Van Gogh, Anne Frank House), cycling culture, and liberal atmosphere."
        },
        'Barcelona': {
            region: 'Catalonia',
            elevation: '12 m',
            population: '1.6 million',
            description: "Barcelona is a coastal city in Spain. Famous for Gaudí's architecture (Sagrada Familia), beautiful beaches, vibrant culture, and as a major center for art, fashion, and sports."
        },
        'Moscow': {
            region: 'Central Russia',
            elevation: '156 m',
            population: '12.5 million',
            description: "Moscow is Russia's capital and largest city. Home to the iconic Red Square, Kremlin, and St. Basil's Cathedral, it's a major political, economic, and cultural center with rich history and grand architecture."
        },
        'Istanbul': {
            region: 'Marmara',
            elevation: '39 m',
            population: '15.5 million',
            description: "Istanbul is Turkey's largest city, straddling Europe and Asia. Rich in history as the former Byzantine and Ottoman capital, it's famous for the Hagia Sophia, Blue Mosque, and vibrant bazaars."
        },
        
        // North America
        'New York': {
            region: 'New York State',
            elevation: '10 m',
            population: '8.3 million',
            description: "New York City is the most populous city in the United States. Known as 'The City That Never Sleeps,' it's a global center for finance, culture, media, and entertainment, featuring landmarks like the Statue of Liberty and Times Square."
        },
        'Los Angeles': {
            region: 'California',
            elevation: '93 m',
            population: '4 million',
            description: "Los Angeles is a sprawling Southern California city and the center of the nation's film and television industry. Famous for Hollywood, beautiful beaches, and diverse neighborhoods, it's a global entertainment capital."
        },
        'Chicago': {
            region: 'Illinois',
            elevation: '179 m',
            population: '2.7 million',
            description: "Chicago is a major city on Lake Michigan known for its bold architecture, deep-dish pizza, and vibrant arts scene. The skyline features iconic buildings and it's a major financial and cultural center."
        },
        'Toronto': {
            region: 'Ontario',
            elevation: '76 m',
            population: '2.9 million',
            description: "Toronto is Canada's largest city and a major financial center. Known for the CN Tower, diverse neighborhoods, vibrant arts scene, and as one of the most multicultural cities in the world."
        },
        'Mexico City': {
            region: 'Federal District',
            elevation: '2,240 m',
            population: '9.2 million',
            description: "Mexico City is one of the oldest and largest cities in the Americas. Rich in history and culture, it features ancient Aztec ruins, colonial architecture, world-class museums, and vibrant markets."
        },
        'Miami': {
            region: 'Florida',
            elevation: '2 m',
            population: '467,000',
            description: "Miami is a coastal city in South Florida known for its beautiful beaches, Art Deco architecture, vibrant nightlife, and as a major cruise port and gateway to Latin America."
        },
        
        // South America
        'São Paulo': {
            region: 'São Paulo State',
            elevation: '760 m',
            population: '12.3 million',
            description: "São Paulo is Brazil's largest city and the largest in South America. A major financial center known for its cultural diversity, vibrant arts scene, world-class restaurants, and bustling urban life."
        },
        'Rio de Janeiro': {
            region: 'Rio de Janeiro State',
            elevation: '2 m',
            population: '6.7 million',
            description: "Rio de Janeiro is a coastal Brazilian city famous for its stunning beaches (Copacabana, Ipanema), Christ the Redeemer statue, Carnival festival, and dramatic mountain backdrop."
        },
        'Buenos Aires': {
            region: 'Buenos Aires Province',
            elevation: '25 m',
            population: '3 million',
            description: "Buenos Aires is the capital of Argentina. Known for tango, European-style architecture, passionate football culture, delicious steaks, and vibrant neighborhoods like La Boca and Palermo."
        },
        
        // Asia
        'Tokyo': {
            region: 'Kanto',
            elevation: '40 m',
            population: '14 million',
            description: "Tokyo is the capital and most populous city of Japan. A fascinating blend of traditional and modern, it's known for its skyscrapers, temples, shopping districts, and cutting-edge technology."
        },
        'Dubai': {
            region: 'Dubai Emirate',
            elevation: '16 m',
            population: '3.5 million',
            description: "Dubai is the largest city in the United Arab Emirates. Known for ultramodern architecture, luxury shopping, and vibrant nightlife, it features the world's tallest building, Burj Khalifa."
        },
        'Singapore': {
            region: 'Central Region',
            elevation: '15 m',
            population: '5.7 million',
            description: "Singapore is a sovereign city-state and island country in Southeast Asia. A global financial center, it's known for its modern skyline, Gardens by the Bay, diverse culture, and reputation as one of the world's cleanest cities."
        },
        'Mumbai': {
            region: 'Maharashtra',
            elevation: '14 m',
            population: '21 million',
            description: "Mumbai (formerly Bombay) is India's largest city and financial capital. A bustling metropolis, it's home to Bollywood, diverse cuisine, colonial architecture, and vibrant street life."
        },
        'Delhi': {
            region: 'National Capital Territory',
            elevation: '216 m',
            population: '32 million',
            description: "Delhi is the capital of India. A city of contrasts blending ancient and modern, it's home to historic monuments like the Red Fort, India Gate, diverse cuisine, and bustling markets."
        },
        'Bangkok': {
            region: 'Central Thailand',
            elevation: '1.5 m',
            population: '10.7 million',
            description: "Bangkok is Thailand's capital and largest city. Known for ornate temples, vibrant street life, bustling markets, delicious street food, and a dynamic nightlife scene."
        },
        'Beijing': {
            region: 'Northern China',
            elevation: '43 m',
            population: '21.5 million',
            description: "Beijing is the capital of China and one of the world's oldest cities. Home to the Forbidden City, Great Wall nearby, and modern Olympic venues, it's a major cultural and political center."
        },
        'Shanghai': {
            region: 'Eastern China',
            elevation: '4 m',
            population: '27 million',
            description: "Shanghai is China's largest city and a global financial hub. Known for its futuristic skyline, historic waterfront Bund, excellent shopping, and as a major center for business and culture."
        },
        'Seoul': {
            region: 'Seoul Capital Area',
            elevation: '38 m',
            population: '9.7 million',
            description: "Seoul is the capital of South Korea. A dynamic metropolis blending modern skyscrapers with traditional palaces, it's known for K-pop, technology, delicious cuisine, and vibrant street culture."
        },
        'Hong Kong': {
            region: 'Special Administrative Region',
            elevation: '2 m',
            population: '7.5 million',
            description: "Hong Kong is a vibrant city and special administrative region of China. Known for its stunning skyline, bustling harbor, dim sum cuisine, and unique blend of Eastern and Western cultures."
        },
        
        // Oceania
        'Sydney': {
            region: 'New South Wales',
            elevation: '3 m',
            population: '5.4 million',
            description: "Sydney is Australia's largest and most iconic city. Famous for the Sydney Opera House and Harbour Bridge, it's known for beautiful beaches, vibrant culture, and stunning natural harbors."
        },
        'Melbourne': {
            region: 'Victoria',
            elevation: '31 m',
            population: '5 million',
            description: "Melbourne is Australia's cultural capital. Known for its coffee culture, street art, sports passion (Australian football), diverse food scene, and European-style architecture."
        },
        'Auckland': {
            region: 'North Island',
            elevation: '26 m',
            population: '1.7 million',
            description: "Auckland is New Zealand's largest city. Known as the 'City of Sails,' it's surrounded by harbors and islands, offering beautiful scenery, outdoor activities, and Polynesian culture."
        }
    };

    return cityDatabase[cityName] || {
        region: currentCity?.state || 'Various',
        elevation: 'Data unavailable',
        population: 'Data unavailable',
        description: `${cityName} is a unique destination with its own character and charm. Check the current weather conditions above to plan your day!`
    };
}

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
            state: 'Greater Accra',
            lat: 5.6037,
            lon: -0.1870,
            temp: 28,
            feels_like: 31,
            description: 'partly cloudy',
            icon: '02d',
            humidity: 75,
            wind_speed: 12,
            pressure: 1012,
            visibility: 10000,
            timezone: 0
        },
        'lagos': {
            name: 'Lagos',
            country: 'NG',
            state: 'Lagos State',
            lat: 6.5244,
            lon: 3.3792,
            temp: 29,
            feels_like: 33,
            description: 'scattered clouds',
            icon: '03d',
            humidity: 78,
            wind_speed: 14,
            pressure: 1011,
            visibility: 10000,
            timezone: 3600
        },
        'london': {
            name: 'London',
            country: 'GB',
            state: 'England',
            lat: 51.5074,
            lon: -0.1278,
            temp: 12,
            feels_like: 10,
            description: 'light rain',
            icon: '10d',
            humidity: 82,
            wind_speed: 18,
            pressure: 1015,
            visibility: 8000,
            timezone: 0
        },
        'new york': {
            name: 'New York',
            country: 'US',
            state: 'New York',
            lat: 40.7128,
            lon: -74.0060,
            temp: 15,
            feels_like: 13,
            description: 'clear sky',
            icon: '01d',
            humidity: 65,
            wind_speed: 15,
            pressure: 1018,
            visibility: 10000,
            timezone: -18000
        },
        'tokyo': {
            name: 'Tokyo',
            country: 'JP',
            state: 'Kanto',
            lat: 35.6762,
            lon: 139.6503,
            temp: 20,
            feels_like: 19,
            description: 'few clouds',
            icon: '02d',
            humidity: 70,
            wind_speed: 10,
            pressure: 1013,
            visibility: 10000,
            timezone: 32400
        }
    };

    const cityKey = cityName.toLowerCase();
    const demo = demoData[cityKey] || {
        name: cityName,
        country: 'XX',
        state: '',
        lat: 0,
        lon: 0,
        temp: 22,
        feels_like: 24,
        description: 'clear sky',
        icon: '01d',
        humidity: 70,
        wind_speed: 10,
        pressure: 1013,
        visibility: 10000,
        timezone: 0
    };

    currentCity = { 
        name: demo.name, 
        country: demo.country, 
        state: demo.state,
        lat: demo.lat, 
        lon: demo.lon 
    };

    // Create demo weather data
    const currentWeather = {
        name: demo.name,
        dt: Math.floor(Date.now() / 1000),
        timezone: demo.timezone,
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
