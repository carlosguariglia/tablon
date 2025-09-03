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
        is_admin BOOLEAN DEFAULT FALSE,
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

    // Crear tabla de auditoría
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_name VARCHAR(100),
        user_email VARCHAR(100),
        action VARCHAR(50) NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Tabla audit_logs creada exitosamente');


    // Crear stored procedure para cambiar el rol de admin
    await query(`DROP PROCEDURE IF EXISTS SetUserAdmin;`);
    await query(`
      CREATE PROCEDURE SetUserAdmin(IN userId INT, IN adminValue BOOLEAN)
      BEGIN
        UPDATE users SET is_admin = adminValue WHERE id = userId;
      END
    `);
    console.log('✅ Stored procedure SetUserAdmin creado exitosamente');

    // CRUD de usuarios
    await query(`DROP PROCEDURE IF EXISTS CreateUser;`);
    await query(`
      CREATE PROCEDURE CreateUser(
        IN p_name VARCHAR(100),
        IN p_email VARCHAR(100),
        IN p_password VARCHAR(255),
        IN p_is_admin BOOLEAN
      )
      BEGIN
        INSERT INTO users (name, email, password, is_admin)
        VALUES (p_name, p_email, p_password, p_is_admin);
      END
    `);
    console.log('✅ Stored procedure CreateUser creado exitosamente');

    await query(`DROP PROCEDURE IF EXISTS GetUserById;`);
    await query(`
      CREATE PROCEDURE GetUserById(IN p_id INT)
      BEGIN
        SELECT id, name, email, is_admin, created_at, updated_at
        FROM users WHERE id = p_id;
      END
    `);
    console.log('✅ Stored procedure GetUserById creado exitosamente');

    await query(`DROP PROCEDURE IF EXISTS UpdateUser;`);
    await query(`
      CREATE PROCEDURE UpdateUser(
        IN p_id INT,
        IN p_name VARCHAR(100),
        IN p_email VARCHAR(100),
        IN p_password VARCHAR(255),
        IN p_is_admin BOOLEAN
      )
      BEGIN
        UPDATE users
        SET name = p_name,
            email = p_email,
            password = p_password,
            is_admin = p_is_admin
        WHERE id = p_id;
      END
    `);
    console.log('✅ Stored procedure UpdateUser creado exitosamente');

    await query(`DROP PROCEDURE IF EXISTS DeleteUser;`);
    await query(`
      CREATE PROCEDURE DeleteUser(IN p_id INT)
      BEGIN
        DELETE FROM users WHERE id = p_id;
      END
    `);
    console.log('✅ Stored procedure DeleteUser creado exitosamente');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear las tablas:', error);
    process.exit(1);
  }
}

createDatabase();