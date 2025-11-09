const { Router } = require('express');
const marketController = require('../controllers/market.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

// Obtener precios del mercado (con OpenAI para datos actualizados)
router.get('/market-prices', validateJWT, marketController.getMarketPrices);

// Obtener análisis de precios de un producto específico
router.get('/market-prices/:productName', validateJWT, marketController.getProductAnalysis);

module.exports = router;
