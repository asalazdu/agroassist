require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./config/db');
const authRoutes = require('./routes/auth.routes');

app.use(express.json());
app.use('/api/auth', authRoutes);

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
