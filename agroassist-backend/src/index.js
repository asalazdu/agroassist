require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./infrastructure/database/mysql/db');
const authRoutes = require('./interfaces/routes/auth.routes');
const weatherRoutes = require('./interfaces/routes/weather.routes');
const pestRoutes = require('./interfaces/routes/pest.routes');
const chatbotRoutes = require('./interfaces/routes/chatbot.routes');


app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/pests', pestRoutes);
app.use('/api/chatbot', chatbotRoutes);

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
        descripcion: 'Pronóstico del clima para los próximos 3 días (requiere autenticación)',
        autenticacion: 'Token JWT requerido',
        endpoints: [
          'GET /api/weather/help (público)',
          'GET /api/weather/forecast?city=nombre&country=codigo (protegido)',
          'GET /api/weather/coordinates?lat=latitud&lon=longitud (protegido)'
        ]
      },
      plagas: {
        base_url: '/api/pests',
        descripcion: 'Información sobre plagas agrícolas por cultivo (requiere autenticación)',
        autenticacion: 'Token JWT requerido',
        endpoints: [
          'GET /api/pests/help (público)',
          'GET /api/pests/crops (protegido)',
          'GET /api/pests/crop/:cultivo (protegido)',
          'POST /api/pests/symptoms (protegido)'
        ]
      },
      chatbot: {
        base_url: '/api/chatbot',
        descripcion: 'Asistente agrícola inteligente con IA para recomendaciones personalizadas (requiere autenticación)',
        autenticacion: 'Token JWT requerido',
        inteligencia_artificial: 'Utiliza OpenAI para recomendaciones avanzadas (requiere OPENAI_API_KEY)',
        endpoints: [
          'GET /api/chatbot/capabilities (público)',
          'GET /api/chatbot/health (público)',
          'POST /api/chatbot/message (protegido)',
          'GET /api/chatbot/suggestions (protegido)',
          'GET /api/chatbot/history (protegido)',
          'POST /api/chatbot/feedback (protegido)'
        ]
      }
    },
    configuracion_requerida: {
      autenticacion: 'Todas las APIs principales requieren login previo y token JWT',
      clima: 'Necesitas configurar WEATHER_API_KEY en el archivo .env (obtén una clave gratuita en https://openweathermap.org/api)',
      chatbot_ia: 'Para funcionalidad completa de IA, configura OPENAI_API_KEY en el archivo .env (obtén una clave en https://platform.openai.com/)',
      base_datos: 'Configurar las variables de conexión a MySQL en el archivo .env'
    },
    como_usar: {
      paso_1: 'Registrarse con POST /api/auth/register',
      paso_2: 'Iniciar sesión con POST /api/auth/login para obtener token',
      paso_3: 'Incluir token en header: Authorization: Bearer <tu_token>',
      paso_4: 'Usar las APIs de clima, plagas y chatbot con el token',
      paso_5: 'Para el chatbot: envía mensajes a POST /api/chatbot/message'
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
