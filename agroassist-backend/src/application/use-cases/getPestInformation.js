const pestService = require('../../infrastructure/services/pestService');

/**
 * Caso de uso para obtener información de plagas
 */
class GetPestInformation {
  /**
   * Ejecuta el caso de uso para obtener plagas por cultivo
   * @param {string} crop - Nombre del cultivo
   * @returns {Promise<Object>} - Resultado de la consulta de plagas
   */
  async execute(crop) {
    try {
      if (!crop || crop.trim() === '') {
        throw new Error('El nombre del cultivo es requerido');
      }

      const pestInfo = await pestService.getPestsByCrop(crop.trim());
      
      return {
        success: true,
        data: pestInfo,
        message: 'Información de plagas obtenida exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener información de plagas'
      };
    }
  }

  /**
   * Ejecuta el caso de uso para obtener plagas por síntomas
   * @param {Array<string>} symptoms - Lista de síntomas observados
   * @returns {Promise<Object>} - Resultado de la búsqueda por síntomas
   */
  async executeBySymptoms(symptoms) {
    try {
      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        throw new Error('Se requiere al menos un síntoma para la búsqueda');
      }

      const validSymptoms = symptoms.filter(s => s && s.trim() !== '');
      if (validSymptoms.length === 0) {
        throw new Error('Se requieren síntomas válidos para la búsqueda');
      }

      const pestInfo = await pestService.getPestsBySymptoms(validSymptoms);
      
      return {
        success: true,
        data: pestInfo,
        message: 'Búsqueda de plagas por síntomas realizada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error al buscar plagas por síntomas'
      };
    }
  }

  /**
   * Ejecuta el caso de uso para obtener cultivos disponibles
   * @returns {Promise<Object>} - Lista de cultivos disponibles
   */
  async getAvailableCrops() {
    try {
      const crops = pestService.getAvailableCrops();
      
      return {
        success: true,
        data: {
          cultivos_disponibles: crops,
          total: crops.length,
          consultado_en: new Date().toISOString()
        },
        message: 'Lista de cultivos disponibles obtenida exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener la lista de cultivos disponibles'
      };
    }
  }
}

module.exports = GetPestInformation;
