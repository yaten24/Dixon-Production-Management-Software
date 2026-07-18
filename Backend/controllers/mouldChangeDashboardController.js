const {
  getHallWiseMouldChanges,
  getPlannedVsUnplanned,
  getHourlyPlannedUnplanned,
  getRecentMouldChanges,
  getMouldChangeHeatmap,
} = require("../models/mouldChangeDashboardModel");

const getDashboardSummary = async (req, res) => {
  try {
    const { date, hall, reason } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }

    const filters = { hall, reason };

    const [hallWiseMouldChanges, plannedVsUnplanned, hourlyPlannedUnplanned] = await Promise.all([
      getHallWiseMouldChanges(date, filters),
      getPlannedVsUnplanned(date, filters),
      getHourlyPlannedUnplanned(date, filters),
    ]);

    const allHours = [...hourlyPlannedUnplanned.shiftA, ...hourlyPlannedUnplanned.shiftB];
    const peakHourEntry = allHours.reduce(
      (max, h) => (h.planned + h.unplanned > max.planned + max.unplanned ? h : max),
      { label: "-", planned: 0, unplanned: 0 }
    );
    const peakHourTotal = peakHourEntry.planned + peakHourEntry.unplanned;

    res.json({
      success: true,
      data: {
        date,
        hall: hall || "All",
        reason: reason || "All",
        hallWiseMouldChanges,
        plannedVsUnplanned,
        hourlyPlannedUnplanned,
        peakHour: peakHourTotal > 0 ? peakHourEntry.label : "-",
        peakHourValue: peakHourTotal,
      },
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    res.status(500).json({ success: false, message: "Failed to load mould change dashboard" });
  }
};

const getRecent = async (req, res) => {
  try {
    const { date, hall, reason, limit = 20 } = req.query;
    const rows = await getRecentMouldChanges({ date, hall, reason, limit });
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getRecent error:", err);
    res.status(500).json({ success: false, message: "Failed to load recent mould changes" });
  }
};

const getHeatmap = async (req, res) => {
  try {
    const { date, hall, reason } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }
    const data = await getMouldChangeHeatmap(date, { hall, reason });
    res.json({ success: true, data });
  } catch (err) {
    console.error("getHeatmap error:", err);
    res.status(500).json({ success: false, message: "Failed to load mould change heatmap" });
  }
};

module.exports = { getDashboardSummary, getRecent, getHeatmap };