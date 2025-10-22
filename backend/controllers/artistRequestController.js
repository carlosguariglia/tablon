const ArtistRequestRepository = require('../repositories/ArtistRequestRepository');
const ArtistRepository = require('../repositories/ArtistRepository');
const { sanitizeString, validateUrl } = require('../utils/validateSanitize');

exports.createRequest = async (req, res) => {
  try {
    const user = req.user;
    const { nombre, bio, genero, social_links, image_urls, muestras, notas_usuario } = req.body;
    
    if (!nombre || String(nombre).trim() === '') return res.status(400).json({ message: 'Nombre del artista requerido' });

    // rate limit per user: max 3 requests per 24 hours
    const recentCount = await ArtistRequestRepository.countRecentByUser(user.id, 24);
    if (recentCount >= 3) return res.status(429).json({ message: 'Has alcanzado el límite de solicitudes (3 en 24h). Espera antes de enviar otra.' });

    // Basic sanitization
    const safeNombre = sanitizeString(nombre);
    const safeBio = bio ? sanitizeString(bio) : null;

    // Validate image_urls are valid http(s) URLs and limit count
    let parsedImageUrls = null;
    if (image_urls) {
      if (!Array.isArray(image_urls)) return res.status(400).json({ message: 'image_urls debe ser un array de URLs' });
      if (image_urls.length > 5) return res.status(400).json({ message: 'Máximo 5 URLs de imagen permitidas' });
      parsedImageUrls = [];
      for (const u of image_urls) {
        if (!validateUrl(u)) return res.status(400).json({ message: `URL inválida en image_urls: ${u}` });
        parsedImageUrls.push(u);
      }
    }

    // Validate social_links entries if provided (expect array of {platform,url} or object)
    let parsedSocial = null;
    if (social_links) {
      if (Array.isArray(social_links)) {
        parsedSocial = [];
        for (const s of social_links) {
          if (!s || !s.url) {
            return res.status(400).json({ message: 'Cada social link debe tener un campo url' });
          }
          if (!validateUrl(s.url)) {
            return res.status(400).json({ message: `URL inválida en social_links: ${s.url}` });
          }
          parsedSocial.push({ platform: s.platform ? sanitizeString(s.platform) : null, url: s.url });
        }
      } else if (typeof social_links === 'object') {
        // keep as-is but validate any url fields
        parsedSocial = {};
        for (const k of Object.keys(social_links)) {
          const v = social_links[k];
          if (v && typeof v === 'string' && validateUrl(v)) parsedSocial[k] = v;
        }
      } else {
        return res.status(400).json({ message: 'social_links mal formado' });
      }
    }

    // simple duplicate prevention: same user & same name pending
    try {
      const existing = await ArtistRequestRepository.list({ status: 'pending', limit: 1000 });
      const userPending = (existing || []).find(r => r.user_id == user.id && r.nombre && String(r.nombre).toLowerCase() === String(safeNombre).toLowerCase());
      if (userPending) return res.status(409).json({ message: 'Ya existe una solicitud pendiente con ese nombre' });
    } catch (dupErr) {
      console.error('Error en verificación de duplicados:', dupErr);
      // Continuar sin bloquear la creación
    }
    
    const dataToCreate = {
      user_id: user.id,
      nombre: safeNombre,
      bio: safeBio,
      genero: genero ? sanitizeString(genero) : null,
      social_links: parsedSocial || null,
      image_urls: parsedImageUrls || null,
      muestras: muestras || null,
      notas_usuario: notas_usuario ? sanitizeString(notas_usuario) : null
    };
    
    const id = await ArtistRequestRepository.create(dataToCreate);

    res.status(201).json({ message: 'Solicitud creada', id });
  } catch (err) {
    console.error('createRequest error:', err.message);
    res.status(500).json({ message: 'Error al crear solicitud' });
  }
};

exports.listRequestsAdmin = async (req, res) => {
  try {
    const { status, page = 1, per_page = 25 } = req.query;
    const offset = (Number(page) - 1) * Number(per_page);
    const items = await ArtistRequestRepository.list({ status: status || null, limit: Number(per_page), offset });
    res.json(items);
  } catch (err) {
    console.error('listRequestsAdmin', err);
    res.status(500).json({ message: 'Error al listar solicitudes' });
  }
};

exports.getRequestAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await ArtistRequestRepository.findById(id);
    if (!item) return res.status(404).json({ message: 'Solicitud no encontrada' });
    res.json(item);
  } catch (err) {
    console.error('getRequestAdmin', err);
    res.status(500).json({ message: 'Error al obtener solicitud' });
  }
};

// Approve -> create artist using ArtistRepository and mark request approved
exports.approveRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = req.user;
    const request = await ArtistRequestRepository.findById(id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Solicitud no está pendiente' });

    // check artist duplicate
    const existing = await ArtistRepository.findByName(request.nombre);
    if (existing) {
      // mark request rejected/duplicated to avoid re-processing
      await ArtistRequestRepository.updateStatus(id, 'rejected', admin.id, 'Artista ya existe en el sistema');
      return res.status(409).json({ message: 'Artista ya existe' });
    }

    // create artist reusing fields; image_urls map to photo (take first) and other fields
    const artistData = {
      name: request.nombre,
      bio: request.bio || '',
      photo: (request.image_urls && request.image_urls[0]) ? request.image_urls[0] : null,
    };
    
    // Map social_links array to individual fields
    if (request.social_links && Array.isArray(request.social_links)) {
      const platformMap = {
        'instagram': 'instagram',
        'facebook': 'facebook',
        'spotify': 'spotify',
        'youtube': 'youtube',
        'whatsapp': 'whatsapp',
        'threads': 'threads',
        'tiktok': 'tiktok',
        'bandcamp': 'bandcamp',
        'website': 'website',
        'web': 'website',
        'sitio': 'website'
      };
      
      request.social_links.forEach(link => {
        if (link.platform && link.url) {
          const fieldName = platformMap[link.platform.toLowerCase()];
          if (fieldName && !artistData[fieldName]) {
            artistData[fieldName] = link.url;
            console.log(`Mapped ${link.platform} -> ${fieldName}: ${link.url}`);
          }
        }
      });
    }
    
    console.log('artistData final:', artistData);
    const artistId = await ArtistRepository.create(artistData);

    await ArtistRequestRepository.updateStatus(id, 'approved', admin.id, req.body.admin_notes || null);

    // notify user
    try {
      const NotificationService = require('../services/notificationService');
      // fetch user email if available
      const { query } = require('../config/db');
      const urows = await query('SELECT email FROM users WHERE id = ?', [request.user_id]);
      const urow = urows[0] && urows[0][0];
      await NotificationService.notifyUser(request.user_id, { type: 'success', title: 'Solicitud aprobada', message: `Tu solicitud para "${request.nombre}" fue aprobada.`, email: urow && urow.email ? urow.email : null });
    } catch (e) { console.warn('notify approve failed', e && e.message ? e.message : e); }

    res.json({ message: 'Solicitud aprobada y artista creado', artistId });
  } catch (err) {
    console.error('approveRequest', err);
    res.status(500).json({ message: 'Error al aprobar solicitud' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = req.user;
    const { reason } = req.body;
    const request = await ArtistRequestRepository.findById(id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Solicitud no está pendiente' });
    await ArtistRequestRepository.updateStatus(id, 'rejected', admin.id, reason || null);
    try {
      const NotificationService = require('../services/notificationService');
      const { query } = require('../config/db');
      const urows = await query('SELECT email FROM users WHERE id = ?', [request.user_id]);
      const urow = urows[0] && urows[0][0];
      await NotificationService.notifyUser(request.user_id, { type: 'warning', title: 'Solicitud rechazada', message: `Tu solicitud para "${request.nombre}" fue rechazada. Motivo: ${reason || 'No especificado'}`, email: urow && urow.email ? urow.email : null });
    } catch (e) { console.warn('notify reject failed', e && e.message ? e.message : e); }
    res.json({ message: 'Solicitud rechazada' });
  } catch (err) {
    console.error('rejectRequest', err);
    res.status(500).json({ message: 'Error al rechazar solicitud' });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const request = await ArtistRequestRepository.findById(id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    
    await ArtistRequestRepository.delete(id);
    
    res.json({ message: 'Solicitud eliminada correctamente' });
  } catch (err) {
    console.error('deleteRequest', err);
    res.status(500).json({ message: 'Error al eliminar solicitud' });
  }
};
