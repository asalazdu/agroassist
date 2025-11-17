const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const { validateJWT } = require('../middlewares/validateJWT');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/register', [
  check('nombre_completo', 'El nombre es obligatorio').notEmpty(),
  check('correo', 'El email es obligatorio').isEmail(),
  check('contrasena', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  validateFields
], authController.register);

router.post('/login', [
  check('correo', 'Debes ingresar un correo válido').isEmail(),
  check('contrasena', 'La contraseña es obligatoria').notEmpty(),
  validateFields
], authController.login);

router.post('/recover-password', [
  check('correo', 'El email es obligatorio').isEmail(),
  validateFields
], authController.recover);

router.post('/reset-password', [
  check('correo', 'El correo es obligatorio').isEmail(),
  check('codigo', 'El código es obligatorio').notEmpty(),
  check('newPassword', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  validateFields
], authController.reset);

// Ruta protegida para obtener perfil del usuario (requiere JWT)
router.get('/profile', [
  validateJWT
], authController.getProfile);

// Ruta protegida para actualizar perfil (requiere JWT)
router.put('/profile', [
  validateJWT,
  check('nombre_completo', 'El nombre debe tener al menos 3 caracteres').optional().isLength({ min: 3 }),
  check('telefono', 'El teléfono debe tener al menos 7 caracteres').optional().isLength({ min: 7 }),
  check('ubicacion', 'La ubicación debe tener al menos 3 caracteres').optional().isLength({ min: 3 }),
  check('tamaño_finca', 'El tamaño de finca debe ser un número').optional().isNumeric(),
  validateFields
], authController.updateProfile);

module.exports = router;
