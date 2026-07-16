const express = require("express");
const router = express.Router();

const {
  getSummary,
  getHallWiseLoss,
  getReasonWiseLoss,
  getHeatMapData,
  getHourlyLossTotals,
  getRecentEvents,
  getFilterOptions,
} = require("../controllers/lossTimeController");

router.get("/summary", getSummary);
router.get("/hall-wise", getHallWiseLoss);
router.get("/reason-wise", getReasonWiseLoss);
router.get("/heatmap", getHeatMapData);
router.get("/hourly-totals", getHourlyLossTotals);
router.get("/recent-events", getRecentEvents);
router.get("/filters", getFilterOptions);

module.exports = router;