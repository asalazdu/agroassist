const { response } = require('express');
const tokenService = require('../../infrastructure/shared/utils/token');
// Cambiado a Supabase (PostgreSQL)
const userRepository = require('../../infrastructure/database/supabase/userRepository');

/**
 * Middleware para validar JWT y autenticar usuario
 */
const validateJWT = async (req, res = response, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'No se proporcionó token de autorización',
        help: 'Incluye el header: Authorization: Bearer <tu_token>'
      });
    }

    // Verificar formato Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
        error: 'El token debe tener formato: Bearer <token>',
        help: 'Incluye el header: Authorization: Bearer <tu_token>'
      });
    }

    // Extraer el token
    const token = authHeader.substring(7); // Remover 'Bearer '

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token vacío',
        error: 'No se proporcionó token después de Bearer'
      });
    }

    // Verificar el token
    const secret = process.env.JWT_SECRET || process.env.SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor',
        error: 'JWT secret no configurado'
      });
    }

    let userId;
    try {
      userId = await tokenService.verifyToken(token, secret);
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
        error: tokenError.message,
        help: 'Inicia sesión nuevamente para obtener un token válido'
      });
    }

    // Verificar que el usuario existe y está activo
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'El usuario asociado al token no existe'
      });
    }

    // Verificar si la cuenta está bloqueada
    const now = new Date();
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > now) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta bloqueada temporalmente',
        error: 'La cuenta está bloqueada. Intente más tarde.'
      });
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user.id,
      nombre: user.nombre_completo,
      correo: user.correo,
      rol: user.id_rol
    };
    
    // También agregar uid para compatibilidad con controladores
    req.uid = user.id;

    // Continuar con el siguiente middleware/controlador
    next();

  } catch (error) {
    console.error('Error en validateJWT:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al validar token de autenticación'
    });
  }
};

/**
 * Middleware opcional para validar JWT (no falla si no hay token)
 */
const optionalJWT = async (req, res = response, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No hay token, continuar sin usuario autenticado
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    if (!token) {
      req.user = null;
      return next();
    }

    const secret = process.env.JWT_SECRET || process.env.SECRET;
    if (!secret) {
      req.user = null;
      return next();
    }

    try {
      const userId = await tokenService.verifyToken(token, secret);
      const user = await userRepository.findById(userId);
      
      if (user) {
        req.user = {
          id: user.id,
          nombre: user.nombre_completo,
          correo: user.correo,
          rol: user.id_rol
        };
      } else {
        req.user = null;
      }
    } catch (tokenError) {
      req.user = null;
    }

    next();

  } catch (error) {
    console.error('Error en optionalJWT:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  validateJWT,
  optionalJWT
};
