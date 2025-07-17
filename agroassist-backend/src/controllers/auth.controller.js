const bcrypt = require('bcrypt');
const db = require('../config/db');
const {generateJWT} = require('../utils/token')

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


module.exports = {
  register,
  login
};
