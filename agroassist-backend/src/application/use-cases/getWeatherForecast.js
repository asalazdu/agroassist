const weatherService = require('../../infrastructure/services/weatherService');

/**
 * Caso de uso para obtener pronóstico del clima
 */
class GetWeatherForecast {
  /**
   * Ejecuta el caso de uso para obtener pronóstico del clima por ciudad
   * @param {string} city - Nombre de la ciudad
   * @param {string} country - Código del país (opcional)
   * @returns {Promise<Object>} - Resultado del pronóstico
   */
  async execute(city, country = '') {
    try {
      if (!city || city.trim() === '') {
        throw new Error('El nombre de la ciudad es requerido');
      }

      const forecast = await weatherService.getWeatherForecast(city.trim(), country.trim());
      
      return {
        success: true,
        data: forecast,
        message: 'Pronóstico del clima obtenido exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener el pronóstico del clima'
      };
    }
  }

  /**
   * Ejecuta el caso de uso para obtener pronóstico del clima por coordenadas
   * @param {number} latitude - Latitud
   * @param {number} longitude - Longitud
   * @returns {Promise<Object>} - Resultado del pronóstico
   */
  async executeByCoordinates(latitude, longitude) {
    try {
      if (latitude === undefined || longitude === undefined) {
        throw new Error('Las coordenadas de latitud y longitud son requeridas');
      }

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Las coordenadas deben ser números válidos');
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error('La latitud debe estar entre -90 y 90 grados');
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('La longitud debe estar entre -180 y 180 grados');
      }

      const forecast = await weatherService.getWeatherByCoordinates(latitude, longitude);
      
      return {
        success: true,
        data: forecast,
        message: 'Pronóstico del clima obtenido exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener el pronóstico del clima'
      };
    }
  }
}

module.exports = GetWeatherForecast;
