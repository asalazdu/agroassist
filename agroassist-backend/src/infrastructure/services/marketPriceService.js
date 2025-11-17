/**
 * Market Price Service - Servicio de precios de mercado usando OpenAI
 */

const axios = require('axios');

class MarketPriceService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.cache = {
      data: null,
      timestamp: null,
      ttl: 2 * 60 * 60 * 1000 // 2 horas en milisegundos
    };
  }

  /**
   * Verificar si el caché es válido
   */
  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) {
      return false;
    }
    const now = Date.now();
    return (now - this.cache.timestamp) < this.cache.ttl;
  }

  /**
   * Obtener precios de mercado usando OpenAI
   */
  async getMarketPrices() {
    try {
      // Si hay caché válido, retornarlo
      if (this.isCacheValid()) {
        console.log('📊 Usando precios en caché');
        return {
          success: true,
          prices: this.cache.data,
          cached: true,
          lastUpdate: new Date(this.cache.timestamp).toISOString()
        };
      }

      if (!this.openaiApiKey) {
        console.log('⚠️ OpenAI API key no configurada, usando datos de ejemplo');
        return {
          success: true,
          prices: this.getMockPrices(),
          cached: false,
          mock: true
        };
      }

      console.log('🤖 Consultando precios actualizados con OpenAI...');

      const prompt = `Genera una lista de precios actuales de productos agrícolas en Colombia para la fecha ${new Date().toLocaleDateString('es-CO')}. 

Necesito 15 productos diferentes incluyendo: hortalizas, frutas, tubérculos, cereales y legumbres.
Para cada producto incluye:
- Nombre del producto
- Categoría
- Precio actual en pesos colombianos por kg
- Precio de la semana pasada
- Cambio porcentual
- Mercado (Corabastos Bogotá, Cavasa Cali, Central Mayorista Medellín, Plaza de Mercado Pasto)
- Región
- Calidad (premium, estándar, económica)

Considera:
- Precios realistas para Colombia 2025
- Estacionalidad de productos
- Variaciones normales de mercado (+/- 5-15%)

Responde SOLO con un JSON válido en este formato:
{
  "prices": [
    {
      "productName": "Tomate",
      "category": "Hortalizas",
      "currentPrice": 3500,
      "previousPrice": 3200,
      "priceChange": 300,
      "priceChangePercent": 9.38,
      "unit": "kg",
      "market": "Corabastos",
      "region": "Bogotá",
      "quality": "estándar"
    }
  ]
}`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en mercados agrícolas colombianos. Respondes siempre con JSON válido, sin texto adicional.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      // Extraer JSON de la respuesta (por si viene con markdown)
      let jsonContent = content;
      if (content.includes('```json')) {
        jsonContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonContent = content.split('```')[1].split('```')[0].trim();
      }

      const data = JSON.parse(jsonContent);
      
      // Agregar IDs y fecha a cada precio
      const today = new Date().toISOString().split('T')[0];
      const pricesWithIds = data.prices.map((price, index) => ({
        id: `gpt-${Date.now()}-${index}`,
        ...price,
        date: today
      }));

      // Guardar en caché
      this.cache.data = pricesWithIds;
      this.cache.timestamp = Date.now();

      console.log(`✅ ${pricesWithIds.length} precios generados con OpenAI`);

      return {
        success: true,
        prices: pricesWithIds,
        cached: false,
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error obteniendo precios de OpenAI:', error.message);
      
      // Fallback a datos de ejemplo
      return {
        success: true,
        prices: this.getMockPrices(),
        cached: false,
        mock: true,
        error: error.message
      };
    }
  }

  /**
   * Obtener análisis de un producto específico usando OpenAI
   */
  async getProductAnalysis(productName) {
    try {
      if (!this.openaiApiKey) {
        return this.getMockAnalysis(productName);
      }

      console.log(`🤖 Generando análisis para: ${productName}`);

      const prompt = `Genera un análisis de mercado para el producto agrícola "${productName}" en Colombia.

Incluye:
1. Tendencia actual (alcista, bajista, estable)
2. Predicción para próximas 2 semanas
3. Factores que afectan el precio (clima, estacionalidad, demanda)
4. Recomendación para agricultores (mejor momento para vender, almacenar, etc.)
5. Precio proyectado en 2 semanas

Responde SOLO con un JSON válido en este formato:
{
  "productName": "${productName}",
  "trend": "alcista",
  "trendDescription": "Los precios han aumentado...",
  "prediction": "Se espera...",
  "factors": ["Factor 1", "Factor 2"],
  "recommendation": "Recomendación...",
  "projectedPrice": 3800,
  "confidence": "alta"
}`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un analista experto en mercados agrícolas colombianos. Respondes con JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      let jsonContent = content;
      
      if (content.includes('```json')) {
        jsonContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonContent = content.split('```')[1].split('```')[0].trim();
      }

      const analysis = JSON.parse(jsonContent);

      return {
        success: true,
        analysis
      };

    } catch (error) {
      console.error('❌ Error generando análisis:', error.message);
      return {
        success: true,
        analysis: this.getMockAnalysis(productName)
      };
    }
  }

  /**
   * Datos de ejemplo como fallback
   */
  getMockPrices() {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: '1',
        productName: 'Tomate',
        category: 'Hortalizas',
        currentPrice: 3500,
        previousPrice: 3200,
        priceChange: 300,
        priceChangePercent: 9.38,
        unit: 'kg',
        market: 'Corabastos',
        region: 'Bogotá',
        date: today,
        quality: 'estándar'
      },
      {
        id: '2',
        productName: 'Papa Criolla',
        category: 'Tubérculos',
        currentPrice: 4200,
        previousPrice: 4500,
        priceChange: -300,
        priceChangePercent: -6.67,
        unit: 'kg',
        market: 'Corabastos',
        region: 'Bogotá',
        date: today,
        quality: 'premium'
      },
      {
        id: '3',
        productName: 'Cebolla Cabezona',
        category: 'Hortalizas',
        currentPrice: 2800,
        previousPrice: 2800,
        priceChange: 0,
        priceChangePercent: 0,
        unit: 'kg',
        market: 'Cavasa',
        region: 'Cali',
        date: today,
        quality: 'estándar'
      }
    ];
  }

  getMockAnalysis(productName) {
    return {
      productName,
      trend: 'estable',
      trendDescription: 'Los precios se mantienen estables en el último mes',
      prediction: 'Se espera estabilidad en las próximas semanas',
      factors: ['Clima favorable', 'Demanda constante', 'Producción normal'],
      recommendation: 'Momento adecuado para vender a precios actuales',
      projectedPrice: 3500,
      confidence: 'media'
    };
  }
}

module.exports = new MarketPriceService();
