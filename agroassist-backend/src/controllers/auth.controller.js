const bcrypt = require('bcrypt');
const db = require('../config/db');
const {generateJWT} = require('../utils/token')
const {sendRecoveryEmail} = require('../services/emailService')

const register = async (req, res) => {
  const { nombre_completo, correo, contrasena } = req.body;

  try {
    
    const [existingUser] = await db.promise().query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'Ya existe un registro con el correo ingresado'
      });
    }

    
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    await db.promise().query(
      'INSERT INTO usuarios (nombre_completo, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)',
      [nombre_completo, correo, hashedPassword, 2]
    );

    res.status(201).json({ ok: true, msg: 'Usuario registrado exitosamente' });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al registrar usuario',
      details: error.message
    });
  }
};

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM usuarios WHERE correo = ?', 
      [correo]
    );

    if (rows.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'El usuario no existe' 
      });
    }

    const usuario = rows[0];

    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'Contraseña incorrecta' 
      });
    }

    const token = await generateJWT(usuario.id);

    res.status(200).json({
      ok: true,
      msg: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        correo: usuario.correo,
        rol: usuario.id_rol
      },
      token
    });

    
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      msg: 'Error al iniciar sesión', 
      error: error.message 
    });
  }
};

const recoverPassword = async (req, res) => {
  const {correo} = req.body;
   try {
    const [rows] = await db.promise().query(
      'SELECT id FROM usuarios WHERE correo = ?', 
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        ok: false, 
        msg: 'Correo no registrado' 
      });
    }

    const token = Math.floor(100000 + Math.random() * 900000);
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);

    await db.promise().query(
      'UPDATE usuarios SET reset_token = ?, reset_token_expiration = ? WHERE correo = ?',
      [token, expiracion, correo]
    );

    await sendRecoveryEmail(correo, token);

    res.status(200).json({
       ok: true, 
       msg: 'Correo de recuperación enviado' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      ok: false, 
      msg: 'Error al procesar la solicitud' 
    });
  }
};

const resetPassword = async (req, res) => {
  const { correo, codigo, newPassword } = req.body;

  try {
    const [usuarios] = await db.promise().query(`
      SELECT * FROM usuarios 
      WHERE correo = ? AND reset_token = ? AND reset_token_expiration > NOW()
    `, [correo, codigo]);

    if (usuarios.length === 0) {
      return res.status(400).json({
         mensaje: 'Código inválido o expirado' 
        });
    }

    const usuario = usuarios[0];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query(`
      UPDATE usuarios SET 
        contrasena = ?, 
        reset_token = NULL, 
        reset_token_expiration = NULL 
      WHERE id = ?
    `, [hashedPassword, usuario.id]);

    res.json({ 
      mensaje: 'Contraseña actualizada correctamente.' 
    });

  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    res.status(500).json({
       mensaje: "Error del servidor." 
    });
  }
};

module.exports = {
  register,
  login,
  recoverPassword,
  resetPassword
};
