const DashboardModel = require("../models/dashboardModel");

// ==========================================================
// GET /api/dashboard/overview?date=YYYY-MM-DD&hall=C-8
//
// If `date` is not passed, defaults to TODAY's business date
// (accounting for the 8AM shift-day boundary).
// If `hall` is not passed, returns totals across all halls.
// ==========================================================
exports.getOverview = async (req, res) => {
  try {
    const { date, hall } = req.query;

    const { businessDate, currentShift } = DashboardModel.getShiftContext();
    const entryDate = date || businessDate;

    const [totals, shiftWise, runningMachines, totalMachines] =
      await Promise.all([
        DashboardModel.getOverviewTotals(entryDate, hall),
        DashboardModel.getShiftWiseTotals(entryDate, hall),
        DashboardModel.getRunningMachinesCount(entryDate, currentShift, hall),
        DashboardModel.getTotalMachinesCount(hall),
      ]);

    const totalTarget = Number(totals.total_target) || 0;
    const totalActual = Number(totals.total_actual) || 0;
    const totalReject = Number(totals.total_reject) || 0;
    const totalLossMinutes = Number(totals.total_loss_minutes) || 0;

    const efficiency = totalTarget
      ? Number(((totalActual / totalTarget) * 100).toFixed(2))
      : 0;

    const rejectionRate = totalActual
      ? Number(((totalReject / totalActual) * 100).toFixed(2))
      : 0;

    // normalize shift-wise array into an { A: {...}, B: {...} } object,
    // filling in zeros for whichever shift has no entries yet
    const shiftBreakdown = { A: null, B: null };
    shiftWise.forEach((row) => {
      shiftBreakdown[row.shift] = {
        target: Number(row.total_target) || 0,
        actual: Number(row.total_actual) || 0,
        reject: Number(row.total_reject) || 0,
        lossMinutes: Number(row.total_loss_minutes) || 0,
        machinesReporting: Number(row.machines_reporting) || 0,
      };
    });
    ["A", "B"].forEach((s) => {
      if (!shiftBreakdown[s]) {
        shiftBreakdown[s] = {
          target: 0,
          actual: 0,
          reject: 0,
          lossMinutes: 0,
          machinesReporting: 0,
        };
      }
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard overview fetched successfully.",
      data: {
        date: entryDate,
        currentShift,
        totalTarget,
        totalActual,
        totalGood: Number(totals.total_good) || 0,
        totalReject,
        totalLossMinutes,
        efficiency,
        rejectionRate,
        machinesRunning: Number(runningMachines) || 0,
        machinesTotal: Number(totalMachines) || 0,
        machinesIdle: Math.max(
          (Number(totalMachines) || 0) - (Number(runningMachines) || 0),
          0,
        ),
        totalEntries: Number(totals.total_entries) || 0,
        shiftBreakdown,
      },
      error: null,
    });
  } catch (err) {
    console.error("getOverview (dashboard) failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview.",
      data: null,
      error: err.message,
    });
  }
};

// ==========================================================
// GET /api/dashboard/halls?date=YYYY-MM-DD
//
// Returns per-hall totals (target/actual/reject/achievement/status)
// for the given business date, defaulting to today's business date.
// ==========================================================
exports.getHallWiseOverview = async (req, res) => {
  try {
    const { date } = req.query;

    const { businessDate, currentShift } = DashboardModel.getShiftContext();
    const entryDate = date || businessDate;

    const [totals, runningByHall, machineCounts] = await Promise.all([
      DashboardModel.getHallWiseTotals(entryDate),
      DashboardModel.getHallWiseRunningMachines(entryDate, currentShift),
      DashboardModel.getHallWiseMachineCounts(),
    ]);

    // lookup maps for O(1) merge below
    const runningMap = {};
    runningByHall.forEach((r) => {
      runningMap[r.hall] = Number(r.running_count) || 0;
    });

    const machineCountMap = {};
    machineCounts.forEach((m) => {
      machineCountMap[m.hall] = Number(m.total) || 0;
    });

    // ensure EVERY hall that has machines shows up, even if it logged
    // zero entries today (so the frontend can render it as Idle / 0s
    // instead of it silently disappearing from the list)
    const allHallNames = new Set([
      ...totals.map((t) => t.hall),
      ...Object.keys(machineCountMap),
    ]);

    const totalsMap = {};
    totals.forEach((t) => {
      totalsMap[t.hall] = t;
    });

    const halls = Array.from(allHallNames).map((hallName) => {
      const t = totalsMap[hallName] || {
        total_target: 0,
        total_actual: 0,
        total_reject: 0,
        total_loss_minutes: 0,
      };

      const target = Number(t.total_target) || 0;
      const actual = Number(t.total_actual) || 0;
      const reject = Number(t.total_reject) || 0;
      const lossMinutes = Number(t.total_loss_minutes) || 0;

      const achievement = target
        ? Number(((actual / target) * 100).toFixed(1))
        : 0;

      const machinesRunning = runningMap[hallName] || 0;
      const machinesTotal = machineCountMap[hallName] || 0;

      return {
        hall: hallName,
        target,
        actual,
        rejection: reject,
        lossMinutes,
        achievement: `${achievement}%`,
        machinesRunning,
        machinesTotal,
        status: machinesRunning > 0 ? "Running" : "Idle",
      };
    });

    // stable alphabetical order (e.g. C-1, C-2, ... C-8)
    halls.sort((a, b) => a.hall.localeCompare(b.hall, undefined, { numeric: true }));

    return res.status(200).json({
      success: true,
      message: "Hall-wise overview fetched successfully.",
      data: {
        date: entryDate,
        currentShift,
        halls,
      },
      error: null,
    });
  } catch (err) {
    console.error("getHallWiseOverview failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hall-wise overview.",
      data: null,
      error: err.message,
    });
  }
};
