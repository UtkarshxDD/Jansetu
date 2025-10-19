// Weather API Configuration
export const WEATHER_CONFIG = {
    // Get your free API key from https://openweathermap.org/api
    API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key',
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    UNITS: 'metric', // metric, imperial, or kelvin
    
    // Weather correlation thresholds
    THRESHOLDS: {
        HEAVY_RAIN: 1, // mm/hour
        HIGH_WIND: 15, // km/h
        EXTREME_HEAT: 35, // celsius
        HIGH_HUMIDITY: 80, // percentage
    },
    
    // Issue type mappings
    CORRELATIONS: {
        'Water Supply': {
            weatherFactors: ['precipitation', 'humidity'],
            highRiskThreshold: 0.8,
            mediumRiskThreshold: 0.6
        },
        'Road Issues': {
            weatherFactors: ['temperature', 'precipitation'],
            highRiskThreshold: 0.7,
            mediumRiskThreshold: 0.5
        },
        'Infrastructure': {
            weatherFactors: ['windSpeed', 'precipitation'],
            highRiskThreshold: 0.7,
            mediumRiskThreshold: 0.5
        },
        'Garbage Collection': {
            weatherFactors: ['humidity', 'temperature'],
            highRiskThreshold: 0.6,
            mediumRiskThreshold: 0.4
        }
    }
};

// Weather condition icons mapping
export const WEATHER_ICONS = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

export default WEATHER_CONFIG;
