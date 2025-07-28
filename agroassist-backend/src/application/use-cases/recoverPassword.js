const recoverPassword = async ({ correo }, { userRepository, emailService }) => {
  const user = await userRepository.findByEmail(correo);
  if (!user) {
    throw new Error('Correo no registrado');
  }

  const token = Math.floor(100000 + Math.random() * 900000);
  const expiracion = new Date(Date.now() + 15 * 60 * 1000);

  await userRepository.updateResetToken(correo, token, expiracion);
  await emailService.sendRecoveryEmail(correo, token);

  return { message: 'Correo de recuperación enviado' };
};

module.exports = recoverPassword;
