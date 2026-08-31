const express = require('express');
const router = express.Router();
const { loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Rota pública de login
router.post('/login', loginUser);

// Rota protegida para verificar se o token ainda é válido e pegar os dados do usuário
router.get('/me', protect, getMe);

module.exports = router;