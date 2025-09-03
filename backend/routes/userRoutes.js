const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const db = require('../config/db');
const router = express.Router();

// Ruta para obtener todos los usuarios (solo admin)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, is_admin FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.' });
  }
});

// Ruta para cambiar el rol de admin usando el stored procedure
router.put('/admin/:id', protect, isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { is_admin } = req.body;
  console.log('PUT /admin/:id', { userId, is_admin });
  try {
    await db.query('CALL SetUserAdmin(?, ?)', [userId, !!is_admin]);
    res.json({ message: 'Rol de administrador actualizado correctamente.' });
  } catch (error) {
    console.error('Error en SetUserAdmin:', error);
    res.status(500).json({ message: 'Error al actualizar el rol de administrador.', error: error.message });
  }
});


// Crear usuario
router.post('/', protect, isAdmin, async (req, res) => {
  const { name, email, password, is_admin } = req.body;
  try {
    await db.query('CALL CreateUser(?, ?, ?, ?)', [name, email, password, !!is_admin]);
    res.json({ message: 'Usuario creado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario.', error: error.message });
  }
});

// Leer usuario por ID
router.get('/:id', protect, isAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await db.query('CALL GetUserById(?)', [userId]);
    console.log('Resultado de GetUserById:', result);
    // Para stored procedures, el resultado es un array de arrays
    const user = result[0] && result[0][0] ? result[0][0] : null;
    console.log('Usuario extraído:', user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario.', error: error.message });
  }
});

// Actualizar usuario
router.put('/:id', protect, isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, is_admin } = req.body;
  console.log('PUT /api/users/:id', { userId, name, email, password: password ? '[PASSWORD]' : '', is_admin });
  
  try {
    // Si se proporciona una contraseña, hashearla
    let hashedPassword = password;
    
    if (password && password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('Contraseña hasheada correctamente');
    } else {
      // Si no se proporciona contraseña o está vacía, obtener la contraseña actual
      const [userResult] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
      if (userResult && userResult[0]) {
        hashedPassword = userResult[0].password;
        console.log('Manteniendo contraseña existente');
      }
    }
    
    await db.query('CALL UpdateUser(?, ?, ?, ?, ?)', [userId, name, email, hashedPassword, is_admin]);
    res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error en UpdateUser:', error);
    res.status(500).json({ message: 'Error al actualizar usuario.', error: error.message });
  }
});

// Eliminar usuario
router.delete('/:id', protect, isAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    await db.query('CALL DeleteUser(?)', [userId]);
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario.', error: error.message });
  }
});

module.exports = router;
