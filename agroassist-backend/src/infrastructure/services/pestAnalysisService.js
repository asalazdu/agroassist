const axios = require('axios');

/**
 * Servicio para análisis de imágenes de cultivos usando OpenAI Vision API
 * Identifica plagas, enfermedades y problemas en fotos de plantas
 */
class PestAnalysisService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiBaseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Analiza una imagen de cultivo para detectar plagas y enfermedades
   * @param {string} imageBase64 - Imagen en formato base64
   * @param {string} cropName - Nombre del cultivo (opcional)
   * @returns {Object} - Análisis detallado de la imagen
   */
  async analyzeCropImage(imageBase64, cropName = null) {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key no configurada');
      }

      // Preparar el prompt especializado para análisis agrícola
      const systemPrompt = `Eres un experto agrónomo especializado en identificación de plagas y enfermedades en cultivos. 
Tu tarea es analizar imágenes de plantas y proporcionar diagnósticos precisos.

Debes responder SIEMPRE en formato JSON con la siguiente estructura:
{
  "detectado": true/false,
  "cultivo_identificado": "nombre del cultivo si es identificable",
  "problemas": [
    {
      "tipo": "plaga/enfermedad/deficiencia/daño_mecanico",
      "nombre": "nombre científico y común",
      "confianza": "alta/media/baja",
      "descripcion": "descripción detallada del problema",
      "sintomas_visibles": ["lista de síntomas observados"],
      "gravedad": "leve/moderada/severa",
      "etapa": "descripción de la etapa del problema"
    }
  ],
  "recomendaciones": [
    {
      "accion": "acción recomendada",
      "prioridad": "inmediata/alta/media/baja",
      "descripcion": "descripción detallada de la acción",
      "productos_sugeridos": ["lista de productos o métodos"]
    }
  ],
  "condiciones_observadas": {
    "estado_general": "descripción del estado general de la planta",
    "color_hojas": "descripción",
    "signos_estres": ["lista de signos"]
  },
  "prevencion": ["medidas preventivas para evitar futuros problemas"]
}`;

      const userPrompt = cropName 
        ? `Analiza esta imagen de cultivo de ${cropName}. Identifica plagas, enfermedades o cualquier problema visible. Sé específico y detallado en tu análisis.`
        : `Analiza esta imagen de cultivo. Primero identifica qué tipo de planta es, luego identifica plagas, enfermedades o cualquier problema visible. Sé específico y detallado en tu análisis.`;

      // Llamada a OpenAI Vision API
      const response = await axios.post(
        this.openaiBaseUrl,
        {
          model: 'gpt-4o', // Modelo con capacidades de visión
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                    detail: 'high' // Alta resolución para mejor análisis
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.3 // Baja temperatura para respuestas más precisas
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 segundos timeout
        }
      );

      // Extraer y parsear la respuesta
      const content = response.data.choices[0].message.content;
      
      // Intentar parsear como JSON
      let analysis;
      try {
        // Buscar JSON en la respuesta (puede venir con markdown)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          analysis = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Error parseando respuesta JSON:', parseError);
        // Si no se puede parsear, crear estructura manual
        analysis = {
          detectado: true,
          cultivo_identificado: cropName || 'No especificado',
          problemas: [],
          recomendaciones: [{
            accion: 'Análisis de texto',
            prioridad: 'media',
            descripcion: content,
            productos_sugeridos: []
          }],
          condiciones_observadas: {
            estado_general: 'Ver descripción en recomendaciones',
            color_hojas: 'No determinado',
            signos_estres: []
          },
          prevencion: []
        };
      }

      return {
        exito: true,
        analisis: analysis,
        modelo_utilizado: 'gpt-4o',
        tokens_utilizados: response.data.usage?.total_tokens || 0,
        analizado_en: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error en análisis de imagen:', error.message);
      
      if (error.response?.status === 401) {
        throw new Error('API key de OpenAI inválida');
      } else if (error.response?.status === 429) {
        throw new Error('Límite de uso de OpenAI excedido. Intenta más tarde.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. La imagen puede ser muy grande.');
      }
      
      throw new Error(`Error al analizar imagen: ${error.message}`);
    }
  }

  /**
   * Obtiene recomendaciones basadas en clima para prevención de plagas
   * @param {Object} weatherData - Datos del clima actual
   * @param {string} cropName - Nombre del cultivo
   * @returns {Object} - Alertas y recomendaciones
   */
  async getPestAlertsBasedOnWeather(weatherData, cropName = null) {
    try {
      const alerts = [];
      const temperature = weatherData.current?.temperature || weatherData.temperature;
      const humidity = weatherData.current?.humidity || weatherData.humidity;

      // Alertas por temperatura alta
      if (temperature > 30) {
        alerts.push({
          tipo: 'temperatura_alta',
          titulo: '🌡️ Temperatura Alta Detectada',
          descripcion: `Temperatura de ${temperature}°C favorece la proliferación de ácaros y trips`,
          plagas_riesgo: ['Ácaros', 'Trips', 'Mosca blanca'],
          recomendaciones: [
            'Aumentar monitoreo de plagas succionadoras',
            'Verificar presencia de telarañas (ácaros)',
            'Mantener riego adecuado para reducir estrés',
            'Considerar aplicación preventiva de acaricidas'
          ],
          nivel_riesgo: 'alto',
          icono: '🔥'
        });
      }

      // Alertas por temperatura baja
      if (temperature < 15) {
        alerts.push({
          tipo: 'temperatura_baja',
          titulo: '❄️ Temperatura Baja Detectada',
          descripcion: `Temperatura de ${temperature}°C puede favorecer hongos y reducir actividad de insectos`,
          plagas_riesgo: ['Hongos foliares', 'Moho gris', 'Mildiu'],
          recomendaciones: [
            'Monitorear aparición de hongos en hojas',
            'Evitar riego excesivo',
            'Mejorar ventilación en cultivos protegidos',
            'Aplicar fungicidas preventivos si es necesario'
          ],
          nivel_riesgo: 'medio',
          icono: '🧊'
        });
      }

      // Alertas por humedad alta
      if (humidity > 80) {
        alerts.push({
          tipo: 'humedad_alta',
          titulo: '💧 Humedad Alta Detectada',
          descripcion: `Humedad de ${humidity}% favorece desarrollo de enfermedades fúngicas`,
          plagas_riesgo: ['Mildiu', 'Botrytis', 'Antracnosis', 'Roya'],
          recomendaciones: [
            'Reducir riego por aspersión',
            'Mejorar ventilación entre plantas',
            'Aplicar fungicidas preventivos',
            'Evitar regar en horas de la tarde',
            'Remover hojas o frutos enfermos inmediatamente'
          ],
          nivel_riesgo: 'alto',
          icono: '💦'
        });
      }

      // Condiciones ideales para plagas
      if (temperature >= 25 && temperature <= 30 && humidity >= 60 && humidity <= 80) {
        alerts.push({
          tipo: 'condiciones_optimas_plagas',
          titulo: '⚠️ Condiciones Óptimas para Plagas',
          descripcion: `Temperatura ${temperature}°C y humedad ${humidity}% son ideales para muchas plagas`,
          plagas_riesgo: ['Pulgones', 'Mosca blanca', 'Trips', 'Gusanos'],
          recomendaciones: [
            'Intensificar monitoreo diario de cultivos',
            'Instalar trampas cromáticas (amarillas y azules)',
            'Revisar envés de hojas',
            'Aplicar controles preventivos si hay historial de plagas',
            'Mantener cultivo libre de malezas'
          ],
          nivel_riesgo: 'medio',
          icono: '⚠️'
        });
      }

      // Alertas específicas por cultivo
      if (cropName) {
        const cropAlerts = this.getCropSpecificAlerts(cropName, temperature, humidity);
        alerts.push(...cropAlerts);
      }

      return {
        exito: true,
        clima_actual: {
          temperatura: temperature,
          humedad: humidity,
          ubicacion: weatherData.location || 'No especificada'
        },
        total_alertas: alerts.length,
        alertas: alerts,
        nivel_riesgo_general: this.calculateOverallRisk(alerts),
        consultado_en: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Error al generar alertas de clima: ${error.message}`);
    }
  }

  /**
   * Obtiene alertas específicas por cultivo según clima
   * @param {string} cropName - Nombre del cultivo
   * @param {number} temperature - Temperatura actual
   * @param {number} humidity - Humedad actual
   * @returns {Array} - Lista de alertas específicas
   */
  getCropSpecificAlerts(cropName, temperature, humidity) {
    const alerts = [];
    const crop = cropName.toLowerCase();

    // Tomate
    if (crop.includes('tomate') || crop.includes('tomato')) {
      if (humidity > 85) {
        alerts.push({
          tipo: 'cultivo_especifico',
          titulo: '🍅 Alerta para Tomate',
          descripcion: 'Alta humedad favorece Tizón tardío (Phytophthora) en tomate',
          plagas_riesgo: ['Tizón tardío', 'Moho gris', 'Cladosporiosis'],
          recomendaciones: [
            'Aplicar fungicidas a base de cobre',
            'Evitar mojar follaje al regar',
            'Podar hojas inferiores para mejorar ventilación'
          ],
          nivel_riesgo: 'alto',
          icono: '🍅'
        });
      }
    }

    // Café
    if (crop.includes('café') || crop.includes('coffee')) {
      if (temperature >= 20 && temperature <= 28 && humidity > 70) {
        alerts.push({
          tipo: 'cultivo_especifico',
          titulo: '☕ Alerta para Café',
          descripcion: 'Condiciones favorables para Broca del café y Roya',
          plagas_riesgo: ['Broca del café', 'Roya del cafeto', 'Ojo de gallo'],
          recomendaciones: [
            'Monitorear granos para detectar Broca',
            'Revisar hojas por manchas de Roya',
            'Mantener buena sombra regulada',
            'Realizar re-re y repase oportuno'
          ],
          nivel_riesgo: 'alto',
          icono: '☕'
        });
      }
    }

    // Papa
    if (crop.includes('papa') || crop.includes('potato')) {
      if (temperature >= 18 && temperature <= 22 && humidity > 80) {
        alerts.push({
          tipo: 'cultivo_especifico',
          titulo: '🥔 Alerta para Papa',
          descripcion: 'Condiciones ideales para Tizón tardío de la papa',
          plagas_riesgo: ['Tizón tardío', 'Tizón temprano', 'Polilla guatemalteca'],
          recomendaciones: [
            'Aplicar fungicidas preventivos',
            'Realizar aporque para proteger tubérculos',
            'Monitorear envés de hojas',
            'Evitar exceso de nitrógeno'
          ],
          nivel_riesgo: 'alto',
          icono: '🥔'
        });
      }
    }

    return alerts;
  }

  /**
   * Calcula el nivel de riesgo general
   * @param {Array} alerts - Lista de alertas
   * @returns {string} - Nivel de riesgo (bajo/medio/alto)
   */
  calculateOverallRisk(alerts) {
    if (alerts.length === 0) return 'bajo';
    
    const highRiskCount = alerts.filter(a => a.nivel_riesgo === 'alto').length;
    const mediumRiskCount = alerts.filter(a => a.nivel_riesgo === 'medio').length;

    if (highRiskCount >= 2) return 'alto';
    if (highRiskCount >= 1 || mediumRiskCount >= 2) return 'medio';
    return 'bajo';
  }
}

module.exports = new PestAnalysisService();
