const { query } = require('../config/db');

class AnuncioRepository {
  async findAll(filters = {}) {
    let whereClauses = [];
    let params = [];
    const { fecha, desde, hasta, categoria } = filters;
    function normalizeDate(str) {
      if (str && /^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return `${str} 00:00:00`;
      }
      return str;
    }
    if (fecha) whereClauses.push('a.fecha = ?'), params.push(normalizeDate(fecha));
    if (desde) whereClauses.push('a.fecha >= ?'), params.push(normalizeDate(desde));
    if (hasta) whereClauses.push('a.fecha <= ?'), params.push(normalizeDate(hasta));
    if (categoria) whereClauses.push('a.categoria = ?'), params.push(categoria);
    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const sqlQuery = `
      SELECT 
        a.id,
        a.titulo,
        a.descripcion,
        DATE_FORMAT(a.fecha, '%Y-%m-%d %H:%i:%s') as fecha,
        a.lugar,
        a.precio,
        a.categoria,
        a.participantes,
        u.name as autor,
        DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM anuncios a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereSQL}
      ORDER BY a.fecha ASC
    `;
    const [results] = await query(sqlQuery, params);
    return results;
  }

  async findById(id) {
    const sql = 'SELECT * FROM anuncios WHERE id = ?';
    const [rows] = await query(sql, [id]);
    return rows[0];
  }

  async create({ titulo, descripcion, fecha, lugar, precio, categoria, participantes, user_id }) {
    const sql = `INSERT INTO anuncios (titulo, descripcion, fecha, lugar, precio, categoria, participantes, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    await query(sql, [titulo, descripcion, fecha, lugar, precio || 0, categoria, participantes, user_id]);
    return true;
  }

  async update(id, { titulo, descripcion, fecha, lugar, precio, categoria, participantes }) {
    const sql = 'UPDATE anuncios SET titulo=?, descripcion=?, fecha=?, lugar=?, precio=?, categoria=?, participantes=? WHERE id=?';
    await query(sql, [titulo, descripcion, fecha, lugar, precio || 0, categoria, participantes, id]);
    return true;
  }

  async delete(id) {
    const sql = 'DELETE FROM anuncios WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = new AnuncioRepository();
