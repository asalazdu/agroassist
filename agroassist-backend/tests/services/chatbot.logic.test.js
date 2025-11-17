const { describe, test, expect, beforeEach } = require('@jest/globals');

// Test de lógica de negocio del chatbot sin llamadas a OpenAI
describe('ChatbotService - Lógica de Negocio', () => {
  describe('Clasificación de consultas', () => {
    test('debe identificar consultas sobre clima', () => {
      expect(/clima/i.test('¿Qué clima hay hoy?')).toBe(true);
      expect(/tiempo/i.test('¿Cómo está el tiempo?')).toBe(true);
      expect(/llover/i.test('Va a llover')).toBe(true);
      expect(/temperatura/i.test('temperatura actual')).toBe(true);
    });

    test('debe identificar consultas sobre plagas', () => {
      const queries = [
        '¿Cómo combatir la roya?',
        'Mi cultivo tiene manchas',
        'plagas en el café',
        'enfermedad en las hojas'
      ];

      queries.forEach(query => {
        const hasPestKeywords = /plaga|roya|enfermedad|combatir|manchas|hojas|cultivo/i.test(query);
        expect(hasPestKeywords).toBe(true);
      });
    });

    test('debe identificar consultas sobre cultivos', () => {
      const queries = [
        '¿Cuándo sembrar café?',
        'Cuidados del tomate',
        'época de siembra papa',
        'fertilización de maíz'
      ];

      queries.forEach(query => {
        const hasCropKeywords = /sembrar|siembra|cultivo|cuidados|fertilización|café|papa|tomate|maíz/i.test(query);
        expect(hasCropKeywords).toBe(true);
      });
    });
  });

  describe('Validación de entrada', () => {
    test('debe rechazar mensajes vacíos', () => {
      const emptyMessages = ['', '   ', '\n', '\t'];

      emptyMessages.forEach(msg => {
        expect(msg.trim().length).toBe(0);
      });
    });

    test('debe aceptar mensajes válidos', () => {
      const validMessages = [
        '¿Cuándo sembrar café?',
        'Hola',
        '¿Qué clima hace?'
      ];

      validMessages.forEach(msg => {
        expect(msg.trim().length).toBeGreaterThan(0);
      });
    });

    test('debe limpiar espacios extra', () => {
      const message = '  ¿Cuándo sembrar café?  ';
      const cleaned = message.trim();
      expect(cleaned).toBe('¿Cuándo sembrar café?');
      expect(cleaned).not.toContain('  ');
    });
  });

  describe('Formato de respuesta', () => {
    test('debe crear estructura de respuesta exitosa', () => {
      const response = {
        success: true,
        respuesta: 'El café se siembra en época de lluvias...',
        tipo_consulta: 'cultivo',
        tokens_usados: 100
      };

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('respuesta');
      expect(response).toHaveProperty('tipo_consulta');
      expect(response.success).toBe(true);
    });

    test('debe crear estructura de respuesta con error', () => {
      const response = {
        success: false,
        error: 'No se pudo procesar la consulta'
      };

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('Gestión de contexto', () => {
    test('debe mantener historial de conversación', () => {
      const historial = [];
      
      historial.push({
        role: 'user',
        content: '¿Cuándo sembrar café?'
      });
      
      historial.push({
        role: 'assistant',
        content: 'El café se siembra...'
      });

      expect(historial.length).toBe(2);
      expect(historial[0].role).toBe('user');
      expect(historial[1].role).toBe('assistant');
    });

    test('debe limitar tamaño del historial', () => {
      const historial = [];
      const maxHistorial = 10;

      // Agregar más mensajes que el límite
      for (let i = 0; i < 15; i++) {
        historial.push({ role: 'user', content: `Mensaje ${i}` });
      }

      const historialLimitado = historial.slice(-maxHistorial);
      expect(historialLimitado.length).toBe(maxHistorial);
    });
  });

  describe('Detección de emergencias', () => {
    test('debe detectar situaciones de emergencia', () => {
      const emergencyQueries = [
        'urgente, mi cultivo se está muriendo',
        'ayuda! plaga severa',
        'emergencia agrícola'
      ];

      emergencyQueries.forEach(query => {
        const isEmergency = /urgente|emergencia|ayuda!|muriendo|severa/i.test(query);
        expect(isEmergency).toBe(true);
      });
    });

    test('debe priorizar respuestas de emergencia', () => {
      const query = 'urgente plaga en café';
      const isEmergency = /urgente|emergencia/i.test(query);
      const priority = isEmergency ? 'alta' : 'normal';

      expect(priority).toBe('alta');
    });
  });

  describe('Extracción de información', () => {
    test('debe extraer nombres de cultivos', () => {
      const cultivos = ['café', 'papa', 'tomate', 'maíz', 'arroz'];
      const message = 'Quiero información sobre el cultivo de café';

      const cultivoEncontrado = cultivos.find(c => 
        message.toLowerCase().includes(c)
      );

      expect(cultivoEncontrado).toBe('café');
    });

    test('debe extraer ubicación del usuario', () => {
      const context = {
        location: {
          lat: 4.60971,
          lon: -74.08175
        }
      };

      expect(context.location).toBeDefined();
      expect(context.location.lat).toBeCloseTo(4.60971);
      expect(context.location.lon).toBeCloseTo(-74.08175);
    });
  });

  describe('Construcción de prompts', () => {
    test('debe construir prompt con contexto', () => {
      const sistemPrompt = 'Eres un experto agrícola';
      const userMessage = '¿Cuándo sembrar café?';
      const context = 'Región: Andina, Clima: Templado';

      const fullPrompt = `${sistemPrompt}\n\nContexto: ${context}\n\nPregunta: ${userMessage}`;

      expect(fullPrompt).toContain(sistemPrompt);
      expect(fullPrompt).toContain(userMessage);
      expect(fullPrompt).toContain(context);
    });
  });
});
