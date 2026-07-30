// controllers/machineDashboardController.js
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
      const target = Number(r.target) || 0;
      const actual = Number(r.actual) || 0;
      const good = Number(r.good) || 0;
      const reject = Number(r.reject) || 0;

      return {
        machineId: r.machine_id,
        machine: r.machine_code || `Machine-${r.machine_id}`,
        hall: r.hall,
        target,
        actual,
        good,
        reject,
        achievement: target > 0 ? Math.round((actual / target) * 1000) / 10 : 0,
        rejectPct: actual > 0 ? Math.round((reject / actual) * 1000) / 10 : 0,
        efficiency: Number(r.avg_efficiency) || 0,
        stdCycleTime: Number(r.std_cycle_time) || 0,
        actualCycleTime: Number(r.actual_cycle_time) || 0,
        lossMinutes: Number(r.loss_minutes) || 0,
        lastEntryDate: r.last_entry_date,
      };
    });

    const totalTarget = rows.reduce((s, r) => s + r.target, 0);
    const totalActual = rows.reduce((s, r) => s + r.actual, 0);
    const totalGood = rows.reduce((s, r) => s + r.good, 0);
    const totalReject = rows.reduce((s, r) => s + r.reject, 0);
    const effVals = rows.map((r) => r.efficiency).filter((v) => v > 0);
    const avgEfficiency = effVals.length
      ? Math.round((effVals.reduce((a, b) => a + b, 0) / effVals.length) * 100) / 100
      : 0;
    const bestMachine = rows.length ? rows.reduce((a, b) => (b.efficiency > a.efficiency ? b : a)) : null;
    const worstMachine = rows.length ? rows.reduce((a, b) => (b.efficiency < a.efficiency ? b : a)) : null;

    const totals = {
      target: totalTarget,
      actual: totalActual,
      good: totalGood,
      reject: totalReject,
      achievement: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 1000) / 10 : 0,
      rejectPct: totalActual > 0 ? Math.round((totalReject / totalActual) * 1000) / 10 : 0,
      machineCount: rows.length,
      avgEfficiency,
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