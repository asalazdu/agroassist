const express = require('express');
const MarketPricesController = require('../controllers/marketPrices.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = express.Router();
const marketPricesController = new MarketPricesController();

/**
 * Rutas para precios de mercado agrícola en Colombia
 * Productos: huevos, semillas, fertilizantes, cultivos básicos
 */

// Endpoint de prueba (público)
router.get('/test', marketPricesController.testDataSources.bind(marketPricesController));

// Obtener productos disponibles (público para consulta)
router.get('/products', marketPricesController.getAvailableProducts.bind(marketPricesController));

// Búsqueda de productos (público)
router.get('/search/:query', marketPricesController.searchProducts.bind(marketPricesController));

// Obtener precios de producto específico
router.get('/product/:productName', validateJWT, marketPricesController.getProductPrices.bind(marketPricesController));

// Obtener precios de insumos agrícolas
router.get('/inputs/:inputType', validateJWT, marketPricesController.getInputPrices.bind(marketPricesController));

// Comparar precios entre regiones
router.get('/compare/:productName', validateJWT, marketPricesController.compareRegionalPrices.bind(marketPricesController));

// Obtener historial de precios
router.get('/history/:productName', validateJWT, marketPricesController.getPriceHistory.bind(marketPricesController));

// Análisis completo de mercado
router.post('/analysis', validateJWT, marketPricesController.getMarketAnalysis.bind(marketPricesController));

module.exports = router;
