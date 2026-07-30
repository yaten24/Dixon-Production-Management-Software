// controllers/machineWiseProductionController.js
const { getMachineWiseSummary } = require("../models/machineWiseProductionModel");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

async function getMonthlyMachineWise(req, res) {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const monthName = req.query.month;
    const month = monthName ? MONTHS.indexOf(monthName) + 1 : new Date().getMonth() + 1;
    const hall = req.query.hall;
    const shift = req.query.shift;

    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: "Invalid month" });
    }

    const dbRows = await getMachineWiseSummary({ year, month, hall, shift });

    const rows = dbRows.map((r) => {
      const hasData = Number(r.entry_count) > 0;
      const target = Number(r.target) || 0;
      const actual = Number(r.actual) || 0;
      const good = Number(r.good) || 0;
      const reject = Number(r.reject) || 0;

      return {
        machineId: r.machine_id,
        machine: r.machine_code || `Machine-${r.machine_id}`,
        hall: r.hall,
        hasData,
        target,
        actual,
        good,
        reject,
        // achievement/rejectPct/efficiency are meaningless with no data —
        // keep them 0 instead of NaN/misleading numbers, UI shows the
        // "no data" message for these rows instead of the percentages.
        achievement: hasData && target > 0 ? Math.round((actual / target) * 1000) / 10 : 0,
        rejectPct: hasData && actual > 0 ? Math.round((reject / actual) * 1000) / 10 : 0,
        efficiency: hasData ? Number(r.avg_efficiency) || 0 : 0,
        stdCycleTime: hasData ? Number(r.std_cycle_time) || 0 : 0,
        actualCycleTime: hasData ? Number(r.actual_cycle_time) || 0 : 0,
        lossMinutes: Number(r.loss_minutes) || 0,
        lastEntryDate: r.last_entry_date,
      };
    });

    const rowsWithData = rows.filter((r) => r.hasData);

    const totalTarget = rows.reduce((s, r) => s + r.target, 0);
    const totalActual = rows.reduce((s, r) => s + r.actual, 0);
    const totalGood = rows.reduce((s, r) => s + r.good, 0);
    const totalReject = rows.reduce((s, r) => s + r.reject, 0);
    const totalLossMinutes = rows.reduce((s, r) => s + r.lossMinutes, 0);

    // Volume-weighted overall efficiency — matches how each machine's own
    // efficiency is already weighted, instead of a flat average of averages
    // (a flat average would let a low-volume machine skew the total).
    const avgEfficiency = totalActual > 0
      ? Math.round((rowsWithData.reduce((s, r) => s + r.efficiency * r.actual, 0) / totalActual) * 100) / 100
      : 0;

    // Simple means for cycle times — sum/qty weighting doesn't apply the
    // same way here since cycle time is per-piece, not a percentage.
    const avgStdCycleTime = rowsWithData.length
      ? Math.round((rowsWithData.reduce((s, r) => s + r.stdCycleTime, 0) / rowsWithData.length) * 100) / 100
      : 0;
    const avgActualCycleTime = rowsWithData.length
      ? Math.round((rowsWithData.reduce((s, r) => s + r.actualCycleTime, 0) / rowsWithData.length) * 100) / 100
      : 0;

    const bestMachine = rowsWithData.length
      ? rowsWithData.reduce((a, b) => (b.efficiency > a.efficiency ? b : a))
      : null;
    const worstMachine = rowsWithData.length
      ? rowsWithData.reduce((a, b) => (b.efficiency < a.efficiency ? b : a))
      : null;

    const totals = {
      target: totalTarget,
      actual: totalActual,
      good: totalGood,
      reject: totalReject,
      achievement: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 1000) / 10 : 0,
      rejectPct: totalActual > 0 ? Math.round((totalReject / totalActual) * 1000) / 10 : 0,
      machineCount: rows.length,
      machinesWithData: rowsWithData.length,
      avgEfficiency,
      avgStdCycleTime,
      avgActualCycleTime,
      totalLossMinutes,
      bestMachine,
      worstMachine,
    };

    res.json({ success: true, data: { rows, totals } });
  } catch (err) {
    console.error("getMonthlyMachineWise error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch machine-wise summary" });
  }
}

module.exports = { getMonthlyMachineWise };