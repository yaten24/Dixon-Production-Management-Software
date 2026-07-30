const router = require("express").Router();
const { getSummary, getOverview } = require("../controllers/monthlyDashboardController");

router.get("/summary", getSummary);
router.get("/overview", getOverview);

module.exports = router;