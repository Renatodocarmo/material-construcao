const express = require('express');
const router = express.Router();
const {
  getInventoryReport,
  getFinancialReport,
  getCustomersReport
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

// Todas as rotas são protegidas
router.use(protect);

// Rotas dos relatórios
router.get('/inventory', getInventoryReport);
router.get('/financial', getFinancialReport);
router.get('/customers', getCustomersReport);

module.exports = router;