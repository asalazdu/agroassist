const express = require('express');
const PestController = require('../controllers/pest.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = express.Router();
const pestController = new PestController();

/**
 * Rutas para información de plagas y cultivos
 * Todas las APIs utilizadas son completamente GRATUITAS
 */

// Endpoint de prueba (público para verificar APIs)
router.get('/test', pestController.testAPIs.bind(pestController));

// Buscar información general de una plaga específica
router.get('/search/:pestName', validateJWT, pestController.searchPest.bind(pestController));

// Obtener plagas asociadas a un cultivo
router.get('/crop/:cropName', validateJWT, pestController.getCropPests.bind(pestController));

// Buscar plagas por ubicación geográfica
router.post('/location', validateJWT, pestController.getPestsByLocation.bind(pestController));

// Obtener información detallada de una plaga
router.post('/details', validateJWT, pestController.getDetailedPestInfo.bind(pestController));

// ===== NUEVAS FUNCIONALIDADES CON IA =====

// Analizar imagen de cultivo para detectar plagas/enfermedades con OpenAI Vision
router.post('/analyze-image', validateJWT, pestController.analyzeImage.bind(pestController));

// Obtener alertas de plagas basadas en clima actual
router.post('/weather-alerts', validateJWT, pestController.getWeatherAlerts.bind(pestController));

// ===== BASE DE DATOS REAL DE PLAGAS (PERENUAL API) =====

// Obtener lista de plagas/enfermedades (con búsqueda y paginación)
router.get('/database', validateJWT, pestController.getPestDatabase.bind(pestController));

// Obtener detalles de una plaga específica por ID
router.get('/database/:id', validateJWT, pestController.getPestDetails.bind(pestController));

// Buscar plagas específicas para un cultivo
router.get('/by-crop/:cropName', validateJWT, pestController.getPestsByCrop.bind(pestController));

module.exports = router;
