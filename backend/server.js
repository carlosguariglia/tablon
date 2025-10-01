require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const anuncioRoutes = require('./routes/anuncioRoutes');

const app = express();

// Configuración de CORS segura
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP cada 15 minutos
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(generalLimiter);

// Rate limiting específico para autenticación (más restrictivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login/registro por IP cada 15 minutos
  message: {
    error: 'Demasiados intentos de autenticación, intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(express.json());

// Conexión a la base de datos
db.connect()
  .then(() => console.log('✅ Conectado a MariaDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/anuncios', anuncioRoutes);
const auditRoutes = require('./routes/auditRoutes');
app.use('/api/audit', auditRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor funcionando en http://localhost:${PORT}`);
  console.log(`📌 Rutas disponibles:`);
  console.log(`   - Frontend: /, /login, /register, /welcome`);
  console.log(`   - API: /api/auth/register, /api/auth/login\n`);
});



// Manejo de preflight para todas las rutas
app.options('*', cors(corsOptions));

