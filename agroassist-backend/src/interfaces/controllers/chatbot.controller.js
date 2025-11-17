const ProcessChatbotQuery = require('../../application/use-cases/processChatbotQuery');
const { validationResult } = require('express-validator');

/**
 * Controlador del Chatbot Agrícola
 * Gestiona las interacciones con el asistente inteligente
 */
class ChatbotController {
  constructor() {
    this.processChatbotQuery = new ProcessChatbotQuery();
  }

  /**
   * Procesa un mensaje del usuario al chatbot
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async processMessage(req, res) {
    try {
      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { message, context } = req.body;
      const user = req.user; // Viene del middleware de autenticación

      // Ejecutar caso de uso
      const result = await this.processChatbotQuery.execute({
        message,
        user,
        context: {
          ...context,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          timestamp: new Date().toISOString()
        }
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error,
          data: result.fallbackResponse || null
        });
      }

      // Respuesta exitosa
      return res.status(200).json({
        success: true,
        message: 'Mensaje procesado exitosamente',
        data: result.data
      });

    } catch (error) {
      console.error('Error en ChatbotController.processMessage:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: {
          response: {
            text: "Lo siento, tengo problemas técnicos en este momento. Por favor, intenta de nuevo más tarde. 🔧",
            type: 'error',
            source: 'system',
            confidence: 'low'
          },
          suggestions: [
            'Intentar de nuevo más tarde',
            'Contactar soporte técnico'
          ],
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Obtiene el historial de conversaciones del usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getConversationHistory(req, res) {
    try {
      const user = req.user;
      const { limit } = req.query;

      const result = await this.processChatbotQuery.getConversationHistory({
        userId: user.id,
        limit: parseInt(limit) || 10
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Historial obtenido exitosamente',
        data: result.data
      });

    } catch (error) {
      console.error('Error en ChatbotController.getConversationHistory:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo historial de conversaciones'
      });
    }
  }

  /**
   * Obtiene sugerencias de preguntas para el usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getSuggestions(req, res) {
    try {
      const user = req.user;
      const { location } = req.query;

      const context = {};
      if (location) {
        try {
          context.location = JSON.parse(location);
        } catch (parseError) {
          console.log('Error parseando ubicación:', parseError.message);
        }
      }

      const result = await this.processChatbotQuery.getSuggestions({
        user,
        context
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error,
          data: result.data || null
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Sugerencias obtenidas exitosamente',
        data: result.data
      });

    } catch (error) {
      console.error('Error en ChatbotController.getSuggestions:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo sugerencias',
        data: {
          suggestions: [
            "¿Cómo está el clima?",
            "¿Qué puedo sembrar?",
            "¿Cómo identificar plagas?"
          ],
          categories: []
        }
      });
    }
  }

  /**
   * Procesa feedback del usuario sobre una respuesta
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async processFeedback(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de feedback inválidos',
          errors: errors.array()
        });
      }

      const { conversationId, feedback, comment } = req.body;
      const user = req.user;

      const result = await this.processChatbotQuery.processFeedback({
        userId: user.id,
        conversationId,
        feedback,
        comment
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });

    } catch (error) {
      console.error('Error en ChatbotController.processFeedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Error procesando feedback'
      });
    }
  }

  /**
   * Obtiene información sobre las capacidades del chatbot
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getBotCapabilities(req, res) {
    try {
      const capabilities = {
        name: "AgroBot",
        version: "1.0.0",
        description: "Asistente agrícola inteligente especializado en cultivos colombianos",
        features: [
          {
            name: "Pronósticos Climáticos",
            description: "Análisis del clima y recomendaciones agrícolas basadas en pronósticos de 3 días",
            icon: "🌤️",
            available: true
          },
          {
            name: "Identificación de Plagas",
            description: "Diagnóstico de plagas y enfermedades con métodos de control recomendados",
            icon: "🐛",
            available: true
          },
          {
            name: "Guías de Cultivos",
            description: "Información completa sobre siembra, cuidados y cosecha de diferentes cultivos",
            icon: "🌱",
            available: true
          },
          {
            name: "Calendario Agrícola",
            description: "Épocas ideales para actividades agrícolas según la región y el mes",
            icon: "📅",
            available: true
          },
          {
            name: "Recomendaciones IA",
            description: "Consejos personalizados generados por inteligencia artificial",
            icon: "🤖",
            available: !!process.env.OPENAI_API_KEY
          }
        ],
        supportedCrops: [
          "Maíz", "Tomate", "Arroz", "Papa", "Soja", "Frijol", "Café", "Plátano"
        ],
        supportedRegions: [
          "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", 
          "Bucaramanga", "Pereira", "Manizales"
        ],
        languages: ["Español"],
        responseTypes: [
          "Texto con recomendaciones",
          "Sugerencias de acciones",
          "Enlaces a recursos adicionales"
        ],
        limitations: [
          "Requiere autenticación de usuario",
          "Respuestas limitadas a cultivos colombianos",
          "Funcionalidad IA requiere configuración de OpenAI"
        ]
      };

      return res.status(200).json({
        success: true,
        message: 'Capacidades del chatbot obtenidas exitosamente',
        data: capabilities
      });

    } catch (error) {
      console.error('Error en ChatbotController.getBotCapabilities:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo capacidades del chatbot'
      });
    }
  }

  /**
   * Endpoint de salud del chatbot
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async healthCheck(req, res) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          chatbot: 'active',
          weatherAPI: 'active',
          pestDatabase: 'active',
          openAI: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
        },
        version: '1.0.0',
        uptime: process.uptime()
      };

      return res.status(200).json({
        success: true,
        message: 'Chatbot funcionando correctamente',
        data: health
      });

    } catch (error) {
      console.error('Error en ChatbotController.healthCheck:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en verificación de salud del chatbot'
      });
    }
  }
}

module.exports = new ChatbotController();
