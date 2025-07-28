const registerUser = require('../../application/use-cases/registerUser');
const loginUser = require('../../application/use-cases/loginUser');
const recoverPassword = require('../../application/use-cases/recoverPassword');
const resetPassword = require('../../application/use-cases/resetPassword');

const userRepository = require('../../infrastructure/database/mysql/userRepository');
const hashService = require('../../infrastructure/services/hash.service');
const emailService = require('../../infrastructure/services/emailService');
const tokenService = require('../../infrastructure/shared/utils/token');

const register = async (req, res) => {
  const { nombre_completo, correo, contrasena } = req.body;

  try {
    const result = await registerUser({ nombre_completo, correo, contrasena }, { userRepository, hashService });
    res.status(201).json({ 
      ok: true, 
      msg: result.message 
    });
  } catch (error) {
    res.status(400).json({ 
      ok: false, 
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const result = await loginUser({ correo, contrasena }, { userRepository, hashService, tokenService });
    res.status(200).json({ 
      ok: true, 
      msg: result.message, 
      ...result 
    });
  } catch (error) {
    res.status(400).json({ 
      ok: false, 
      msg: error.message 
    });
  }
};

const recover = async (req, res) => {
  const { correo } = req.body;

  try {
    const result = await recoverPassword({ correo }, { userRepository, emailService });
    res.status(200).json({ 
      ok: true, 
      msg: result.message 
    });
  } catch (error) {
    res.status(400).json({ 
      ok: false, 
      msg: error.message 
    });
  }
};

const reset = async (req, res) => {
  const { correo, codigo, newPassword } = req.body;

  try {
    const result = await resetPassword({ correo, codigo, newPassword }, { userRepository, hashService });
    res.status(200).json({ 
      ok: true, 
      msg: result.message 
    });
  } catch (error) {
    res.status(400).json({ 
      ok: false, 
      msg: error.message 
    });
  }
};

module.exports = {
  register,
  login,
  recover,
  reset
};
