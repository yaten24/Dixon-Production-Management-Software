const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");

// All dashboard endpoints require a valid logged-in session
router.use(authMiddleware);

// ===========================================
// GET DASHBOARD OVERVIEW (today's production summary)
// ===========================================
router.get("/overview", dashboardController.getOverview);

// ===========================================
// GET HALL-WISE OVERVIEW (per-hall cards data)
// ===========================================
router.get("/halls", dashboardController.getHallWiseOverview);

module.exports = router;