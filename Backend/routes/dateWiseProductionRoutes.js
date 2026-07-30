// routes/productionDashboardRoutes.js
const express = require("express");
const router = express.Router();
const { getMonthlyDateWise } = require("../controllers/datewiseProductionController");
// const { authMiddleware } = require("../middleware/authMiddleware"); // adjust to your actual path

router.get("/monthly-summary", getMonthlyDateWise);

module.exports = router;

// In your main app/server file:
// const productionDashboardRoutes = require("./routes/productionDashboardRoutes");
// app.use("/api/production-dashboard", productionDashboardRoutes);