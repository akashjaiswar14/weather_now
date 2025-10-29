import React, { useState } from 'react';
import "./WeatherInfo.css";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudFog, 
  Zap, 
  CloudDrizzle, 
  Wind, 
  Droplets, 
  Thermometer,
  Search,
  MapPin
} from 'lucide-react';

const weatherCodeMap = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

const WeatherIcon = ({ code }) => {
  const iconProps = { size: 96, className: "text-blue-500" };

  if ([0, 1].includes(code)) {
    return <Sun {...iconProps} className="text-yellow-500" />;
  }
  if ([2, 3].includes(code)) {
    return <Cloud {...iconProps} className="text-gray-500" />;
  }
  if ([45, 48].includes(code)) {
    return <CloudFog {...iconProps} className="text-gray-400" />;
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return <CloudRain {...iconProps} />;
  }
  if ([56, 57, 66, 67].includes(code)) {
    return <CloudDrizzle {...iconProps} />;
  }
  if ([71, 73, 75, 85, 86].includes(code)) {
    return <CloudSnow {...iconProps} />;
  }
  if ([95, 96, 99].includes(code)) {
    return <Zap {...iconProps} className="text-yellow-600" />;
  }

  return <Cloud {...iconProps} />; 
};


const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
    }}
  >
    <div
      style={{
        width: "3rem",
        height: "3rem",
        border: "4px solid #3b82f6",
        borderTop: "4px solid transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>

    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

const WeatherInfo = ({ weather, location }) => {
  const weatherDescription = weatherCodeMap[weather.weather_code] || "Unknown weather condition";

  return (
    <div className="weather-container">
      <div className="location">
        <MapPin className="icon-gray" size={24} />
        <h2 className="city">
          {location.name}, {location.country}
        </h2>
      </div>

      <div className="main-info">
        <WeatherIcon code={weather.weather_code} />
        <p className="temperature">{weather.temperature_2m}°C</p>
        <p className="description">{weatherDescription}</p>
      </div>

      {/* Details Grid */}
      <div className="details-grid">
        <div className="detail-card">
          <Droplets size={24} className="icon-blue" />
          <div>
            <span className="label">Humidity</span>
            <p className="value">{weather.relative_humidity_2m}%</p>
          </div>
        </div>

        <div className="detail-card">
          <Wind size={24} className="icon-gray" />
          <div>
            <span className="label">Wind Speed</span>
            <p className="value">{weather.wind_speed_10m} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const getCoordinates = async (cityName) => {
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch coordinates.");
      }
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const city = data.results[0];
        return {
          name: city.name,
          country: city.country,
          latitude: city.latitude,
          longitude: city.longitude
        };
      } else {
        throw new Error("City not found. Please try another city.");
      }
    } catch (err) {
      throw new Error(err.message || "Could not find city.");
    }
  };

  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError(null);
    setWeather(null);
    setLocation(null);

    try {
      const coords = await getCoordinates(city);
      setLocation({ name: coords.name, country: coords.country });

      const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const weatherResponse = await fetch(weatherApiUrl);
      
      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data.");
      }
      
      const weatherData = await weatherResponse.json();
      
      if (weatherData && weatherData.current) {
        setWeather(weatherData.current);
      } else {
        throw new Error("Invalid weather data format received.");
      }
      
      setCity("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="weather-box">
        <h1 className="app-title">Weather App</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="search-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading}
          >
            <Search size={20} />
          </button>
        </form>

        <div className="results-area">
          {loading && <LoadingSpinner />}

          {error && <div className="error-box">{error}</div>}

          {weather && location && !loading && (
            <WeatherInfo weather={weather} location={location} />
          )}
        </div>
      </div>
    </div>
  );
}
