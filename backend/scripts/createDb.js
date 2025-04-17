const { query } = require('../config/db');
require('dotenv').config();

async function createDatabase() {
  try {
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error);
    process.exit(1);
  }
}

createDatabase();