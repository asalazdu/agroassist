const GetPestInformation = require('../../application/use-cases/getPestInformation');
const pestAnalysisService = require('../../infrastructure/services/pestAnalysisService');
const perenualService = require('../../infrastructure/services/perenualService');

/**
 * Controlador para manejo de información de plagas
 * Utiliza Perenual API para información real de plagas y enfermedades
 * Incluye análisis de imágenes con IA y alertas basadas en clima
 */
class PestController {
  constructor() {
    this.getPestInformation = new GetPestInformation();
  }

  /**
   * Analizar imagen de cultivo para detectar plagas/enfermedades
   * POST /api/pests/analyze-image
   * Body: { imageBase64, cropName? }
   */
  async analyzeImage(req, res) {
    try {
      const { imageBase64, cropName } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar una imagen en formato base64'
        });
      }

      // Verificar que sea un base64 válido (sin el prefijo data:image...)
      let cleanBase64 = imageBase64;
      if (imageBase64.includes('base64,')) {
        cleanBase64 = imageBase64.split('base64,')[1];
      }

      console.log('🔍 Analizando imagen de cultivo con IA...');
      if (cropName) {
        console.log(`🌱 Cultivo especificado: ${cropName}`);
      }

      const result = await pestAnalysisService.analyzeCropImage(cleanBase64, cropName);
      
      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Error en análisis de imagen:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al analizar la imagen'
      });
    }
  }

  /**
   * Obtener alertas de plagas basadas en clima actual
   * POST /api/pests/weather-alerts
   * Body: { weatherData, cropName? }
   */
  async getWeatherAlerts(req, res) {
    try {
      const { weatherData, cropName } = req.body;
      
      if (!weatherData) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar datos del clima'
        });
      }

      console.log('🌤️ Generando alertas de plagas basadas en clima...');
      if (cropName) {
        console.log(`🌱 Cultivo especificado: ${cropName}`);
      }

      const result = await pestAnalysisService.getPestAlertsBasedOnWeather(weatherData, cropName);
      
      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Error en alertas de clima:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al generar alertas'
      });
    }
  }

  /**
   * Buscar información completa de una plaga específica
   * GET /api/pests/search/:pestName
   */
  async searchPest(req, res) {
    try {
      const { pestName } = req.params;
      
      if (!pestName) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre de la plaga'
        });
      }

      const result = await this.getPestInformation.searchPest(pestName);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en búsqueda de plaga:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener plagas asociadas a un cultivo específico
   * GET /api/pests/crop/:cropName
   */
  async getCropPests(req, res) {
    try {
      const { cropName } = req.params;
      
      if (!cropName) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre del cultivo'
        });
      }

      const result = await this.getPestInformation.getCropPests(cropName);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en información de cultivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Buscar plagas por ubicación geográfica
   * POST /api/pests/location
   * Body: { latitude, longitude, cropType? }
   */
  async getPestsByLocation(req, res) {
    try {
      const { latitude, longitude, cropType } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar latitud y longitud'
        });
      }

      const params = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        cropType: cropType || null
      };

      const result = await this.getPestInformation.getPestsByLocation(params);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error en búsqueda por ubicación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener información detallada de una plaga específica
   * POST /api/pests/details
   * Body: { pestName, speciesId? }
   */
  async getDetailedPestInfo(req, res) {
    try {
      const { pestName, speciesId } = req.body;
      
      if (!pestName) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre de la plaga'
        });
      }

      const params = {
        pestName,
        speciesId: speciesId ? parseInt(speciesId) : null
      };

      const result = await this.getPestInformation.getDetailedPestInfo(params);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en información detallada:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Endpoint de prueba para verificar APIs
   * GET /api/pests/test
   */
  async testAPIs(req, res) {
    try {
      const testResults = {
        timestamp: new Date().toISOString(),
        apis: []
      };

      // Probar GBIF API
      try {
        const gbifService = require('../../infrastructure/services/gbifService');
        const gbifTest = await gbifService.searchPests('aphid');
        testResults.apis.push({
          name: 'GBIF',
          status: gbifTest.success ? 'OK' : 'ERROR',
          results: gbifTest.success ? gbifTest.data?.length || 0 : 0,
          error: gbifTest.success ? null : gbifTest.error
        });
      } catch (error) {
        testResults.apis.push({
          name: 'GBIF',
          status: 'ERROR',
          results: 0,
          error: error.message
        });
      }

      // Probar iNaturalist API
      try {
        const iNaturalistService = require('../../infrastructure/services/iNaturalistService');
        const iNatTest = await iNaturalistService.searchInsectPests('aphid');
        testResults.apis.push({
          name: 'iNaturalist',
          status: iNatTest.success ? 'OK' : 'ERROR',
          results: iNatTest.success ? iNatTest.data?.length || 0 : 0,
          error: iNatTest.success ? null : iNatTest.error
        });
      } catch (error) {
        testResults.apis.push({
          name: 'iNaturalist',
          status: 'ERROR',
          results: 0,
          error: error.message
        });
      }

      // Probar USDA API
      try {
        const usdaService = require('../../infrastructure/services/usdaService');
        const usdaTest = await usdaService.getCropProduction('CORN', '2023');
        testResults.apis.push({
          name: 'USDA',
          status: usdaTest.success ? 'OK' : 'ERROR',
          results: usdaTest.success ? usdaTest.data?.length || 0 : 0,
          error: usdaTest.success ? null : usdaTest.error
        });
      } catch (error) {
        testResults.apis.push({
          name: 'USDA',
          status: 'ERROR',
          results: 0,
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Prueba de APIs completada',
        data: testResults
      });

    } catch (error) {
      console.error('Error en prueba de APIs:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener lista de plagas/enfermedades desde Perenual API
   * GET /api/pests/database?query=...&page=1
   */
  async getPestDatabase(req, res) {
    try {
      const { query, page = 1 } = req.query;
      
      console.log(`🔍 Buscando plagas en Perenual API: "${query || 'todas'}"`);
      
      const result = await perenualService.getPestDiseaseList({
        query: query || '',
        page: parseInt(page),
        perPage: 30
      });

      res.json({
        success: true,
        total: result.total,
        currentPage: result.currentPage,
        lastPage: result.lastPage,
        plagas: result.data
      });

    } catch (error) {
      console.error('❌ Error obteniendo base de datos de plagas:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error al consultar base de datos de plagas'
      });
    }
  }

  /**
   * Obtener detalles de una plaga específica
   * GET /api/pests/database/:id
   */
  async getPestDetails(req, res) {
    try {
      const { id } = req.params;
      
      console.log(`📖 Obteniendo detalles de plaga ID: ${id}`);
      
      const pest = await perenualService.getPestDiseaseDetails(parseInt(id));

      if (!pest) {
        return res.status(404).json({
          success: false,
          error: 'Plaga no encontrada'
        });
      }

      res.json({
        success: true,
        plaga: pest
      });

    } catch (error) {
      console.error('❌ Error obteniendo detalles de plaga:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error al obtener detalles de la plaga'
      });
    }
  }

  /**
   * Buscar plagas específicas para un cultivo
   * GET /api/pests/by-crop/:cropName
   */
  async getPestsByCrop(req, res) {
    try {
      const { cropName } = req.params;
      
      console.log(`🌱 Buscando plagas para cultivo: ${cropName}`);
      
      const pests = await perenualService.getPestsForCrop(cropName);

      res.json({
        success: true,
        cultivo: cropName,
        cantidad: pests.length,
        plagas: pests
      });

    } catch (error) {
      console.error('❌ Error buscando plagas por cultivo:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error al buscar plagas para el cultivo'
      });
    }
  }
}

module.exports = PestController;
