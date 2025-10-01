
const UserRepository = require('../repositories/UserRepository');
const { sanitizeString, validateEmail, validatePassword } = require('../utils/validateSanitize');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserRepository.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.' });
  }
};

exports.createUser = async (req, res) => {
  let { name, email, password, is_admin } = req.body;
  name = sanitizeString(name);
  email = sanitizeString(email);
  password = sanitizeString(password);
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Contraseña débil. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.' });
  }
  try {
    await UserRepository.create({ name, email, password, is_admin });
    res.json({ message: 'Usuario creado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario.', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserRepository.findById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario.', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  let { name, email, password, is_admin } = req.body;
  name = sanitizeString(name);
  email = sanitizeString(email);
  password = sanitizeString(password);
  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y email son requeridos.' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }
  if (password && password.trim() !== '' && !validatePassword(password)) {
    return res.status(400).json({ message: 'Contraseña débil. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.' });
  }
  try {
    await UserRepository.update(userId, { name, email, password, is_admin });
    res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario.', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await UserRepository.delete(userId);
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario.', error: error.message });
  }
};
