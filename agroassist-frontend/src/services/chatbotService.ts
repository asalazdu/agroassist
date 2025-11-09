import { API_CONFIG } from '../config/api';
import axios from 'axios';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
}

class ChatbotService {
  private static instance: ChatbotService;
  private conversationHistory: Array<{role: string, content: string}> = [];
  
  // System prompt especializado en agricultura colombiana
  private readonly SYSTEM_PROMPT = `Eres AgroBot IA, un experto asistente agrícola especializado en Colombia. Tu conocimiento incluye:

📊 PRECIOS DE MERCADO (Actualizado Oct 2025):
- Tomate: $2,800-3,200/kg (Corabastos, Plaza Minorista, Cavasa)
- Papa: $1,800-2,200/kg (variedades: Parda Pastusa, R12, Capiro)
- Maíz: $1,200-1,800/kg (híbridos: Pioneer 30F35, ICA V-109)
- Cebolla: $2,200-2,800/kg
- Zanahoria: $1,500-1,900/kg
- Plátano Hartón: $1,200-1,500/kg
- Aguacate Hass: $5,500-7,000/kg

💰 RENTABILIDAD (ROI):
- Tomate invernadero: 370-550% (4 meses ciclo)
- Aguacate Hass: 180-260% anual (exportación)
- Papa tecnificada: 94-158% (5-6 meses)
- Maíz híbrido: 60-100%

🌱 CULTIVOS RECOMENDADOS:
- Fincas pequeñas (<2 ha): Tomate cherry, pimentón, cilantro
- Fincas medianas (2-10 ha): Tomate Milano F1, papa R12, maíz híbrido
- Fincas grandes (>10 ha): Aguacate Hass exportación, arroz mecanizado

🐛 PLAGAS COMUNES:
- Tomate: Mosca blanca, Gusano cogollero, Tizón tardío
- Papa: Gota (Phytophthora), Polilla guatemalteca
- Maíz: Cogollero, Gusano elotero

💳 FINANCIAMIENTO:
- FINAGRO: 4-8% EA, hasta $5,000M
- Banco Agrario: 6-12% EA, microcrédito rural
- Cooperativas: 8-15% EA, garantías solidarias

🌍 CERTIFICACIONES:
- GlobalGAP: $8-12M, +20-30% precio
- Orgánico: $15-25M, +40-60% precio
- Rainforest Alliance: $5-10M

INSTRUCCIONES:
- Responde de forma concisa y práctica (máximo 250 palabras)
- Usa emojis para hacer respuestas visuales
- Proporciona datos específicos y actualizados
- Si no tienes información, recomienda consultar con un agrónomo
- Siempre sugiere 3-4 preguntas relacionadas al final
- Habla en español colombiano, tutea al usuario`;

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    console.log('🤖 AgroBot procesando con OpenAI:', message);
    
    try {
      // Intentar usar OpenAI API real
      const response = await this.callOpenAI(message);
      return response;
    } catch (error) {
      console.error('Error OpenAI, usando fallback:', error);
      // Si falla OpenAI, usar respuestas inteligentes locales
      return this.getSmartResponse(message);
    }
  }

  private async callOpenAI(message: string): Promise<ChatResponse> {
    const OPENAI_API_KEY = API_CONFIG.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'tu-api-key-aqui') {
      throw new Error('OpenAI API key no configurada');
    }

    // Agregar mensaje del usuario al historial
    this.conversationHistory.push({
      role: 'user',
      content: message
    });

    // Mantener solo los últimos 10 mensajes para no exceder límite de tokens
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Modelo más accesible y económico
          messages: [
            { role: 'system', content: this.SYSTEM_PROMPT },
            ...this.conversationHistory
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          timeout: 30000, // 30 segundos timeout
        }
      );

      const botMessage = response.data.choices[0].message.content;
      
      // Agregar respuesta al historial
      this.conversationHistory.push({
        role: 'assistant',
        content: botMessage
      });

      // Generar sugerencias inteligentes basadas en el contexto
      const suggestions = this.generateSuggestions(message, botMessage);

      return {
        message: botMessage,
        suggestions
      };
    } catch (error: any) {
      // Mejorar logging de errores
      if (error.response) {
        console.error('Error OpenAI Response:', {
          status: error.response.status,
          data: error.response.data,
        });
        
        // Errores específicos
        if (error.response.status === 429) {
          console.error('⏱️ Rate limit excedido en OpenAI');
        } else if (error.response.status === 401) {
          console.error('🔑 API Key inválida o expirada');
        } else if (error.response.status === 404) {
          console.error('❌ Modelo no encontrado. Verifica que tienes acceso a gpt-3.5-turbo');
        }
      }
      
      // Re-lanzar error para que se use el fallback
      throw error;
    }
  }

  private generateSuggestions(userMessage: string, botResponse: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = botResponse.toLowerCase();

    // Sugerencias contextuales
    if (lowerMessage.includes('precio') || lowerResponse.includes('precio')) {
      return ['Rentabilidad del cultivo', 'Mejor época siembra', 'Variedades disponibles', 'Mercados cercanos'];
    }
    if (lowerMessage.includes('rentabilidad') || lowerResponse.includes('roi')) {
      return ['Costos de producción', 'Financiamiento FINAGRO', 'Comparar con otros cultivos', 'Certificaciones'];
    }
    if (lowerMessage.includes('plaga') || lowerResponse.includes('plaga')) {
      return ['Control biológico', 'Productos recomendados', 'Prevención', 'Manejo integrado'];
    }
    if (lowerMessage.includes('cultivo') || lowerMessage.includes('sembrar')) {
      return ['Análisis de suelo', 'Clima requerido', 'Rentabilidad esperada', 'Plagas comunes'];
    }

    // Sugerencias por defecto
    return ['Precios del mercado', '¿Qué cultivo sembrar?', 'Rentabilidad', 'Plagas comunes'];
  }

  private getSmartResponse(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase();
    
    // SALUDOS
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('hi') || lowerMessage.includes('buenas')) {
      return {
        message: '¡Hola! 👋 Soy **AgroBot IA**, tu asistente agrícola especializado en Colombia.\n\n🌾 **Experto en:**\n• 💰 Precios actualizados de mercados\n• � Recomendaciones de cultivos\n• 🐛 Control de plagas y enfermedades\n• 🌤️ Pronósticos y clima agrícola\n• 📈 Análisis de rentabilidad\n• 📅 Calendario de siembra óptimo\n• 💡 Mejores prácticas agrícolas\n\n**¿Sobre qué quieres saber?**\nPregúntame sobre precios, cultivos específicos, plagas, o necesitas una recomendación.',
        suggestions: ['Precios del mercado', '¿Qué cultivo sembrar?', 'Plagas comunes', 'Rentabilidad']
      };
    }

    // AYUDA COMPLETA Y MEJORADA
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('que puedes') || lowerMessage.includes('qué puedes') || lowerMessage.includes('funciones') || lowerMessage.includes('capacidades')) {
      return {
        message: '🤖 **AgroBot IA - Tu Experto Agrícola Completo**\n\n� **INFORMACIÓN DE MERCADO:**\n• 💰 Precios actualizados por producto\n• 📈 Análisis de tendencias y rentabilidad\n• 🏪 Mercados: Corabastos, Plaza Minorista, Cavasa\n• 💵 Comparación de precios regionales\n\n� **CULTIVOS Y PRODUCCIÓN:**\n• 📋 Guías completas por cultivo (tomate, papa, maíz, aguacate, etc.)\n• 🌾 Variedades recomendadas y comparaciones\n• 📊 Análisis ROI y rentabilidad detallada\n• ⏱️ Ciclos de cultivo y calendarios\n• 🗺️ Información por regiones\n\n💡 **RECOMENDACIONES PERSONALIZADAS:**\n• ¿Qué cultivo sembrar según tu finca?\n• Análisis por tamaño de terreno\n• Diversificación de cultivos\n• Estrategias de maximización\n\n🐛 **SANIDAD VEGETAL:**\n• Identificación de plagas y enfermedades\n• Métodos de control (químico, biológico, cultural)\n• Manejo Integrado de Plagas (MIP)\n• Prevención y monitoreo\n\n� **FINANCIAMIENTO:**\n• Líneas de crédito (FINAGRO, Banco Agrario)\n• Requisitos y tasas\n• Plan de negocio\n\n🌍 **EXPORTACIÓN:**\n• Certificaciones (GlobalGAP, Orgánico)\n• Mercados internacionales\n• Productos de exportación\n\n🚀 **TECNOLOGÍA:**\n• Agricultura de precisión\n• Invernaderos tecnificados\n• Sistemas de riego eficientes\n• Hidroponía\n\n**Solo pregunta lo que necesites saber!**',
        suggestions: ['Precios productos', 'Mejor cultivo sembrar', 'Rentabilidad', 'Financiamiento']
      };
    }

    // CLIMA
    if (lowerMessage.includes('clima') || lowerMessage.includes('temperatura') || lowerMessage.includes('lluvia')) {
      return {
        message: '🌤️ **Información del Clima**\n\nPara ver el pronóstico detallado y recomendaciones agrícolas:\n\n1. Ve a la sección **"Clima"** en el menú principal\n2. Busca tu ciudad\n3. Obtén pronósticos a 5 días\n4. Recibe alertas importantes\n\n💡 **Tip**: El clima es fundamental para planificar siembras y aplicaciones de productos.',
        suggestions: ['Ver sección Clima', 'Mejor época sembrar', 'Riego recomendado']
      };
    }

    // PLAGAS
    if (lowerMessage.includes('plaga') || lowerMessage.includes('insecto') || lowerMessage.includes('enfermedad')) {
      return {
        message: '🐛 **Control de Plagas**\n\n**Plagas Comunes en Colombia:**\n\n🐛 **Gusano cogollero** (Maíz)\n• Control: Bacillus thuringiensis\n• Monitoreo constante\n\n🦋 **Mosca blanca** (Tomate)\n• Trampas amarillas\n• Control biológico\n\n🐛 **Minador de hoja** (Hortalizas)\n• Eliminar plantas afectadas\n• Rotación de cultivos\n\n**Ve a la sección "Plagas" para identificar con fotos**',
        suggestions: ['Ver sección Plagas', 'Plagas tomate', 'Control orgánico', 'Prevención']
      };
    }

    // PRECIOS Y MERCADOS - EXPANDIDO
    if (lowerMessage.includes('precio') || lowerMessage.includes('mercado') || lowerMessage.includes('vender') || lowerMessage.includes('comprar') || lowerMessage.includes('cotización') || lowerMessage.includes('cotizacion') || lowerMessage.includes('cuanto cuesta') || lowerMessage.includes('cuánto cuesta')) {
      
      // Precios específicos de productos
      if (lowerMessage.includes('tomate')) {
        return {
          message: '🍅 **PRECIOS TOMATE - Actualizado Octubre 2025**\n\n💰 **MERCADOS NACIONALES:**\n\n**Corabastos Bogotá:**\n• Tomate Chonto Extra: $3,200/kg\n• Tomate Chonto 1ra: $2,800/kg\n• Tomate Milano F1: $3,500/kg\n• Tomate Cherry: $4,800/kg\n\n**Plaza Minorista Medellín:**\n• Tomate Chonto: $2,900-3,300/kg\n• Tomate Cherry: $4,500/kg\n\n**Cavasa Cali:**\n• Tomate Valle: $2,700-3,100/kg\n• Tomate Larga Vida: $3,400/kg\n\n📊 **ANÁLISIS:**\n• Tendencia: Precios estables\n• Mejor época venta: Enero-Marzo\n• Demanda alta: Diciembre y Semana Santa\n• Consejo: Clasificar por tamaño aumenta precio 15%',
          suggestions: ['Costo producción tomate', 'Rentabilidad tomate', 'Variedades', 'Otros precios']
        };
      }
      
      if (lowerMessage.includes('papa')) {
        return {
          message: '🥔 **PRECIOS PAPA - Actualizado Octubre 2025**\n\n💰 **MERCADOS NACIONALES:**\n\n**Corabastos Bogotá:**\n• Papa Parda Pastusa Extra: $2,200/kg\n• Papa Parda Pastusa 1ra: $1,800/kg\n• Papa R12 (Única): $2,400/kg\n• Papa Criolla: $3,500/kg\n\n**Plaza Minorista Medellín:**\n• Papa Pastusa: $1,900-2,300/kg\n• Papa Criolla: $3,200-3,800/kg\n\n**Mercado del Sur (Ipiales):**\n• Papa Capiro: $1,600-1,900/kg\n• Papa Pastusa: $1,700-2,100/kg\n\n📊 **ANÁLISIS:**\n• Tendencia: Ligero incremento por temporada\n• Mejor venta: Junio-Agosto, Diciembre\n• Producción: Cundinamarca 30%, Boyacá 25%\n• Consejo: Papa lavada aumenta precio 20%',
          suggestions: ['Rentabilidad papa', 'Mejor variedad', 'Costo producción', 'Otros tubérculos']
        };
      }
      
      if (lowerMessage.includes('maíz') || lowerMessage.includes('maiz')) {
        return {
          message: '� **PRECIOS MAÍZ - Actualizado Octubre 2025**\n\n💰 **MERCADOS NACIONALES:**\n\n**Precio al Productor:**\n• Maíz Amarillo Seco: $1,450/kg\n• Maíz Blanco Tecnificado: $1,650/kg\n• Maíz Tradicional: $1,200/kg\n\n**Precio Industrial:**\n• Maíz grado 1: $1,580/kg\n• Maíz grado 2: $1,420/kg\n• Maíz importado: $1,380/kg\n\n**Mercados Mayoristas:**\n• Valle del Cauca: $1,500-1,700/kg\n• Córdoba: $1,400-1,600/kg\n• Meta: $1,350-1,550/kg\n\n📊 **ANÁLISIS:**\n• Tendencia: Influenciado por precio internacional\n• Demanda constante (alimento animal)\n• Mejor venta: Todo el año\n• Consejo: Contratos anticipados aseguran precio',
          suggestions: ['Rentabilidad maíz', 'Híbridos recomendados', 'Maíz vs otros', 'Mercado industrial']
        };
      }

      if (lowerMessage.includes('cebolla')) {
        return {
          message: '🧅 **PRECIOS CEBOLLA - Actualizado Octubre 2025**\n\n💰 **MERCADOS NACIONALES:**\n\n**Corabastos Bogotá:**\n• Cebolla Cabezona Blanca: $2,800/kg\n• Cebolla Cabezona Roja: $2,400/kg\n• Cebolla Junca (Larga): $1,800/kg\n\n**Otros Mercados:**\n• Plaza Minorista: $2,500-3,000/kg\n• Cavasa Cali: $2,300-2,700/kg\n\n📊 **ANÁLISIS:**\n• Tendencia: Alta variabilidad estacional\n• Mejor venta: Marzo-Mayo (precios altos)\n• Producción: Boyacá 40%, Nariño 25%\n• Consejo: Almacenamiento adecuado mantiene precio',
          suggestions: ['Cebolla rentabilidad', 'Mejor variedad', 'Almacenamiento', 'Otros precios']
        };
      }

      if (lowerMessage.includes('zanahoria')) {
        return {
          message: '🥕 **PRECIOS ZANAHORIA - Actualizado Octubre 2025**\n\n💰 **MERCADOS:**\n• Corabastos: $1,600-1,900/kg\n• Cavasa: $1,500-1,800/kg\n• Plaza Minorista: $1,700-2,000/kg\n\n📊 **ANÁLISIS:**\n• Producción: Cundinamarca 35%\n• Mejor época: Mayo-Julio\n• Demanda: Estable todo el año',
          suggestions: ['Rentabilidad zanahoria', 'Cultivo zanahoria', 'Otros precios']
        };
      }

      if (lowerMessage.includes('plátano') || lowerMessage.includes('platano')) {
        return {
          message: '🍌 **PRECIOS PLÁTANO - Actualizado Octubre 2025**\n\n💰 **MERCADOS:**\n• Plátano Hartón: $1,200-1,500/kg\n• Plátano Dominico: $1,000-1,300/kg\n\n📊 **ANÁLISIS:**\n• Producción: Eje Cafetero, Urabá\n• Exportación activa\n• Demanda constante',
          suggestions: ['Rentabilidad plátano', 'Cultivo tecnificado', 'Otros precios']
        };
      }

      if (lowerMessage.includes('aguacate')) {
        return {
          message: '🥑 **PRECIOS AGUACATE - Actualizado Octubre 2025**\n\n💰 **MERCADOS:**\n• Aguacate Hass Extra: $5,500-7,000/kg\n• Aguacate Hass 1ra: $4,500-5,500/kg\n• Aguacate Papelillo: $2,500-3,200/kg\n\n📊 **ANÁLISIS:**\n• Cultivo de exportación\n• Alta rentabilidad\n• Mejor época: Todo el año (diferentes zonas)',
          suggestions: ['Rentabilidad aguacate', 'Cultivo Hass', 'Exportación']
        };
      }
      
      // Precios generales si no se especifica producto
      return {
        message: '💰 **PRECIOS PRODUCTOS AGRÍCOLAS - Colombia**\n\n📊 **HORTALIZAS (por kg):**\n• 🍅 Tomate: $2,800-3,200\n• 🥔 Papa: $1,800-2,200\n• 🧅 Cebolla: $2,400-2,800\n• 🥕 Zanahoria: $1,600-1,900\n• 🥬 Lechuga: $700-900/unidad\n• 🫑 Pimentón: $3,500-4,200\n\n🌾 **CEREALES (por kg):**\n• 🌽 Maíz: $1,200-1,800\n• 🍚 Arroz paddy: $2,800-3,200\n• Frijol: $4,500-5,500\n\n🍌 **FRUTAS (por kg):**\n• Plátano: $1,200-1,500\n• 🥑 Aguacate Hass: $5,500-7,000\n• Mango: $2,200-2,800\n• Naranja: $1,800-2,400\n\n📍 **Mercados:** Corabastos, Plaza Minorista, Cavasa\n\n**Pregúntame por un producto específico para más detalle**',
        suggestions: ['Precio tomate', 'Precio papa', 'Precio maíz', 'Productos más rentables']
      };
    }

    // TOMATE - MEJORADO Y EXPANDIDO
    if (lowerMessage.includes('tomate')) {
      if (lowerMessage.includes('plagas') || lowerMessage.includes('enfermedad')) {
        return {
          message: '🐛 **PLAGAS Y ENFERMEDADES DEL TOMATE**\n\n**PLAGAS PRINCIPALES:**\n\n1. 🦋 **Mosca Blanca** (Bemisia tabaci)\n   • Daño: Transmite virus, debilita planta\n   • Control: Trampas amarillas, aceite de neem\n   • Químico: Imidacloprid, Thiamethoxam\n   • Prevención: Mallas antiáfidos\n\n2. 🐛 **Minador de Hoja** (Liriomyza)\n   • Daño: Galerías en hojas\n   • Control: Spinosad, Abamectina\n   • Biológico: Avispas parasitoides\n\n3. 🐛 **Gusano del Fruto** (Heliothis)\n   • Daño: Perfora frutos\n   • Control: Bacillus thuringiensis\n   • Químico: Clorpirifos\n\n**ENFERMEDADES:**\n• Tizón tardío: Mancozeb preventivo\n• Marchitez: Suelo sano, rotación\n• Virus: Control vector (mosca blanca)\n\n💡 **RECOMENDACIONES:**\n• Monitoreo semanal\n• Manejo integrado (IPM)\n• Rotación de productos',
          suggestions: ['Control orgánico', 'Productos químicos', 'Prevención', 'Precio tomate']
        };
      }

      if (lowerMessage.includes('variedad') || lowerMessage.includes('tipo') || lowerMessage.includes('cual')) {
        return {
          message: '🍅 **VARIEDADES DE TOMATE COLOMBIA**\n\n**PARA MERCADO FRESCO:**\n\n1. **Chonto** (Tradicional)\n   • Más cultivado (70%)\n   • Resistente transporte\n   • Precio: $2,800-3,200/kg\n   • Rendimiento: 50-60 ton/ha\n   • Ciclo: 120 días\n   • Ideal: Pequeños y medianos\n\n2. **Milano F1** (Híbrido)\n   • Excelente postcosecha\n   • Uniforme y firme\n   • Precio: $3,200-3,500/kg\n   • Rendimiento: 60-70 ton/ha\n   • Ciclo: 110 días\n   • Ideal: Comercial, tecnificado\n\n3. **Cherry** (Especialidad)\n   • Mercado gourmet\n   • Precio premium: $4,800/kg\n   • Rendimiento: 40-50 ton/ha\n   • Ideal: Invernadero, exportación\n\n4. **Dominador F1**\n   • Invernadero tecnificado\n   • Larga vida útil\n   • Precio: $3,500/kg\n   • Rendimiento: 70-80 ton/ha\n\n💡 **RECOMENDACIÓN:** Milano F1 para rentabilidad',
          suggestions: ['Rentabilidad tomate', 'Plagas tomate', 'Cultivo invernadero', 'Precio']
        };
      }

      return {
        message: '🍅 **TOMATE EN COLOMBIA - Guía Completa**\n\n📊 **DATOS ECONÓMICOS:**\n• Precio: $2,800-3,200/kg (Chonto)\n• Rendimiento: 50-70 ton/ha\n• ROI: 370-550%\n• Ciclo: 4-5 meses\n• Inversión/ha: $32M\n\n🗺️ **REGIONES PRODUCTORAS:**\n• Cundinamarca: 35% producción\n• Boyacá: 25% (altiplano)\n• Valle del Cauca: 15%\n• Norte de Santander: 10%\n\n🌱 **VARIEDADES TOP:**\n• Chonto (70% mercado)\n• Milano F1 (comercial)\n• Cherry (gourmet)\n• Dominador F1 (invernadero)\n\n📈 **MERCADO:**\n• Consumo per cápita: 8 kg/año\n• Tendencia: Creciente\n• Mejor venta: Diciembre, Semana Santa\n\n**¿Quieres saber sobre rentabilidad, plagas o variedades específicas?**',
        suggestions: ['Rentabilidad tomate', 'Plagas tomate', 'Variedades', 'Precio actual']
      };
    }

    // PAPA - MEJORADO Y EXPANDIDO
    if (lowerMessage.includes('papa')) {
      if (lowerMessage.includes('variedad') || lowerMessage.includes('tipo')) {
        return {
          message: '🥔 **VARIEDADES DE PAPA COLOMBIA**\n\n**TOP VARIEDADES:**\n\n1. **Parda Pastusa** (Tradicional)\n   • 60% producción nacional\n   • Mejor para consumo fresco\n   • Precio: $1,800-2,200/kg\n   • Rendimiento: 30-35 ton/ha\n   • Zonas: Boyacá, Cundinamarca\n\n2. **R12 (ICA Única)**\n   • Alta resistencia enfermedades\n   • Excelente calidad\n   • Precio: $2,200-2,400/kg\n   • Rendimiento: 35-40 ton/ha\n   • Exportación\n\n3. **Diacol Capiro**\n   • Industria (chips, prefritos)\n   • Alto contenido materia seca\n   • Precio industrial: $1,600/kg\n   • Rendimiento: 32-38 ton/ha\n\n4. **Papa Criolla**\n   • Especialidad, precio premium\n   • Precio: $3,200-3,800/kg\n   • Rendimiento: 15-20 ton/ha\n   • Mercado gourmet\n\n💡 **RECOMENDACIÓN:** R12 para exportación, Pastusa para nacional',
          suggestions: ['Rentabilidad papa', 'Plagas papa', 'Cultivo tecnificado', 'Precio']
        };
      }

      if (lowerMessage.includes('plagas') || lowerMessage.includes('gota')) {
        return {
          message: '🐛 **PLAGAS Y ENFERMEDADES PAPA**\n\n**ENFERMEDADES CRÍTICAS:**\n\n1. **Gota/Tizón Tardío** (Phytophthora)\n   • Principal problema\n   • Control: Mancozeb, Metalaxyl\n   • Prevención: Monitoreo, rotación\n   • Pérdidas: Hasta 100% si no se controla\n\n2. **Polilla Guatemalteca**\n   • Daño: Tubérculos y follaje\n   • Control: Bacillus thuringiensis\n   • Manejo: Aporque alto, rotación\n\n3. **Nematodos**\n   • Suelo infestado\n   • Prevención: Rotación, variedades resistentes\n\n**PLAGAS:**\n• Pulguilla: Piretroides\n• Áfidos: Imidacloprid\n• Chiza: Preparación suelo\n\n💡 **MANEJO INTEGRADO:**\n• Semilla certificada\n• Rotación 3-4 años\n• Monitoreo Gota con modelos',
          suggestions: ['Control Gota', 'Semilla certificada', 'Rotación cultivos', 'Precio']
        };
      }

      return {
        message: '🥔 **PAPA EN COLOMBIA - Guía Completa**\n\n📊 **DATOS ECONÓMICOS:**\n• Precio: $1,800-2,200/kg\n• Rendimiento: 30-40 ton/ha\n• ROI: 94-158%\n• Ciclo: 5-6 meses\n• Inversión/ha: $31M\n\n🗺️ **REGIONES PRINCIPALES:**\n• Cundinamarca: 30% producción\n• Boyacá: 25% (altiplano)\n• Nariño: 20% (sur)\n• Antioquia: 12%\n\n🌱 **VARIEDADES:**\n• Parda Pastusa (60% mercado)\n• R12/ICA Única (exportación)\n• Diacol Capiro (industria)\n• Papa Criolla (premium)\n\n⚠️ **CONSIDERACIONES:**\n• Requiere altitud >2,200 msnm\n• Sensible a Gota (Phytophthora)\n• Semilla certificada clave\n\n**¿Quieres saber sobre variedades, plagas o rentabilidad?**',
        suggestions: ['Variedades papa', 'Plagas papa', 'Rentabilidad', 'Precio actual']
      };
    }

    // MAÍZ - MEJORADO Y EXPANDIDO
    if (lowerMessage.includes('maíz') || lowerMessage.includes('maiz')) {
      if (lowerMessage.includes('variedad') || lowerMessage.includes('híbrido') || lowerMessage.includes('hibrido')) {
        return {
          message: '🌽 **VARIEDADES/HÍBRIDOS DE MAÍZ COLOMBIA**\n\n**HÍBRIDOS COMERCIALES:**\n\n1. **Pioneer 30F35**\n   • Alto rendimiento: 7-9 ton/ha\n   • Tolerante sequía\n   • Grano amarillo\n   • Precio semilla: $180,000/ha\n   • Ciclo: 110 días\n\n2. **ICA V-109**\n   • Variedad nacional\n   • Resistente sequía\n   • Rendimiento: 6-7 ton/ha\n   • Precio semilla: $120,000/ha\n   • Ideal: Pequeños productores\n\n3. **DK 7508** (Dekalb)\n   • Clima tropical\n   • Alto potencial: 8-10 ton/ha\n   • Grano semi-cristalino\n   • Precio semilla: $200,000/ha\n\n4. **Cargill C-426**\n   • Doble propósito (grano/forraje)\n   • Rendimiento: 7-8 ton/ha\n   • Versátil\n\n💡 **RECOMENDACIÓN:**\n• Tecnificado: Pioneer 30F35\n• Tradicional: ICA V-109\n• Tropical: DK 7508',
          suggestions: ['Rentabilidad maíz', 'Plagas maíz', 'Precio actual', 'Vs otros cultivos']
        };
      }

      if (lowerMessage.includes('plagas') || lowerMessage.includes('cogollero')) {
        return {
          message: '🐛 **PLAGAS DEL MAÍZ**\n\n**PLAGA PRINCIPAL:**\n\n1. **Gusano Cogollero** (Spodoptera)\n   • Daño crítico: Come hojas jóvenes\n   • Control biológico: Bacillus thuringiensis\n   • Control químico: Clorpirifos, Lufenuron\n   • Momento: Primeros instares\n   • **Pérdidas: Hasta 60% si no se controla**\n\n2. **Gusano Elotero**\n   • Daño: Mazorcas\n   • Control: Deltametrina\n   • Prevención: Variedades resistentes\n\n3. **Áfidos/Pulgones**\n   • Transmiten virus\n   • Control: Imidacloprid\n\n💡 **MANEJO INTEGRADO:**\n• Monitoreo desde V2-V3\n• Aplicación temprana\n• Rotación de productos\n• Enemigos naturales',
          suggestions: ['Control cogollero', 'Productos biológicos', 'Rentabilidad', 'Precio']
        };
      }

      return {
        message: '🌽 **MAÍZ EN COLOMBIA - Guía Completa**\n\n📊 **DATOS ECONÓMICOS:**\n• Precio productor: $1,200-1,800/kg\n• Rendimiento: 4-7 ton/ha (tradicional)\n• Rendimiento: 7-10 ton/ha (tecnificado)\n• ROI: 60-100%\n• Ciclo: 4-5 meses\n\n🗺️ **REGIONES PRINCIPALES:**\n• Valle del Cauca: 25%\n• Córdoba: 20% (costa)\n• Meta: 15% (llanos)\n• Tolima: 12%\n\n🌱 **TIPOS:**\n• Amarillo: Industria alimentos\n• Blanco: Consumo humano\n• Tradicional: Autoconsumo\n\n📈 **MERCADO:**\n• Demanda industrial constante\n• Importación complementa\n• Precio influenciado por internacional\n\n**¿Quieres saber sobre híbridos, plagas o rentabilidad?**',
        suggestions: ['Híbridos maíz', 'Plagas cogollero', 'Rentabilidad', 'Precio actual']
      };
    }

    // CALENDARIO / SIEMBRA
    if (lowerMessage.includes('cuándo') || lowerMessage.includes('cuando') || lowerMessage.includes('época') || lowerMessage.includes('sembrar') || lowerMessage.includes('calendario')) {
      return {
        message: '📅 **Calendario Agrícola Colombia - Octubre 2025**\n\n🌱 **Siembras Recomendadas Ahora:**\n\n**Región Andina:**\n• Lechuga, acelga, espinaca\n• Zanahoria, remolacha\n• Preparación para tomate\n\n**Valle del Cauca:**\n• Tomate, pimentón\n• Pepino, calabacín\n• Maíz tecnificado\n\n**Costa Caribe:**\n• Yuca, ñame\n• Plátano, banano\n• Sorgo\n\n**Llanos Orientales:**\n• Arroz\n• Soya\n• Maíz',
        suggestions: ['Siembras octubre', 'Siembras noviembre', 'Mi región', 'Cultivos clima']
      };
    }

    // RIEGO
    if (lowerMessage.includes('riego') || lowerMessage.includes('agua')) {
      return {
        message: '💧 **Riego Agrícola**\n\n**Sistemas de Riego:**\n\n💦 **Goteo:**\n• Ahorro: 40-60% agua\n• Ideal: Hortalizas, frutales\n• Inversión: Media\n\n🌧️ **Aspersión:**\n• Cobertura amplia\n• Ideal: Cereales, pastos\n• Inversión: Media-Alta\n\n🚿 **Microaspersión:**\n• Eficiente\n• Ideal: Cítricos, café\n• Inversión: Media\n\n**Recomendación:** El riego por goteo es más eficiente para hortalizas',
        suggestions: ['Riego tomate', 'Instalar riego', 'Ahorro agua', 'Costos']
      };
    }

    // RENTABILIDAD Y ANÁLISIS ECONÓMICO - NUEVO
    if (lowerMessage.includes('rentab') || lowerMessage.includes('ganancia') || lowerMessage.includes('negocio') || lowerMessage.includes('inversión') || lowerMessage.includes('inversion') || lowerMessage.includes('cuanto gano') || lowerMessage.includes('cuánto gano')) {
      
      if (lowerMessage.includes('tomate')) {
        return {
          message: '📊 **RENTABILIDAD TOMATE - Análisis Económico**\n\n💰 **INVERSIÓN INICIAL (1 hectárea):**\n• Semilla/Plántulas: $8,000,000\n• Preparación suelo: $2,500,000\n• Fertilizantes: $4,500,000\n• Control plagas: $3,000,000\n• Riego tecnificado: $6,000,000\n• Mano de obra: $8,000,000\n• **TOTAL: $32,000,000**\n\n📈 **PRODUCCIÓN ESPERADA:**\n• Rendimiento: 50-70 ton/ha\n• Precio promedio: $3,000/kg\n• **Ingreso bruto: $150,000,000 - $210,000,000**\n\n💵 **UTILIDAD NETA:**\n• Ganancia: $118,000,000 - $178,000,000\n• **ROI: 369% - 556%**\n• Ciclo: 4-5 meses\n\n⚠️ **RIESGOS:** Plagas, clima, volatilidad precios\n✅ **VENTAJAS:** Alta demanda, ciclo corto, múltiples cosechas/año',
          suggestions: ['Tomate vs papa rentabilidad', 'Reducir costos', 'Otros cultivos', 'Financiamiento']
        };
      }

      if (lowerMessage.includes('papa')) {
        return {
          message: '📊 **RENTABILIDAD PAPA - Análisis Económico**\n\n💰 **INVERSIÓN (1 hectárea):**\n• Semilla certificada: $12,000,000\n• Preparación suelo: $3,000,000\n• Fertilizantes: $5,500,000\n• Control plagas: $4,000,000\n• Mano de obra: $6,500,000\n• **TOTAL: $31,000,000**\n\n📈 **PRODUCCIÓN:**\n• Rendimiento: 30-40 ton/ha\n• Precio promedio: $2,000/kg\n• **Ingreso bruto: $60,000,000 - $80,000,000**\n\n💵 **UTILIDAD:**\n• Ganancia: $29,000,000 - $49,000,000\n• **ROI: 94% - 158%**\n• Ciclo: 5-6 meses\n\n✅ **VENTAJAS:** Mercado estable, tecnología disponible\n⚠️ **RIESGOS:** Requiere altitud, sensible a clima',
          suggestions: ['Papa vs maíz', 'Mejores variedades', 'Financiamiento', 'Otros cultivos']
        };
      }

      if (lowerMessage.includes('aguacate') || lowerMessage.includes('hass')) {
        return {
          message: '📊 **RENTABILIDAD AGUACATE HASS - Análisis**\n\n💰 **INVERSIÓN INICIAL (1 ha):**\n• Plántulas injertadas: $18,000,000\n• Preparación terreno: $4,000,000\n• Sistema riego: $8,000,000\n• Fertilización: $3,500,000\n• Infraestructura: $5,000,000\n• **TOTAL: $38,500,000**\n\n📈 **PRODUCCIÓN (año 4+):**\n• Rendimiento: 15-20 ton/ha/año\n• Precio exportación: $6,000/kg\n• **Ingreso: $90,000,000 - $120,000,000/año**\n\n💵 **UTILIDAD ANUAL (estabilizado):**\n• Ganancia: $70,000,000 - $100,000,000\n• **ROI: 182% - 260% anual**\n\n⏰ **CONSIDERACIONES:**\n• Primera cosecha: Año 3-4\n• Vida útil: 25-30 años\n• **Inversión a largo plazo pero MUY rentable**\n\n✅ **IDEAL PARA:** Exportación, mercado premium',
          suggestions: ['Aguacate vs otros', 'Cultivo Hass', 'Exportación', 'Financiamiento']
        };
      }

      // Rentabilidad general
      return {
        message: '📊 **RENTABILIDAD CULTIVOS COLOMBIA**\n\n💰 **MÁS RENTABLES (ROI):**\n1. 🥑 **Aguacate Hass**: 180-260% anual (largo plazo)\n2. 🍅 **Tomate invernadero**: 370-550% (ciclo corto)\n3. 🌶️ **Pimentón**: 300-400% (4 meses)\n4. 🍓 **Fresa**: 250-350% (continuo)\n5. 🥔 **Papa**: 94-158% (5-6 meses)\n\n⚖️ **BALANCEADOS (riesgo/rentabilidad):**\n• 🌽 Maíz: 60-100% (menos riesgo)\n• 🥕 Zanahoria: 80-120%\n• 🧅 Cebolla: 100-180% (variable)\n\n📈 **FACTORES CLAVE:**\n• Tecnificación aumenta rendimiento 40%\n• Riego tecnificado: ROI mejora 30%\n• Certificaciones: Precio +20%\n\n**Pregunta por un cultivo específico para análisis detallado**',
        suggestions: ['Tomate rentabilidad', 'Papa rentabilidad', 'Aguacate Hass', 'Comparar cultivos']
      };
    }

    // RECOMENDACIONES PERSONALIZADAS - NUEVO
    if (lowerMessage.includes('recomienda') || lowerMessage.includes('recomendación') || lowerMessage.includes('que sembrar') || lowerMessage.includes('qué sembrar') || lowerMessage.includes('que cultivar') || lowerMessage.includes('mejor cultivo') || lowerMessage.includes('consejo')) {
      
      if (lowerMessage.includes('pequeña') || lowerMessage.includes('pequeño') || lowerMessage.includes('poco terreno') || lowerMessage.includes('poca tierra')) {
        return {
          message: '🌱 **RECOMENDACIONES FINCA PEQUEÑA (<2 ha)**\n\n✅ **CULTIVOS IDEALES:**\n\n1. 🍅 **Tomate bajo invernadero**\n   • Alta rentabilidad: 370-550% ROI\n   • Ciclo corto: 4 meses\n   • Múltiples cosechas/año\n   • Requiere: Invernadero, riego\n\n2. 🌶️ **Pimentón**\n   • Excelente precio: $4,000/kg\n   • ROI: 300-400%\n   • Mercado estable\n\n3. 🥬 **Hortalizas diversificadas**\n   • Lechuga, cilantro, espinaca\n   • Rotación rápida\n   • Venta directa al consumidor\n\n4. 🍓 **Fresa**\n   • Producción continua\n   • Alto precio\n   • Mercado local y turismo\n\n💡 **ESTRATEGIA:**\n• Tecnificación máxima\n• Diversificar cultivos\n• Venta directa (elimina intermediarios)\n• Hidroponía para optimizar espacio',
          suggestions: ['Tomate invernadero', 'Hidroponía', 'Costos pequeña finca', 'Rentabilidad']
        };
      }

      if (lowerMessage.includes('mediana') || lowerMessage.includes('medio')) {
        return {
          message: '🌱 **RECOMENDACIONES FINCA MEDIANA (2-10 ha)**\n\n✅ **CULTIVOS RECOMENDADOS:**\n\n1. 🥔 **Papa tecnificada**\n   • ROI: 94-158%\n   • Mercado estable\n   • Tecnología disponible\n   • Área: 3-5 ha\n\n2. 🌽 **Maíz híbrido**\n   • Rotación con otros cultivos\n   • Demanda industrial\n   • Área: 4-6 ha\n\n3. 🍅 **Tomate campo + invernadero**\n   • Combinar ambos sistemas\n   • Mayor rentabilidad\n   • Área: 2-3 ha\n\n4. 🧅 **Cebolla cabezona**\n   • Buenos precios estacionales\n   • Área: 2-4 ha\n\n💡 **ESTRATEGIA:**\n• Diversificar 2-3 cultivos\n• Rotación para salud del suelo\n• Riego tecnificado\n• Maquinaria compartida',
          suggestions: ['Papa tecnificada', 'Rotación cultivos', 'Maquinaria', 'Financiamiento']
        };
      }

      if (lowerMessage.includes('grande') || lowerMessage.includes('mucho terreno')) {
        return {
          message: '🌱 **RECOMENDACIONES FINCA GRANDE (>10 ha)**\n\n✅ **CULTIVOS ESTRATÉGICOS:**\n\n1. 🥑 **Aguacate Hass (exportación)**\n   • Inversión largo plazo\n   • ROI: 180-260% anual\n   • Mercado internacional\n   • Área: 5-15 ha\n\n2. 🌽 **Maíz tecnificado a escala**\n   • Agricultura de precisión\n   • Contratos industriales\n   • Área: 10-30 ha\n\n3. 🍚 **Arroz mecanizado**\n   • Producción masiva\n   • Tecnología GPS\n   • Área: 20-50 ha\n\n4. 🌾 **Cultivos combinados**\n   • Papa 25% + Maíz 40% + Hortalizas 35%\n   • Diversificación de riesgo\n\n💡 **ESTRATEGIA:**\n• Agricultura de precisión\n• Drones y sensores\n• Contratos anticipados\n• Certificaciones (GlobalGAP)',
          suggestions: ['Aguacate exportación', 'Agricultura precisión', 'Contratos', 'Certificaciones']
        };
      }

      // Recomendación general
      return {
        message: '🌱 **RECOMENDACIONES AGRÍCOLAS COLOMBIA - Octubre 2025**\n\n✅ **TOP 5 CULTIVOS RECOMENDADOS:**\n\n1. 🥑 **Aguacate Hass**\n   • ROI: 180-260% (largo plazo)\n   • Exportación activa\n   • Demanda creciente\n\n2. 🍅 **Tomate bajo invernadero**\n   • ROI: 370-550%\n   • Ciclo corto (4 meses)\n   • Tecnología accesible\n\n3. 🥔 **Papa tecnificada**\n   • ROI: 94-158%\n   • Mercado estable\n   • Consumo nacional alto\n\n4. 🌽 **Maíz híbrido**\n   • ROI: 60-100%\n   • Menor riesgo\n   • Demanda industrial\n\n5. 🌶️ **Pimentón**\n   • ROI: 300-400%\n   • Precio premium\n   • Ciclo medio (4 meses)\n\n💡 **CONSIDERA:**\n• Tu ubicación y clima\n• Capital disponible\n• Experiencia\n• Acceso a mercados\n\n**Dime el tamaño de tu finca para recomendación específica**',
        suggestions: ['Finca pequeña', 'Finca mediana', 'Finca grande', 'Comparar cultivos']
      };
    }

    // TECNOLOGÍA
    if (lowerMessage.includes('tecnología') || lowerMessage.includes('tecnologia') || lowerMessage.includes('moderno') || lowerMessage.includes('innovación')) {
      return {
        message: '🚀 **Tecnología Agrícola**\n\n🎯 **Agricultura de Precisión:**\n• GPS agrícola\n• Drones para monitoreo\n• Sensores de suelo\n• Análisis de datos\n\n💧 **Hidroponía:**\n• Sin suelo\n• Ahorro 90% agua\n• Producción 3x mayor\n• Control total\n\n🏠 **Invernaderos:**\n• Control clima\n• Mayor producción\n• Menos plagas\n• ROI: 18-24 meses\n\n💡 **Recomendación según tamaño:**\n• Pequeña (<2ha): Goteo, hidroponía\n• Mediana (2-10ha): Invernaderos\n• Grande (>10ha): Precisión, drones',
        suggestions: ['Hidroponía', 'Invernaderos', 'Drones', 'Sensores']
      };
    }

    // COMPARACIÓN ENTRE CULTIVOS - NUEVO
    if (lowerMessage.includes('comparar') || lowerMessage.includes('vs') || lowerMessage.includes('mejor que') || lowerMessage.includes('diferencia entre')) {
      return {
        message: '📊 **COMPARACIÓN CULTIVOS PRINCIPALES**\n\n**RENTABILIDAD (ROI):**\n🥇 Tomate invernadero: 370-550%\n🥈 Pimentón: 300-400%\n🥉 Papa: 94-158%\n4️⃣ Maíz: 60-100%\n\n**CICLO DE CULTIVO:**\n⚡ Tomate: 4 meses (rápido)\n⚡ Maíz: 4 meses (rápido)\n🕐 Papa: 5-6 meses (medio)\n🕐 Aguacate: 3-4 años primera cosecha (largo)\n\n**INVERSIÓN INICIAL:**\n💰 Maíz: $15-20M/ha (bajo)\n💰 Papa: $31M/ha (medio)\n💰💰 Tomate: $32M/ha (medio-alto)\n💰💰 Aguacate: $38M/ha (alto)\n\n**RIESGO:**\n⚠️ Tomate: Alto (plagas, clima, precio)\n⚠️ Papa: Medio-Alto (Gota, clima)\n✅ Maíz: Bajo-Medio (más estable)\n✅ Aguacate: Bajo (largo plazo)\n\n**EXPERIENCIA REQUERIDA:**\n👨‍🌾 Maíz: Baja\n👨‍🌾👨‍🌾 Papa: Media\n👨‍🌾👨‍🌾👨‍🌾 Tomate invernadero: Alta\n👨‍🌾👨‍🌾 Aguacate: Media\n\n**¿Quieres comparación detallada entre dos cultivos específicos?**',
        suggestions: ['Tomate vs papa', 'Papa vs maíz', 'Aguacate vs otros', 'Más rentable']
      };
    }

    // FINANCIAMIENTO Y CRÉDITOS - NUEVO
    if (lowerMessage.includes('financiamiento') || lowerMessage.includes('financiacion') || lowerMessage.includes('crédito') || lowerMessage.includes('credito') || lowerMessage.includes('préstamo') || lowerMessage.includes('prestamo') || lowerMessage.includes('banco')) {
      return {
        message: '💳 **FINANCIAMIENTO AGRÍCOLA COLOMBIA**\n\n🏦 **FUENTES PRINCIPALES:**\n\n1. **FINAGRO** (Fondo financiación agro)\n   • Tasas subsidiadas: 4-8% EA\n   • Hasta 10 años plazo\n   • Líneas: Inversión, capital trabajo\n   • Monto: Hasta $5,000M\n   • Info: www.finagro.com.co\n\n2. **BANCO AGRARIO**\n   • Créditos pequeños productores\n   • Tasas: 6-12% EA\n   • Microcrédito rural\n   • Requisitos flexibles\n\n3. **BANCOLDEX**\n   • Proyectos agroindustriales\n   • Inversión tecnología\n   • Tasas competitivas\n\n4. **COOPERATIVAS**\n   • Tasas: 8-15% EA\n   • Trámites rápidos\n   • Garantías solidarias\n\n📋 **REQUISITOS BÁSICOS:**\n• Plan de negocio\n• Certificado tradición (tierra)\n• Estados financieros\n• Experiencia agrícola\n\n💡 **LÍNEAS POPULARES:**\n• Capital de trabajo: 1-2 años\n• Inversión (riego, invernadero): 5-10 años\n• Compra tierra: Hasta 15 años',
        suggestions: ['FINAGRO', 'Banco Agrario', 'Plan de negocio', 'Requisitos crédito']
      };
    }

    // CERTIFICACIONES Y EXPORTACIÓN - NUEVO
    if (lowerMessage.includes('export') || lowerMessage.includes('certificación') || lowerMessage.includes('certificacion') || lowerMessage.includes('globalgap') || lowerMessage.includes('orgánico') || lowerMessage.includes('organico')) {
      return {
        message: '🌍 **EXPORTACIÓN Y CERTIFICACIONES**\n\n✅ **CERTIFICACIONES PRINCIPALES:**\n\n1. **GlobalGAP** (Buenas Prácticas)\n   • Requerida: Supermercados europeos\n   • Costo: $8-12M (implementación + auditoría)\n   • Vigencia: 1 año\n   • Beneficio: Acceso mercados premium\n   • Aumento precio: +20-30%\n\n2. **Orgánico** (USDA/EU)\n   • Transición: 3 años\n   • Costo: $15-25M (certificación)\n   • Precio premium: +40-60%\n   • Cultivos ideales: Aguacate, café, cacao\n\n3. **Rainforest Alliance**\n   • Sostenibilidad ambiental\n   • Costo: $5-10M\n   • Mercados: USA, Europa\n\n4. **Fair Trade** (Comercio Justo)\n   • Cooperativas\n   • Precio garantizado\n   • Prima social\n\n🌍 **PRODUCTOS EXPORTACIÓN:**\n• Aguacate Hass 🥑\n• Café especial ☕\n• Flores 🌹\n• Banano 🍌\n• Mango uperior\n\n📈 **BENEFICIOS:**\n• Precio 20-60% superior\n• Mercados estables\n• Contratos largo plazo',
        suggestions: ['GlobalGAP', 'Orgánico', 'Aguacate exportación', 'Requisitos']
      };
    }

    // RESPUESTA INTELIGENTE POR DEFECTO
    return {
      message: '🤖 **AgroBot IA - Asistente Agrícola Especializado**\n\nNo encontré información específica sobre tu consulta, pero puedo ayudarte con:\n\n💰 **PRECIOS Y MERCADO:**\n• "¿Cuánto cuesta el tomate?"\n• "Precios del mercado hoy"\n• "Precio de la papa en Corabastos"\n\n🌱 **CULTIVOS Y RENTABILIDAD:**\n• "¿Qué cultivo me recomiendas?"\n• "Rentabilidad del tomate"\n• "Variedades de papa"\n• "Tomate vs papa rentabilidad"\n\n� **INFORMACIÓN DETALLADA:**\n• "Plagas del tomate"\n• "Mejor época para sembrar"\n• "Cultivo en finca pequeña"\n\n� **FINANCIAMIENTO:**\n• "Crédito FINAGRO"\n• "Financiamiento agrícola"\n\n🌍 **EXPORTACIÓN:**\n• "Certificación GlobalGAP"\n• "Exportar aguacate"\n\n**Escribe "ayuda" para ver todas mis capacidades**\n\n**¿Sobre qué tema agrícola específico necesitas información?**',
      suggestions: ['Ayuda completa', 'Precios del mercado', '¿Qué cultivo sembrar?', 'Rentabilidad cultivos']
    };
  }
}

// Exportar instancia singleton del servicio
export default ChatbotService.getInstance();
