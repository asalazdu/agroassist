const axios = require('axios');

class WeatherService {
  constructor() {
    // Usaremos OpenWeatherMap API - necesitarás obtener una API key gratuita en https://openweathermap.org/api
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  /**
   * Obtiene el pronóstico del clima para los próximos 3 días
   * @param {string} city - Nombre de la ciudad
   * @param {string} country - Código del país (opcional)
   * @returns {Promise<Object>} - Pronóstico del clima
   */
  async getWeatherForecast(city, country = '') {
    try {
      if (!this.apiKey) {
        throw new Error('API key del clima no configurada. Agrega WEATHER_API_KEY en el archivo .env');
      }

      const location = country ? `${city},${country}` : city;
      const url = `${this.baseUrl}/forecast?q=${location}&appid=${this.apiKey}&units=metric&lang=es`;

      const response = await axios.get(url);
      
      if (response.status !== 200) {
        throw new Error('Error al obtener datos del clima');
      }

      return this.formatWeatherData(response.data);
    } catch (error) {
      if (error.response) {
        // Error de la API
        const { status, data } = error.response;
        if (status === 404) {
          throw new Error('Ciudad no encontrada');
        } else if (status === 401) {
          throw new Error('API key del clima inválida');
        } else {
          throw new Error(`Error del servicio de clima: ${data.message || 'Error desconocido'}`);
        }
      } else {
        // Error de red o configuración
        throw new Error(`Error al conectar con el servicio de clima: ${error.message}`);
      }
    }
  }

  /**
   * Obtiene el pronóstico por coordenadas geográficas
   * @param {number} lat - Latitud
   * @param {number} lon - Longitud
   * @returns {Promise<Object>} - Pronóstico del clima
   */
  async getWeatherByCoordinates(lat, lon) {
    try {
      if (!this.apiKey) {
        throw new Error('API key del clima no configurada. Agrega WEATHER_API_KEY en el archivo .env');
      }

      const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`;

      const response = await axios.get(url);
      
      if (response.status !== 200) {
        throw new Error('Error al obtener datos del clima');
      }

      return this.formatWeatherData(response.data);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          throw new Error('API key del clima inválida');
        } else {
          throw new Error(`Error del servicio de clima: ${data.message || 'Error desconocido'}`);
        }
      } else {
        throw new Error(`Error al conectar con el servicio de clima: ${error.message}`);
      }
    }
  }

  /**
   * Formatea los datos del clima para mostrar solo los próximos 3 días
   * @param {Object} weatherData - Datos crudos de la API
   * @returns {Object} - Datos formateados
   */
  formatWeatherData(weatherData) {
    const forecast = [];
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Agrupar por días
    const dailyData = {};
    
    weatherData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      if (date <= threeDaysFromNow) {
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
            date: dayKey,
            fecha_legible: date.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            temperaturas: [],
            humedad: [],
            descripcion: item.weather[0].description,
            icono: item.weather[0].icon,
            viento: [],
            lluvia: []
          };
        }

        dailyData[dayKey].temperaturas.push(item.main.temp);
        dailyData[dayKey].humedad.push(item.main.humidity);
        dailyData[dayKey].viento.push(item.wind.speed);
        
        if (item.rain && item.rain['3h']) {
          dailyData[dayKey].lluvia.push(item.rain['3h']);
        }
      }
    });

    // Calcular promedios y crear el resumen final
    Object.keys(dailyData).slice(0, 3).forEach(day => {
      const data = dailyData[day];
      forecast.push({
        fecha: data.date,
        fecha_legible: data.fecha_legible,
        temperatura_maxima: Math.round(Math.max(...data.temperaturas)),
        temperatura_minima: Math.round(Math.min(...data.temperaturas)),
        temperatura_promedio: Math.round(data.temperaturas.reduce((a, b) => a + b, 0) / data.temperaturas.length),
        humedad_promedio: Math.round(data.humedad.reduce((a, b) => a + b, 0) / data.humedad.length),
        descripcion: data.descripcion,
        icono: data.icono,
        viento_promedio: Math.round(data.viento.reduce((a, b) => a + b, 0) / data.viento.length * 3.6), // m/s a km/h
        probabilidad_lluvia: data.lluvia.length > 0 ? Math.round(data.lluvia.reduce((a, b) => a + b, 0)) : 0
      });
    });

    return {
      ubicacion: {
        ciudad: weatherData.city.name,
        pais: weatherData.city.country,
        coordenadas: {
          latitud: weatherData.city.coord.lat,
          longitud: weatherData.city.coord.lon
        }
      },
      pronostico_3_dias: forecast,
      consultado_en: new Date().toISOString()
    };
  }
}

module.exports = new WeatherService();
