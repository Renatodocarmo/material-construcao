const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

router.use(protect);
router.use(roleMiddleware(['ADMINISTRADOR', 'GERENTE']));

router.get('/', getAuditLogs);

module.exports = router;