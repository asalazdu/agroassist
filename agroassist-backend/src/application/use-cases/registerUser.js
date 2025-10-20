const User = require('../../domain/entities/User');

const registerUser = async ({ 
  nombre_completo, correo, 
  contrasena 
}, 
{ 
  userRepository, 
  hashService 
}) => {

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
  if (!passwordRegex.test(contrasena)) {
    throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.');
  }

  const exists = await userRepository.existsByEmail(correo);
  if (exists) {
    throw new Error('Ya existe un registro con el correo ingresado');
  }

  const hashedPassword = await hashService.hashPassword(contrasena);

  const newUser = new User({ 
    nombre_completo, correo, 
    contrasena: hashedPassword 
  });

  const createdUser = await userRepository.createUser(newUser);

  return { 
    message: 'Usuario registrado exitosamente',
    user: createdUser
  };
};

module.exports = registerUser;
