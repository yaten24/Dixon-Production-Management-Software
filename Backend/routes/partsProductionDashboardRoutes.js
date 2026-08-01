// routes/productionEntry.routes.js
const express = require("express");
const router = express.Router();
const productionController = require("../controllers/partsProductionDashboardController");

router.get("/dashboard", productionController.getDashboard);
router.get("/filters", productionController.getFilters);

module.exports = router;

// In your main app.js / server.js, mount this with:
//   const productionRoutes = require("./routes/productionEntry.routes");
//   app.use("/api/production", productionRoutes);