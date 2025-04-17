const User = require('../models/User');
const { generateToken, verifyToken } = require('../config/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Todos los campos son requeridos' 
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'El email ya está registrado' 
      });
    }

    await User.create({ name, email, password });
    const user = await User.findByEmail(email);
    const token = generateToken({ id: user.id, email: user.email });

    res.status(201).json({ 
      success: true,
      message: 'Usuario registrado exitosamente', 
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
    }

    const user = await User.findByEmail(email);
    if (!user || !(await User.verifyPassword(password, user.password))) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales inválidas' 
      });
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ 
      success: true,
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
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
      user: { id: user.id, name: user.name, email: user.email }
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