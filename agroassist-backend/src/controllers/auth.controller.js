const bcrypt = require('bcrypt');
const db = require('../config/db');

const register = async (req, res) => {
  const { nombre_completo, correo, contrasena } = req.body;

  try {
    console.log("BODY:", req.body);
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    await db.promise().query(
      'INSERT INTO usuarios (nombre_completo, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)',
      [nombre_completo, correo, hashedPassword, 2]
    );

    res.status(201).json({ ok: true, msg: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error al registrar usuario', details: error.message });
  }
};

module.exports = {
  register
};
