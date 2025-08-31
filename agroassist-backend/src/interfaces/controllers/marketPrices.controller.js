const GetColombianMarketPrices = require('../../application/use-cases/getColombianMarketPrices');

/**
 * Controlador para precios de mercado agrícola en Colombia
 * Maneja consultas de precios de productos agrícolas, fertilizantes, semillas, etc.
 */
class MarketPricesController {
  constructor() {
    this.getColombianMarketPrices = new GetColombianMarketPrices();
  }

  /**
   * Obtener precios de un producto agrícola específico
   * GET /api/market/product/:productName
   * Query params: ?region=Bogotá (opcional)
   */
  async getProductPrices(req, res) {
    try {
      const { productName } = req.params;
      const { region } = req.query;

      if (!productName) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre del producto'
        });
      }

      const result = await this.getColombianMarketPrices.getProductPrices(productName, region);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en getProductPrices:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener precios de insumos agrícolas
   * GET /api/market/inputs/:inputType
   */
  async getInputPrices(req, res) {
    try {
      const { inputType } = req.params;

      if (!inputType) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el tipo de insumo'
        });
      }

      const result = await this.getColombianMarketPrices.getInputPrices(inputType);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en getInputPrices:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Comparar precios entre regiones
   * GET /api/market/compare/:productName
   */
  async compareRegionalPrices(req, res) {
    try {
      const { productName } = req.params;

      if (!productName) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre del producto'
        });
      }

      const result = await this.getColombianMarketPrices.compareRegionalPrices(productName);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en compareRegionalPrices:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener historial de precios
   * GET /api/market/history/:productName
   * Query params: ?months=12 (opcional)
   */
  async getPriceHistory(req, res) {
    try {
      const { productName } = req.params;
      const { months } = req.query;

      if (!productName) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar el nombre del producto'
        });
      }

      const monthsToAnalyze = months ? parseInt(months) : 12;

      if (isNaN(monthsToAnalyze) || monthsToAnalyze < 1 || monthsToAnalyze > 36) {
        return res.status(400).json({
          success: false,
          error: 'El parámetro months debe ser un número entre 1 y 36'
        });
      }

      const result = await this.getColombianMarketPrices.getPriceHistory(productName, monthsToAnalyze);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en getPriceHistory:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Análisis completo de mercado
   * POST /api/market/analysis
   * Body: { products: ["huevos", "maiz", "arroz"], region: "Bogotá" }
   */
  async getMarketAnalysis(req, res) {
    try {
      const { products, region } = req.body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar una lista de productos válida'
        });
      }

      if (products.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Máximo 10 productos por análisis'
        });
      }

      const result = await this.getColombianMarketPrices.getMarketAnalysis(products, region);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error en getMarketAnalysis:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener lista de productos disponibles
   * GET /api/market/products
   */
  async getAvailableProducts(req, res) {
    try {
      const products = {
        cereales: ['maiz', 'arroz', 'trigo', 'avena', 'cebada'],
        legumbres: ['frijol', 'lenteja', 'garbanzo', 'arveja'],
        tuberculos: ['papa', 'yuca', 'ñame', 'platano'],
        hortalizas: ['tomate', 'cebolla', 'zanahoria', 'lechuga', 'apio'],
        frutas: ['naranja', 'banano', 'mango', 'piña', 'aguacate'],
        pecuarios: ['huevos', 'leche', 'carne_res', 'carne_cerdo', 'pollo'],
        insumos: ['fertilizante', 'semilla', 'pesticida', 'abono_organico']
      };

      const regions = [
        'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 
        'Bucaramanga', 'Cartagena', 'Pereira', 'Manizales',
        'Ibagué', 'Cúcuta', 'Villavicencio', 'Pasto'
      ];

      res.json({
        success: true,
        data: {
          products: products,
          regions: regions,
          totalProducts: Object.values(products).flat().length,
          categories: Object.keys(products),
          note: 'Use los nombres exactos de productos para consultas'
        }
      });
    } catch (error) {
      console.error('Error en getAvailableProducts:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Búsqueda inteligente de productos
   * GET /api/market/search/:query
   */
  async searchProducts(req, res) {
    try {
      const { query } = req.params;

      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'La búsqueda debe tener al menos 2 caracteres'
        });
      }

      const allProducts = [
        'maiz', 'arroz', 'trigo', 'frijol', 'papa', 'yuca', 'tomate', 
        'cebolla', 'huevos', 'leche', 'fertilizante', 'semilla', 'naranja',
        'banano', 'aguacate', 'lechuga', 'zanahoria', 'platano', 'piña'
      ];

      const matches = allProducts.filter(product => 
        product.toLowerCase().includes(query.toLowerCase())
      );

      res.json({
        success: true,
        query: query,
        matches: matches,
        count: matches.length,
        suggestions: matches.slice(0, 5)
      });
    } catch (error) {
      console.error('Error en searchProducts:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Endpoint de prueba para verificar conectividad con fuentes de datos
   * GET /api/market/test
   */
  async testDataSources(req, res) {
    try {
      const testResults = {
        timestamp: new Date().toISOString(),
        tests: []
      };

      // Probar servicio colombiano
      try {
        const testProduct = await this.getColombianMarketPrices.getProductPrices('huevos');
        testResults.tests.push({
          source: 'Colombian Price Service',
          status: testProduct.success ? 'OK' : 'ERROR',
          response: testProduct.success ? 'Service responding' : testProduct.error
        });
      } catch (error) {
        testResults.tests.push({
          source: 'Colombian Price Service',
          status: 'ERROR',
          response: error.message
        });
      }

      // Probar datos de muestra
      try {
        const sampleData = await this.getColombianMarketPrices.getInputPrices('fertilizante');
        testResults.tests.push({
          source: 'Sample Data Generation',
          status: sampleData.success ? 'OK' : 'ERROR',
          response: sampleData.success ? 'Sample data available' : sampleData.error
        });
      } catch (error) {
        testResults.tests.push({
          source: 'Sample Data Generation',
          status: 'ERROR',
          response: error.message
        });
      }

      const allOk = testResults.tests.every(test => test.status === 'OK');

      res.json({
        success: true,
        message: allOk ? 'Todos los servicios funcionando correctamente' : 'Algunos servicios presentan problemas',
        data: testResults,
        overallStatus: allOk ? 'HEALTHY' : 'DEGRADED'
      });

    } catch (error) {
      console.error('Error en testDataSources:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = MarketPricesController;
