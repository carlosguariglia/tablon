const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { createArtist, updateArtist, listArtists, deleteArtist } = require('../controllers/artistAdminController');

router.get('/', protect, isAdmin, listArtists);
router.post('/', protect, isAdmin, createArtist);
router.put('/:id', protect, isAdmin, updateArtist);
router.delete('/:id', protect, isAdmin, deleteArtist);

module.exports = router;
