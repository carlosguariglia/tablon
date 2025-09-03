// Middleware para permitir solo acceso a usuarios admin
function isAdmin(req, res, next) {
  // Puedes ajustar la lógica según cómo identificas al admin
  if (req.user && req.user.is_admin) {
    return next();
  }
  return res.status(403).json({ message: 'Acceso solo permitido para administradores' });
}

module.exports = { isAdmin };
