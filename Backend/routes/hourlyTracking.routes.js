const express = require('express');
const { getHourlyMachineTracking } = require('../controllers/hourlyTracking.controller');
const  authMiddleware  = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/:id/hourly-tracking', getHourlyMachineTracking);

module.exports = router;