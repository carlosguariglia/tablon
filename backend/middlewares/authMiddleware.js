/**
 * Auth Middleware
 * 
 * Middlewares para proteger rutas y verificar permisos.
 * Se usan en las definiciones de rutas para requerir autenticación o rol de admin.
 * 
 * Ejemplo de uso:
 * router.post('/ruta-protegida', protect, controlador);
 * router.delete('/ruta-admin', protect, isAdmin, controlador);
 */

const { verifyToken } = require('../config/jwt');

/**
 * Middleware: protect
 * Verifica que la request incluya un token JWT válido
 * 
 * Uso: Protege rutas que requieren usuario autenticado
 * 
 * Proceso:
 * 1. Extrae el token del header Authorization: "Bearer <token>"
 * 2. Verifica el token con la clave secreta (JWT_SECRET)
 * 3. Decodifica el payload y lo agrega a req.user
 * 4. Llama a next() si todo es válido
 * 
 * @returns 401 si no hay token o es inválido
 * @next Si el token es válido, continúa con el siguiente middleware/controlador
 */
const protect = (req, res, next) => {
  // Extrae el token del header "Authorization: Bearer TOKEN"
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  // Verifica y decodifica el token
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Token inválido' });

  // Agrega la información del usuario a la request para uso posterior
  req.user = decoded; // { id, name, email, is_admin }
  next();
};

module.exports = { protect };