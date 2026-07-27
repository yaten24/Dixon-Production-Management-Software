// routes/adminDashboardRoutes.js
const express = require("express");
const router = express.Router();
const { getAdminDashboardSummary } = require("../controllers/adminDashboardController");

// GET /api/admin/dashboard/summary
router.get("/summary", getAdminDashboardSummary);

module.exports = router;