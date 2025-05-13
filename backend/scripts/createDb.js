const { query } = require('../config/db');
require('dotenv').config();

async function createDatabase() {
  try {
    // Crear tabla de usuarios (igual a tu versión actual)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla users creada exitosamente');

    // Crear tabla de anuncios/eventos (versión corregida)
    await query(`
      CREATE TABLE IF NOT EXISTS anuncios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        participantes TEXT,
        descripcion TEXT,
        fecha DATETIME NOT NULL,
        lugar VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2),
        categoria ENUM('Concierto', 'Presentacion', 'Anuncio', 'Otros') NOT NULL DEFAULT 'Otros',
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_fecha (fecha),
        INDEX idx_categoria (categoria)
      )
    `);
    console.log('✅ Tabla anuncios creada exitosamente');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear las tablas:', error);
    process.exit(1);
  }
}

createDatabase();