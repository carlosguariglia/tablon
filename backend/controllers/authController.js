/**
 * Auth Controller
 * 
 * Gestiona el registro, login y verificación de usuarios.
 * Implementa seguridad con:
 * - Sanitización de entradas (prevención XSS)
 * - Validación de emails y contraseñas
 * - Hash de contraseñas con bcrypt
 * - Tokens JWT para autenticación stateless
 * - Auditoría de acciones (login registrado en audit_log)
 */

const User = require('../repositories/UserRepository');
const { generateToken, verifyToken } = require('../config/jwt');
const { sanitizeString, validateEmail, validatePassword } = require('../utils/validateSanitize');
const { logAction } = require('./auditController');

/**
 * POST /api/auth/register
 * Registra un nuevo usuario en el sistema
 * 
 * Validaciones:
 * - Email válido y único
 * - Contraseña fuerte (min 8 chars, mayúscula, minúscula, número)
 * - Sanitización de todos los campos
 * 
 * @returns {Object} { success, message, token, user }
 */
const register = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    name = sanitizeString(name);
    email = sanitizeString(email);
    password = sanitizeString(password);
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email inválido' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Contraseña débil. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.' });
    }
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    await User.create({ name, email, password });
    const user = await User.findByEmail(email);
    const token = generateToken({ id: user.id, name: user.name, email: user.email, is_admin: user.is_admin });
    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', token, user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
};

/**
 * POST /api/auth/login
 * Autentica un usuario existente
 * 
 * Proceso:
 * 1. Valida formato de email
 * 2. Busca usuario en base de datos
 * 3. Verifica contraseña con bcrypt.compare()
 * 4. Genera JWT token si las credenciales son correctas
 * 5. Registra el login en audit_log
 * 
 * @returns {Object} { success, message, token, user }
 * 
 * Seguridad: No revela si el error es por email inexistente o contraseña incorrecta
 * (mensaje genérico "Credenciales inválidas")
 */
const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = sanitizeString(email);
    password = sanitizeString(password);
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email inválido' });
    }
    const user = await User.findByEmail(email);
    if (!user || !(await User.verifyPassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    const token = generateToken({ id: user.id, name: user.name, email: user.email, is_admin: user.is_admin });
    // Registrar acción de login en auditoría
    try {
      await logAction({ user: { id: user.id, name: user.name, email: user.email } }, 'LOGIN', `Email: ${email}`);
    } catch (e) { /* Ignorar errores de log */ }
    res.json({ success: true, message: 'Login exitoso', token, user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message 
    });
  }
};

const verifyTokenController = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token no proporcionado' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Token inválido' });

    const user = await User.findByEmail(decoded.email);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    res.json({ 
      success: true,
      user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin }
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al verificar autenticación',
      error: error.message 
    });
  }
};

module.exports = { register, login, verifyToken: verifyTokenController };