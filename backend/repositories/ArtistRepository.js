const { query } = require('../config/db');

class ArtistRepository {
  async create(data = {}) {
    const { name, bio = '', photo = null, spotify = null, youtube = null, whatsapp = null, instagram = null, threads = null, tiktok = null, bandcamp = null, website = null, email = null, phone = null } = data;
    const sql = `INSERT INTO artists (name, bio, photo, spotify, youtube, whatsapp, instagram, threads, tiktok, bandcamp, website, email, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const result = await query(sql, [name, bio, photo, spotify, youtube, whatsapp, instagram, threads, tiktok, bandcamp, website, email, phone]);
    return result.insertId || (result[0] && result[0].insertId) || null;
  }

  async findByName(name) {
    const sql = 'SELECT * FROM artists WHERE name = ? LIMIT 1';
    const results = await query(sql, [name]);
    return results[0] && results[0][0];
  }

  async findByNameLike(name) {
    const sql = 'SELECT * FROM artists WHERE LOWER(name) LIKE LOWER(?) ORDER BY name ASC';
    const param = `%${name}%`;
    const results = await query(sql, [param]);
    return results[0] || [];
  }

  async findById(id) {
    const sql = 'SELECT * FROM artists WHERE id = ? LIMIT 1';
    const results = await query(sql, [id]);
    return results[0] && results[0][0];
  }

  async upsertMany(names = []) {
    // Devuelve array de ids correspondientes a los nombres dados (crea si no existen)
    const ids = [];
    for (let raw of names) {
      const name = String(raw).trim();
      if (!name) continue;
      const existing = await this.findByName(name);
      if (existing) ids.push(existing.id);
      else {
        const id = await this.create({ name });
        ids.push(id);
      }
    }
    return ids;
  }

  async update(id, data = {}) {
    const { name, bio = '', photo = null, spotify = null, youtube = null, whatsapp = null, instagram = null, threads = null, tiktok = null, bandcamp = null, website = null, email = null, phone = null } = data;
    const sql = 'UPDATE artists SET name = ?, bio = ?, photo = ?, spotify = ?, youtube = ?, whatsapp = ?, instagram = ?, threads = ?, tiktok = ?, bandcamp = ?, website = ?, email = ?, phone = ? WHERE id = ?';
    await query(sql, [name, bio, photo, spotify, youtube, whatsapp, instagram, threads, tiktok, bandcamp, website, email, phone, id]);
    return true;
  }

  async delete(id) {
    // Remove join rows then the artist
    await query('DELETE FROM anuncio_artistas WHERE artist_id = ?', [id]);
    await query('DELETE FROM artists WHERE id = ?', [id]);
    return true;
  }

  async findAll() {
    const sql = 'SELECT * FROM artists ORDER BY name ASC';
    const results = await query(sql);
    return results[0];
  }
}

module.exports = new ArtistRepository();
