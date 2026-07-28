// backend/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { getOverview } = require("../controllers/managementDashboardController");
const  authMiddleware  = require("../middlewares/authMiddleware");

router.get("/overview", authMiddleware, getOverview);

module.exports = router;
