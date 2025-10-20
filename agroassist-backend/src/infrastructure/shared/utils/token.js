const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || process.env.SECRET;

if (!secret) {
  console.error('⚠️  ADVERTENCIA: JWT_SECRET no está definido en las variables de entorno');
}

const generateJWT = (userId) => {
    const token = jwt.sign({ id: userId }, secret, {
         expiresIn: process.env.JWT_EXPIRES_IN || '1h'
         });
    return token;
  };

const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (error, decoded) => {
            if (error) {
                reject(new Error(
                    'Token invalido'
                ));
            }
            resolve(decoded.id);
        });
    });
};

module.exports = {
    generateJWT,
    verifyToken
  };