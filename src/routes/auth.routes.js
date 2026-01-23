const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

// Registro de usuario
router.post('/register', 
  validate('register'),
  authController.register
);
// Login de usuario
router.post('/login',
  validate('login'),
  authController.login
);
// Refrescar token
router.post('/refresh-token',
  authController.refreshToken
);
// Logout
router.post('/logout',
  authenticate,
  authController.logout
);
// Obtener perfil
router.get('/profile',
  authenticate,
  authController.getProfile
);
// Actualizar perfil
router.put('/profile',
  authenticate,
  validate('updateProfile'),
  authController.updateProfile
);
router.post('/change-password',
  authenticate,
  validate('changePassword'),
  authController.changePassword
);

module.exports = router;