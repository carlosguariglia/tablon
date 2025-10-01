const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const userController = require('../controllers/userController');
const router = express.Router();

// Ruta para obtener todos los usuarios (solo admin)
router.get('/', protect, isAdmin, userController.getAllUsers);

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
router.post('/', protect, isAdmin, userController.createUser);

// Leer usuario por ID
router.get('/:id', protect, isAdmin, userController.getUserById);

// Actualizar usuario
router.put('/:id', protect, isAdmin, userController.updateUser);

// Eliminar usuario
router.delete('/:id', protect, isAdmin, userController.deleteUser);

module.exports = router;
