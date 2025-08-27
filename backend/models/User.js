const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const result = await query(sql, [name, email, hashedPassword]);
    return result.insertId;
  }

  static async findByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const results = await query(sql, [email]);
  return results[0][0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;