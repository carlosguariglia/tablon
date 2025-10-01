
const AnuncioRepository = require('../repositories/AnuncioRepository');
const { logAction } = require('./auditController');
const { sanitizeString } = require('../utils/validateSanitize');

exports.getAnuncios = async (req, res) => {
  try {
    const anuncios = await AnuncioRepository.findAll(req.query);
    res.json(anuncios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener anuncios' });
  }
};

exports.createAnuncio = async (req, res) => {
  try {
    const user_id = req.user.id;
    let { titulo, descripcion, fecha, lugar, precio, categoria, participantes } = req.body;
    titulo = sanitizeString(titulo);
    descripcion = sanitizeString(descripcion);
    fecha = sanitizeString(fecha);
    lugar = sanitizeString(lugar);
    categoria = sanitizeString(categoria);
    participantes = sanitizeString(participantes);
    if (!titulo || !descripcion || !fecha || !lugar || !categoria) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos.' });
    }
    await AnuncioRepository.create({ titulo, descripcion, fecha, lugar, precio, categoria, participantes, user_id });
    await logAction(req, 'CREAR_ANUNCIO', `Título: ${titulo}`);
    res.status(201).json({ message: 'Anuncio creado correctamente.' });
  } catch (error) {
  console.error('[ERROR][createAnuncio]', error);
  res.status(500).json({ message: 'Error al crear el anuncio.', details: error.message });
  }
};

exports.updateAnuncio = async (req, res) => {
  try {
    const anuncioId = req.params.id;
    const userId = req.user.id;
    const anuncio = await AnuncioRepository.findById(anuncioId);
    if (!anuncio) return res.status(404).json({ message: 'Anuncio no encontrado.' });
    if (anuncio.user_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'No tienes permiso para editar este anuncio.' });
    }
  let { titulo, descripcion, fecha, lugar, precio, categoria, participantes } = req.body;
  titulo = sanitizeString(titulo);
  descripcion = sanitizeString(descripcion);
  fecha = sanitizeString(fecha);
  lugar = sanitizeString(lugar);
  categoria = sanitizeString(categoria);
  participantes = sanitizeString(participantes);
  await AnuncioRepository.update(anuncioId, { titulo, descripcion, fecha, lugar, precio, categoria, participantes });
  await logAction(req, 'EDITAR_ANUNCIO', `ID: ${anuncioId}, Título: ${titulo}`);
  res.json({ message: 'Anuncio editado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar el anuncio.' });
  }
};

exports.deleteAnuncio = async (req, res) => {
  try {
    const anuncioId = req.params.id;
    const userId = req.user.id;
    const anuncio = await AnuncioRepository.findById(anuncioId);
    if (!anuncio) return res.status(404).json({ message: 'Anuncio no encontrado.' });
    if (anuncio.user_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este anuncio.' });
    }
    await AnuncioRepository.delete(anuncioId);
    await logAction(req, 'ELIMINAR_ANUNCIO', `ID: ${anuncioId}, Título: ${anuncio.titulo}`);
    res.json({ message: 'Anuncio eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el anuncio.' });
  }
};
