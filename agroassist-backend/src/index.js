require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./infrastructure/database/mysql/db');
const authRoutes = require('./interfaces/routes/auth.routes');
const pestRoutes = require('./interfaces/routes/pest.routes');
const weatherRoutes = require('./interfaces/routes/weather.routes');
const marketPricesRoutes = require('./interfaces/routes/marketPrices.routes');
const colombianPestRoutes = require('./interfaces/routes/colombianPest.routes');

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pests', pestRoutes);
app.use('/api/plagas', colombianPestRoutes); // Rutas en español para Colombia
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketPricesRoutes);

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
    version: '2.0.0',
    idiomas: ['Inglés (APIs internacionales)', 'Español (Sistema colombiano)'],
    features: {
      authentication: 'Sistema de autenticación JWT',
      pests: 'Información de plagas usando APIs gratuitas (inglés)',
      plagas: 'Información de plagas específica para Colombia (español)',
      weather: 'Información meteorológica para agricultura',
      marketPrices: 'Precios de mercado agrícola colombiano'
    },
    freeAPIs: {
      gbif: 'Base de datos global de biodiversidad',
      iNaturalist: 'Identificación de especies',
      usda: 'Datos agrícolas del USDA',
      colombia: 'Base de datos especializada para Colombia',
      dane: 'Sistema de precios SIPSA (Colombia)',
      agronet: 'Red agrícola colombiana'
    },
    endpoints: {
      auth: '/api/auth',
      pests: '/api/pests (inglés)',
      plagas: '/api/plagas (español - Colombia)',
      weather: '/api/weather',
      market: '/api/market'
    },
    new_features: {
      colombian_focus: 'Sistema especializado para agricultura colombiana',
      spanish_responses: 'Todas las respuestas en español',
      local_recommendations: 'Recomendaciones adaptadas a Colombia'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('APIs gratuitas disponibles: GBIF, iNaturalist, USDA');
  console.log('Sistema colombiano: /api/plagas (español)');
  console.log('Sistema internacional: /api/pests (inglés)');
  console.log('Endpoint de prueba Colombia: /api/plagas/test-colombia');
  console.log('Endpoint de prueba internacional: /api/pests/test');
});
