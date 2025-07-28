const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
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

module.exports = router;
