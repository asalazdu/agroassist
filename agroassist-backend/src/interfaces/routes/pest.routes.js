const { Router } = require('express');
const { param, body } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const pestController = require('../controllers/pest.controller');

const router = Router();

// Ruta para obtener ayuda sobre la API de plagas
router.get('/help', pestController.getHelp);

// Ruta para obtener cultivos disponibles
router.get('/crops', pestController.getAvailableCrops);

// Ruta para obtener plagas por cultivo
router.get('/crop/:crop', [
  param('crop', 'El nombre del cultivo es requerido').notEmpty(),
  validateFields
], pestController.getPestsByCrop);

// Ruta para buscar plagas por síntomas
router.post('/symptoms', [
  body('symptoms', 'Se requiere un array de síntomas').isArray({ min: 1 }),
  body('symptoms.*', 'Cada síntoma debe ser un string no vacío').isString().notEmpty(),
  validateFields
], pestController.getPestsBySymptoms);

module.exports = router;
