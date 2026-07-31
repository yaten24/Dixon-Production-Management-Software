const rejectionModel = require("../models/rejectionDashboardModel");

// GET /api/rejection-dashboard/reasons
async function getReasons(req, res) {
  try {
    const reasons = await rejectionModel.getActiveReasons();
    res.json({ success: true, data: reasons });
  } catch (err) {
    console.error("getReasons error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch rejection reasons" });
  }
}

// GET /api/rejection-dashboard/summary?filterType=daily&date=YYYY-MM-DD&reasonId=all
// GET /api/rejection-dashboard/summary?filterType=monthly&month=YYYY-MM&reasonId=3
async function getSummary(req, res) {
  try {
    const { filterType = "daily", date, month, reasonId } = req.query;

    if (filterType === "monthly" && !month) {
      return res.status(400).json({ success: false, message: "month is required for monthly filter (YYYY-MM)" });
    }
    if (filterType === "daily" && !date) {
      return res.status(400).json({ success: false, message: "date is required for daily filter (YYYY-MM-DD)" });
    }

    const data = await rejectionModel.getRejectionSummary({
      filterType,
      date,
      month,
      reasonId,
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch rejection summary" });
  }
}

module.exports = {
  getReasons,
  getSummary,
};