const mariadb = require('mariadb');
// Cargar .env específico del backend (evita que al ejecutar desde la raíz no se encuentre)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 5,
  // Opciones adicionales para mejor manejo de resultados
  metaAsArray: true,  // Forzar metadatos como array
  rowsAsArray: false, // Asegurar que rows sean objetos
  dateStrings: true   // Mejor manejo de fechas
});

const connect = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Conexión a DB verificada');
  } finally {
    if (conn) conn.release();
  }
};

const query = async (sql, params) => {
  let conn;
  try {
    conn = await pool.getConnection();
    return await conn.query(sql, params);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { connect, query };