/**
 * Alert Routes - Rutas para alertas climáticas
 */

const { Router } = require('express');
const { obtenerAlertas, obtenerAlertasPorCultivo } = require('../controllers/alert.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

/**
 * Todas las rutas requieren autenticación JWT
 */

// GET /api/alerts - Obtener todas las alertas del usuario
router.get('/', validateJWT, obtenerAlertas);

// GET /api/alerts/cultivo/:id - Obtener alertas de un cultivo específico
router.get('/cultivo/:id', validateJWT, obtenerAlertasPorCultivo);

module.exports = router;
