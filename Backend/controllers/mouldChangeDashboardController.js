const {
  getHallWiseMouldChanges,
  getPlannedVsUnplanned,
  getHourlyLoss,
  getRecentMouldChanges,
} = require("../models/mouldChangeDashboardModel");

const getDashboardSummary = async (req, res) => {
  try {
    const { date, reason = "All" } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }

    const [hallWiseMouldChanges, plannedVsUnplanned, hourlyLoss] = await Promise.all([
      getHallWiseMouldChanges(date),
      getPlannedVsUnplanned(date),
      getHourlyLoss(date, reason),
    ]);

    const allHours = [...hourlyLoss.shiftA, ...hourlyLoss.shiftB];
    const peakHourEntry = allHours.reduce(
      (max, h) => (h.lossMinutes > max.lossMinutes ? h : max),
      { label: "-", lossMinutes: 0 }
    );

    res.json({
      success: true,
      data: {
        date,
        hallWiseMouldChanges,
        plannedVsUnplanned,
        hourlyLoss,
        peakHour: peakHourEntry.lossMinutes > 0 ? peakHourEntry.label : "-",
        peakHourValue: peakHourEntry.lossMinutes,
      },
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    res.status(500).json({ success: false, message: "Failed to load mould change dashboard" });
  }
};

const getRecent = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const rows = await getRecentMouldChanges(limit);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getRecent error:", err);
    res.status(500).json({ success: false, message: "Failed to load recent mould changes" });
  }
};

module.exports = { getDashboardSummary, getRecent };