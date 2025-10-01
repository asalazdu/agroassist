// Configuración de APIs
export const API_CONFIG = {
  // URL del backend (ajusta según tu configuración)
  BACKEND_URL: 'http://localhost:3000/api',
  
  // API Key de OpenWeatherMap - USAR VARIABLE DE ENTORNO
  WEATHER_API_KEY: process.env.EXPO_PUBLIC_WEATHER_API_KEY || '',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // API Key de OpenAI - USAR VARIABLE DE ENTORNO
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  
  // Configuraciones por defecto
  DEFAULT_CITY: 'Bogotá',
  DEFAULT_COUNTRY: 'CO',
  
  // Timeouts
  REQUEST_TIMEOUT: 10000,
};

// Función para validar que las APIs estén configuradas
export const validateApiConfig = () => {
  const warnings = [];
  
  if (!API_CONFIG.WEATHER_API_KEY) {
    warnings.push('⚠️ WEATHER_API_KEY no está configurada. Las funcionalidades del clima usarán datos de ejemplo.');
  }
  
  if (!API_CONFIG.OPENAI_API_KEY) {
    warnings.push('⚠️ OPENAI_API_KEY no está configurada. El chatbot usará respuestas predefinidas.');
  }
  
  if (API_CONFIG.BACKEND_URL.includes('localhost')) {
    warnings.push('ℹ️ Backend configurado en localhost. Asegúrate de que el servidor esté ejecutándose.');
  }
  
  return warnings;
};
