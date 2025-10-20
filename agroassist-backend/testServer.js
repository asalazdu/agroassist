// Script de prueba simple del backend
console.log('🚀 Iniciando servidor de prueba...');

const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Ruta de prueba simple
app.get('/test', (req, res) => {
  console.log('✅ Recibida petición GET /test');
  res.json({ message: 'Backend funcionando!' });
});

app.post('/test-login', (req, res) => {
  console.log('✅ Recibida petición POST /test-login');
  console.log('Body:', req.body);
  res.json({ message: 'Login test OK', body: req.body });
});

// Endpoint compatible con el frontend
app.post('/api/auth/login', (req, res) => {
  console.log('\n📥 PETICIÓN DE LOGIN RECIBIDA');
  console.log('  Hora:', new Date().toLocaleTimeString());
  console.log('  Headers:', JSON.stringify(req.headers, null, 2));
  console.log('  Body:', JSON.stringify(req.body, null, 2));
  
  const { correo, contrasena } = req.body;
  
  if (!correo || !contrasena) {
    console.log('❌ Faltan campos requeridos');
    return res.status(400).json({ 
      ok: false, 
      msg: 'Correo y contraseña son requeridos'
    });
  }
  
  // Simular login exitoso
  console.log('✅ Simulando login exitoso');
  res.json({
    ok: true,
    msg: 'Login exitoso (servidor de prueba)',
    usuario: {
      id: 1,
      nombre: 'Usuario Test',
      correo: correo,
      rol: 2
    },
    token: 'test_jwt_token_12345'
  });
});

const PORT = 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor de PRUEBA corriendo en http://localhost:${PORT}`);
  console.log(`✅ Accesible desde Android en http://10.0.2.2:${PORT}`);
  console.log('\n⏳ Esperando peticiones...\n');
});

// Evitar que el proceso termine
server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  Servidor detenido manualmente');
  process.exit(0);
});

// Mantener el proceso vivo
setInterval(() => {
  // Este intervalo mantiene el evento loop activo
}, 1000);
