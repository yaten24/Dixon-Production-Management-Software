const express = require("express");
const router = express.Router();

const hallDashboardController = require("../controllers/hallDashboardController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/stats", hallDashboardController.getStats);
router.get("/machine-wise", hallDashboardController.getMachineWise);
router.get("/hourly-trend", hallDashboardController.getHourlyTrend);
router.get("/machine-hourly-trend", hallDashboardController.getMachineHourlyTrend); // NEW
router.get("/shift-summary", hallDashboardController.getShiftSummary);
router.get("/top-rejects", hallDashboardController.getTopRejects);
router.get("/machines", hallDashboardController.getMachinesForHall);

module.exports = router;