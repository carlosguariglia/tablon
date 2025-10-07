const AnuncioRepository = require('../repositories/AnuncioRepository');

// Devuelve una "ficha" del artista con sinopsis y todos sus posts
const getArtist = async (req, res) => {
  try {
    const name = req.query.name || req.params.name;
    if (!name) return res.status(400).json({ message: 'Nombre de artista requerido' });

    // Primero buscar en tabla artists si hay coincidencias (búsqueda parcial)
    const ArtistRepository = require('../repositories/ArtistRepository');
    const matches = await ArtistRepository.findByNameLike(name);
    if (matches && matches.length > 1) {
      // Devolver posibles coincidencias para que el frontend permita elegir
      return res.json({ matches: matches.map(m => ({ id: m.id, name: m.name, bio: m.bio })) });
    }

    let anuncios = [];
    let artistLabel = name;
    if (matches && matches.length === 1) {
      // Si hay coincidencia exacta (o única), usar el id para buscar posts enlazados
      const artist = matches[0];
      artistLabel = artist.name;
      anuncios = await AnuncioRepository.findByArtistId(artist.id);
      // attach artist metadata
      const ArtistRepository = require('../repositories/ArtistRepository');
      const fullArtist = await ArtistRepository.findById(artist.id);
      if (fullArtist) {
        return res.json({
          artist: fullArtist.name,
          bio: fullArtist.bio,
          photo: fullArtist.photo,
          spotify: fullArtist.spotify,
          youtube: fullArtist.youtube,
          whatsapp: fullArtist.whatsapp,
          instagram: fullArtist.instagram,
          threads: fullArtist.threads,
          tiktok: fullArtist.tiktok,
          bandcamp: fullArtist.bandcamp,
          website: fullArtist.website,
          email: fullArtist.email,
          phone: fullArtist.phone,
          totalPosts: anuncios.length,
          categorias: anuncios.reduce((acc, a) => { acc[a.categoria] = (acc[a.categoria]||0)+1; return acc; }, {}),
          sinopsis: anuncios.length ? (anuncios[0].descripcion || '') : 'Sin sinopsis disponible',
          posts: anuncios.map(a => ({ id: a.id, titulo: a.titulo, fecha: a.fecha, lugar: a.lugar, categoria: a.categoria, precio: a.precio, descripcion: a.descripcion }))
        });
      }
    } else {
      // Fallback: buscar por participantes (texto libre)
      anuncios = await AnuncioRepository.findAll({ artista: name });
      // intentar adjuntar metadata desde tabla artists si existe un registro exacto
      const ArtistRepository = require('../repositories/ArtistRepository');
      const exact = await ArtistRepository.findByName(name);
      if (exact) {
        return res.json({
          artist: exact.name,
          bio: exact.bio,
          photo: exact.photo,
          spotify: exact.spotify,
          youtube: exact.youtube,
          whatsapp: exact.whatsapp,
          instagram: exact.instagram,
          threads: exact.threads,
          tiktok: exact.tiktok,
          bandcamp: exact.bandcamp,
          website: exact.website,
          email: exact.email,
          phone: exact.phone,
          totalPosts: anuncios.length,
          categorias: anuncios.reduce((acc, a) => { acc[a.categoria] = (acc[a.categoria]||0)+1; return acc; }, {}),
          sinopsis: anuncios.length ? (anuncios[0].descripcion || '') : 'Sin sinopsis disponible',
          posts: anuncios.map(a => ({ id: a.id, titulo: a.titulo, fecha: a.fecha, lugar: a.lugar, categoria: a.categoria, precio: a.precio, descripcion: a.descripcion }))
        });
      }
    }

    const total = anuncios.length;
    const categorias = {};
    anuncios.forEach(a => { categorias[a.categoria] = (categorias[a.categoria] || 0) + 1; });

    let sinopsis = '';
    for (const a of anuncios) {
      if (a.descripcion && a.descripcion.trim().length > 20) { sinopsis = a.descripcion.trim(); break; }
    }
    if (!sinopsis) sinopsis = 'Sin sinopsis disponible para este artista.';
    if (sinopsis.length > 300) sinopsis = sinopsis.slice(0, 297) + '...';

    const posts = anuncios.map(a => ({ id: a.id, titulo: a.titulo, fecha: a.fecha, lugar: a.lugar, categoria: a.categoria, precio: a.precio, descripcion: a.descripcion }));

    res.json({ artist: artistLabel, totalPosts: total, categorias, sinopsis, posts });
  } catch (err) {
    console.error('Error getArtist:', err);
    res.status(500).json({ message: 'Error al obtener información del artista' });
  }
};

module.exports = { getArtist };
