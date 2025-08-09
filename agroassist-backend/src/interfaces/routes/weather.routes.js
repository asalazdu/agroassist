const { Router } = require('express');
const { query } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const weatherController = require('../controllers/weather.controller');

const router = Router();

// Ruta para obtener ayuda sobre la API del clima
router.get('/help', weatherController.getHelp);

// Ruta para obtener pronóstico por ciudad
router.get('/forecast', [
  query('city', 'El nombre de la ciudad es requerido').notEmpty(),
  query('country', 'El código del país debe tener máximo 2 caracteres').optional().isLength({ max: 2 }),
  validateFields
], weatherController.getForecastByCity);

// Ruta para obtener pronóstico por coordenadas
router.get('/coordinates', [
  query('lat', 'La latitud es requerida y debe ser un número').isFloat({ min: -90, max: 90 }),
  query('lon', 'La longitud es requerida y debe ser un número').isFloat({ min: -180, max: 180 }),
  validateFields
], weatherController.getForecastByCoordinates);

module.exports = router;
