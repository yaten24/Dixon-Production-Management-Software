// backend/routes/activityLogRoutes.js
const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getActivityLogById,
  getDistinctModules,
  createActivityLog,
} = require('../controllers/activityLogController');

// Order matters: static/meta routes before the ":id" param route
router.get('/meta/modules', getDistinctModules);
router.get('/:id', getActivityLogById);
router.get('/', getActivityLogs);
router.post('/', createActivityLog);

module.exports = router;

/* --------------------------------------------------------------------
   In your main app.js / server.js, mount it like this:

   const activityLogRoutes = require('./routes/activityLogRoutes');
   app.use('/api/activity-logs', activityLogRoutes);

   Example calls:
   GET /api/activity-logs?page=1&limit=25
   GET /api/activity-logs?module=Orders&action=CREATE,UPDATE
   GET /api/activity-logs?user_id=12&date_from=2026-07-01&date_to=2026-07-08
   GET /api/activity-logs?search=192.168
   GET /api/activity-logs/meta/modules
-------------------------------------------------------------------- */