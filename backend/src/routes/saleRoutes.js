const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { 
  createSale, 
  getSales, 
  getSaleById, 
  cancelSale 
} = require('../controllers/saleController');

// Todas as rotas exigem autenticação
router.use(protect);

router.route('/')
  .get(getSales) // Qualquer usuário autenticado pode ver vendas
  .post(roleMiddleware(['ADMINISTRADOR', 'GERENTE', 'VENDEDOR']), createSale);

router.route('/:id')
  .get(getSaleById);

router.route('/:id/cancel')
  .put(roleMiddleware(['ADMINISTRADOR', 'GERENTE']), cancelSale);

module.exports = router;