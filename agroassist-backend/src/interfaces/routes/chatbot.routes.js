const express = require('express');
const { body, query } = require('express-validator');
const chatbotController = require('../controllers/chatbot.controller');
const { validateJWT, optionalJWT } = require('../middlewares/validateJWT');

const router = express.Router();

/**
 * @route POST /api/chatbot/message
 * @desc Procesa un mensaje del usuario al chatbot
 * @access Private (requiere autenticación)
 */
router.post('/message',
  validateJWT,
  [
    body('message')
      .notEmpty()
      .withMessage('El mensaje es requerido')
      .isLength({ min: 1, max: 1000 })
      .withMessage('El mensaje debe tener entre 1 y 1000 caracteres')
      .trim(),
    body('context')
      .optional()
      .isObject()
      .withMessage('El contexto debe ser un objeto válido'),
    body('context.location')
      .optional()
      .isObject()
      .withMessage('La ubicación debe ser un objeto válido'),
    body('context.location.city')
      .optional()
      .isString()
      .withMessage('La ciudad debe ser una cadena de texto'),
    body('context.location.country')
      .optional()
      .isString()
      .withMessage('El país debe ser una cadena de texto')
  ],
  chatbotController.processMessage
);

/**
 * @route GET /api/chatbot/history
 * @desc Obtiene el historial de conversaciones del usuario
 * @access Private (requiere autenticación)
 */
router.get('/history',
  validateJWT,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('El límite debe ser un número entre 1 y 50')
  ],
  chatbotController.getConversationHistory
);

/**
 * @route GET /api/chatbot/suggestions
 * @desc Obtiene sugerencias de preguntas para el usuario
 * @access Private (requiere autenticación)
 */
router.get('/suggestions',
  validateJWT,
  [
    query('location')
      .optional()
      .isJSON()
      .withMessage('La ubicación debe ser un JSON válido')
  ],
  chatbotController.getSuggestions
);

/**
 * @route POST /api/chatbot/feedback
 * @desc Procesa feedback del usuario sobre una respuesta
 * @access Private (requiere autenticación)
 */
router.post('/feedback',
  validateJWT,
  [
    body('conversationId')
      .notEmpty()
      .withMessage('El ID de conversación es requerido')
      .isString()
      .withMessage('El ID de conversación debe ser una cadena'),
    body('feedback')
      .notEmpty()
      .withMessage('El tipo de feedback es requerido')
      .isIn(['helpful', 'not_helpful', 'incorrect', 'excellent'])
      .withMessage('Tipo de feedback no válido'),
    body('comment')
      .optional()
      .isLength({ max: 500 })
      .withMessage('El comentario no puede exceder 500 caracteres')
      .trim()
  ],
  chatbotController.processFeedback
);

/**
 * @route GET /api/chatbot/capabilities
 * @desc Obtiene información sobre las capacidades del chatbot
 * @access Public (con autenticación opcional para información personalizada)
 */
router.get('/capabilities',
  optionalJWT,
  chatbotController.getBotCapabilities
);

/**
 * @route GET /api/chatbot/health
 * @desc Verifica el estado de salud del chatbot y sus servicios
 * @access Public
 */
router.get('/health',
  chatbotController.healthCheck
);

/**
 * @route GET /api/chatbot/
 * @desc Endpoint de información general del chatbot
 * @access Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de Chatbot Agrícola - AgroBot',
    data: {
      name: 'AgroBot',
      version: '1.0.0',
      description: 'Asistente agrícola inteligente para Colombia',
      endpoints: {
        message: 'POST /api/chatbot/message - Enviar mensaje al chatbot',
        history: 'GET /api/chatbot/history - Obtener historial de conversaciones',
        suggestions: 'GET /api/chatbot/suggestions - Obtener sugerencias de preguntas',
        feedback: 'POST /api/chatbot/feedback - Enviar feedback sobre respuestas',
        capabilities: 'GET /api/chatbot/capabilities - Ver capacidades del chatbot',
        health: 'GET /api/chatbot/health - Verificar estado del servicio'
      },
      authentication: 'Bearer Token requerido para la mayoría de endpoints',
      documentation: 'Consulta la documentación completa en /docs'
    }
  });
});

module.exports = router;
