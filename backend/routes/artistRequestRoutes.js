const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createRequest } = require('../controllers/artistRequestController');

// POST /api/artist-requests (authenticated user)
router.post('/', protect, createRequest);

module.exports = router;
