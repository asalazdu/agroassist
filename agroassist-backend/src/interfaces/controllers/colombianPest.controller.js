/**
 * Controlador para información de plagas específica de Colombia
 * Todas las respuestas en español y adaptadas a la agricultura colombiana
 */

const getColombianPestInformation = require('../../application/use-cases/getColombianPestInformation');

class ColombianPestController {

  /**
   * Buscar información de una plaga específica para Colombia
   * GET /api/plagas/buscar/:nombrePlaga
   */
  async buscarPlaga(req, res) {
    try {
      const { nombrePlaga } = req.params;
      
      if (!nombrePlaga) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre de la plaga',
          ejemplos: ['broca del café', 'roya', 'gusano cogollero', 'trips', 'pulgón']
        });
      }

      const resultado = await getColombianPestInformation.searchPest(nombrePlaga);
      
      const statusCode = resultado.success ? 200 : 400;
      res.status(statusCode).json(resultado);
      
    } catch (error) {
      console.error('Error en búsqueda de plaga:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        detalles: 'No se pudo procesar la búsqueda de la plaga'
      });
    }
  }

  /**
   * Obtener plagas de un cultivo colombiano
   * GET /api/plagas/cultivo/:nombreCultivo
   */
  async obtenerPlagasCultivo(req, res) {
    try {
      const { nombreCultivo } = req.params;
      
      if (!nombreCultivo) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre del cultivo',
          cultivos_disponibles: [
            'café', 'plátano', 'arroz', 'maíz', 'cacao', 
            'yuca', 'papa', 'fríjol', 'caña de azúcar', 'flores'
          ]
        });
      }

      const resultado = await getColombianPestInformation.getCropPests(nombreCultivo);
      
      const statusCode = resultado.success ? 200 : 400;
      res.status(statusCode).json(resultado);
      
    } catch (error) {
      console.error('Error en consulta de cultivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        detalles: 'No se pudo obtener información del cultivo'
      });
    }
  }

  /**
   * Buscar plagas por ubicación en Colombia
   * POST /api/plagas/ubicacion
   */
  async buscarPorUbicacion(req, res) {
    try {
      const { latitud, longitud, tipoCultivo } = req.body;
      
      if (typeof latitud !== 'number' || typeof longitud !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar latitud y longitud como números',
          formato: {
            latitud: 'número decimal (ej: 4.7110)',
            longitud: 'número decimal (ej: -74.0721)'
          },
          ejemplos_colombia: {
            bogota: { latitud: 4.7110, longitud: -74.0721 },
            medellin: { latitud: 6.2442, longitud: -75.5812 },
            cali: { latitud: 3.4516, longitud: -76.5320 },
            barranquilla: { latitud: 10.9639, longitud: -74.7964 }
          }
        });
      }

      const resultado = await getColombianPestInformation.getPestsByLocation(
        latitud, 
        longitud, 
        tipoCultivo
      );
      
      const statusCode = resultado.success ? 200 : 400;
      res.status(statusCode).json(resultado);
      
    } catch (error) {
      console.error('Error en búsqueda por ubicación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        detalles: 'No se pudo buscar plagas por ubicación'
      });
    }
  }

  /**
   * Obtener plan de manejo específico para Colombia
   * POST /api/plagas/plan-manejo
   */
  async obtenerPlanManejo(req, res) {
    try {
      const { nombrePlaga, nombreCultivo } = req.body;
      
      if (!nombrePlaga) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre de la plaga',
          formato: {
            nombrePlaga: 'requerido - nombre de la plaga',
            nombreCultivo: 'opcional - cultivo específico'
          }
        });
      }

      const resultado = await getColombianPestInformation.getControlPlan(
        nombrePlaga, 
        nombreCultivo
      );
      
      const statusCode = resultado.success ? 200 : 400;
      res.status(statusCode).json(resultado);
      
    } catch (error) {
      console.error('Error en plan de manejo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        detalles: 'No se pudo generar el plan de manejo'
      });
    }
  }

  /**
   * Obtener lista de cultivos disponibles en Colombia
   * GET /api/plagas/cultivos-colombia
   */
  async obtenerCultivosDisponibles(req, res) {
    try {
      const resultado = getColombianPestInformation.getColombiaCropsList();
      res.status(200).json(resultado);
      
    } catch (error) {
      console.error('Error al obtener cultivos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        detalles: 'No se pudo obtener la lista de cultivos'
      });
    }
  }

  /**
   * Endpoint de prueba para verificar funcionamiento
   * GET /api/plagas/test-colombia
   */
  async testColombianAPI(req, res) {
    try {
      const testResults = {
        success: true,
        mensaje: 'API de plagas para Colombia funcionando correctamente',
        idioma: 'Español',
        enfoque: 'Agricultura Colombiana',
        timestamp: new Date().toISOString(),
        endpoints_disponibles: [
          'GET /api/plagas/buscar/:nombrePlaga - Buscar información de plaga',
          'GET /api/plagas/cultivo/:nombreCultivo - Plagas por cultivo',
          'POST /api/plagas/ubicacion - Plagas por ubicación en Colombia',
          'POST /api/plagas/plan-manejo - Plan de manejo específico',
          'GET /api/plagas/cultivos-colombia - Lista de cultivos disponibles'
        ],
        ejemplos_uso: {
          buscar_plaga: '/api/plagas/buscar/broca del café',
          cultivo: '/api/plagas/cultivo/café',
          ubicacion: {
            url: '/api/plagas/ubicacion',
            body: { 
              latitud: 4.7110, 
              longitud: -74.0721, 
              tipoCultivo: 'café' 
            }
          }
        },
        cultivos_soportados: [
          'café', 'plátano', 'arroz', 'maíz', 'cacao', 
          'yuca', 'papa', 'fríjol', 'caña de azúcar', 'flores'
        ],
        plagas_principales: [
          'broca del café', 'roya del café', 'sigatoka negra',
          'gusano cogollero', 'sogata', 'trips', 'pulgones'
        ]
      };

      res.status(200).json(testResults);
      
    } catch (error) {
      console.error('Error en test de API:', error);
      res.status(500).json({
        success: false,
        error: 'Error en prueba de API',
        detalles: error.message
      });
    }
  }

  /**
   * Información sobre el sistema y fuentes de datos
   * GET /api/plagas/info-sistema
   */
  async obtenerInfoSistema(req, res) {
    try {
      const infoSistema = {
        success: true,
        sistema: 'AgroAssist - Sistema de Información de Plagas para Colombia',
        version: '2.0',
        idioma: 'Español',
        enfoque: 'Agricultura Colombiana',
        fuentes_datos: {
          internacionales: [
            'GBIF - Global Biodiversity Information Facility',
            'iNaturalist - Observaciones científicas comunitarias',
            'USDA - Departamento de Agricultura de Estados Unidos'
          ],
          colombia: [
            'Base de datos especializada para Colombia',
            'Cultivos principales del país',
            'Plagas específicas de cada región',
            'Métodos de control adaptados'
          ]
        },
        regiones_colombia: [
          'Caribe', 'Andina', 'Pacífica', 'Orinoquía', 'Amazonía'
        ],
        instituciones_referencia: [
          'ICA - Instituto Colombiano Agropecuario',
          'AGROSAVIA - Corporación Colombiana de Investigación Agropecuaria',
          'UMATA - Unidades Municipales de Asistencia Técnica'
        ],
        nota_importante: 'Toda la información está adaptada específicamente para condiciones y normativas colombianas'
      };

      res.status(200).json(infoSistema);
      
    } catch (error) {
      console.error('Error al obtener info del sistema:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new ColombianPestController();
