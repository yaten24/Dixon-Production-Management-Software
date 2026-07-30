// controllers/productionDashboardController.js
const { getDateWiseSummary } = require("../models/dateWiseProductionModel");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const isSunday = (y, m, d) => new Date(y, m - 1, d).getDay() === 0;

const toISO = (d) => {
  // MySQL date driver may return a Date object or a "YYYY-MM-DD" string
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

async function getMonthlyDateWise(req, res) {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const monthName = req.query.month;
    const month = monthName ? MONTHS.indexOf(monthName) + 1 : new Date().getMonth() + 1;
    const hall = req.query.hall;
    const shift = req.query.shift;

    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: "Invalid month" });
    }

    const dbRows = await getDateWiseSummary({ year, month, hall, shift });
    const byDate = {};
    dbRows.forEach((r) => {
      byDate[toISO(r.entry_date)] = r;
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    let cumTarget = 0;
    let cumActual = 0;
    let cumReject = 0;
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month - 1, day);
      const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const label = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const weekday = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
      const sunday = isSunday(year, month, day);
      const dbRow = byDate[iso];

      if (sunday || !dbRow) {
        rows.push({ day, label, weekday, sunday: true });
        continue;
      }

      const target = Number(dbRow.target) || 0;
      const actual = Number(dbRow.actual) || 0;
      const reject = Number(dbRow.reject) || 0;
      const dailyOee = Number(dbRow.daily_efficiency) || 0;

      cumTarget += target;
      cumActual += actual;
      cumReject += reject;

      rows.push({
        day,
        label,
        weekday,
        sunday: false,
        target,
        cumTarget,
        actual,
        cumActual,
        achievement: target > 0 ? Math.round((actual / target) * 1000) / 10 : 0,
        reject,
        rejectPct: actual > 0 ? Math.round((reject / actual) * 1000) / 10 : 0,
        cumReject,
        cumRejectPct: cumActual > 0 ? Math.round((cumReject / cumActual) * 1000) / 10 : 0,
        dailyOee,
        cumOee:
          cumTarget > 0 && cumActual > 0
            ? Math.round((cumActual / cumTarget) * (1 - cumReject / cumActual) * 1000) / 10
            : 0,
      });
    }

    const workingRows = rows.filter((r) => !r.sunday);
    const last = workingRows[workingRows.length - 1];
    const oeeVals = workingRows.map((r) => r.dailyOee).filter((v) => v > 0);
    const avgOee = oeeVals.length
      ? Math.round((oeeVals.reduce((a, b) => a + b, 0) / oeeVals.length) * 100) / 100
      : 0;
    const bestDay = oeeVals.length
      ? workingRows.reduce((a, b) => (b.dailyOee > a.dailyOee ? b : a))
      : null;
    const worstDay = oeeVals.length
      ? workingRows.reduce((a, b) => (b.dailyOee < a.dailyOee ? b : a))
      : null;

    const totals = {
      target: last?.cumTarget || 0,
      actual: last?.cumActual || 0,
      reject: last?.cumReject || 0,
      dailyAvgTarget: workingRows.length ? Math.round((last?.cumTarget || 0) / workingRows.length) : 0,
      dailyAvgActual: workingRows.length ? Math.round((last?.cumActual || 0) / workingRows.length) : 0,
      achievement: last?.cumTarget ? Math.round((last.cumActual / last.cumTarget) * 1000) / 10 : 0,
      rejectPct: last?.cumActual ? Math.round((last.cumReject / last.cumActual) * 1000) / 10 : 0,
      dailyAvgReject: workingRows.length ? Math.round((last?.cumReject || 0) / workingRows.length) : 0,
      avgOee,
      bestDay,
      worstDay,
    };

    res.json({ success: true, data: { rows, totals } });
  } catch (err) {
    console.error("getMonthlyDateWise error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch monthly date-wise summary" });
  }
}

module.exports = { getMonthlyDateWise };