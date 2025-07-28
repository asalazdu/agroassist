const loginUser = async ({ correo, contrasena }, { userRepository, hashService, tokenService }) => {
  const user = await userRepository.findByEmail(correo);
  if (!user) {
    throw new Error('El usuario no existe');
  }

  const now = new Date();
  if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > now) {
    throw new Error('Cuenta bloqueada temporalmente. Intente más tarde.');
  }

  const passwordMatch = await hashService.comparePassword(contrasena, user.contrasena);
  if (!passwordMatch) {
    const nuevosIntentos = (user.intentos_fallidos || 0) + 1;

    if (nuevosIntentos >= 3) {
      const bloqueadoHasta = new Date(now.getTime() + 15 * 60000);
      await userRepository.lockAccount(user.id, bloqueadoHasta);
      throw new Error('Cuenta bloqueada por múltiples intentos fallidos. Intente en 15 minutos.');
    } else {
      await userRepository.updateLoginAttempts(user.id, nuevosIntentos);
      throw new Error(`Contraseña incorrecta. Te quedan ${nuevosIntentos} intentos.`);
    }
  }

  await userRepository.resetLoginAttempts(user.id);

  const token = tokenService.generateJWT(user.id);

  return {
    message: 'Inicio de sesión exitoso',
    usuario: {
      id: user.id,
      nombre: user.nombre_completo,
      correo: user.correo,
      rol: user.id_rol
    },
    token
  };
};

module.exports = loginUser;