require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const anuncioRoutes = require('./routes/anuncioRoutes');

const app = express();

// Configuración básica
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
db.connect()
  .then(() => console.log('✅ Conectado a MariaDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/anuncios', anuncioRoutes);

// Ruta SPA - Maneja todas las rutas no-API
app.get(['/', '/login', '/register', '/welcome'], (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

//app.get('*', (req, res) => {
//  res.sendFile(path.join(__dirname, '../frontend/index.html'));
//});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor funcionando en http://localhost:${PORT}`);
  console.log(`📌 Rutas disponibles:`);
  console.log(`   - Frontend: /, /login, /register, /welcome`);
  console.log(`   - API: /api/auth/register, /api/auth/login\n`);
});
