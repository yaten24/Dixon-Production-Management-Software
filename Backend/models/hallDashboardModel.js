const db = require("../config/db");
const DashboardModel = require("./dashboardModel"); // reuse getShiftContext

// ==========================================================
// Build a WHERE clause fragment + params for the common filters:
// hall (required), date range (from/to), machine (machine_code)
// ==========================================================
const buildFilters = ({ hall, from, to, machineCode }) => {
  const conditions = ["pe.hall = ?"];
  const params = [hall];

  if (from) {
    conditions.push("pe.entry_date >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("pe.entry_date <= ?");
    params.push(to);
  }
  if (machineCode && machineCode !== "All Machines") {
    conditions.push("m.machine_code = ?");
    params.push(machineCode);
  }

  return { where: conditions.join(" AND "), params };
};

// ==========================================================
// KPI STATS — Target / Actual / Reject / Achievement for a hall
// ==========================================================
exports.getStats = async (filters) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      COALESCE(SUM(pe.target_qty), 0) AS total_target,
      COALESCE(SUM(pe.actual_qty), 0) AS total_actual,
      COALESCE(SUM(pe.reject_qty), 0) AS total_reject,
      COALESCE(SUM(pe.loss_minutes), 0) AS total_loss_minutes,
      COUNT(DISTINCT pe.machine_id) AS machines_reporting
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    `,
    params,
  );

  return rows[0];
};

// ==========================================================
// MACHINE-WISE — per-machine target/actual/reject/achievement
// (feeds the bar chart)
// ==========================================================
exports.getMachineWise = async (filters) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      m.machine_code AS machine,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual,
      COALESCE(SUM(pe.reject_qty), 0) AS rejection
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    GROUP BY m.machine_code
    ORDER BY m.machine_code ASC
    `,
    params,
  );

  return rows.map((r) => {
    const target = Number(r.target) || 0;
    const actual = Number(r.actual) || 0;
    return {
      machine: r.machine,
      target,
      actual,
      rejection: Number(r.rejection) || 0,
      achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
    };
  });
};

// ==========================================================
// HOURLY / TIME-SLOT TREND — for a SINGLE day (date required)
// Groups by time_slot string (e.g. "08:00 - 10:00") since that's
// how ProductionEntry stores the shift slot.
// ==========================================================
exports.getHourlyTrend = async ({ hall, date, machineCode }) => {
  const conditions = ["pe.hall = ?", "pe.entry_date = ?"];
  const params = [hall, date];

  if (machineCode && machineCode !== "All Machines") {
    conditions.push("m.machine_code = ?");
    params.push(machineCode);
  }

  const [rows] = await db.query(
    `
    SELECT
      pe.time_slot AS hour,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY pe.time_slot
    `,
    params,
  );

  // Sort by the slot's starting time (e.g. "08:00 - 10:00" -> "08:00")
  const sorted = rows.sort((a, b) => {
    const aStart = a.hour?.split(" - ")[0] || "";
    const bStart = b.hour?.split(" - ")[0] || "";
    return aStart.localeCompare(bStart);
  });

  return sorted.map((r) => {
    const target = Number(r.target) || 0;
    const actual = Number(r.actual) || 0;
    return {
      hour: r.hour,
      target,
      actual,
      achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
    };
  });
};

// ==========================================================
// SHIFT SUMMARY — Shift A vs Shift B totals for a date range
// ==========================================================
exports.getShiftSummary = async (filters) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      pe.shift,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    GROUP BY pe.shift
    `,
    params,
  );

  const result = { A: { target: 0, actual: 0 }, B: { target: 0, actual: 0 } };

  rows.forEach((r) => {
    if (r.shift === "A" || r.shift === "B") {
      result[r.shift] = {
        target: Number(r.target) || 0,
        actual: Number(r.actual) || 0,
      };
    }
  });

  return result;
};

// ==========================================================
// TOP REJECTS — machines with highest reject qty (default top 5)
// ==========================================================
exports.getTopRejects = async (filters, limit = 5) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      m.machine_code AS machine,
      COALESCE(SUM(pe.reject_qty), 0) AS reject,
      COALESCE(SUM(pe.actual_qty), 0) AS production
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    GROUP BY m.machine_code
    HAVING reject > 0
    ORDER BY reject DESC
    LIMIT ?
    `,
    [...params, limit],
  );

  return rows.map((r) => ({
    machine: r.machine,
    reject: Number(r.reject) || 0,
    production: Number(r.production) || 0,
  }));
};

// ==========================================================
// MACHINES for a hall (used to populate the machine filter dropdown)
// ==========================================================
exports.getMachinesForHall = async (hall) => {
  const [rows] = await db.query(
    `SELECT id, machine_code, machine_name FROM machines WHERE hall = ? ORDER BY machine_code ASC`,
    [hall],
  );
  return rows;
};

exports.getShiftContext = DashboardModel.getShiftContext;