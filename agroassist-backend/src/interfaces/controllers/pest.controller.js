const GetPestInformation = require('../../application/use-cases/getPestInformation');

class PestController {
  constructor() {
    this.getPestInformation = new GetPestInformation();
  }

  /**
   * Controlador para obtener plagas por cultivo
   */
  getPestsByCrop = async (req, res) => {
    try {
      const { crop } = req.params;

      if (!crop) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro "crop" es requerido',
          example: '/api/pests/crop/maiz'
        });
      }

      const result = await this.getPestInformation.execute(crop);

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
   * Controlador para buscar plagas por síntomas
   */
  getPestsBySymptoms = async (req, res) => {
    try {
      const { symptoms } = req.body;

      if (!symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de síntomas en el cuerpo de la petición',
          example: {
            symptoms: ['hojas amarillas', 'perforaciones', 'plantas debilitadas']
          }
        });
      }

      const result = await this.getPestInformation.executeBySymptoms(symptoms);

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
   * Controlador para obtener lista de cultivos disponibles
   */
  getAvailableCrops = async (req, res) => {
    try {
      const result = await this.getPestInformation.getAvailableCrops();

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
   * Controlador para mostrar información de ayuda sobre la API de plagas
   */
  getHelp = async (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        message: 'API de Información de Plagas - AgroAssist',
        descripcion: 'Esta API proporciona información sobre plagas comunes en diferentes cultivos agrícolas',
        endpoints: {
          'GET /api/pests/crops': {
            descripcion: 'Obtiene la lista de cultivos disponibles',
            ejemplo: '/api/pests/crops'
          },
          'GET /api/pests/crop/:crop': {
            descripcion: 'Obtiene plagas específicas de un cultivo',
            parametros: {
              crop: 'Nombre del cultivo (maiz, tomate, arroz, papa, soja)'
            },
            ejemplo: '/api/pests/crop/maiz'
          },
          'POST /api/pests/symptoms': {
            descripcion: 'Busca plagas basándose en síntomas observados',
            cuerpo: {
              symptoms: 'Array de síntomas como strings'
            },
            ejemplo: {
              url: '/api/pests/symptoms',
              body: {
                symptoms: ['hojas amarillas', 'perforaciones', 'plantas debilitadas']
              }
            }
          }
        },
        cultivos_disponibles: [
          'maiz (corn, maize)',
          'tomate (tomato)',
          'arroz (rice)',
          'papa (potato, patata)',
          'soja (soybean, soy)'
        ],
        datos_retornados: {
          informacion_por_cultivo: {
            cultivo: 'Nombre del cultivo',
            total_plagas: 'Número total de plagas registradas',
            plagas: [
              {
                nombre: 'Nombre científico y común de la plaga',
                descripcion: 'Descripción de la plaga',
                sintomas: 'Lista de síntomas que causa',
                control: 'Métodos de control recomendados',
                periodo_critico: 'Momento crítico de ataque',
                nivel_dano: 'Nivel de daño (Alto, Medio, Bajo)'
              }
            ],
            recomendaciones_generales: 'Lista de recomendaciones de manejo'
          }
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

module.exports = new PestController();
