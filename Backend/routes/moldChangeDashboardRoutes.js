const express = require("express");
const router = express.Router();
const mouldChangeController = require("../controllers/moldChangeDashboardController");
// const authMiddleware = require("../middlewares/authMiddleware"); // adjust path to your actual middleware

// router.use(authMiddleware);

router.get("/reasons", mouldChangeController.getReasons);
router.get("/summary", mouldChangeController.getSummary);
router.get("/hall-wise", mouldChangeController.getHallWise);
router.get("/reason-distribution", mouldChangeController.getReasonDistribution);
router.get("/top-machines", mouldChangeController.getTopMachines);
router.get("/hourly-trend", mouldChangeController.getHourlyTrend);

module.exports = router;

// In your main app/server file (note: frontend calls "/api/Mold-changes" —
// match the exact path/case you mount here to what API_BASE uses):
// const mouldChangeRoutes = require("./routes/mouldChangeRoutes");
// app.use("/api/Mold-changes", mouldChangeRoutes);