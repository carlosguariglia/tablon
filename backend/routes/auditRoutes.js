const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

// Solo admin puede ver los logs
router.get('/', protect, isAdmin, getAuditLogs);

module.exports = router;
