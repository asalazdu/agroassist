const chatbotService = require('../../infrastructure/services/chatbotService');

/**
 * Caso de uso: Procesar consulta del chatbot
 * Gestiona la interacción con el usuario a través del chatbot inteligente
 */
class ProcessChatbotQuery {
  /**
   * Ejecuta una consulta del chatbot
   * @param {Object} params - Parámetros de la consulta
   * @param {string} params.message - Mensaje del usuario
   * @param {Object} params.user - Información del usuario autenticado
   * @param {Object} params.context - Contexto adicional (ubicación, historial, etc.)
   * @returns {Promise<Object>} - Respuesta del chatbot con recomendaciones
   */
  async execute({ message, user, context = {} }) {
    try {
      // Validar entrada
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('El mensaje no puede estar vacío');
      }

      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }

      // Limpiar y preparar mensaje
      const cleanMessage = message.trim();
      
      // Preparar contexto del usuario
      const userContext = {
        ...context,
        userId: user.id,
        userName: user.nombre,
        userEmail: user.email,
        timestamp: new Date().toISOString()
      };

      // Procesar consulta a través del servicio de chatbot
      const result = await chatbotService.processMessage(
        cleanMessage,
        userContext,
        user
      );

      if (!result.success) {
        throw new Error(result.error || 'Error procesando la consulta');
      }

      // Enriquecer respuesta con metadatos
      const enrichedResponse = {
        ...result,
        metadata: {
          userId: user.id,
          messageLength: cleanMessage.length,
          processingTime: new Date().toISOString(),
          queryType: result.type,
          hasWeatherData: !!(userContext.location || result.response.text.includes('temperatura')),
          hasPestData: result.response.text.includes('plaga'),
          confidence: result.response.confidence || 'medium'
        }
      };

      return {
        success: true,
        data: enrichedResponse,
        message: 'Consulta procesada exitosamente'
      };

    } catch (error) {
      console.error('Error en ProcessChatbotQuery:', error);
      
      return {
        success: false,
        data: null,
        error: error.message || 'Error interno del servidor',
        fallbackResponse: {
          response: {
            text: "Lo siento, tuve un problema procesando tu consulta. Por favor, intenta de nuevo o formula tu pregunta de manera diferente. 🤖",
            type: 'error',
            source: 'fallback',
            confidence: 'low'
          },
          suggestions: [
            'Intentar con una pregunta más específica',
            'Verificar conectividad',
            'Contactar soporte técnico'
          ],
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Obtiene el historial de conversaciones del usuario
   * @param {Object} params - Parámetros de la consulta
   * @param {number} params.userId - ID del usuario
   * @param {number} params.limit - Límite de mensajes a obtener
   * @returns {Promise<Object>} - Historial de conversaciones
   */
  async getConversationHistory({ userId, limit = 10 }) {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      // Por ahora retornamos una estructura vacía
      // En el futuro se implementará persistencia del historial
      return {
        success: true,
        data: {
          conversations: [],
          totalCount: 0,
          userId: userId,
          message: 'Historial no implementado aún - funcionalidad futura'
        }
      };

    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene sugerencias de preguntas para el usuario
   * @param {Object} params - Parámetros de la consulta
   * @param {Object} params.user - Usuario autenticado
   * @param {Object} params.context - Contexto adicional
   * @returns {Promise<Object>} - Sugerencias de preguntas
   */
  async getSuggestions({ user, context = {} }) {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const suggestions = [];

      // Sugerencias generales siempre disponibles
      const generalSuggestions = [
        "¿Cuál es el pronóstico del clima para esta semana?",
        "¿Qué cultivos puedo sembrar este mes?",
        "¿Cómo identifico plagas en mis cultivos?",
        "¿Cuáles son las mejores prácticas para el riego?",
        "¿Qué fertilizantes recomiendas para maíz?"
      ];

      // Sugerencias específicas por época del año
      const seasonalSuggestions = {
        1: ["¿Es buen momento para preparar terrenos?", "¿Qué hortalizas puedo sembrar en enero?"],
        2: ["¿Cuándo sembrar papa en zona fría?", "¿Cómo prepararse para la época lluviosa?"],
        3: ["¿Es época de siembra de maíz?", "¿Qué cuidados necesita el cultivo de arroz?"],
        4: ["¿Cuándo fertilizar cultivos perennes?", "¿Cómo controlar malezas efectivamente?"],
        5: ["¿Qué hacer durante la época lluviosa?", "¿Cómo proteger cultivos de exceso de agua?"],
        6: ["¿Cuándo cosechar cultivos de ciclo corto?", "¿Cómo preparar siembra de segundo semestre?"],
        7: ["¿Qué sembrar en julio?", "¿Cómo mantener cultivos en época seca?"],
        8: ["¿Es tiempo de siembra de papa?", "¿Qué cultivos toleram mejor la sequía?"],
        9: ["¿Cuándo aplicar fertilizantes?", "¿Cómo prevenir plagas de fin de año?"],
        10: ["¿Es época de siembra de soja?", "¿Cómo prepararse para época seca?"],
        11: ["¿Cuándo cosechar cultivos?", "¿Cómo preparar suelos para el próximo año?"],
        12: ["¿Cómo planificar cultivos del próximo año?", "¿Qué mantenimiento hacer en diciembre?"]
      };

      // Combinar sugerencias
      suggestions.push(...generalSuggestions.slice(0, 3));
      if (seasonalSuggestions[currentMonth]) {
        suggestions.push(...seasonalSuggestions[currentMonth]);
      }

      // Sugerencias basadas en ubicación si está disponible
      if (context.location) {
        suggestions.push(`¿Qué cultivos crecen mejor en ${context.location.city}?`);
        suggestions.push(`¿Cuál es el clima típico de ${context.location.city} para agricultura?`);
      }

      return {
        success: true,
        data: {
          suggestions: suggestions.slice(0, 7), // Máximo 7 sugerencias
          categories: [
            { name: 'Clima', icon: '🌤️', description: 'Pronósticos y recomendaciones climáticas' },
            { name: 'Cultivos', icon: '🌱', description: 'Guías de siembra y cuidados' },
            { name: 'Plagas', icon: '🐛', description: 'Identificación y control de plagas' },
            { name: 'Calendario', icon: '📅', description: 'Épocas ideales para actividades' }
          ],
          user: user.nombre,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      return {
        success: false,
        error: error.message,
        data: {
          suggestions: [
            "¿Cómo puedo mejorar mis cultivos?",
            "¿Qué necesito saber sobre agricultura?",
            "¿Cuáles son los cultivos más rentables?"
          ]
        }
      };
    }
  }

  /**
   * Procesa feedback del usuario sobre una respuesta
   * @param {Object} params - Parámetros del feedback
   * @param {number} params.userId - ID del usuario
   * @param {string} params.conversationId - ID de la conversación
   * @param {string} params.feedback - Tipo de feedback ('helpful', 'not_helpful', 'incorrect')
   * @param {string} params.comment - Comentario adicional del usuario
   * @returns {Promise<Object>} - Resultado del procesamiento del feedback
   */
  async processFeedback({ userId, conversationId, feedback, comment = '' }) {
    try {
      if (!userId || !conversationId || !feedback) {
        throw new Error('Parámetros incompletos para el feedback');
      }

      const validFeedbackTypes = ['helpful', 'not_helpful', 'incorrect', 'excellent'];
      if (!validFeedbackTypes.includes(feedback)) {
        throw new Error('Tipo de feedback no válido');
      }

      // Log del feedback para análisis futuro
      console.log(`Feedback recibido - Usuario: ${userId}, Conversación: ${conversationId}, Tipo: ${feedback}, Comentario: ${comment}`);

      // En el futuro, aquí se guardará en base de datos para mejorar el modelo
      const feedbackData = {
        userId,
        conversationId,
        feedback,
        comment,
        timestamp: new Date().toISOString(),
        processed: true
      };

      return {
        success: true,
        data: feedbackData,
        message: '¡Gracias por tu feedback! Nos ayuda a mejorar. 👍'
      };

    } catch (error) {
      console.error('Error procesando feedback:', error);
      return {
        success: false,
        error: error.message,
        message: 'No pudimos procesar tu feedback en este momento'
      };
    }
  }
}

module.exports = ProcessChatbotQuery;
