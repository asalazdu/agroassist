const OpenAI = require('openai');
const weatherService = require('./weatherService');
const pestService = require('./pestService');

class ChatbotService {
  constructor() {
    // Inicializar OpenAI (requerirá OPENAI_API_KEY en .env)
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;

    // Base de conocimiento agrícola
    this.knowledgeBase = {
      cultivos: {
        'maiz': {
          mejor_epoca: 'Marzo-Abril y Septiembre-Octubre',
          clima_ideal: 'Temperatura 20-30°C, precipitación 600-1200mm',
          ciclo: '90-120 días',
          cuidados: ['Riego constante primeras 6 semanas', 'Control de gusano cogollero', 'Fertilización NPK']
        },
        'tomate': {
          mejor_epoca: 'Todo el año en clima controlado, evitar lluvias fuertes',
          clima_ideal: 'Temperatura 18-25°C, humedad 60-70%',
          ciclo: '90-120 días',
          cuidados: ['Control de mosca blanca', 'Poda y entutorado', 'Riego por goteo']
        },
        'arroz': {
          mejor_epoca: 'Abril-Mayo (primer semestre), Agosto-Septiembre (segundo)',
          clima_ideal: 'Temperatura 20-35°C, abundante agua',
          ciclo: '120-150 días',
          cuidados: ['Manejo de agua', 'Control de barrenador', 'Fertilización fraccionada']
        },
        'papa': {
          mejor_epoca: 'Febrero-Marzo y Agosto-Septiembre',
          clima_ideal: 'Temperatura 15-20°C, altitud 2000-3500m',
          ciclo: '90-120 días',
          cuidados: ['Aporque regular', 'Control de polilla', 'Cosecha oportuna']
        },
        'soja': {
          mejor_epoca: 'Octubre-Diciembre',
          clima_ideal: 'Temperatura 20-30°C, precipitación 450-800mm',
          ciclo: '100-140 días',
          cuidados: ['Inoculación con rhizobium', 'Control de plagas', 'No riego en floración']
        }
      },
      recomendaciones_clima: {
        lluvia_fuerte: 'Proteger cultivos con coberturas, revisar drenajes, posponer aplicaciones',
        sequia: 'Implementar riego, mulch para retener humedad, variedades resistentes',
        viento_fuerte: 'Instalar cortavientos, reforzar tutores, cosechar cultivos maduros',
        helada: 'Cubrir cultivos sensibles, riego nocturno, variedades resistentes al frío',
        temperatura_alta: 'Riego temprano, sombra artificial, variedades tolerantes al calor'
      }
    };

    // Prompts del sistema para diferentes tipos de consulta
    this.systemPrompts = {
      general: `Eres AgroBot, un asistente agrícola inteligente especializado en cultivos colombianos. 
      Proporciona consejos prácticos y recomendaciones basadas en:
      - Datos meteorológicos actuales
      - Información de plagas y enfermedades
      - Calendario agrícola colombiano
      - Buenas prácticas agronómicas
      
      Responde de forma amigable, práctica y útil. Usa emojis cuando sea apropiado.
      Si no tienes información específica, sugiere consultar con un agrónomo local.`,
      
      clima: `Analiza la información meteorológica y proporciona recomendaciones agrícolas específicas.
      Considera: temperaturas, precipitación, humedad, viento.
      Sugiere acciones específicas para proteger o beneficiar los cultivos.`,
      
      plagas: `Analiza los síntomas descritos y proporciona diagnóstico probable de plagas o enfermedades.
      Sugiere métodos de control integrado: biológico, cultural, químico.
      Prioriza soluciones sostenibles y económicas.`,
      
      cultivo: `Proporciona guía completa para el cultivo solicitado:
      - Época ideal de siembra
      - Preparación del terreno
      - Cuidados durante el ciclo
      - Momento de cosecha
      - Problemas comunes y soluciones`
    };
  }

  /**
   * Procesa un mensaje del usuario y genera respuesta inteligente
   * @param {string} message - Mensaje del usuario
   * @param {Object} context - Contexto adicional (ubicación, historial, etc.)
   * @param {Object} user - Información del usuario
   * @returns {Promise<Object>} - Respuesta del chatbot
   */
  async processMessage(message, context = {}, user = {}) {
    try {
      // Determinar tipo de consulta
      const queryType = this.detectQueryType(message);
      
      // Obtener datos relevantes según el tipo de consulta
      const relevantData = await this.gatherRelevantData(message, queryType, context);
      
      // Generar respuesta
      let response;
      if (this.openai) {
        response = await this.generateAIResponse(message, queryType, relevantData, user);
      } else {
        response = await this.generateRuleBasedResponse(message, queryType, relevantData, user);
      }

      // Agregar sugerencias de acciones
      response.suggestions = this.generateSuggestions(queryType, relevantData);
      
      // Guardar en historial
      await this.saveConversation(user.id, message, response);

      return {
        success: true,
        response: response,
        type: queryType,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error en chatbot:', error);
      return {
        success: false,
        response: {
          text: "Lo siento, tuve un problema procesando tu consulta. ¿Podrías intentar de nuevo? 🤖",
          type: 'error'
        },
        error: error.message
      };
    }
  }

  /**
   * Detecta el tipo de consulta del usuario
   * @param {string} message - Mensaje del usuario
   * @returns {string} - Tipo de consulta
   */
  detectQueryType(message) {
    const msg = message.toLowerCase();
    
    // Palabras clave para cada tipo
    const keywords = {
      clima: ['clima', 'tiempo', 'temperatura', 'lluvia', 'pronóstico', 'helada', 'viento', 'sequia'],
      plagas: ['plaga', 'enfermedad', 'hoja', 'amarilla', 'manchas', 'insecto', 'gusano', 'hongo'],
      cultivo: ['sembrar', 'plantar', 'cultivar', 'cosecha', 'siembra', 'maíz', 'tomate', 'arroz', 'papa', 'soja'],
      calendario: ['cuándo', 'época', 'momento', 'fecha', 'mes', 'calendario'],
      general: ['hola', 'ayuda', 'consejos', 'recomendación']
    };

    // Contar coincidencias por categoría
    let maxScore = 0;
    let detectedType = 'general';

    Object.keys(keywords).forEach(type => {
      const score = keywords[type].reduce((count, keyword) => {
        return count + (msg.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedType = type;
      }
    });

    return detectedType;
  }

  /**
   * Recopila datos relevantes para la consulta
   * @param {string} message - Mensaje del usuario
   * @param {string} queryType - Tipo de consulta
   * @param {Object} context - Contexto adicional
   * @returns {Promise<Object>} - Datos relevantes
   */
  async gatherRelevantData(message, queryType, context) {
    const data = {};

    try {
      // Extraer ubicación del mensaje o contexto
      const location = this.extractLocation(message) || context.location;

      if (queryType === 'clima' || queryType === 'general') {
        if (location) {
          try {
            const weatherData = await weatherService.getWeatherForecast(location.city, location.country);
            data.weather = weatherData;
          } catch (error) {
            console.log('No se pudo obtener datos del clima:', error.message);
          }
        }
      }

      if (queryType === 'plagas' || queryType === 'cultivo') {
        const crop = this.extractCrop(message);
        if (crop) {
          try {
            const pestData = await pestService.getPestsByCrop(crop);
            data.pests = pestData;
            data.crop = crop;
          } catch (error) {
            console.log('No se pudo obtener datos de plagas:', error.message);
          }
        }
      }

      // Agregar conocimiento base
      data.knowledgeBase = this.knowledgeBase;
      data.location = location;

    } catch (error) {
      console.error('Error recopilando datos:', error);
    }

    return data;
  }

  /**
   * Genera respuesta usando IA (OpenAI)
   * @param {string} message - Mensaje del usuario
   * @param {string} queryType - Tipo de consulta
   * @param {Object} data - Datos relevantes
   * @param {Object} user - Usuario
   * @returns {Promise<Object>} - Respuesta generada
   */
  async generateAIResponse(message, queryType, data, user) {
    const systemPrompt = this.systemPrompts[queryType] || this.systemPrompts.general;
    
    const contextInfo = this.buildContextForAI(data, user);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nInformación de contexto disponible:\n${contextInfo}`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return {
      text: completion.choices[0].message.content,
      type: queryType,
      source: 'ai',
      confidence: 'high'
    };
  }

  /**
   * Genera respuesta basada en reglas (sin IA)
   * @param {string} message - Mensaje del usuario
   * @param {string} queryType - Tipo de consulta
   * @param {Object} data - Datos relevantes
   * @param {Object} user - Usuario
   * @returns {Promise<Object>} - Respuesta generada
   */
  async generateRuleBasedResponse(message, queryType, data, user) {
    let response = "";

    switch (queryType) {
      case 'clima':
        response = this.generateWeatherResponse(data);
        break;
      case 'plagas':
        response = this.generatePestResponse(data);
        break;
      case 'cultivo':
        response = this.generateCropResponse(data);
        break;
      case 'calendario':
        response = this.generateCalendarResponse(data);
        break;
      default:
        response = this.generateGeneralResponse(message);
    }

    return {
      text: response,
      type: queryType,
      source: 'rules',
      confidence: 'medium'
    };
  }

  /**
   * Construye contexto para la IA
   * @param {Object} data - Datos disponibles
   * @param {Object} user - Usuario
   * @returns {string} - Contexto formateado
   */
  buildContextForAI(data, user) {
    let context = [];

    if (data.weather) {
      context.push(`CLIMA ACTUAL: ${JSON.stringify(data.weather, null, 2)}`);
    }

    if (data.pests && data.crop) {
      context.push(`INFORMACIÓN DE PLAGAS PARA ${data.crop.toUpperCase()}: ${JSON.stringify(data.pests, null, 2)}`);
    }

    if (data.location) {
      context.push(`UBICACIÓN: ${data.location.city}, ${data.location.country}`);
    }

    if (user.nombre) {
      context.push(`USUARIO: ${user.nombre}`);
    }

    return context.join('\n\n');
  }

  /**
   * Extrae ubicación del mensaje
   * @param {string} message - Mensaje del usuario
   * @returns {Object|null} - Ubicación extraída
   */
  extractLocation(message) {
    const cities = ['bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'bucaramanga', 'pereira', 'manizales'];
    const msg = message.toLowerCase();
    
    for (const city of cities) {
      if (msg.includes(city)) {
        return { city: city, country: 'CO' };
      }
    }
    return null;
  }

  /**
   * Extrae cultivo del mensaje
   * @param {string} message - Mensaje del usuario
   * @returns {string|null} - Cultivo extraído
   */
  extractCrop(message) {
    const crops = ['maíz', 'maiz', 'tomate', 'arroz', 'papa', 'soja', 'frijol', 'café', 'cafe', 'plátano', 'platano'];
    const msg = message.toLowerCase();
    
    for (const crop of crops) {
      if (msg.includes(crop)) {
        return crop.replace('í', 'i').replace('é', 'e'); // Normalizar
      }
    }
    return null;
  }

  /**
   * Genera respuesta sobre clima
   * @param {Object} data - Datos disponibles
   * @returns {string} - Respuesta sobre clima
   */
  generateWeatherResponse(data) {
    if (!data.weather) {
      return "🌤️ Para darte información del clima específica, necesito que me digas tu ubicación. ¿En qué ciudad te encuentras?";
    }

    const weather = data.weather;
    let response = `🌤️ **Pronóstico para ${weather.ubicacion.ciudad}:**\n\n`;
    
    weather.pronostico_3_dias.forEach((day, index) => {
      const dayName = index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : day.fecha_legible.split(',')[0];
      response += `**${dayName}:** ${day.temperatura_maxima}°/${day.temperatura_minima}°C, ${day.descripcion}\n`;
    });

    response += "\n🌱 **Recomendaciones agrícolas:**\n";
    response += this.getWeatherRecommendations(weather.pronostico_3_dias[0]);

    return response;
  }

  /**
   * Genera recomendaciones basadas en clima
   * @param {Object} forecast - Pronóstico del día
   * @returns {string} - Recomendaciones
   */
  getWeatherRecommendations(forecast) {
    let recommendations = [];

    if (forecast.probabilidad_lluvia > 70) {
      recommendations.push("☔ Alta probabilidad de lluvia - Evita aplicaciones foliares");
      recommendations.push("🛡️ Protege cultivos sensibles con coberturas");
    } else if (forecast.probabilidad_lluvia < 20 && forecast.temperatura_maxima > 30) {
      recommendations.push("🌵 Clima seco y caluroso - Asegura riego adecuado");
      recommendations.push("🌿 Considera mulch para retener humedad");
    }

    if (forecast.viento_promedio > 20) {
      recommendations.push("💨 Vientos fuertes - Refuerza tutores de cultivos altos");
    }

    if (forecast.temperatura_minima < 15) {
      recommendations.push("🥶 Temperaturas bajas - Protege cultivos sensibles al frío");
    }

    return recommendations.length > 0 ? recommendations.join('\n') : "✅ Condiciones favorables para actividades agrícolas";
  }

  /**
   * Genera respuesta sobre plagas
   * @param {Object} data - Datos disponibles
   * @returns {string} - Respuesta sobre plagas
   */
  generatePestResponse(data) {
    if (!data.pests || !data.crop) {
      return "🐛 Para ayudarte con plagas, necesito saber qué cultivo tienes y qué síntomas observas. ¿Podrías ser más específico?";
    }

    const pestInfo = data.pests;
    let response = `🐛 **Plagas comunes en ${pestInfo.cultivo}:**\n\n`;
    
    pestInfo.plagas.slice(0, 3).forEach((pest, index) => {
      response += `**${index + 1}. ${pest.nombre}**\n`;
      response += `📍 Síntomas: ${pest.sintomas.join(', ')}\n`;
      response += `🛡️ Control: ${pest.control.slice(0, 2).join(', ')}\n\n`;
    });

    response += "💡 **Tip:** Implementa siempre manejo integrado de plagas (MIP) para mejores resultados.";

    return response;
  }

  /**
   * Genera respuesta sobre cultivos
   * @param {Object} data - Datos disponibles
   * @returns {string} - Respuesta sobre cultivos
   */
  generateCropResponse(data) {
    const crop = data.crop;
    if (!crop || !data.knowledgeBase.cultivos[crop]) {
      return "🌱 ¿Qué cultivo te interesa? Puedo ayudarte con maíz, tomate, arroz, papa, soja y más. ¡Dime cuál quieres cultivar!";
    }

    const cropInfo = data.knowledgeBase.cultivos[crop];
    let response = `🌱 **Guía para cultivar ${crop.toUpperCase()}:**\n\n`;
    response += `📅 **Mejor época:** ${cropInfo.mejor_epoca}\n`;
    response += `🌡️ **Clima ideal:** ${cropInfo.clima_ideal}\n`;
    response += `⏱️ **Ciclo:** ${cropInfo.ciclo}\n\n`;
    response += `✅ **Cuidados principales:**\n`;
    cropInfo.cuidados.forEach((care, index) => {
      response += `${index + 1}. ${care}\n`;
    });

    return response;
  }

  /**
   * Genera respuesta sobre calendario agrícola
   * @param {Object} data - Datos disponibles
   * @returns {string} - Respuesta sobre calendario
   */
  generateCalendarResponse(data) {
    const currentMonth = new Date().getMonth() + 1;
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    let response = `📅 **Calendario Agrícola - ${monthNames[currentMonth - 1]}:**\n\n`;
    
    // Actividades recomendadas por mes (simplificado)
    const activities = {
      1: ['Preparación de terrenos', 'Siembra de hortalizas de ciclo corto'],
      2: ['Siembra de papa en zona fría', 'Control de plagas en cultivos establecidos'],
      3: ['Siembra de maíz primer semestre', 'Preparación para época lluviosa'],
      4: ['Siembra de arroz', 'Fertilización de cultivos perennes'],
      5: ['Mantenimiento de cultivos', 'Control de malezas'],
      6: ['Cosecha de cultivos tempranos', 'Preparación para segundo semestre'],
      7: ['Preparación de terrenos segundo semestre', 'Siembra de hortalizas'],
      8: ['Siembra de papa segundo semestre', 'Siembra de maíz segundo semestre'],
      9: ['Fertilización y control fitosanitario', 'Siembra de cultivos de fin de año'],
      10: ['Siembra de soja', 'Preparación para época seca'],
      11: ['Cosecha de cultivos segundo semestre', 'Preparación de suelos'],
      12: ['Planificación año siguiente', 'Mantenimiento de infraestructura']
    };

    const currentActivities = activities[currentMonth] || ['Consulta con agrónomo local'];
    currentActivities.forEach((activity, index) => {
      response += `${index + 1}. ${activity}\n`;
    });

    return response;
  }

  /**
   * Genera respuesta general
   * @param {string} message - Mensaje del usuario
   * @returns {string} - Respuesta general
   */
  generateGeneralResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('hola') || msg.includes('ayuda')) {
      return `¡Hola! 👋 Soy AgroBot, tu asistente agrícola inteligente. 

Puedo ayudarte con:
🌤️ Pronósticos del clima y recomendaciones
🐛 Identificación y control de plagas
🌱 Guías de cultivos y mejores prácticas
📅 Calendario agrícola
🌾 Consejos personalizados para tu región

¿En qué puedo ayudarte hoy?`;
    }

    return "🤖 Estoy aquí para ayudarte con tus cultivos. Puedes preguntarme sobre clima, plagas, épocas de siembra, o cualquier tema agrícola. ¿Qué necesitas saber?";
  }

  /**
   * Genera sugerencias de acciones
   * @param {string} queryType - Tipo de consulta
   * @param {Object} data - Datos disponibles
   * @returns {Array} - Sugerencias
   */
  generateSuggestions(queryType, data) {
    const suggestions = [];

    switch (queryType) {
      case 'clima':
        suggestions.push('Ver pronóstico extendido');
        suggestions.push('Configurar alertas climáticas');
        suggestions.push('Consultar recomendaciones por cultivo');
        break;
      case 'plagas':
        suggestions.push('Ver más información de plagas');
        suggestions.push('Reportar nueva plaga');
        suggestions.push('Consultar métodos de control');
        break;
      case 'cultivo':
        suggestions.push('Ver calendario de siembra');
        suggestions.push('Consultar clima para siembra');
        suggestions.push('Información de plagas del cultivo');
        break;
      default:
        suggestions.push('Consultar clima de mi región');
        suggestions.push('Ver cultivos recomendados');
        suggestions.push('Identificar plagas');
    }

    return suggestions;
  }

  /**
   * Guarda conversación en historial
   * @param {number} userId - ID del usuario
   * @param {string} message - Mensaje del usuario
   * @param {Object} response - Respuesta del bot
   */
  async saveConversation(userId, message, response) {
    // Implementar según necesidad de guardar historial
    // Por ahora solo log
    console.log(`Conversación guardada - Usuario: ${userId}, Mensaje: ${message.substring(0, 50)}...`);
  }
}

module.exports = new ChatbotService();
