const supabase = require('./supabaseClient');

/**
 * Repositorio de usuarios usando Supabase (PostgreSQL)
 * Reemplaza el repositorio de SQLite manteniendo la misma interfaz
 */

/**
 * Buscar usuario por email
 * @param {string} correo - Email del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
const findByEmail = async (correo) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el usuario
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en findByEmail:', error);
    throw error;
  }
};

/**
 * Buscar usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
const findById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en findById:', error);
    throw error;
  }
};

/**
 * Verificar si existe un usuario con ese email
 * @param {string} correo - Email a verificar
 * @returns {Promise<boolean>} true si existe, false si no
 */
const existsByEmail = async (correo) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('correo', correo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error en existsByEmail:', error);
    throw error;
  }
};

/**
 * Crear nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.nombre_completo - Nombre completo
 * @param {string} userData.correo - Email
 * @param {string} userData.contrasena - Contraseña hasheada
 * @returns {Promise<Object>} Usuario creado
 */
const createUser = async ({ nombre_completo, correo, contrasena, telefono, ubicacion, tamaño_finca }) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre_completo,
          correo,
          contrasena,
          telefono: telefono || null,
          ubicacion: ubicacion || null,
          tamaño_finca: tamaño_finca || null,
          id_rol: 2 // Usuario regular por defecto
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en createUser:', error);
    throw error;
  }
};

/**
 * Actualizar token de recuperación de contraseña
 * @param {string} correo - Email del usuario
 * @param {string} token - Token de recuperación
 * @param {Date} expiracion - Fecha de expiración
 */
const updateResetToken = async (correo, token, expiracion) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        reset_token: token,
        reset_token_expiration: expiracion
      })
      .eq('correo', correo);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error en updateResetToken:', error);
    throw error;
  }
};

/**
 * Buscar usuario por email y token de recuperación
 * @param {string} correo - Email del usuario
 * @param {string} codigo - Código de recuperación
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
const findByCorreoAndToken = async (correo, codigo) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .eq('reset_token', codigo)
      .gt('reset_token_expiration', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en findByCorreoAndToken:', error);
    throw error;
  }
};

/**
 * Restablecer contraseña
 * @param {number} id - ID del usuario
 * @param {string} newPassword - Nueva contraseña hasheada
 */
const resetPassword = async (id, newPassword) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        contrasena: newPassword,
        reset_token: null,
        reset_token_expiration: null
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error en resetPassword:', error);
    throw error;
  }
};

/**
 * Actualizar intentos fallidos de login
 * @param {number} id - ID del usuario
 * @param {number} intentos - Número de intentos fallidos
 */
const updateLoginAttempts = async (id, intentos) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ intentos_fallidos: intentos })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error en updateLoginAttempts:', error);
    throw error;
  }
};

/**
 * Bloquear cuenta de usuario
 * @param {number} id - ID del usuario
 * @param {Date} bloqueadoHasta - Fecha hasta cuando está bloqueado
 */
const lockAccount = async (id, bloqueadoHasta) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        bloqueado_hasta: bloqueadoHasta,
        intentos_fallidos: 0
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error en lockAccount:', error);
    throw error;
  }
};

/**
 * Reiniciar intentos de login
 * @param {number} id - ID del usuario
 */
const resetLoginAttempts = async (id) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        intentos_fallidos: 0,
        bloqueado_hasta: null
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error en resetLoginAttempts:', error);
    throw error;
  }
};

/**
 * Actualizar último acceso
 * @param {number} id - ID del usuario
 */
const updateLastAccess = async (id) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error en updateLastAccess:', error);
    throw error;
  }
};

/**
 * Actualizar perfil de usuario
 * @param {number} id - ID del usuario
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
const updateUserProfile = async (id, { nombre_completo, telefono, ubicacion, tamaño_finca }) => {
  try {
    const updates = {};

    if (nombre_completo !== undefined) updates.nombre_completo = nombre_completo;
    if (telefono !== undefined) updates.telefono = telefono;
    if (ubicacion !== undefined) updates.ubicacion = ubicacion;
    if (tamaño_finca !== undefined) updates.tamaño_finca = tamaño_finca;

    if (Object.keys(updates).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    throw error;
  }
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
  resetLoginAttempts,
  updateLastAccess,
  updateUserProfile
};
