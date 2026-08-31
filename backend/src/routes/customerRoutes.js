const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { 
  getCustomers, 
  createCustomer, 
  updateCustomer 
} = require('../controllers/customerController');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(roleMiddleware(['ADMINISTRADOR', 'GERENTE', 'VENDEDOR']), createCustomer);

router.route('/:id')
  .put(roleMiddleware(['ADMINISTRADOR', 'GERENTE', 'VENDEDOR']), updateCustomer);

module.exports = router;