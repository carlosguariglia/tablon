/**
 * Artist Request Repository
 * 
 * Gestiona el acceso a datos de la tabla artist_requests.
 * Maneja campos JSON (social_links, image_urls, muestras) con cuidado especial.
 * 
 * IMPORTANTE - Auto-parsing de JSON en MariaDB:
 * El driver nativo de MariaDB automáticamente convierte columnas JSON a objetos/arrays JavaScript.
 * Por eso, antes de hacer JSON.parse(), verificamos si el dato ya es un objeto (typeof !== 'string').
 * Sin esta verificación, obtendríamos errores como "Unexpected token o in JSON at position 1"
 */

const { query } = require('../config/db');

class ArtistRequestRepository {
  /**
   * Crea una nueva solicitud de artista en la base de datos
   * 
   * @param {Object} data - Datos de la solicitud
   * @param {number} data.user_id - ID del usuario que hace la solicitud
   * @param {string} data.nombre - Nombre del artista
   * @param {string} data.bio - Biografía
   * @param {Array} data.social_links - Array de objetos {platform, url}
   * @param {Array} data.image_urls - Array de URLs de imágenes
   * @returns {number} ID de la solicitud creada
   * 
   * Nota: Los arrays/objetos se convierten a JSON antes de guardar en DB
   */
  async create(data = {}) {
    const { user_id, nombre, bio = null, genero = null, social_links = null, image_urls = null, muestras = null, notas_usuario = null } = data;
    
    const sql = `INSERT INTO artist_requests (user_id, nombre, bio, genero, social_links, image_urls, muestras, notas_usuario, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const params = [user_id, nombre, bio, genero, social_links ? JSON.stringify(social_links) : null, image_urls ? JSON.stringify(image_urls) : null, muestras ? JSON.stringify(muestras) : null, notas_usuario];
    
    const result = await query(sql, params);
    const insertId = result.insertId || (result[0] && result[0].insertId) || null;
    return insertId != null ? Number(insertId) : null;
  }

  /**
   * Obtiene una solicitud por ID
   * 
   * @param {number} id - ID de la solicitud
   * @returns {Object|null} Solicitud con campos JSON parseados
   * 
   * CRÍTICO - Manejo de JSON auto-parseado:
   * MariaDB puede devolver los campos JSON ya convertidos a objetos JavaScript.
   * Verificamos typeof === 'string' antes de parsear para evitar errores.
   * 
   * Ejemplo:
   * - Si viene como string: '["url1","url2"]' → parseamos → ["url1","url2"]
   * - Si viene como array: ["url1","url2"] → lo dejamos tal cual
   */
  async findById(id) {
    const sql = 'SELECT * FROM artist_requests WHERE id = ? LIMIT 1';
    const results = await query(sql, [id]);
    const row = results[0] && results[0][0];
    if (!row) return null;
    
    // normalize JSON fields - MariaDB driver may auto-parse JSON columns
    try { 
      if (row.social_links && typeof row.social_links === 'string') {
        row.social_links = JSON.parse(row.social_links);
      }
      // If already an object/array, keep it as-is
    } catch(e){ row.social_links = null; }
    
    try { 
      if (row.image_urls && typeof row.image_urls === 'string') {
        row.image_urls = JSON.parse(row.image_urls);
      }
      // If already an array, keep it as-is
    } catch(e){ row.image_urls = null; }
    
    try { 
      if (row.muestras && typeof row.muestras === 'string') {
        row.muestras = JSON.parse(row.muestras);
      }
    } catch(e){ row.muestras = null; }
    // Normalize BigInt numeric fields to Number for safe JSON serialization
    for (const k of Object.keys(row)) {
      if (typeof row[k] === 'bigint') row[k] = Number(row[k]);
    }
    return row;
  }

  async countRecentByUser(user_id, hours = 24) {
    const sql = `SELECT COUNT(*) as cnt FROM artist_requests WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)`;
    const results = await query(sql, [user_id, Number(hours)]);
    const row = results[0] && results[0][0];
    return row ? Number(row.cnt) : 0;
  }

  async list({ status = null, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM artist_requests';
    const params = [];
    if (status) { sql += ' WHERE status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit)); params.push(Number(offset));
    const results = await query(sql, params);
    const rows = results[0] || [];
    // Normalize BigInt fields in each row
    return rows.map(r => {
      const nr = { ...r };
      for (const k of Object.keys(nr)) {
        if (typeof nr[k] === 'bigint') nr[k] = Number(nr[k]);
      }
      // parse JSON fields safely - MariaDB driver may auto-parse JSON columns
      try { 
        if (nr.social_links && typeof nr.social_links === 'string') {
          nr.social_links = JSON.parse(nr.social_links);
        }
      } catch(e){ nr.social_links = null; }
      
      try { 
        if (nr.image_urls && typeof nr.image_urls === 'string') {
          nr.image_urls = JSON.parse(nr.image_urls);
        }
      } catch(e){ nr.image_urls = null; }
      
      try { 
        if (nr.muestras && typeof nr.muestras === 'string') {
          nr.muestras = JSON.parse(nr.muestras);
        }
      } catch(e){ nr.muestras = null; }
      return nr;
    });
  }

  async updateStatus(id, status, admin_id = null, admin_notes = null) {
    const sql = 'UPDATE artist_requests SET status = ?, admin_id = ?, admin_notes = ?, reviewed_at = NOW() WHERE id = ?';
    await query(sql, [status, admin_id, admin_notes, id]);
    return true;
  }

  async delete(id) {
    const sql = 'DELETE FROM artist_requests WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = new ArtistRequestRepository();
