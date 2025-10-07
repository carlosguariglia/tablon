const express = require('express');
const router = express.Router();
const { getArtist } = require('../controllers/artistaController');

// GET /api/artistas?name=Nombre
router.get('/', getArtist);

// GET /api/artistas/:name
router.get('/:name', getArtist);

module.exports = router;
