// backend/controllers/dashboardController.js
const dashboardModel = require("../models/managementDashboardModel");

exports.getOverview = async (req, res) => {
  try {
    const hall = req.query.hall || null;

    const [
      dayTarget,
      shiftData,
      lossTimeReasons,
      machineStatus,
      userStatus,
      lastDay,
      currentMonth,
      weeklyOee,
      mouldChangeSummary,
    ] = await Promise.all([
      dashboardModel.getDayTarget(hall),
      dashboardModel.getShiftData(hall),
      dashboardModel.getLossTime(hall),
      dashboardModel.getMachineStatus(hall),
      dashboardModel.getUserStatus(),
      dashboardModel.getLastDay(hall),
      dashboardModel.getCurrentMonth(hall),
      dashboardModel.getWeeklyOee(hall),
      dashboardModel.getMouldChangeSummary(hall),
    ]);

    res.json({
      success: true,
      data: {
        dayTarget,
        shiftData,
        lossTimeReasons,
        machineStatus,
        userStatus,
        lastDay,
        currentMonth,
        weeklyOee,
        mouldChangeSummary,
      },
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard data" });
  }
};