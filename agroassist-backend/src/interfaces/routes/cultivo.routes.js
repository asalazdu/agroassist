const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const { validateJWT } = require('../middlewares/validateJWT');
const cultivoController = require('../controllers/cultivo.controller');

const router = Router();

// Todas las rutas de cultivos requieren autenticación
router.use(validateJWT);

// GET /api/cultivos - Obtener todos los cultivos del usuario
router.get('/', cultivoController.getCultivos);

// POST /api/cultivos - Crear nuevo cultivo
router.post('/', [
  check('nombre_cultivo', 'El nombre del cultivo es obligatorio').notEmpty(),
  check('fecha_siembra', 'La fecha de siembra es obligatoria').notEmpty(),
  check('area_sembrada', 'El área sembrada debe ser un número').optional().isNumeric(),
  validateFields
], cultivoController.create);

// PUT /api/cultivos/:id - Actualizar cultivo
router.put('/:id', [
  check('nombre_cultivo', 'El nombre del cultivo debe tener al menos 2 caracteres').optional().isLength({ min: 2 }),
  check('area_sembrada', 'El área sembrada debe ser un número').optional().isNumeric(),
  validateFields
], cultivoController.update);

// DELETE /api/cultivos/:id - Eliminar cultivo
router.delete('/:id', cultivoController.remove);

module.exports = router;
