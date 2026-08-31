const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { getSettings, updateSettings } = require('../controllers/settingsController');

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(roleMiddleware(['ADMINISTRADOR', 'GERENTE']), updateSettings);

module.exports = router;