/**
 * Server.js - Punto de entrada principal del backend
 * 
 * Configura y arranca el servidor Express con:
 * - CORS configurado de forma segura
 * - Rate limiting para prevenir abuso
 * - Rutas API REST organizadas por funcionalidad
 * - Servicio de archivos estáticos para el frontend
 * 
 * Estructura de rutas:
 * - /api/auth - Autenticación (login, register)
 * - /api/anuncios - CRUD de anuncios/eventos
 * - /api/artistas - Vista pública de artistas
 * - /api/admin/artistas - Gestión de artistas (admin)
 * - /api/artist-requests - Sugerencias de usuarios
 * - /api/admin/artist-requests - Gestión de sugerencias (admin)
 * - /api/audit - Auditoría (admin)
 * - /api/notifications - Notificaciones de usuarios
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const anuncioRoutes = require('./routes/anuncioRoutes');

const app = express();

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Permite que el frontend haga requests al backend de forma segura
 */
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

/**
 * Rate Limiting - Protección contra abuso y ataques
 * 
 * Implementa dos niveles de rate limiting:
 * 
 * 1. General (generalLimiter):
 *    - 100 requests por IP cada 15 minutos
 *    - Aplica a todas las rutas del servidor
 *    - Previene DDoS y uso excesivo
 * 
 * 2. Autenticación (authLimiter):
 *    - 5 intentos de login/registro por IP cada 15 minutos
 *    - Más restrictivo para prevenir brute force attacks
 *    - Solo aplica a rutas de /api/auth
 * 
 * Nota: También existe rate limiting a nivel de usuario para artist-requests
 * (3 sugerencias por usuario cada 24h) implementado en el controller
 */

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

// Servir imagenes y iconos ubicados en la carpeta raíz `iconos_redes_sociales`
app.use('/iconos_redes_sociales', express.static(path.join(__dirname, '..', 'iconos_redes_sociales')));

// Rutas API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/anuncios', anuncioRoutes);
const auditRoutes = require('./routes/auditRoutes');
app.use('/api/audit', auditRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const artistaRoutes = require('./routes/artistaRoutes');
app.use('/api/artistas', artistaRoutes);
const artistAdminRoutes = require('./routes/artistAdminRoutes');
app.use('/api/admin/artistas', artistAdminRoutes);
const artistRequestRoutes = require('./routes/artistRequestRoutes');
app.use('/api/artist-requests', artistRequestRoutes);
const adminArtistRequestRoutes = require('./routes/adminArtistRequestRoutes');
app.use('/api/admin/artist-requests', adminArtistRequestRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor funcionando en http://localhost:${PORT}`);
  console.log(`📌 Rutas disponibles:`);
  console.log(`   - Frontend: /, /login, /register, /welcome`);
  console.log(`   - API: /api/auth/register, /api/auth/login\n`);
});



// Manejo de preflight para todas las rutas
app.options('*', cors(corsOptions));

