const express = require("express");
const router = express.Router();
const {
  getSummary,
  getHourlyData,
} = require("../controllers/productionDashboardController");

router.get("/summary", getSummary);
router.get("/hourly", getHourlyData);

module.exports = router;