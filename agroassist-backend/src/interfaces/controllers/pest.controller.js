const GetPestInformation = require('../../application/use-cases/getPestInformation');

/**
 * Controlador para manejo de información de plagas
 * Utiliza APIs gratuitas: GBIF, iNaturalist y USDA
 */
class PestController {
  constructor() {
    this.getPestInformation = new GetPestInformation();
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
}

module.exports = PestController;
