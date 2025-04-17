const { verifyToken } = require('../config/jwt');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Token inválido' });

  req.user = decoded;
  next();
};

module.exports = { protect };