// controllers/adminDashboardController.js
const {
  getUsersByRole,
  getMachinesByHall,
  getPartsByCategory,
  getOperatorsByShift,
  getRecentAdditions,
} = require("../models/adminDashboardModel");

const sumCounts = (rows) => rows.reduce((sum, r) => sum + Number(r.count), 0);

const getAdminDashboardSummary = async (req, res) => {
  try {
    const [usersByRole, machinesByHall, partsByCategory, operatorsByShift, recentAdditions] =
      await Promise.all([
        getUsersByRole(),
        getMachinesByHall(),
        getPartsByCategory(),
        getOperatorsByShift(),
        getRecentAdditions(5),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: sumCounts(usersByRole),
          byRole: usersByRole,
        },
        machines: {
          total: sumCounts(machinesByHall),
          byHall: machinesByHall,
        },
        parts: {
          total: sumCounts(partsByCategory),
          byCategory: partsByCategory,
        },
        operators: {
          total: sumCounts(operatorsByShift),
          byShift: operatorsByShift,
        },
        recentAdditions,
      },
    });
  } catch (error) {
    console.error("[adminDashboardController] getAdminDashboardSummary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard summary",
    });
  }
};

module.exports = {
  getAdminDashboardSummary,
};