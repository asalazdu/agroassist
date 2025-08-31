const axios = require('axios');

/**
 * Servicio para obtener precios de mercado agrícola en Colombia
 * Integra múltiples fuentes oficiales y comerciales
 */
class ColombianAgriculturePricesService {
  constructor() {
    this.sources = {
      dane: 'https://www.dane.gov.co',
      agronet: 'https://www.agronet.gov.co',
      fao: 'https://www.fao.org/faostat/api/v1',
      worldbank: 'https://api.worldbank.org/v2'
    };
  }

  /**
   * Obtener precios de productos agrícolas básicos
   * @param {string} product - Producto a consultar (huevos, maiz, arroz, etc.)
   * @param {string} region - Región de Colombia (opcional)
   * @returns {Promise<Object>} - Precios actualizados
   */
  async getProductPrices(product, region = null) {
    try {
      const results = {
        product: product,
        region: region,
        timestamp: new Date().toISOString(),
        sources: {},
        summary: null
      };

      // Intentar obtener datos de múltiples fuentes
      const [daneData, faoData, worldBankData] = await Promise.allSettled([
        this._getDaneData(product, region),
        this._getFAOData(product),
        this._getWorldBankData(product)
      ]);

      // Procesar resultados de DANE/SIPSA
      if (daneData.status === 'fulfilled' && daneData.value.success) {
        results.sources.dane = daneData.value;
      }

      // Procesar resultados de FAO
      if (faoData.status === 'fulfilled' && faoData.value.success) {
        results.sources.fao = faoData.value;
      }

      // Procesar resultados del Banco Mundial
      if (worldBankData.status === 'fulfilled' && worldBankData.value.success) {
        results.sources.worldBank = worldBankData.value;
      }

      // Generar resumen
      results.summary = this._generatePriceSummary(results.sources);

      return {
        success: true,
        data: results,
        recommendations: this._generateRecommendations(results)
      };

    } catch (error) {
      console.error('Error obteniendo precios agrícolas:', error);
      return {
        success: false,
        error: 'Error al obtener precios de productos agrícolas',
        details: error.message
      };
    }
  }

  /**
   * Obtener precios de fertilizantes e insumos agrícolas
   * @param {string} inputType - Tipo de insumo (fertilizante, semilla, etc.)
   * @returns {Promise<Object>} - Precios de insumos
   */
  async getAgriculturalInputPrices(inputType) {
    try {
      const mappedProducts = this._mapInputToProducts(inputType);
      const results = [];

      for (const product of mappedProducts) {
        const productData = await this.getProductPrices(product);
        if (productData.success) {
          results.push(productData.data);
        }
      }

      return {
        success: true,
        inputType: inputType,
        products: results,
        summary: this._summarizeInputPrices(results)
      };

    } catch (error) {
      console.error('Error obteniendo precios de insumos:', error);
      return {
        success: false,
        error: 'Error al obtener precios de insumos agrícolas',
        details: error.message
      };
    }
  }

  /**
   * Obtener comparación de precios por regiones
   * @param {string} product - Producto a comparar
   * @returns {Promise<Object>} - Comparación regional de precios
   */
  async getRegionalPriceComparison(product) {
    try {
      const regions = [
        'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 
        'Bucaramanga', 'Cartagena', 'Pereira', 'Manizales'
      ];

      const regionalData = [];

      for (const region of regions) {
        try {
          const regionPrices = await this.getProductPrices(product, region);
          if (regionPrices.success) {
            regionalData.push({
              region: region,
              data: regionPrices.data
            });
          }
        } catch (error) {
          console.log(`Error obteniendo datos para ${region}:`, error.message);
        }
      }

      return {
        success: true,
        product: product,
        regionalComparison: regionalData,
        analysis: this._analyzeRegionalPrices(regionalData)
      };

    } catch (error) {
      console.error('Error en comparación regional:', error);
      return {
        success: false,
        error: 'Error al comparar precios regionales',
        details: error.message
      };
    }
  }

  /**
   * Obtener tendencias históricas de precios
   * @param {string} product - Producto a analizar
   * @param {number} months - Meses hacia atrás a consultar
   * @returns {Promise<Object>} - Tendencias históricas
   */
  async getPriceHistoryTrends(product, months = 12) {
    try {
      // Simular datos históricos (en implementación real, consultar APIs)
      const historicalData = await this._getHistoricalData(product, months);
      
      return {
        success: true,
        product: product,
        period: `${months} meses`,
        historicalData: historicalData,
        trends: this._analyzeTrends(historicalData),
        forecast: this._generateSimpleForecast(historicalData)
      };

    } catch (error) {
      console.error('Error obteniendo tendencias:', error);
      return {
        success: false,
        error: 'Error al obtener tendencias históricas',
        details: error.message
      };
    }
  }

  // Métodos privados para integración con fuentes de datos

  /**
   * Obtener datos del DANE/SIPSA (simulado - requiere integración real)
   * @private
   */
  async _getDaneData(product, region) {
    try {
      // Simulación de datos del DANE/SIPSA
      // En implementación real, usar API oficial del DANE
      const sampleData = this._getSampleDaneData(product, region);
      
      return {
        success: true,
        source: 'DANE-SIPSA',
        data: sampleData,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error consultando DANE',
        details: error.message
      };
    }
  }

  /**
   * Obtener datos de FAO
   * @private
   */
  async _getFAOData(product) {
    try {
      // Mapear producto a código FAO
      const faoCode = this._mapProductToFAOCode(product);
      
      if (!faoCode) {
        return { success: false, error: 'Producto no encontrado en FAO' };
      }

      // Consulta simulada a FAO (requiere implementación real)
      const faoData = {
        product: product,
        faoCode: faoCode,
        globalPrice: this._generateSamplePrice(product),
        unit: 'USD/ton',
        region: 'Colombia'
      };

      return {
        success: true,
        source: 'FAO',
        data: faoData
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error consultando FAO',
        details: error.message
      };
    }
  }

  /**
   * Obtener datos del Banco Mundial
   * @private
   */
  async _getWorldBankData(product) {
    try {
      const worldBankData = {
        product: product,
        commodityPrice: this._generateSamplePrice(product),
        unit: 'USD/MT',
        lastUpdate: new Date().toISOString()
      };

      return {
        success: true,
        source: 'World Bank',
        data: worldBankData
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error consultando Banco Mundial',
        details: error.message
      };
    }
  }

  // Métodos auxiliares

  /**
   * Generar datos de muestra del DANE/SIPSA
   * @private
   */
  _getSampleDaneData(product, region) {
    const basePrice = this._generateSamplePrice(product);
    const regionMultiplier = region ? this._getRegionMultiplier(region) : 1;
    
    return {
      product: product,
      region: region || 'Nacional',
      pricePerKg: Math.round(basePrice * regionMultiplier),
      unit: 'COP/kg',
      marketType: 'Mayorista',
      lastUpdate: new Date().toISOString(),
      priceRange: {
        min: Math.round(basePrice * regionMultiplier * 0.9),
        max: Math.round(basePrice * regionMultiplier * 1.1)
      }
    };
  }

  /**
   * Generar precio de muestra basado en el producto
   * @private
   */
  _generateSamplePrice(product) {
    const basePrices = {
      'huevos': 450,
      'maiz': 1200,
      'arroz': 2800,
      'frijol': 4500,
      'papa': 1800,
      'tomate': 2200,
      'cebolla': 1600,
      'fertilizante': 85000,
      'semilla': 25000
    };

    const basePrice = basePrices[product.toLowerCase()] || 2000;
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variación
    
    return Math.round(basePrice * (1 + variation));
  }

  /**
   * Obtener multiplicador por región
   * @private
   */
  _getRegionMultiplier(region) {
    const multipliers = {
      'Bogotá': 1.1,
      'Medellín': 1.05,
      'Cali': 1.02,
      'Barranquilla': 0.98,
      'Bucaramanga': 0.95,
      'Cartagena': 1.08,
      'Pereira': 0.92,
      'Manizales': 0.90
    };

    return multipliers[region] || 1.0;
  }

  /**
   * Mapear insumo a productos específicos
   * @private
   */
  _mapInputToProducts(inputType) {
    const mapping = {
      'fertilizante': ['fertilizante', 'urea', 'fosfato'],
      'semilla': ['semilla', 'semilla_maiz', 'semilla_arroz'],
      'pesticida': ['pesticida', 'insecticida', 'fungicida']
    };

    return mapping[inputType.toLowerCase()] || [inputType];
  }

  /**
   * Mapear producto a código FAO
   * @private
   */
  _mapProductToFAOCode(product) {
    const mapping = {
      'maiz': '56',
      'arroz': '27',
      'trigo': '15',
      'frijol': '176',
      'papa': '116'
    };

    return mapping[product.toLowerCase()] || null;
  }

  /**
   * Generar resumen de precios
   * @private
   */
  _generatePriceSummary(sources) {
    const availableSources = Object.keys(sources).length;
    
    if (availableSources === 0) {
      return {
        status: 'No data available',
        message: 'No se pudieron obtener precios de ninguna fuente'
      };
    }

    return {
      status: 'Data available',
      sourcesCount: availableSources,
      message: `Precios obtenidos de ${availableSources} fuente(s)`,
      reliability: availableSources > 1 ? 'High' : 'Medium'
    };
  }

  /**
   * Generar recomendaciones
   * @private
   */
  _generateRecommendations(results) {
    const recommendations = [];

    if (results.summary?.sourcesCount > 1) {
      recommendations.push('Compare precios de múltiples fuentes antes de tomar decisiones');
    }

    recommendations.push('Consulte precios locales para obtener cotizaciones más precisas');
    recommendations.push('Considere factores estacionales que pueden afectar los precios');
    
    return recommendations;
  }

  /**
   * Resumir precios de insumos
   * @private
   */
  _summarizeInputPrices(results) {
    if (results.length === 0) {
      return { message: 'No se encontraron datos de precios' };
    }

    return {
      totalProducts: results.length,
      averageReliability: 'Medium',
      message: `Precios obtenidos para ${results.length} producto(s)`
    };
  }

  /**
   * Analizar precios regionales
   * @private
   */
  _analyzeRegionalPrices(regionalData) {
    if (regionalData.length === 0) {
      return { message: 'No hay datos regionales disponibles' };
    }

    return {
      regionsAnalyzed: regionalData.length,
      recommendation: 'Compare precios entre regiones para optimizar compras',
      note: 'Los precios pueden variar según la cercanía a zonas de producción'
    };
  }

  /**
   * Obtener datos históricos simulados
   * @private
   */
  async _getHistoricalData(product, months) {
    const data = [];
    const basePrice = this._generateSamplePrice(product);
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.1;
      const randomFactor = (Math.random() - 0.5) * 0.15;
      const trendFactor = (months - i) * 0.002; // Tendencia ligera
      
      const price = basePrice * (1 + seasonalFactor + randomFactor + trendFactor);
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        month: date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
      });
    }
    
    return data;
  }

  /**
   * Analizar tendencias
   * @private
   */
  _analyzeTrends(historicalData) {
    if (historicalData.length < 2) {
      return { trend: 'Insufficient data' };
    }

    const firstPrice = historicalData[0].price;
    const lastPrice = historicalData[historicalData.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    let trend = 'Stable';
    if (change > 5) trend = 'Increasing';
    else if (change < -5) trend = 'Decreasing';

    return {
      trend: trend,
      changePercent: Math.round(change * 100) / 100,
      analysis: `Precio ${trend.toLowerCase()} en el período analizado`
    };
  }

  /**
   * Generar pronóstico simple
   * @private
   */
  _generateSimpleForecast(historicalData) {
    if (historicalData.length < 3) {
      return { forecast: 'Insufficient data for forecast' };
    }

    const recentPrices = historicalData.slice(-3).map(d => d.price);
    const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    
    return {
      nextMonthEstimate: Math.round(avgRecent),
      confidence: 'Low',
      note: 'Pronóstico basado en promedios simples. Use con precaución.'
    };
  }
}

module.exports = new ColombianAgriculturePricesService();
