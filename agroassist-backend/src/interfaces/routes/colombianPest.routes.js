/**
 * Rutas para información de plagas específica de Colombia
 * Todas las rutas en español y enfocadas en agricultura colombiana
 */

const express = require('express');
const colombianPestController = require('../controllers/colombianPest.controller');
const validateJWT = require('../middlewares/validateJWT');

const router = express.Router();

// Ruta pública de prueba - no requiere autenticación
router.get('/test-colombia', colombianPestController.testColombianAPI);

// Ruta pública de información del sistema - no requiere autenticación  
router.get('/info-sistema', colombianPestController.obtenerInfoSistema);

// Ruta pública para lista de cultivos - no requiere autenticación
router.get('/cultivos-colombia', colombianPestController.obtenerCultivosDisponibles);

// Rutas protegidas - requieren JWT
router.use(validateJWT); // Middleware aplicado a todas las rutas siguientes

/**
 * Buscar información de una plaga específica
 * GET /api/plagas/buscar/:nombrePlaga
 * 
 * Ejemplos:
 * - /api/plagas/buscar/broca del café
 * - /api/plagas/buscar/roya
 * - /api/plagas/buscar/gusano cogollero
 */
router.get('/buscar/:nombrePlaga', colombianPestController.buscarPlaga);

/**
 * Obtener plagas de un cultivo específico
 * GET /api/plagas/cultivo/:nombreCultivo
 * 
 * Ejemplos:
 * - /api/plagas/cultivo/café
 * - /api/plagas/cultivo/maíz
 * - /api/plagas/cultivo/arroz
 */
router.get('/cultivo/:nombreCultivo', colombianPestController.obtenerPlagasCultivo);

/**
 * Buscar plagas por ubicación geográfica en Colombia
 * POST /api/plagas/ubicacion
 * 
 * Body:
 * {
 *   "latitud": 4.7110,
 *   "longitud": -74.0721,
 *   "tipoCultivo": "café" // opcional
 * }
 */
router.post('/ubicacion', colombianPestController.buscarPorUbicacion);

/**
 * Obtener plan de manejo específico para Colombia
 * POST /api/plagas/plan-manejo
 * 
 * Body:
 * {
 *   "nombrePlaga": "broca del café",
 *   "nombreCultivo": "café" // opcional
 * }
 */
router.post('/plan-manejo', colombianPestController.obtenerPlanManejo);

module.exports = router;
