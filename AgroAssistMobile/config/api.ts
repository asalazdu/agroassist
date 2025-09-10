// Configuración de APIs
export const API_CONFIG = {
  // Backend de AgroAssist
  BASE_URL: 'http://localhost:3000/api',
  
  // OpenWeatherMap (gratuita) - Registrarse en openweathermap.org
  WEATHER_API_KEY: 'tu_api_key_aqui', // Reemplazar con tu API key
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // Geocoding para búsqueda de ubicaciones
  GEOCODING_URL: 'https://api.openweathermap.org/geo/1.0',
  
  // Configuración regional para Colombia
  DEFAULT_COORDS: {
    lat: 4.7110,  // Bogotá, Colombia
    lon: -74.0721
  },
  
  // Configuración de requests
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Headers comunes para las requests
export const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});

// Configuración de idioma para APIs
export const LANGUAGE_CONFIG = {
  weather: 'es', // Español para clima
  country: 'CO'  // Colombia
};
