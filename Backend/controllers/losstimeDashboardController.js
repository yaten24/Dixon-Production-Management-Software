const lossTimeModel = require("../models/losstimeDashboardModel");

// GET /api/loss-time-dashboard/reasons
async function getReasons(req, res) {
  try {
    const reasons = await lossTimeModel.getActiveReasons();
    res.json({ success: true, data: reasons });
  } catch (err) {
    console.error("getReasons error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch loss reasons" });
  }
}

// GET /api/loss-time-dashboard/summary?filterType=daily&date=YYYY-MM-DD&reasonId=all
// GET /api/loss-time-dashboard/summary?filterType=monthly&month=YYYY-MM&reasonId=3
async function getSummary(req, res) {
  try {
    const { filterType = "daily", date, month, reasonId } = req.query;

    if (filterType === "monthly" && !month) {
      return res.status(400).json({ success: false, message: "month is required for monthly filter (YYYY-MM)" });
    }
    if (filterType === "daily" && !date) {
      return res.status(400).json({ success: false, message: "date is required for daily filter (YYYY-MM-DD)" });
    }

    const data = await lossTimeModel.getLossSummary({ filterType, date, month, reasonId });
    res.json({ success: true, data });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch loss time summary" });
  }
}

module.exports = {
  getReasons,
  getSummary,
};