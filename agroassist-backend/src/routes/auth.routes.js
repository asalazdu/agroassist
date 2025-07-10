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


module.exports = router;