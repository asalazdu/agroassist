const colombianPricesService = require('../../infrastructure/services/colombianPricesService');

/**
 * Caso de uso: Obtener información de precios agrícolas en Colombia
 * Gestiona la obtención de precios de productos agrícolas, fertilizantes, semillas, etc.
 */
class GetColombianMarketPrices {
  
  /**
   * Obtener precios de un producto agrícola específico
   * @param {string} product - Nombre del producto
   * @param {string} region - Región de Colombia (opcional)
   * @returns {Promise<Object>} - Precios del producto
   */
  async getProductPrices(product, region = null) {
    try {
      if (!product || typeof product !== 'string') {
        return {
          success: false,
          error: 'Debe proporcionar un nombre válido de producto'
        };
      }

      const result = await colombianPricesService.getProductPrices(product, region);
      
      if (result.success) {
        result.marketAdvice = this._generateMarketAdvice(result.data);
      }

      return result;

    } catch (error) {
      console.error('Error obteniendo precios de producto:', error);
      return {
        success: false,
        error: 'Error interno al obtener precios del producto',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener precios de insumos agrícolas (fertilizantes, semillas, etc.)
   * @param {string} inputType - Tipo de insumo
   * @returns {Promise<Object>} - Precios de insumos
   */
  async getInputPrices(inputType) {
    try {
      if (!inputType || typeof inputType !== 'string') {
        return {
          success: false,
          error: 'Debe proporcionar un tipo válido de insumo'
        };
      }

      const result = await colombianPricesService.getAgriculturalInputPrices(inputType);
      
      if (result.success) {
        result.purchaseAdvice = this._generatePurchaseAdvice(inputType, result);
      }

      return result;

    } catch (error) {
      console.error('Error obteniendo precios de insumos:', error);
      return {
        success: false,
        error: 'Error interno al obtener precios de insumos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Comparar precios entre regiones de Colombia
   * @param {string} product - Producto a comparar
   * @returns {Promise<Object>} - Comparación regional de precios
   */
  async compareRegionalPrices(product) {
    try {
      if (!product || typeof product !== 'string') {
        return {
          success: false,
          error: 'Debe proporcionar un nombre válido de producto'
        };
      }

      const result = await colombianPricesService.getRegionalPriceComparison(product);
      
      if (result.success) {
        result.bestMarkets = this._identifyBestMarkets(result.regionalComparison);
        result.transportationAdvice = this._generateTransportationAdvice(result);
      }

      return result;

    } catch (error) {
      console.error('Error comparando precios regionales:', error);
      return {
        success: false,
        error: 'Error interno al comparar precios regionales',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener tendencias históricas de precios
   * @param {string} product - Producto a analizar
   * @param {number} months - Meses de historial (opcional, default 12)
   * @returns {Promise<Object>} - Tendencias históricas
   */
  async getPriceHistory(product, months = 12) {
    try {
      if (!product || typeof product !== 'string') {
        return {
          success: false,
          error: 'Debe proporcionar un nombre válido de producto'
        };
      }

      if (months < 1 || months > 36) {
        return {
          success: false,
          error: 'El período debe estar entre 1 y 36 meses'
        };
      }

      const result = await colombianPricesService.getPriceHistoryTrends(product, months);
      
      if (result.success) {
        result.investmentAdvice = this._generateInvestmentAdvice(result);
        result.seasonalInsights = this._analyzeSeasonalPatterns(result.historicalData);
      }

      return result;

    } catch (error) {
      console.error('Error obteniendo historial de precios:', error);
      return {
        success: false,
        error: 'Error interno al obtener historial de precios',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener análisis completo de mercado para múltiples productos
   * @param {Array<string>} products - Lista de productos a analizar
   * @param {string} region - Región específica (opcional)
   * @returns {Promise<Object>} - Análisis completo de mercado
   */
  async getMarketAnalysis(products, region = null) {
    try {
      if (!Array.isArray(products) || products.length === 0) {
        return {
          success: false,
          error: 'Debe proporcionar una lista válida de productos'
        };
      }

      const analysis = {
        region: region || 'Nacional',
        timestamp: new Date().toISOString(),
        products: [],
        marketSummary: null
      };

      // Obtener datos para cada producto
      for (const product of products) {
        try {
          const productData = await this.getProductPrices(product, region);
          if (productData.success) {
            analysis.products.push({
              product: product,
              data: productData.data,
              advice: productData.marketAdvice
            });
          }
        } catch (error) {
          console.log(`Error procesando ${product}:`, error.message);
        }
      }

      // Generar resumen del mercado
      analysis.marketSummary = this._generateMarketSummary(analysis.products);
      analysis.recommendations = this._generateMarketRecommendations(analysis);

      return {
        success: true,
        data: analysis
      };

    } catch (error) {
      console.error('Error en análisis de mercado:', error);
      return {
        success: false,
        error: 'Error interno al realizar análisis de mercado',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  // Métodos auxiliares privados

  /**
   * Generar consejos de mercado
   * @private
   */
  _generateMarketAdvice(productData) {
    const advice = [];
    
    if (productData.sources?.dane) {
      advice.push('Precio oficial DANE disponible - Alta confiabilidad');
    }

    if (productData.summary?.sourcesCount > 1) {
      advice.push('Múltiples fuentes confirman el precio - Recomendado para decisiones');
    }

    advice.push('Considere costos de transporte y almacenamiento');
    advice.push('Verifique calidad del producto antes de comprar');

    return advice;
  }

  /**
   * Generar consejos de compra para insumos
   * @private
   */
  _generatePurchaseAdvice(inputType, inputData) {
    const advice = [];

    switch (inputType.toLowerCase()) {
      case 'fertilizante':
        advice.push('Compare precios de diferentes marcas y concentraciones');
        advice.push('Considere compras grupales para obtener mejores precios');
        advice.push('Verifique fecha de vencimiento y condiciones de almacenamiento');
        break;
      case 'semilla':
        advice.push('Verifique certificación y origen de las semillas');
        advice.push('Compare precios por hectárea de siembra');
        advice.push('Considere variedades adaptadas a su región');
        break;
      default:
        advice.push('Compare precios de diferentes proveedores');
        advice.push('Verifique calidad y garantías del producto');
    }

    return advice;
  }

  /**
   * Identificar mejores mercados por región
   * @private
   */
  _identifyBestMarkets(regionalData) {
    if (!regionalData || regionalData.length === 0) {
      return { message: 'No hay datos regionales suficientes' };
    }

    // Simular análisis de mejores mercados
    const markets = regionalData.map(region => {
      const price = region.data?.sources?.dane?.data?.pricePerKg || 0;
      return {
        region: region.region,
        price: price,
        advantage: price > 0 ? 'competitive' : 'data_unavailable'
      };
    });

    return {
      totalMarkets: markets.length,
      recommendedMarkets: markets.slice(0, 3),
      note: 'Los mejores mercados dependen de costos de transporte'
    };
  }

  /**
   * Generar consejos de transporte
   * @private
   */
  _generateTransportationAdvice(regionalComparison) {
    return [
      'Calcule costos de transporte antes de seleccionar mercado',
      'Considere volumen mínimo para que el transporte sea rentable',
      'Evalúe tiempos de entrega según urgencia del producto',
      'Verifique requisitos fitosanitarios entre regiones'
    ];
  }

  /**
   * Generar consejos de inversión
   * @private
   */
  _generateInvestmentAdvice(historyData) {
    const advice = [];

    if (historyData.trends?.trend === 'Increasing') {
      advice.push('Tendencia alcista: Considere compra anticipada si planea usar el producto');
      advice.push('Evalúe almacenamiento si el precio sigue subiendo');
    } else if (historyData.trends?.trend === 'Decreasing') {
      advice.push('Tendencia bajista: Puede esperar mejor precio en próximas semanas');
      advice.push('Buen momento para compras a largo plazo');
    } else {
      advice.push('Precio estable: Puede comprar según necesidad inmediata');
    }

    return advice;
  }

  /**
   * Analizar patrones estacionales
   * @private
   */
  _analyzeSeasonalPatterns(historicalData) {
    if (!historicalData || historicalData.length < 6) {
      return { pattern: 'Insufficient data for seasonal analysis' };
    }

    return {
      pattern: 'Seasonal analysis available',
      note: 'Los precios agrícolas suelen variar según época de cosecha',
      recommendation: 'Planifique compras considerando ciclos estacionales'
    };
  }

  /**
   * Generar resumen del mercado
   * @private
   */
  _generateMarketSummary(productsData) {
    if (productsData.length === 0) {
      return { status: 'No data available' };
    }

    const totalProducts = productsData.length;
    const availableData = productsData.filter(p => p.data?.summary?.status === 'Data available').length;

    return {
      totalProducts: totalProducts,
      dataAvailability: `${availableData}/${totalProducts}`,
      marketCondition: availableData > totalProducts * 0.7 ? 'Good data coverage' : 'Limited data',
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Generar recomendaciones del mercado
   * @private
   */
  _generateMarketRecommendations(analysis) {
    const recommendations = [];

    if (analysis.marketSummary?.dataAvailability) {
      recommendations.push(`Datos disponibles para ${analysis.marketSummary.dataAvailability} productos analizados`);
    }

    recommendations.push('Consulte precios locales para confirmación');
    recommendations.push('Considere factores de calidad además del precio');
    recommendations.push('Planifique compras según estacionalidad de productos');
    recommendations.push('Evalúe proveedores certificados para insumos');

    return recommendations;
  }
}

module.exports = GetColombianMarketPrices;
