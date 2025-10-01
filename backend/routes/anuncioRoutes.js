
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const anuncioController = require('../controllers/anuncioController');

// Obtener anuncios con filtros
router.get('/', anuncioController.getAnuncios);

// Crear anuncio (solo usuarios logueados)
router.post('/', protect, anuncioController.createAnuncio);

// Editar anuncio
router.put('/:id', protect, anuncioController.updateAnuncio);

// Eliminar anuncio
router.delete('/:id', protect, anuncioController.deleteAnuncio);

module.exports = router;