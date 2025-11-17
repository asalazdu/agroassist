import { MarketPrice, MarketAnalysis, PriceHistory } from '../types';
import { API_CONFIG } from '../config/api';
import axios from 'axios';

class MarketPriceService {
  private static instance: MarketPriceService;
  
  public static getInstance(): MarketPriceService {
    if (!MarketPriceService.instance) {
      MarketPriceService.instance = new MarketPriceService();
    }
    return MarketPriceService.instance;
  }

  private getMockPrices(): MarketPrice[] {
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
        productName: 'Maíz Amarillo',
        category: 'Cereales',
        currentPrice: 1650,
        previousPrice: 1620,
        priceChange: 30,
        priceChangePercent: 1.85,
        unit: 'kg',
        market: 'Corabastos',
        region: 'Bogotá',
        date: today,
        quality: 'estándar'
      },
      {
        id: '8',
        productName: 'Aguacate Hass',
        category: 'Frutas',
        currentPrice: 6200,
        previousPrice: 5800,
        priceChange: 400,
        priceChangePercent: 6.90,
        unit: 'kg',
        market: 'Corabastos',
        region: 'Bogotá',
        date: today,
        quality: 'premium'
      },
      {
        id: '9',
        productName: 'Frijol Cargamanto',
        category: 'Legumbres',
        currentPrice: 7500,
        previousPrice: 7300,
        priceChange: 200,
        priceChangePercent: 2.74,
        unit: 'kg',
        market: 'Corabastos',
        region: 'Bogotá',
        date: today,
        quality: 'estándar'
      },
      {
        id: '10',
        productName: 'Zanahoria',
        category: 'Hortalizas',
        currentPrice: 2400,
        previousPrice: 2600,
        priceChange: -200,
        priceChangePercent: -7.69,
        unit: 'kg',
        market: 'Cavasa',
        region: 'Cali',
        date: today,
        quality: 'estándar'
      }
    ];
  }

  private generatePriceHistory(currentPrice: number): PriceHistory[] {
    const history: PriceHistory[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generar variación de precio realista (-15% a +15%)
      const variation = (Math.random() - 0.5) * 0.3;
      const price = Math.round(currentPrice * (1 + variation));
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, Math.round(currentPrice * 0.5)) // Precio mínimo 50% del actual
      });
    }
    
    // Asegurar que el último precio sea el actual
    history[history.length - 1].price = currentPrice;
    
    return history;
  }

  async getAllPrices(): Promise<MarketPrice[]> {
    // Si no hay backend configurado, usar datos de ejemplo
    if (API_CONFIG.BACKEND_URL === 'http://localhost:3000') {
      console.log('Demo: Usando datos de precios de ejemplo');
      return this.getMockPrices();
    }

    try {
      const response = await axios.get(`${API_CONFIG.BACKEND_URL}/api/market-prices`, {
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo precios:', error);
      console.log('Fallback: Usando datos de precios de ejemplo');
      return this.getMockPrices();
    }
  }

  async getPricesByCategory(category: string): Promise<MarketPrice[]> {
    const allPrices = await this.getAllPrices();
    return allPrices.filter(price => 
      price.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getPricesByRegion(region: string): Promise<MarketPrice[]> {
    const allPrices = await this.getAllPrices();
    return allPrices.filter(price => 
      price.region.toLowerCase().includes(region.toLowerCase())
    );
  }

  async searchProducts(query: string): Promise<MarketPrice[]> {
    const allPrices = await this.getAllPrices();
    const lowerQuery = query.toLowerCase();
    
    return allPrices.filter(price =>
      price.productName.toLowerCase().includes(lowerQuery) ||
      price.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getMarketAnalysis(productName: string): Promise<MarketAnalysis> {
    const allPrices = await this.getAllPrices();
    const productPrices = allPrices.filter(price =>
      price.productName.toLowerCase().includes(productName.toLowerCase())
    );

    if (productPrices.length === 0) {
      throw new Error('Producto no encontrado');
    }

    const averagePrice = productPrices.reduce((sum, price) => sum + price.currentPrice, 0) / productPrices.length;
    const priceChanges = productPrices.map(p => p.priceChangePercent);
    const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;

    let trend: 'alcista' | 'bajista' | 'estable';
    if (avgPriceChange > 2) {
      trend = 'alcista';
    } else if (avgPriceChange < -2) {
      trend = 'bajista';
    } else {
      trend = 'estable';
    }

    const recommendations: string[] = [];
    if (trend === 'alcista') {
      recommendations.push('📈 Tendencia al alza: Buen momento para vender si tienes stock');
      recommendations.push('🕐 Considera acelerar la cosecha si está lista');
      recommendations.push('💰 Precios favorables para el productor');
    } else if (trend === 'bajista') {
      recommendations.push('📉 Tendencia a la baja: Evaluar costos de producción');
      recommendations.push('⏳ Considera retrasar la venta si es posible');
      recommendations.push('🔍 Buscar mercados alternativos o nichos especializados');
    } else {
      recommendations.push('📊 Precios estables: Momento normal para comercializar');
      recommendations.push('🎯 Enfócate en la calidad para diferenciarte');
      recommendations.push('📅 Planifica ventas según calendario habitual');
    }

    return {
      product: productName,
      averagePrice: Math.round(averagePrice),
      trend,
      forecast: this.generateForecast(trend, averagePrice),
      recommendations,
      priceHistory: this.generatePriceHistory(productPrices[0]?.currentPrice || averagePrice)
    };
  }

  private generateForecast(trend: 'alcista' | 'bajista' | 'estable', currentPrice: number): string {
    switch (trend) {
      case 'alcista':
        return `Se proyecta un incremento del 5-10% en las próximas 2 semanas debido a la alta demanda.`;
      case 'bajista':
        return `Se espera una disminución del 3-8% en el corto plazo por aumento en la oferta.`;
      case 'estable':
        return `Los precios se mantendrán estables con variaciones menores al 3% en las próximas semanas.`;
      default:
        return 'No hay suficiente información para generar un pronóstico.';
    }
  }

  async getTopGainers(): Promise<MarketPrice[]> {
    const allPrices = await this.getAllPrices();
    return allPrices
      .filter(price => price.priceChangePercent > 0)
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, 5);
  }

  async getTopLosers(): Promise<MarketPrice[]> {
    const allPrices = await this.getAllPrices();
    return allPrices
      .filter(price => price.priceChangePercent < 0)
      .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
      .slice(0, 5);
  }

  getCategories(): string[] {
    return [
      'Hortalizas',
      'Frutas',
      'Tubérculos',
      'Cereales',
      'Legumbres',
      'Café',
      'Cacao',
      'Plantas Aromáticas',
      'Flores',
      'Otros'
    ];
  }

  getRegions(): string[] {
    return [
      'Bogotá',
      'Medellín',
      'Cali',
      'Barranquilla',
      'Bucaramanga',
      'Eje Cafetero',
      'Costa Atlántica',
      'Región Pacífica',
      'Amazonia',
      'Orinoquia'
    ];
  }
}

export default MarketPriceService.getInstance();
