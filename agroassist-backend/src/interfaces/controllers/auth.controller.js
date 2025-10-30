const registerUser = require('../../application/use-cases/registerUser');
const loginUser = require('../../application/use-cases/loginUser');
const recoverPassword = require('../../application/use-cases/recoverPassword');
const resetPassword = require('../../application/use-cases/resetPassword');
const updateUserProfile = require('../../application/use-cases/updateUserProfile');

// Cambiado a Supabase (PostgreSQL)
const userRepository = require('../../infrastructure/database/supabase/userRepository');
const hashService = require('../../infrastructure/services/hash.service');
const emailService = require('../../infrastructure/services/emailService');
const tokenService = require('../../infrastructure/shared/utils/token');
const cacheService = require('../../infrastructure/services/cacheService');

const register = async (req, res) => {
  const { nombre_completo, correo, contrasena, telefono, ubicacion, tamaño_finca } = req.body;

  try {
    // Registrar usuario
    const result = await registerUser(
      { nombre_completo, correo, contrasena, telefono, ubicacion, tamaño_finca }, 
      { userRepository, hashService }
    );
    
    // Generar token JWT para auto-login después del registro
    const token = tokenService.generateToken(result.user.id);
    
    // Retornar usuario y token (igual que en login)
    res.status(201).json({ 
      ok: true, 
      msg: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.user.id,
        nombre: result.user.nombre_completo,
        correo: result.user.correo,
        rol: result.user.id_rol
      }
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

  // DEBUG: Ver qué datos recibe el backend
  console.log('📥 LOGIN REQUEST:');
  console.log('  Body completo:', JSON.stringify(req.body, null, 2));
  console.log('  Correo:', correo);
  console.log('  Contraseña recibida:', contrasena ? '***' + contrasena.slice(-3) : 'undefined');

  try {
    const result = await loginUser({ correo, contrasena }, { userRepository, hashService, tokenService });
    console.log('✅ LOGIN EXITOSO:', correo);
    res.status(200).json({ 
      ok: true, 
      msg: result.message, 
      ...result 
    });
  } catch (error) {
    console.log('❌ LOGIN FALLIDO:', error.message);
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

const getProfile = async (req, res) => {
  try {
    // El ID del usuario viene del JWT (agregado por el middleware validateJWT)
    const userId = req.uid;

    console.log('🔍 Obteniendo perfil del usuario ID:', userId);

    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    // Retornar datos del usuario (sin la contraseña)
    res.status(200).json({
      ok: true,
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        telefono: user.telefono || '',
        ubicacion: user.ubicacion || '',
        tamaño_finca: user.tamaño_finca || '',
        id_rol: user.id_rol,
        activo: user.activo,
        fecha_creacion: user.fecha_creacion
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener perfil del usuario'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    // El ID del usuario viene del JWT (agregado por el middleware validateJWT)
    const userId = req.uid;
    const profileData = req.body;

    console.log('📝 Actualizando perfil usuario ID:', userId);
    console.log('   Datos:', JSON.stringify(profileData, null, 2));

    // Verificar si cambió la ubicación
    const ubicacionCambiada = profileData.ubicacion !== undefined || 
                              profileData.location !== undefined;

    const updatedUser = await updateUserProfile(userId, profileData);

    // Si cambió la ubicación, invalidar todo el caché relacionado con clima
    if (ubicacionCambiada) {
      console.log('📍 Ubicación actualizada - Invalidando caché de clima y alertas');
      cacheService.invalidateUserCache(userId);
    }

    res.status(200).json({
      ok: true,
      msg: 'Perfil actualizado correctamente',
      user: updatedUser,
      cacheInvalidated: ubicacionCambiada // Informar al frontend que debe recargar datos
    });
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error.message);
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
  reset,
  getProfile,
  updateProfile
};
