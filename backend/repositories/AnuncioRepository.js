const { query } = require('../config/db');
const ArtistRepository = require('./ArtistRepository');

class AnuncioRepository {
  async findAll(filters = {}) {
    let whereClauses = [];
    let params = [];
    const { fecha, desde, hasta, categoria, artista } = filters;
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
    // Buscar por artista/participante (consulta parcial, case-insensitive según collation)
    if (artista) {
      whereClauses.push('a.participantes LIKE ?');
      params.push(`%${artista}%`);
    }
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

  async findByArtistId(artistId) {
    const sql = `
      SELECT a.id, a.titulo, a.descripcion, DATE_FORMAT(a.fecha, '%Y-%m-%d %H:%i:%s') as fecha, a.lugar, a.precio, a.categoria, a.participantes, u.name as autor
      FROM anuncios a
      LEFT JOIN anuncio_artistas aa ON aa.anuncio_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE aa.artist_id = ?
      ORDER BY a.fecha ASC
    `;
    const [rows] = await query(sql, [artistId]);
    return rows;
  }

  async create({ titulo, descripcion, fecha, lugar, precio, categoria, participantes, user_id }) {
    const sql = `INSERT INTO anuncios (titulo, descripcion, fecha, lugar, precio, categoria, participantes, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const result = await query(sql, [titulo, descripcion, fecha, lugar, precio || 0, categoria, participantes, user_id]);
    const insertId = result.insertId || (result[0] && result[0].insertId);
    // Enlazar solo artistas ya existentes (no crear nuevos) para evitar duplicados.
    if (participantes && participantes.trim() !== '') {
      const names = participantes.split(',').map(s => s.trim()).filter(Boolean);
      for (const name of names) {
        const existing = await ArtistRepository.findByName(name);
        if (existing) {
          await query('INSERT INTO anuncio_artistas (anuncio_id, artist_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE anuncio_id=anuncio_id', [insertId, existing.id]);
        }
        // Si no existe el artista, NO se crea automáticamente. Crear mediante admin.
      }
    }
    return insertId;
  }

  async update(id, { titulo, descripcion, fecha, lugar, precio, categoria, participantes }) {
    const sql = 'UPDATE anuncios SET titulo=?, descripcion=?, fecha=?, lugar=?, precio=?, categoria=?, participantes=? WHERE id=?';
    await query(sql, [titulo, descripcion, fecha, lugar, precio || 0, categoria, participantes, id]);
    // Actualizar artistas relacionados: solo enlazar artistas existentes
    await query('DELETE FROM anuncio_artistas WHERE anuncio_id = ?', [id]);
    if (participantes && participantes.trim() !== '') {
      const names = participantes.split(',').map(s => s.trim()).filter(Boolean);
      for (const name of names) {
        const existing = await ArtistRepository.findByName(name);
        if (existing) {
          await query('INSERT INTO anuncio_artistas (anuncio_id, artist_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE anuncio_id=anuncio_id', [id, existing.id]);
        }
      }
    }
    return true;
  }

  async delete(id) {
    const sql = 'DELETE FROM anuncios WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = new AnuncioRepository();
