import axios from 'axios';
import { WeatherData, DayForecast } from '../types';
import { API_CONFIG } from '../config/api';

class WeatherService {
  private static instance: WeatherService;
  
  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  private getMockWeatherData(cityName: string = 'Bogotá'): WeatherData {
    // Datos de ejemplo para cuando no esté configurada la API
    return {
      current: {
        temperature: 22,
        description: 'Parcialmente nublado',
        humidity: 68,
        windSpeed: 12,
        icon: '02d'
      },
      forecast: [
        {
          date: 'Hoy',
          temperature: { min: 15, max: 25 },
          description: 'Soleado',
          icon: '01d',
          humidity: 60,
          precipitation: 0
        },
        {
          date: 'Mañana',
          temperature: { min: 16, max: 26 },
          description: 'Parcialmente nublado',
          icon: '02d',
          humidity: 65,
          precipitation: 10
        },
        {
          date: 'Pasado mañana',
          temperature: { min: 17, max: 24 },
          description: 'Lluvioso',
          icon: '10d',
          humidity: 80,
          precipitation: 75
        },
        {
          date: 'En 3 días',
          temperature: { min: 14, max: 22 },
          description: 'Nublado',
          icon: '04d',
          humidity: 70,
          precipitation: 20
        },
        {
          date: 'En 4 días',
          temperature: { min: 16, max: 27 },
          description: 'Soleado',
          icon: '01d',
          humidity: 55,
          precipitation: 0
        }
      ],
      location: cityName
    };
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    // Si no tenemos API key configurada, usar datos de ejemplo
    if (API_CONFIG.WEATHER_API_KEY === 'tu_api_key_aqui') {
      console.log('Demo: Usando datos de clima de ejemplo');
      return this.getMockWeatherData('Ubicación actual');
    }

    try {
      // Obtener clima actual
      const currentResponse = await axios.get(`${API_CONFIG.WEATHER_BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_CONFIG.WEATHER_API_KEY,
          units: 'metric',
          lang: 'es'
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });

      // Obtener pronóstico de 5 días
      const forecastResponse = await axios.get(`${API_CONFIG.WEATHER_BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_CONFIG.WEATHER_API_KEY,
          units: 'metric',
          lang: 'es'
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });

      // Procesar datos del clima actual
      const current = {
        temperature: Math.round(currentResponse.data.main.temp),
        description: currentResponse.data.weather[0].description,
        humidity: currentResponse.data.main.humidity,
        windSpeed: currentResponse.data.wind.speed,
        icon: currentResponse.data.weather[0].icon
      };

      // Procesar pronóstico (tomar solo uno por día)
      const forecastData = forecastResponse.data.list;
      const dailyForecast: DayForecast[] = [];
      const processedDates = new Set();

      forecastData.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!processedDates.has(date) && dailyForecast.length < 5) {
          dailyForecast.push({
            date: new Date(item.dt * 1000).toLocaleDateString('es-ES'),
            temperature: {
              min: Math.round(item.main.temp_min),
              max: Math.round(item.main.temp_max)
            },
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            precipitation: item.rain ? item.rain['3h'] || 0 : 0
          });
          processedDates.add(date);
        }
      });

      return {
        current,
        forecast: dailyForecast,
        location: currentResponse.data.name
      };
    } catch (error) {
      console.error('Error obteniendo datos del clima:', error);
      console.log('Fallback: Usando datos de clima de ejemplo');
      return this.getMockWeatherData('Ubicación actual');
    }
  }

  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    // Si no tenemos API key configurada, usar datos de ejemplo
    if (API_CONFIG.WEATHER_API_KEY === 'tu_api_key_aqui') {
      console.log('Demo: Usando datos de clima de ejemplo para', cityName);
      return this.getMockWeatherData(cityName);
    }

    try {
      // Primero obtener coordenadas de la ciudad
      const geoResponse = await axios.get(`${API_CONFIG.WEATHER_BASE_URL}/weather`, {
        params: {
          q: `${cityName},${API_CONFIG.DEFAULT_COUNTRY}`,
          appid: API_CONFIG.WEATHER_API_KEY,
          units: 'metric',
          lang: 'es'
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });

      const { lat, lon } = geoResponse.data.coord;
      return this.getCurrentWeather(lat, lon);
    } catch (error) {
      console.error('Error obteniendo clima por ciudad:', error);
      console.log('Fallback: Usando datos de clima de ejemplo para', cityName);
      return this.getMockWeatherData(cityName);
    }
  }

  // Obtener recomendaciones agrícolas basadas en el clima
  getAgriculturalRecommendations(weatherData: WeatherData): string[] {
    const recommendations: string[] = [];
    const { current, forecast } = weatherData;

    // Recomendaciones basadas en temperatura
    if (current.temperature > 30) {
      recommendations.push('🌡️ Temperaturas altas: Aumentar la frecuencia de riego');
      recommendations.push('☂️ Proporcionar sombra a cultivos sensibles');
    } else if (current.temperature < 10) {
      recommendations.push('❄️ Temperaturas bajas: Proteger plantas del frío');
      recommendations.push('🔥 Considerar sistemas de calefacción para invernaderos');
    }

    // Recomendaciones basadas en humedad
    if (current.humidity > 80) {
      recommendations.push('💨 Alta humedad: Mejorar ventilación para prevenir hongos');
      recommendations.push('🍄 Vigilar signos de enfermedades fúngicas');
    } else if (current.humidity < 40) {
      recommendations.push('💧 Baja humedad: Aumentar riego y considerar nebulización');
    }

    // Recomendaciones basadas en viento
    if (current.windSpeed > 20) {
      recommendations.push('🌪️ Viento fuerte: Proteger plantas jóvenes con barreras');
      recommendations.push('🏠 Revisar estructuras de invernaderos');
    }

    // Recomendaciones basadas en pronóstico
    const rainDays = forecast.filter(day => day.precipitation > 10).length;
    if (rainDays >= 3) {
      recommendations.push('🌧️ Varios días de lluvia: Asegurar buen drenaje');
      recommendations.push('🦠 Aplicar fungicidas preventivos');
    } else if (rainDays === 0) {
      recommendations.push('☀️ Sin lluvia próxima: Planificar sistemas de riego');
      recommendations.push('🌱 Buen momento para transplantes');
    }

    // Recomendaciones generales si no hay condiciones específicas
    if (recommendations.length === 0) {
      recommendations.push('🌾 Condiciones ideales para actividades agrícolas');
      recommendations.push('🚜 Buen momento para labores de campo');
      recommendations.push('🌱 Continuar con el plan de siembra establecido');
    }

    return recommendations;
  }

  // Búsqueda de ciudades para autocompletar
  async searchCities(query: string): Promise<string[]> {
    const colombianCities = [
      'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
      'Cúcuta', 'Soledad', 'Ibagué', 'Bucaramanga', 'Soacha',
      'Santa Marta', 'Villavicencio', 'Valledupar', 'Pereira',
      'Montería', 'Manizales', 'Pasto', 'Neiva', 'Armenia',
      'Popayán', 'Sincelejo', 'Tunja', 'Florencia', 'Riohacha'
    ];

    return colombianCities.filter(city => 
      city.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export default WeatherService.getInstance();
