/**
 * Rotas de Gestão de Usuários.
 * Todas as rotas são protegidas por autenticação.
 * Rotas administrativas exigem o cargo ADMINISTRADOR.
 */
const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  deleteUserPermanent,
  getRoles
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Todas as rotas são protegidas (requer autenticação)
router.use(protect);

// Rota para obter cargos (disponível para todos autenticados)
router.get('/roles', getRoles);

// Rotas de gerenciamento (apenas ADMINISTRADOR)
router.route('/')
  .get(authorize('ADMINISTRADOR'), getUsers)
  .post(authorize('ADMINISTRADOR'), createUser);

router.route('/:id')
  .put(authorize('ADMINISTRADOR'), updateUser)
  .delete(authorize('ADMINISTRADOR'), deleteUser);

// Rota de exclusão permanente (apenas ADMINISTRADOR)
router.delete('/:id/permanent', authorize('ADMINISTRADOR'), deleteUserPermanent);

module.exports = router;