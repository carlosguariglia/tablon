const Audit = require('../models/Audit');

const logAction = async (req, action, details = '') => {
  if (!req.user) return;
  await Audit.log({
    userId: req.user.id || null,
    userName: req.user.name,
    userEmail: req.user.email,
    action,
    details
  });
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await Audit.getAll();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener logs de auditoría' });
  }
};

module.exports = { logAction, getAuditLogs };
