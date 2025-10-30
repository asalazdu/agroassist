/**
 * Market Price Routes - Rutas de precios de mercado
 */

const { Router } = require('express');
const { 
  getAllPrices, 
  getPricesByCategory, 
  getPricesByRegion,
  searchProducts,
  getProductAnalysis,
  refreshCache
} = require('../controllers/marketPrice.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

/**
 * GET /api/market-prices
 * Obtener todos los precios de mercado
 * Requiere autenticación
 */
router.get('/', validateJWT, getAllPrices);

/**
 * GET /api/market-prices/category/:category
 * Obtener precios por categoría
 * Requiere autenticación
 */
router.get('/category/:category', validateJWT, getPricesByCategory);

/**
 * GET /api/market-prices/region/:region
 * Obtener precios por región
 * Requiere autenticación
 */
router.get('/region/:region', validateJWT, getPricesByRegion);

/**
 * GET /api/market-prices/search?q=producto
 * Buscar productos
 * Requiere autenticación
 */
router.get('/search', validateJWT, searchProducts);

/**
 * GET /api/market-prices/analysis/:productName
 * Obtener análisis de un producto específico
 * Requiere autenticación
 */
router.get('/analysis/:productName', validateJWT, getProductAnalysis);

/**
 * POST /api/market-prices/refresh
 * Forzar actualización de caché
 * Requiere autenticación
 */
router.post('/refresh', validateJWT, refreshCache);

module.exports = router;
