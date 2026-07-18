const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
  getRecent,
  getHeatmap,
} = require("../controllers/mouldChangeDashboardController");

router.get("/summary", getDashboardSummary);
router.get("/recent", getRecent);
router.get("/heatmap", getHeatmap);

module.exports = router;