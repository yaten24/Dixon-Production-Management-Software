// backend/routes/reports.routes.js
//
// Mount this in your main app:
//   const reportsRoutes = require("./routes/reports.routes");
//   app.use("/api/reports", reportsRoutes);

const express = require("express");
const router = express.Router();
const { getCatalogue, getReportData } = require("../controllers/reportsPageController");

// GET /api/reports              -> catalogue (names, categories, mode) for the listing table
router.get("/", getCatalogue);

// GET /api/reports/:key         -> data for one report
// Query params: ?date=YYYY-MM-DD (daily) | ?month=YYYY-MM (monthly) | &hall=Hall%201
router.get("/:key", getReportData);

module.exports = router;