// Configuración de APIs
export const API_CONFIG = {
  // URL del backend (ajusta según tu configuración)
  BACKEND_URL: 'http://localhost:3000/api',
  
  // API Key de OpenWeatherMap (reemplaza con tu API key real)
  WEATHER_API_KEY: 'tu_api_key_aqui',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // Configuraciones por defecto
  DEFAULT_CITY: 'Bogotá',
  DEFAULT_COUNTRY: 'CO',
  
  // Timeouts
  REQUEST_TIMEOUT: 10000,
};

// Función para validar que las APIs estén configuradas
export const validateApiConfig = () => {
  const warnings = [];
  
  if (API_CONFIG.WEATHER_API_KEY === 'tu_api_key_aqui') {
    warnings.push('⚠️ WEATHER_API_KEY no está configurada. Las funcionalidades del clima usarán datos de ejemplo.');
  }
  
  if (API_CONFIG.BACKEND_URL.includes('localhost')) {
    warnings.push('ℹ️ Backend configurado en localhost. Asegúrate de que el servidor esté ejecutándose.');
  }
  
  return warnings;
};
