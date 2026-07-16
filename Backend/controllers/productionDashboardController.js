const {
  getHallSummary,
  getOverallHourlyData,
} = require("../models/productionDashboardModel");

const getSummary = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }

    const hallSummary = await getHallSummary(date);

    const overall = hallSummary.reduce(
      (acc, h) => {
        acc.target += Number(h.target) || 0;
        acc.actual += Number(h.actual) || 0;
        acc.rejection += Number(h.rejection) || 0;
        return acc;
      },
      { target: 0, actual: 0, rejection: 0 }
    );

    res.json({
      success: true,
      data: {
        overall,
        hallSummary: hallSummary.map((h) => ({
          hall: h.hall,
          target: Number(h.target) || 0,
          actual: Number(h.actual) || 0,
          rejection: Number(h.rejection) || 0,
        })),
      },
    });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
};

const getHourlyData = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }

    const rows = await getOverallHourlyData(date);

    res.json({
      success: true,
      data: rows.map((r) => ({
        hour: r.hour,
        target: Number(r.target) || 0,
        actual: Number(r.actual) || 0,
      })),
    });
  } catch (err) {
    console.error("getHourlyData error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch hourly data" });
  }
};

module.exports = { getSummary, getHourlyData };