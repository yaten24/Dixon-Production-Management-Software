const express = require("express");
const router = express.Router();

const {
  getDailyReport,
  getDailySummary,
  getMonthlyReport,
  getMonthlySummary,
  getReportFilters,
  getRejectionReasonsList,
  getLossReasonsList,
} = require("../controllers/reportController"); // matches actual filename

// If you have an auth middleware, plug it in here, e.g.:
// const { verifyToken } = require("../middleware/authMiddleware");
// router.use(verifyToken);

router.get("/reports/daily", getDailyReport);
router.get("/reports/daily-summary", getDailySummary);
router.get("/reports/monthly", getMonthlyReport);
router.get("/reports/monthly-summary", getMonthlySummary);
router.get("/reports/filters", getReportFilters);

router.get("/rejection-reasons", getRejectionReasonsList);
router.get("/loss-reasons", getLossReasonsList);

module.exports = router;

/**
 * In your main app.js / server.js, mount this router, e.g.:
 *
 *   const reportRoutes = require("./routes/reportRoutes");
 *   app.use("/api", reportRoutes);
 *
 * That exposes exactly what the frontend hook calls:
 *   GET /api/reports/daily?date=&hall=&shift=&machine=
 *   GET /api/reports/daily-summary?date=&hall=&shift=&machine=
 *   GET /api/reports/monthly?month=&year=&hall=
 *   GET /api/reports/monthly-summary?month=&year=&hall=
 *   GET /api/reports/filters
 *   GET /api/rejection-reasons
 *   GET /api/loss-reasons
 */