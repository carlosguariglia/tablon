const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

class UserRepository {
  async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const result = await query(sql, [name, email, hashedPassword]);
    return result.insertId;
  }

  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0][0];
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0][0];
  }

  async findAll() {
    const sql = 'SELECT * FROM users';
    const results = await query(sql);
    return results[0];
  }

  async update(id, { name, email, password, is_admin }) {
    let hashedPassword = password;
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Mantener la contraseña existente si no se proporciona una nueva
      const user = await this.findById(id);
      hashedPassword = user.password;
    }
    const sql = 'UPDATE users SET name = ?, email = ?, password = ?, is_admin = ? WHERE id = ?';
    await query(sql, [name, email, hashedPassword, is_admin, id]);
    return true;
  }

  async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = new UserRepository();
