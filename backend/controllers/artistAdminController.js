const ArtistRepository = require('../repositories/ArtistRepository');

exports.createArtist = async (req, res) => {
  try {
    const { name, bio, photo, spotify, youtube, whatsapp, instagram, threads, tiktok, bandcamp, website, email, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Nombre requerido' });
    const existing = await ArtistRepository.findByName(name);
    if (existing) return res.status(400).json({ message: 'Artista ya existe' });
    const id = await ArtistRepository.create({ name, bio, photo, spotify, youtube, whatsapp, instagram, threads, tiktok, bandcamp, website, email, phone });
    const idStr = id !== undefined && id !== null ? String(id) : null;
    res.status(201).json({ message: 'Artista creado', id: idStr });
  } catch (err) {
    console.error('createArtist', err);
    res.status(500).json({ message: 'Error al crear artista' });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, bio, photo, spotify, youtube, whatsapp, instagram, threads, tiktok, bandcamp, website, email, phone } = req.body;
    await ArtistRepository.update(id, { name, bio, photo, spotify, youtube, whatsapp, instagram, threads, tiktok, bandcamp, website, email, phone });
    res.json({ message: 'Artista actualizado' });
  } catch (err) {
    console.error('updateArtist', err);
    res.status(500).json({ message: 'Error al actualizar artista' });
  }
};

exports.listArtists = async (req, res) => {
  try {
    const artists = await ArtistRepository.findAll();
    res.json(artists);
  } catch (err) {
    console.error('listArtists', err);
    res.status(500).json({ message: 'Error al obtener artistas' });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'ID requerido' });
    await ArtistRepository.delete(id);
    res.json({ message: 'Artista eliminado' });
  } catch (err) {
    console.error('deleteArtist', err);
    res.status(500).json({ message: 'Error al eliminar artista' });
  }
};
