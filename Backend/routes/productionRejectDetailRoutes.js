// src/routes/productionRejectDetail.routes.js

const express = require("express");
const router = express.Router();

const {
  getAllRejectDetails,
  getRejectDetailById,
  createRejectDetail,
  updateRejectDetail,
  deleteRejectDetail,
  getDashboardData,
  getHourlyTrend,
  getRecent,
  getMachineWiseSummary,
} = require("../controllers/productionRejectDetailController");


router.get("/dashboard", getDashboardData);
router.get("/hourly-trend", getHourlyTrend);
router.get("/machine-summary", getMachineWiseSummary);
router.get("/recent", getRecent);
router.get("/", getAllRejectDetails);
router.get("/:id", getRejectDetailById);
router.post("/", createRejectDetail);
router.put("/:id", updateRejectDetail);
router.delete("/:id", deleteRejectDetail);

module.exports = router;