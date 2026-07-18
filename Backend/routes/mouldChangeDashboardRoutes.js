const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
  getRecent,
} = require("../controllers/mouldChangeDashboardController");

router.get("/summary", getDashboardSummary);
router.get("/recent", getRecent);

module.exports = router;