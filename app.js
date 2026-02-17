// Your OpenWeatherMap API Key
const API_KEY = 'e744bfd9fc069409bc107d67b1faab3e';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// SELECT DOM ELEMENTS
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');

// REFACTORED GETWEATHER WITH UI POLISH
async function getWeather(city) {
    // 1. UI feedback & Button protection (Step 6.2)
    showLoading();
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        
        // Success!
        displayWeather(response.data);
        
        // 2. Focus back to input for next search (Step 6.3)
        cityInput.focus();

    } catch (error) {
        // 3. Specific Error Handling (Step 5.3 Tips)
        if (error.response && error.response.status === 404) {
            showError(`"<strong>${city}</strong>" not found. Please check your spelling.`);
        } else if (error.request) {
            showError("Network error. Please check your internet connection.");
        } else {
            showError("An unexpected error occurred. Please try again.");
        }
        console.error('Fetch Error:', error);
    } finally {
        // 4. Always re-enable button regardless of success/fail
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

// LOADING SPINNER FUNCTION
function showLoading() {
    weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Fetching weather...</p>
        </div>
    `;
}

// ERROR DISPLAY FUNCTION
function showError(message) {
    weatherDisplay.innerHTML = `
        <div class="error-message">
            <p>⚠️ ${message}</p>
        </div>
    `;
}

// Function to display weather data
function displayWeather(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
}

// SEARCH EVENT LISTENER
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    
    // Improved Validation (Step 6.1)
    if (!city) {
        showError("Please enter a city name!");
        return; // Stop execution
    }
    
    getWeather(city);
    cityInput.value = ''; // Clear input after search
});

// ENTER KEY SUPPORT (Step 6.3)
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});