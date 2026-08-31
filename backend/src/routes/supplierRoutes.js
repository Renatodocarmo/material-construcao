const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { 
  getSuppliers, 
  createSupplier, 
  updateSupplier 
} = require('../controllers/supplierController');

router.use(protect);

router.route('/')
  .get(getSuppliers)
  .post(roleMiddleware(['ADMINISTRADOR', 'GERENTE']), createSupplier);

router.route('/:id')
  .put(roleMiddleware(['ADMINISTRADOR', 'GERENTE']), updateSupplier);

module.exports = router;