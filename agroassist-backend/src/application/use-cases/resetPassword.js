const resetPassword = async ({ correo, codigo, newPassword }, { userRepository, hashService }) => {
  const user = await userRepository.findByCorreoAndToken(correo, codigo);
  if (!user) {
    throw new Error('Código inválido o expirado');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    throw new Error(
      'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
    );
  }

  const hashedPassword = await hashService.hashPassword(newPassword);
  await userRepository.resetPassword(user.id, hashedPassword);

  return { 
    message: 'Tu contraseña fue cambiada exitosamente.'
  };
};

module.exports = resetPassword;
