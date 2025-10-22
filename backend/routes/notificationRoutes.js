const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const NotificationRepository = require('../repositories/NotificationRepository');

// GET /api/notifications - list current user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const items = await NotificationRepository.listByUser(user.id, { limit: 50 });
    res.json(items);
  } catch (e) { console.error('notifications list', e); res.status(500).json({ message: 'Error' }); }
});

// PUT /api/notifications/:id/read - mark as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await NotificationRepository.markRead(req.params.id);
    res.json({ message: 'Marked' });
  } catch (e) { console.error('notifications markRead', e); res.status(500).json({ message: 'Error' }); }
});

module.exports = router;
