require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./infrastructure/database/mysql/db');
const authRoutes = require('./interfaces/routes/auth.routes');
const pestRoutes = require('./interfaces/routes/pest.routes');
const weatherRoutes = require('./interfaces/routes/weather.routes');

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pests', pestRoutes);
app.use('/api/weather', weatherRoutes);

// Endpoint de prueba de base de datos
app.get('/ping', (req, res) => {
  db.query('SELECT 1 + 1 AS resultado', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
    res.json({ mensaje: 'Conexión exitosa', resultado: results[0].resultado });
  });
});

// Endpoint de información de APIs
app.get('/api/info', (req, res) => {
  res.json({
    message: 'AgroAssist API - Sistema de información agrícola',
    version: '1.0.0',
    features: {
      authentication: 'Sistema de autenticación JWT',
      pests: 'Información de plagas usando APIs gratuitas',
      weather: 'Información meteorológica para agricultura'
    },
    freeAPIs: {
      gbif: 'Base de datos global de biodiversidad',
      iNaturalist: 'Identificación de especies',
      usda: 'Datos agrícolas del USDA'
    },
    endpoints: {
      auth: '/api/auth',
      pests: '/api/pests',
      weather: '/api/weather'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('APIs gratuitas disponibles: GBIF, iNaturalist, USDA');
  console.log('Endpoint de prueba: /api/pests/test');
});
