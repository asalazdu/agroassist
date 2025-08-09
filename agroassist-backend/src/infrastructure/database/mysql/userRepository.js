const db = require('./db');

const findByEmail = async (correo) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM usuarios WHERE correo = ?',
    [correo]
  );
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0];
};

const existsByEmail = async (correo) => {
  const [rows] = await db.promise().query(
    'SELECT id FROM usuarios WHERE correo = ?',
    [correo]
  );
  return rows.length > 0;
};

const createUser = async ({ 
  nombre_completo, 
  correo, 
  contrasena 
}) => {
  await db.promise().query(
    'INSERT INTO usuarios (nombre_completo, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)',
    [nombre_completo, 
      correo, 
      contrasena, 
      2
    ]
  );
};

const updateResetToken = async (correo, token, expiracion) => {
  await db.promise().query(
    'UPDATE usuarios SET reset_token = ?, reset_token_expiration = ? WHERE correo = ?',
    [token, 
     expiracion, 
     correo
    ]

  );
};

const findByCorreoAndToken = async (correo, codigo) => {
  const [rows] = await db.promise().query(
    `SELECT * FROM usuarios 
     WHERE correo = ? AND reset_token = ? AND reset_token_expiration > NOW()`,
    [correo, 
     codigo
    ]
  );
  return rows[0];
};

const resetPassword = async (id, newPassword) => {
  await db.promise().query(`
    UPDATE usuarios SET 
      contrasena = ?, 
      reset_token = NULL, 
      reset_token_expiration = NULL 
    WHERE id = ?`,
    [newPassword, id]
  );
};

const updateLoginAttempts = async (id, intentos) => {
  await db.promise().query(
    'UPDATE usuarios SET intentos_fallidos = ? WHERE id = ?',
    [intentos, id]
  );
};

const lockAccount = async (id, bloqueadoHasta) => {
  await db.promise().query(
    'UPDATE usuarios SET bloqueado_hasta = ?, intentos_fallidos = 0 WHERE id = ?',
    [bloqueadoHasta, id]
  );
};

const resetLoginAttempts = async (id) => {
  await db.promise().query(
    'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?',
    [id]
  );
};


module.exports = {
  findByEmail,
  findById,
  existsByEmail,
  createUser,
  updateResetToken,
  findByCorreoAndToken,
  resetPassword,
  updateLoginAttempts,
  lockAccount,
  resetLoginAttempts
};
