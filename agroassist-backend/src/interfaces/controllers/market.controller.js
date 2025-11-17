const marketService = require('../../infrastructure/services/marketService');

// Obtener precios del mercado
const getMarketPrices = async (req, res) => {
  try {
    console.log('📊 Obteniendo precios del mercado...');
    
    const prices = await marketService.getMarketPrices();
    
    res.json({
      ok: true,
      prices,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error obteniendo precios:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener precios del mercado',
      error: error.message
    });
  }
};

// Obtener análisis de un producto específico
const getProductAnalysis = async (req, res) => {
  try {
    const { productName } = req.params;
    console.log(`📊 Analizando precio de: ${productName}`);
    
    const analysis = await marketService.getProductAnalysis(productName);
    
    res.json({
      ok: true,
      product: productName,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error analizando producto:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al analizar producto',
      error: error.message
    });
  }
};

module.exports = {
  getMarketPrices,
  getProductAnalysis
};
