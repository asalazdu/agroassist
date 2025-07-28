require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

const sendRecoveryEmail = async (toEmail, token) => {
  try {
    await transporter.sendMail({
      from: '"AgroAssist Soporte" <no-reply@agroassist.com>',
      to: toEmail,
      subject: 'Recuperación de contraseña - AgroAssist',
      text: `Tu código de recuperación es: ${token}`,
      html: `
        <p>Hola, has solicitado recuperar tu contraseña.</p>
        <p>Usa este código en tu aplicación:</p>
        <h2>${token}</h2>
        <p>Este código es válido por 15 minutos.</p>
        <p>Si no fuiste tú, ignora este mensaje.</p>
      `
    });

    console.log(`Correo enviado a ${toEmail}`);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw new Error('No se pudo enviar el correo de recuperación.');
  }
};

module.exports = {
  sendRecoveryEmail
};
