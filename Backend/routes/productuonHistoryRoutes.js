const express = require("express");
const router = express.Router();

const {
  getProductionReport,
  getRejectionReasonsList,
  getLossReasonsList,
} = require("../controllers/productionHistoryController");

// If you have an auth middleware, plug it in here, e.g.:
// const { verifyToken } = require("../middleware/authMiddleware");
// router.use(verifyToken);

router.get("/production", getProductionReport);
router.get("/rejection-reasons", getRejectionReasonsList);
router.get("/loss-reasons", getLossReasonsList);

module.exports = router;

/**
 * In your main app.js / server.js, mount this router, e.g.:
 *
 *   const reportRoutes = require("./routes/reportRoutes");
 *   app.use("/api", reportRoutes);
 *
 * That exposes:
 *   GET /api/reports/production?fromDate=&toDate=&hall=&shift=&rejectReasonId=&lossReasonId=&mouldChange=
 *   GET /api/rejection-reasons
 *   GET /api/loss-reasons
 */
