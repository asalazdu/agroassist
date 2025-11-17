/**
 * Market Price Controller - Controlador de precios de mercado
 */

const marketPriceService = require('../../infrastructure/services/marketPriceService');

/**
 * Obtener todos los precios de mercado
 */
const getAllPrices = async (req, res) => {
  try {
    const result = await marketPriceService.getMarketPrices();
    
    res.json({
      ok: true,
      ...result
    });

  } catch (error) {
    console.error('Error en getAllPrices:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al obtener precios de mercado',
      error: error.message
    });
  }
};

/**
 * Obtener precios por categoría
 */
const getPricesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const result = await marketPriceService.getMarketPrices();
    
    if (!result.success) {
      return res.status(500).json({
        ok: false,
        message: 'Error al obtener precios'
      });
    }

    const filtered = result.prices.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );

    res.json({
      ok: true,
      prices: filtered,
      category,
      count: filtered.length
    });

  } catch (error) {
    console.error('Error en getPricesByCategory:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al filtrar precios por categoría',
      error: error.message
    });
  }
};

/**
 * Obtener precios por región
 */
const getPricesByRegion = async (req, res) => {
  try {
    const { region } = req.params;
    
    const result = await marketPriceService.getMarketPrices();
    
    if (!result.success) {
      return res.status(500).json({
        ok: false,
        message: 'Error al obtener precios'
      });
    }

    const filtered = result.prices.filter(
      p => p.region.toLowerCase().includes(region.toLowerCase())
    );

    res.json({
      ok: true,
      prices: filtered,
      region,
      count: filtered.length
    });

  } catch (error) {
    console.error('Error en getPricesByRegion:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al filtrar precios por región',
      error: error.message
    });
  }
};

/**
 * Buscar productos
 */
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        ok: false,
        message: 'Parámetro de búsqueda "q" requerido'
      });
    }

    const result = await marketPriceService.getMarketPrices();
    
    if (!result.success) {
      return res.status(500).json({
        ok: false,
        message: 'Error al obtener precios'
      });
    }

    const searchTerm = q.toLowerCase();
    const filtered = result.prices.filter(p =>
      p.productName.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );

    res.json({
      ok: true,
      prices: filtered,
      query: q,
      count: filtered.length
    });

  } catch (error) {
    console.error('Error en searchProducts:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al buscar productos',
      error: error.message
    });
  }
};

/**
 * Obtener análisis de un producto
 */
const getProductAnalysis = async (req, res) => {
  try {
    const { productName } = req.params;
    
    if (!productName) {
      return res.status(400).json({
        ok: false,
        message: 'Nombre de producto requerido'
      });
    }

    const result = await marketPriceService.getProductAnalysis(productName);

    res.json({
      ok: true,
      ...result
    });

  } catch (error) {
    console.error('Error en getProductAnalysis:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al obtener análisis del producto',
      error: error.message
    });
  }
};

/**
 * Forzar actualización de caché
 */
const refreshCache = async (req, res) => {
  try {
    // Invalidar caché
    marketPriceService.cache.data = null;
    marketPriceService.cache.timestamp = null;

    // Obtener nuevos datos
    const result = await marketPriceService.getMarketPrices();

    res.json({
      ok: true,
      message: 'Caché actualizado',
      ...result
    });

  } catch (error) {
    console.error('Error en refreshCache:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al actualizar caché',
      error: error.message
    });
  }
};

module.exports = {
  getAllPrices,
  getPricesByCategory,
  getPricesByRegion,
  searchProducts,
  getProductAnalysis,
  refreshCache
};
