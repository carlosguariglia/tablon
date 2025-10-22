const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { listRequestsAdmin, getRequestAdmin, approveRequest, rejectRequest, deleteRequest } = require('../controllers/artistRequestController');

router.get('/', protect, isAdmin, listRequestsAdmin);
router.get('/:id', protect, isAdmin, getRequestAdmin);
router.post('/:id/approve', protect, isAdmin, approveRequest);
router.post('/:id/reject', protect, isAdmin, rejectRequest);
router.delete('/:id', protect, isAdmin, deleteRequest);

module.exports = router;
