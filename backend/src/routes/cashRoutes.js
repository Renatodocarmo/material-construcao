const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { 
  openCash, 
  registerMovement, 
  closeCash, 
  getCurrentCash 
} = require('../controllers/cashController');

router.use(protect);

router.get('/current', getCurrentCash);
router.post('/open', roleMiddleware(['ADMINISTRADOR', 'GERENTE', 'VENDEDOR']), openCash);
router.post('/movements', roleMiddleware(['ADMINISTRADOR', 'GERENTE', 'VENDEDOR']), registerMovement);
router.post('/close', roleMiddleware(['ADMINISTRADOR', 'GERENTE']), closeCash);

module.exports = router;