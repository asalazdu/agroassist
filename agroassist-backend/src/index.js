require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./infrastructure/database/mysql/db');
const authRoutes = require('./interfaces/routes/auth.routes');
const weatherRoutes = require('./interfaces/routes/weather.routes');
const pestRoutes = require('./interfaces/routes/pest.routes');


app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/pests', pestRoutes);

// Ruta principal de información
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'AgroAssist API - Plataforma de Asistencia Agrícola',
    version: '1.0.0',
    descripcion: 'API completa para gestión agrícola con autenticación, información del clima y control de plagas',
    apis_disponibles: {
      autenticacion: {
        base_url: '/api/auth',
        descripcion: 'Gestión de usuarios, login, registro y recuperación de contraseñas',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login', 
          'POST /api/auth/recover-password',
          'POST /api/auth/reset-password'
        ]
      },
      clima: {
        base_url: '/api/weather',
        descripcion: 'Pronóstico del clima para los próximos 3 días',
        endpoints: [
          'GET /api/weather/help',
          'GET /api/weather/forecast?city=nombre&country=codigo',
          'GET /api/weather/coordinates?lat=latitud&lon=longitud'
        ]
      },
      plagas: {
        base_url: '/api/pests',
        descripcion: 'Información sobre plagas agrícolas por cultivo',
        endpoints: [
          'GET /api/pests/help',
          'GET /api/pests/crops',
          'GET /api/pests/crop/:cultivo',
          'POST /api/pests/symptoms'
        ]
      }
    },
    configuracion_requerida: {
      clima: 'Necesitas configurar WEATHER_API_KEY en el archivo .env (obtén una clave gratuita en https://openweathermap.org/api)',
      base_datos: 'Configurar las variables de conexión a MySQL en el archivo .env'
    },
    soporte: 'Para más información visita los endpoints /help de cada API'
  });
});


console.log("DB_USER:", process.env.DB_USER);
app.get('/ping', (req, res) => {
  db.query('SELECT 1 + 1 AS resultado', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
    res.json({ mensaje: 'Conexión exitosa', resultado: results[0].resultado });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
