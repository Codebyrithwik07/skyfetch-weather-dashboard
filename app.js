// WeatherApp Constructor Function
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    
    // Store DOM references
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');
    
    this.init();
}

// Initialization method
WeatherApp.prototype.init = function() {
    // Bind handleSearch to maintain 'this' context
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    
    this.cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    });

    this.showWelcome();
};

// Welcome message method
WeatherApp.prototype.showWelcome = function() {
    const welcomeHTML = `
        <div class="welcome-message">
            <div style="font-size: 3rem;">🌤️</div>
            <h2>Welcome to WeatherApp</h2>
            <p>Enter a city name above to get the current weather and 5-day forecast.</p>
        </div>
    `;
    this.weatherDisplay.innerHTML = welcomeHTML;
};

// Handle Search logic
WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();
    
    if (!city) {
        this.showError("Please enter a city name!");
        return;
    }

    if (city.length < 2) {
        this.showError("City name is too short.");
        return;
    }
    
    this.getWeather(city);
    this.cityInput.value = '';
};

// Fetch current weather and forecast
WeatherApp.prototype.getWeather = async function(city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentWeatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    
    try {
        // Use Promise.all to fetch both APIs simultaneously
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);
        
        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);
        
    } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.status === 404) {
            this.showError(`"<strong>${city}</strong>" not found. Please check spelling.`);
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Search';
    }
};

// Fetch forecast data
WeatherApp.prototype.getForecast = async function(city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Filter data to one entry per day at noon
WeatherApp.prototype.processForecastData = function(data) {
    const dailyForecasts = data.list.filter((item) => {
        return item.dt_txt.includes('12:00:00');
    });
    return dailyForecasts.slice(0, 5);
};

// Display current weather
WeatherApp.prototype.displayWeather = function(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    this.cityInput.focus();
};

// Display 5-day forecast cards
WeatherApp.prototype.displayForecast = function(data) {
    const dailyForecasts = this.processForecastData(data);
    
    const forecastHTML = dailyForecasts.map((day) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        
        return `
            <div class="forecast-card">
                <div class="forecast-day">${dayName}</div>
                <img src="${iconUrl}" alt="${description}">
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-desc">${description}</div>
            </div>
        `;
    }).join('');
    
    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container" style="display: flex; justify-content: space-around; gap: 10px; margin-top: 20px;">
                ${forecastHTML}
            </div>
        </div>
    `;
    
    this.weatherDisplay.innerHTML += forecastSection;
};

// Show loading state
WeatherApp.prototype.showLoading = function() {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Fetching weather...</p>
        </div>
    `;
};

// Show error state
WeatherApp.prototype.showError = function(message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <p>⚠️ ${message}</p>
        </div>
    `;
};

// Create single instance of WeatherApp
const app = new WeatherApp('e744bfd9fc069409bc107d67b1faab3e');