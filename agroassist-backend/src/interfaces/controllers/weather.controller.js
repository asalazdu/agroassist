const GetWeatherForecast = require('../../application/use-cases/getWeatherForecast');

class WeatherController {
  constructor() {
    this.getWeatherForecast = new GetWeatherForecast();
  }

  /**
   * Controlador para obtener pronóstico del clima por ciudad
   */
  getForecastByCity = async (req, res) => {
    try {
      const { city, country } = req.query;

      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro "city" es requerido',
          example: '/api/weather/forecast?city=Bogota&country=CO'
        });
      }

      const result = await this.getWeatherForecast.execute(city, country);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Agregar información del usuario autenticado
      result.usuario_consulta = {
        id: req.user.id,
        nombre: req.user.nombre,
        correo: req.user.correo
      };

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  /**
   * Controlador para obtener pronóstico del clima por coordenadas
   */
  getForecastByCoordinates = async (req, res) => {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({
          success: false,
          message: 'Los parámetros "lat" y "lon" son requeridos',
          example: '/api/weather/coordinates?lat=4.711&lon=-74.0721'
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      const result = await this.getWeatherForecast.executeByCoordinates(latitude, longitude);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Agregar información del usuario autenticado
      result.usuario_consulta = {
        id: req.user.id,
        nombre: req.user.nombre,
        correo: req.user.correo
      };

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  /**
   * Controlador para mostrar información de ayuda sobre la API del clima
   */
  getHelp = async (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        message: 'API de Pronóstico del Clima - AgroAssist',
        descripcion: 'Esta API proporciona pronósticos del clima para los próximos 3 días, útiles para la planificación agrícola',
        endpoints: {
          'GET /api/weather/forecast': {
            descripcion: 'Obtiene pronóstico por nombre de ciudad',
            parametros: {
              city: 'Nombre de la ciudad (requerido)',
              country: 'Código del país de 2 letras (opcional)'
            },
            ejemplo: '/api/weather/forecast?city=Bogota&country=CO'
          },
          'GET /api/weather/coordinates': {
            descripcion: 'Obtiene pronóstico por coordenadas geográficas',
            parametros: {
              lat: 'Latitud (-90 a 90)',
              lon: 'Longitud (-180 a 180)'
            },
            ejemplo: '/api/weather/coordinates?lat=4.711&lon=-74.0721'
          }
        },
        configuracion: {
          nota: 'Necesitas configurar WEATHER_API_KEY en el archivo .env',
          api_key_gratuita: 'https://openweathermap.org/api'
        },
        datos_retornados: {
          ubicacion: 'Información de la ubicación consultada',
          pronostico_3_dias: [
            {
              fecha: 'Fecha en formato YYYY-MM-DD',
              fecha_legible: 'Fecha en formato legible',
              temperatura_maxima: 'Temperatura máxima en °C',
              temperatura_minima: 'Temperatura mínima en °C',
              temperatura_promedio: 'Temperatura promedio en °C',
              humedad_promedio: 'Humedad promedio en %',
              descripcion: 'Descripción del clima',
              viento_promedio: 'Velocidad del viento en km/h',
              probabilidad_lluvia: 'Probabilidad de lluvia en mm'
            }
          ]
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };
}

module.exports = new WeatherController();
