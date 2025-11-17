const OpenAI = require('openai');

class MarketService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;

    // Precios de ejemplo (fallback)
    this.mockPrices = this.getMockPrices();
  }

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
      },
      {
        id: '4',
        productName: 'Plátano Hartón',
        category: 'Frutas',
        currentPrice: 2100,
        previousPrice: 1950,
        priceChange: 150,
        priceChangePercent: 7.69,
        unit: 'kg',
        market: 'Central Mayorista',
        region: 'Medellín',
        date: today,
        quality: 'estándar'
      },
      {
        id: '5',
        productName: 'Yuca',
        category: 'Tubérculos',
        currentPrice: 1800,
        previousPrice: 2000,
        priceChange: -200,
        priceChangePercent: -10,
        unit: 'kg',
        market: 'Granabastos',
        region: 'Bucaramanga',
        date: today,
        quality: 'básica'
      },
      {
        id: '6',
        productName: 'Café Pergamino',
        category: 'Café',
        currentPrice: 8900,
        previousPrice: 8700,
        priceChange: 200,
        priceChangePercent: 2.30,
        unit: 'kg',
        market: 'FNC',
        region: 'Eje Cafetero',
        date: today,
        quality: 'premium'
      },
      {
        id: '7',
        productName: 'Aguacate Hass',
        category: 'Frutas',
        currentPrice: 5200,
        previousPrice: 4800,
        priceChange: 400,
        priceChangePercent: 8.33,
        unit: 'kg',
        market: 'Corabastos',
        region: 'Bogotá',
        date: today,
        quality: 'premium'
      },
      {
        id: '8',
        productName: 'Zanahoria',
        category: 'Hortalizas',
        currentPrice: 1700,
        previousPrice: 1600,
        priceChange: 100,
        priceChangePercent: 6.25,
        unit: 'kg',
        market: 'Cavasa',
        region: 'Cali',
        date: today,
        quality: 'estándar'
      }
    ];
  }

  async getMarketPrices() {
    // Si no hay API key, usar datos mock
    if (!this.openai) {
      console.log('⚠️ OpenAI no configurado, usando precios de ejemplo');
      return this.mockPrices;
    }

    try {
      console.log('🤖 Consultando precios actualizados con OpenAI...');
      
      const prompt = `Como experto en mercados agrícolas de Colombia, proporciona los precios actuales aproximados (noviembre 2025) de los siguientes productos en los principales mercados mayoristas colombianos (Corabastos Bogotá, Plaza Minorista Medellín, Cavasa Cali):

Productos: Tomate, Papa Criolla, Cebolla Cabezona, Plátano Hartón, Yuca, Café Pergamino, Aguacate Hass, Zanahoria

Para cada producto, estima:
- Precio actual por kg en pesos colombianos
- Precio anterior (hace 1 semana)
- Cambio porcentual
- Mercado principal
- Región

Responde SOLO con un JSON array válido, sin explicaciones adicionales. Formato:
[{
  "productName": "Nombre",
  "category": "Categoría",
  "currentPrice": número,
  "previousPrice": número,
  "priceChange": número,
  "priceChangePercent": número,
  "unit": "kg",
  "market": "Mercado",
  "region": "Región",
  "quality": "estándar"
}]`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en mercados agrícolas colombianos. Respondes SOLO con JSON válido, sin markdown ni explicaciones.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content || '';
      
      // Limpiar el contenido (remover markdown si existe)
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let prices = JSON.parse(jsonContent);
      
      // Agregar ID y fecha
      const today = new Date().toISOString().split('T')[0];
      prices = prices.map((price, index) => ({
        id: (index + 1).toString(),
        ...price,
        date: today
      }));

      console.log(`✅ ${prices.length} precios obtenidos con OpenAI`);
      return prices;

    } catch (error) {
      console.error('❌ Error con OpenAI, usando fallback:', error.message);
      return this.mockPrices;
    }
  }

  async getProductAnalysis(productName) {
    // Si no hay API key, retornar análisis básico
    if (!this.openai) {
      return {
        product: productName,
        analysis: 'Análisis no disponible sin configuración de OpenAI',
        recommendation: 'Usar datos históricos locales'
      };
    }

    try {
      console.log(`🤖 Analizando ${productName} con OpenAI...`);
      
      const prompt = `Como experto en mercados agrícolas de Colombia, proporciona un análisis breve del producto "${productName}" en noviembre 2025:

1. Tendencia de precio (subiendo/bajando/estable)
2. Mejor época para vender
3. Factores que afectan el precio
4. Recomendación para productores

Responde en 150 palabras máximo, en español, formato claro y profesional.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en mercados agrícolas colombianos.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 400
      });

      const analysis = response.choices[0]?.message?.content || 'Análisis no disponible';
      
      console.log(`✅ Análisis de ${productName} generado`);
      return {
        product: productName,
        analysis,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error analizando producto:', error.message);
      return {
        product: productName,
        analysis: 'Error al generar análisis',
        error: error.message
      };
    }
  }
}

module.exports = new MarketService();
