const userRepository = require('../../infrastructure/database/supabase/userRepository');

/**
 * Caso de uso: Actualizar perfil de usuario
 * Permite actualizar datos del perfil (nombre, teléfono, ubicación, tamaño de finca)
 * NO permite actualizar email ni contraseña por seguridad
 */
const updateUserProfile = async (userId, profileData) => {
  try {
    // Validar que el usuario existe
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Filtrar solo los campos permitidos
    const allowedFields = {
      nombre_completo: profileData.nombre_completo,
      telefono: profileData.telefono,
      ubicacion: profileData.ubicacion,
      tamaño_finca: profileData.tamaño_finca
    };

    // Eliminar campos undefined
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    // Actualizar el perfil
    const updatedUser = await userRepository.updateUserProfile(userId, allowedFields);

    // Retornar usuario sin información sensible
    const { contrasena, reset_token, reset_token_expiration, ...userWithoutSensitiveData } = updatedUser;
    
    return userWithoutSensitiveData;
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    throw error;
  }
};

module.exports = updateUserProfile;
