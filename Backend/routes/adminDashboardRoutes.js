// backend/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const {
  getProductionStats,
  getTargetSummary,
  getProductionOverview,
  getRejectionAnalysis,
  getLossTimeAnalysis,
  getRejectionLossTrend,
} = require("../controllers/adminDashboardController");

// GET /api/dashboard/production-stats?date=2026-07-16&hall=Hall-1&shift=A
router.get("/production-stats", getProductionStats);

// GET /api/dashboard/target-summary?date=2026-07-16&hall=Hall-1
// Shift A / Shift B / Overall target quantity (plan tables se)
router.get("/target-summary", getTargetSummary);

// GET /api/dashboard/production-overview?date=2026-07-16&shift=A
// Hall-wise Target vs Actual vs Rejection (ProductionChart ke liye)
router.get("/production-overview", getProductionOverview);

// GET /api/dashboard/rejection-analysis?date=2026-07-16&hall=Hall-1&shift=A
// Reason-wise rejection breakdown (RejectionAnalysis donut ke liye)
router.get("/rejection-analysis", getRejectionAnalysis);

// GET /api/dashboard/loss-time-analysis?date=2026-07-16&hall=Hall-1&shift=A
// Reason-wise downtime breakdown (LossTimeAnalysis donut ke liye)
router.get("/loss-time-analysis", getLossTimeAnalysis);

// GET /api/dashboard/rejection-loss-trend?days=6&endDate=2026-07-16&hall=Hall-1&shift=A
// Daily rejection + loss time trend, zero-filled (RejectionLossTrend chart ke liye)
router.get("/rejection-loss-trend", getRejectionLossTrend);

module.exports = router;
