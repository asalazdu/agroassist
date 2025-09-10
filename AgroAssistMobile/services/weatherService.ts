import { API_CONFIG, LANGUAGE_CONFIG } from '../config/api';

export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  icon: string;
  windSpeed: number;
  visibility: number;
  timestamp: string;
  recommendations: string[];
}

export interface ForecastData {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  humidity: number;
  precipitationChance: number;
}

export interface LocationData {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface WeatherResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
}

export interface ForecastResponse {
  success: boolean;
  data?: ForecastData[];
  error?: string;
}

class WeatherService {
  private apiKey = API_CONFIG.WEATHER_API_KEY;
  
  // Obtener ubicaciones por búsqueda
  async searchLocations(query: string): Promise<LocationData[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.GEOCODING_URL}/direct?q=${encodeURIComponent(query)},CO&limit=5&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Error al buscar ubicaciones');
      }
      
      const data = await response.json();
      
      return data.map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      throw new Error('No se pudieron buscar las ubicaciones');
    }
  }
  
  // Obtener ubicación por coordenadas (reverse geocoding)
  async getLocationByCoords(lat: number, lon: number): Promise<LocationData> {
    try {
      const response = await fetch(
        `${API_CONFIG.GEOCODING_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener ubicación');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error('Ubicación no encontrada');
      }
      
      const location = data[0];
      return {
        name: location.name,
        country: location.country,
        state: location.state,
        lat,
        lon
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw new Error('No se pudo obtener la ubicación');
    }
  }
  
  // Obtener clima actual
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=${LANGUAGE_CONFIG.weather}`
      );
      
      if (!response.ok) {
        return { success: false, error: 'Error al obtener clima actual' };
      }
      
      const rawData = await response.json();
      const location = await this.getLocationByCoords(lat, lon);
      
      const weatherData: WeatherData = {
        location: location.name,
        country: location.country,
        temperature: Math.round(rawData.main.temp),
        feelsLike: Math.round(rawData.main.feels_like),
        humidity: rawData.main.humidity,
        condition: rawData.weather[0].description,
        icon: rawData.weather[0].icon,
        windSpeed: Math.round(rawData.wind.speed * 3.6), // m/s to km/h
        visibility: Math.round((rawData.visibility || 10000) / 1000), // meters to km
        timestamp: new Date().toISOString(),
        recommendations: this.getAgriculturalRecommendations(rawData, { list: [] })
      };
      
      return { success: true, data: weatherData };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }
  
  // Obtener pronóstico de 5 días
  async getForecast(lat: number, lon: number): Promise<ForecastResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=${LANGUAGE_CONFIG.weather}`
      );
      
      if (!response.ok) {
        return { success: false, error: 'Error al obtener pronóstico' };
      }
      
      const forecast = await response.json();
      const forecastData = await this.get3DayForecast(lat, lon);
      
      return { success: true, data: forecastData };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }
  
  // Obtener clima completo (actual + pronóstico 3 días)
  async getCompleteWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const [currentWeather, forecast, location] = await Promise.all([
        this.getCurrentWeather(lat, lon),
        this.getForecast(lat, lon),
        this.getLocationByCoords(lat, lon)
      ]);
      
      // Procesar datos del clima actual
      const current = {
        temp: Math.round(currentWeather.main.temp),
        feelsLike: Math.round(currentWeather.main.feels_like),
        humidity: currentWeather.main.humidity,
        description: currentWeather.weather[0].description,
        icon: currentWeather.weather[0].icon,
        windSpeed: currentWeather.wind.speed,
        pressure: currentWeather.main.pressure
      };
      
      // Procesar pronóstico - agrupar por días y tomar los próximos 3
      const dailyForecast = this.processForecastData(forecast.list);
      
      return {
        location: location.name,
        country: location.country,
        current,
        forecast: dailyForecast.slice(0, 3) // Solo próximos 3 días
      };
    } catch (error) {
      console.error('Error getting complete weather:', error);
      throw new Error('No se pudo obtener la información del clima');
    }
  }
  
  private processForecastData(forecastList: any[]): any[] {
    const dailyData: { [key: string]: any } = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          day: date.toLocaleDateString('es-ES', { weekday: 'long' }),
          temps: [],
          descriptions: [],
          icons: [],
          humidity: [],
          windSpeed: [],
          precipitation: 0
        };
      }
      
      dailyData[dateKey].temps.push(item.main.temp);
      dailyData[dateKey].descriptions.push(item.weather[0].description);
      dailyData[dateKey].icons.push(item.weather[0].icon);
      dailyData[dateKey].humidity.push(item.main.humidity);
      dailyData[dateKey].windSpeed.push(item.wind.speed);
      
      if (item.rain) {
        dailyData[dateKey].precipitation += item.rain['3h'] || 0;
      }
    });
    
    return Object.values(dailyData).map((day: any) => ({
      date: day.date,
      day: day.day.charAt(0).toUpperCase() + day.day.slice(1),
      temp: {
        min: Math.round(Math.min(...day.temps)),
        max: Math.round(Math.max(...day.temps))
      },
      description: day.descriptions[Math.floor(day.descriptions.length / 2)],
      icon: day.icons[Math.floor(day.icons.length / 2)],
      humidity: Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length),
      windSpeed: day.windSpeed.reduce((a: number, b: number) => a + b, 0) / day.windSpeed.length,
      precipitation: Math.round(day.precipitation * 10) / 10
    }));
  }
  
  // Obtener recomendaciones agrícolas basadas en el clima
  getAgriculturalRecommendations(currentWeather: any, forecast: any): string[] {
    const recommendations: string[] = [];
    const temp = currentWeather.main.temp;
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;
    
    // Recomendaciones basadas en temperatura
    if (temp > 30) {
      recommendations.push('🌡️ Temperatura alta: Aumentar riego y proporcionar sombra a cultivos sensibles');
    } else if (temp < 15) {
      recommendations.push('❄️ Temperatura baja: Proteger cultivos del frío, considerar manta térmica');
    }
    
    // Recomendaciones basadas en humedad
    if (humidity > 80) {
      recommendations.push('💧 Humedad alta: Vigilar enfermedades fúngicas, mejorar ventilación');
    } else if (humidity < 40) {
      recommendations.push('🏜️ Humedad baja: Aumentar riego por aspersión, mulching para retener humedad');
    }
    
    // Recomendaciones basadas en pronóstico
    const rainyDays = forecast.list.filter((item: any) => 
      item.weather[0].main.toLowerCase().includes('rain')
    ).length;
    
    if (rainyDays >= 3) {
      recommendations.push('🌧️ Lluvias próximas: Posponer aplicaciones foliares, revisar drenaje');
    } else if (rainyDays === 0) {
      recommendations.push('☀️ Días secos: Planificar riego, verificar sistemas de irrigación');
    }
    
    // Recomendaciones basadas en viento
    if (windSpeed > 10) {
      recommendations.push('💨 Vientos fuertes: Evitar fumigaciones, proteger plantas jóvenes');
    }
    
    // Recomendaciones generales para Colombia
    const condition = currentWeather.weather[0].main.toLowerCase();
    if (condition.includes('rain')) {
      recommendations.push('🌾 Ideal para siembra de cultivos de temporada lluviosa como arroz y maíz');
    } else if (condition.includes('clear')) {
      recommendations.push('☀️ Perfecto para cosecha y aplicación de tratamientos foliares');
    }
    
    return recommendations;
  }
  
  // Wrapper methods for new interface compatibility
  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=${LANGUAGE_CONFIG.weather}`
      );
      
      if (!response.ok) {
        return { success: false, error: 'Error al obtener clima actual' };
      }
      
      const rawData = await response.json();
      const location = await this.getLocationByCoords(lat, lon);
      
      const weatherData: WeatherData = {
        location: location.name,
        country: location.country,
        temperature: Math.round(rawData.main.temp),
        feelsLike: Math.round(rawData.main.feels_like),
        humidity: rawData.main.humidity,
        condition: rawData.weather[0].description,
        icon: rawData.weather[0].icon,
        windSpeed: Math.round(rawData.wind.speed * 3.6), // m/s to km/h
        visibility: Math.round((rawData.visibility || 10000) / 1000), // meters to km
        timestamp: new Date().toISOString(),
        recommendations: this.getAgriculturalRecommendations(rawData, { list: [] })
      };
      
      return { success: true, data: weatherData };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }
  
  async getForecastByCoords(lat: number, lon: number): Promise<ForecastResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=${LANGUAGE_CONFIG.weather}`
      );
      
      if (!response.ok) {
        return { success: false, error: 'Error al obtener pronóstico' };
      }
      
      const forecast = await response.json();
      const forecastData = await this.get3DayForecast(lat, lon);
      
      return { success: true, data: forecastData };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Obtener clima por ubicación de texto
  async getWeatherByLocation(locationQuery: string): Promise<WeatherResponse> {
    try {
      const locations = await this.searchLocations(locationQuery);
      if (locations.length === 0) {
        return { success: false, error: 'Ubicación no encontrada' };
      }
      
      const location = locations[0];
      return await this.getCurrentWeatherByCoords(location.lat, location.lon);
    } catch (error) {
      return { success: false, error: 'Error al obtener clima' };
    }
  }

  // Obtener pronóstico por ubicación de texto
  async getForecastByLocation(locationQuery: string): Promise<ForecastResponse> {
    try {
      const locations = await this.searchLocations(locationQuery);
      if (locations.length === 0) {
        return { success: false, error: 'Ubicación no encontrada' };
      }
      
      const location = locations[0];
      return await this.getForecastByCoords(location.lat, location.lon);
    } catch (error) {
      return { success: false, error: 'Error al obtener pronóstico' };
    }
  }

  // Obtener pronóstico de 3 días específico
  async get3DayForecast(lat: number, lon: number): Promise<ForecastData[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=${LANGUAGE_CONFIG.weather}`
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener pronóstico');
      }
      
      const forecast = await response.json();
      
      // Agrupar por días (tomar medias diarias)
      const dailyForecast: { [key: string]: any[] } = {};
      
      forecast.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyForecast[date]) {
          dailyForecast[date] = [];
        }
        dailyForecast[date].push(item);
      });
      
      // Procesar los primeros 3 días
      const result: ForecastData[] = [];
      const dates = Object.keys(dailyForecast).slice(0, 3);
      
      dates.forEach(date => {
        const dayData = dailyForecast[date];
        const temps = dayData.map(d => d.main.temp);
        const humidities = dayData.map(d => d.main.humidity);
        const precipitation = dayData.some(d => d.weather[0].main.toLowerCase().includes('rain')) ? 70 : 20;
        
        result.push({
          date,
          maxTemp: Math.max(...temps),
          minTemp: Math.min(...temps),
          condition: dayData[Math.floor(dayData.length / 2)].weather[0].description,
          humidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
          precipitationChance: precipitation
        });
      });
      
      return result;
    } catch (error) {
      console.error('Error getting 3-day forecast:', error);
      throw error;
    }
  }

  // Aliases for weather screen compatibility
  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherResponse> {
    return this.getCurrentWeather(lat, lon);
  }

  async getForecastByCoords(lat: number, lon: number): Promise<ForecastResponse> {
    return this.getForecast(lat, lon);
  }
}

export const weatherService = new WeatherService();
