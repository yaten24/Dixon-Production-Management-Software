const pool = require("../config/db");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}

function safePct(numerator, denominator) {
  if (!denominator) return 0;
  return round1((numerator / denominator) * 100);
}

function formatLastUpdate(dt) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// DB enum (machines.status) -> UI vocabulary used by Dashboard.jsx's
// STATUS_COLORS map. There's no "Setup" state in the DB yet — add one
// there (and here) if the shopfloor starts tracking changeovers.
const STATUS_MAP = { Running: "Running", Stopped: "Idle", Maintenance: "Breakdown" };

// ============================================================
// FILTER PARSING (shared contract: month defaults to CURRENT month)
// ============================================================
function parseSummaryFilters(query) {
  const hall = query.hall && query.hall !== "All" ? query.hall : null;
  const shift = query.shift && query.shift !== "All" ? query.shift : null;

  const monthIdx = query.month ? MONTHS.indexOf(query.month) : new Date().getMonth();
  const month = monthIdx >= 0 ? monthIdx + 1 : new Date().getMonth() + 1;
  const year = query.year ? Number(query.year) : new Date().getFullYear();
  const monthName = MONTHS[month - 1];

  return { hall, shift, month, year, monthName };
}

// Overview endpoint uses the exact same filter contract as summary.
const parseFilters = parseSummaryFilters;

// NOTE: uses standard "?" positional placeholders (not ":name" named
// placeholders) — the live pool is not configured with
// `namedPlaceholders: true`, so named placeholders cause a raw SQL
// syntax error ("near ':month AND ...'"). Positional params work with
// mysql2's default config regardless.
function buildEntryWhere(filters) {
  const { hall, shift, month, year } = filters;
  const clauses = ["MONTH(entry_date) = ?", "YEAR(entry_date) = ?"];
  const params = [month, year];
  if (hall) {
    clauses.push("hall = ?");
    params.push(hall);
  }
  if (shift) {
    clauses.push("shift = ?");
    params.push(shift);
  }
  return { where: clauses.join(" AND "), params };
}

// ============================================================
// EXISTING: /dashboard/summary
// ============================================================
async function getDashboardSummary(filters) {
  const { hall, shift, month, year, monthName } = filters;
  const { where: entryWhere, params: entryParams } = buildEntryWhere(filters);

  const [[totals]] = await pool.query(
    `SELECT
       COALESCE(SUM(target_qty), 0)   AS totalTarget,
       COALESCE(SUM(actual_qty), 0)   AS totalActual,
       COALESCE(SUM(good_qty), 0)     AS totalGood,
       COALESCE(SUM(reject_qty), 0)   AS totalReject,
       COALESCE(SUM(loss_minutes), 0) AS totalLossMinutes,
       COUNT(*)                       AS totalEntries
     FROM production_entries
     WHERE ${entryWhere}`,
    entryParams
  );

  const machineWhere = hall ? "WHERE hall = ?" : "";
  const machineParams = hall ? [hall] : [];

  const [[machineCounts]] = await pool.query(
    `SELECT
       COUNT(*) AS machinesTotal,
       SUM(status = 'Running') AS machinesRunning
     FROM machines
     ${machineWhere}`,
    machineParams
  );

  const machinesTotal = Number(machineCounts.machinesTotal) || 0;
  const machinesRunning = Number(machineCounts.machinesRunning) || 0;
  const machinesIdle = Math.max(machinesTotal - machinesRunning, 0);

  const efficiency = safePct(totals.totalActual, totals.totalTarget);
  const rejectionRate = safePct(totals.totalReject, totals.totalActual);

  const shiftClauses = ["MONTH(entry_date) = ?", "YEAR(entry_date) = ?"];
  const shiftParams = [month, year];
  if (hall) {
    shiftClauses.push("hall = ?");
    shiftParams.push(hall);
  }
  const shiftWhere = shiftClauses.join(" AND ");

  const [shiftRows] = await pool.query(
    `SELECT
       shift,
       COALESCE(SUM(target_qty), 0)   AS target,
       COALESCE(SUM(actual_qty), 0)   AS actual,
       COALESCE(SUM(reject_qty), 0)   AS reject,
       COALESCE(SUM(loss_minutes), 0) AS lossMinutes,
       COUNT(DISTINCT machine_id)     AS machinesReporting
     FROM production_entries
     WHERE ${shiftWhere}
     GROUP BY shift`,
    shiftParams
  );

  const shiftBreakdown = { A: emptyShift(), B: emptyShift() };
  for (const row of shiftRows) {
    if (row.shift === "A" || row.shift === "B") {
      shiftBreakdown[row.shift] = {
        target: Number(row.target),
        actual: Number(row.actual),
        reject: Number(row.reject),
        lossMinutes: Number(row.lossMinutes),
        machinesReporting: Number(row.machinesReporting) || 0,
      };
    }
  }

  return {
    month: monthName,
    year,
    currentShift: shift || "All",
    totalTarget: Number(totals.totalTarget),
    totalActual: Number(totals.totalActual),
    totalGood: Number(totals.totalGood),
    totalReject: Number(totals.totalReject),
    totalLossMinutes: Number(totals.totalLossMinutes),
    efficiency,
    rejectionRate,
    machinesRunning,
    machinesTotal,
    machinesIdle,
    totalEntries: Number(totals.totalEntries),
    shiftBreakdown,
  };
}

function emptyShift() {
  return { target: 0, actual: 0, reject: 0, lossMinutes: 0, machinesReporting: 0 };
}

// ============================================================
// NEW: /dashboard/monthly-overview -> feeds useDashboardOverview() on
// the Overall Production Dashboard page (KPIs + trend chart + hall
// table + live machine table).
// ============================================================

// ---- KPI row ----
async function getKpis(filters) {
  const { where, params } = buildEntryWhere(filters);

  const [[totals]] = await pool.query(
    `SELECT
       COALESCE(SUM(target_qty), 0) AS target,
       COALESCE(SUM(actual_qty), 0) AS actual,
       COALESCE(SUM(good_qty), 0)   AS good,
       COALESCE(SUM(reject_qty), 0) AS reject
     FROM production_entries
     WHERE ${where}`,
    params
  );

  const machineWhere = filters.hall ? "WHERE hall = ?" : "";
  const machineParams = filters.hall ? [filters.hall] : [];

  const [[machineCounts]] = await pool.query(
    `SELECT
       COUNT(*) AS totalMachines,
       SUM(status = 'Running') AS runningMachines,
       SUM(status = 'Maintenance') AS breakdownMachines
     FROM machines
     ${machineWhere}`,
    machineParams
  );

  const target = Number(totals.target);
  const actual = Number(totals.actual);
  const good = Number(totals.good);
  const reject = Number(totals.reject);
  const efficiency = safePct(actual, target);
  const quality = safePct(good, actual);
  const oee = round1((efficiency * quality) / 100);

  return {
    target,
    actual,
    good,
    reject,
    efficiency,
    oee,
    runningMachines: Number(machineCounts.runningMachines) || 0,
    totalMachines: Number(machineCounts.totalMachines) || 0,
    breakdownMachines: Number(machineCounts.breakdownMachines) || 0,
  };
}

// ---- Day-wise trend chart for the selected month ----
async function getMonthlyTrend(filters) {
  const { where, params } = buildEntryWhere(filters);

  const [rows] = await pool.query(
    `SELECT
       DAY(entry_date) AS day,
       COALESCE(SUM(target_qty), 0) AS target,
       COALESCE(SUM(actual_qty), 0) AS actual
     FROM production_entries
     WHERE ${where}
     GROUP BY DAY(entry_date)
     ORDER BY day ASC`,
    params
  );

  return rows.map((r) => ({
    day: Number(r.day),
    target: Number(r.target),
    actual: Number(r.actual),
  }));
}

// ---- Hall Wise Performance table ----
async function getHallPerformance(filters) {
  const { where, params } = buildEntryWhere(filters);

  const [prodRows] = await pool.query(
    `SELECT
       hall,
       COALESCE(SUM(target_qty), 0) AS target,
       COALESCE(SUM(actual_qty), 0) AS actual,
       COALESCE(SUM(good_qty), 0)   AS good,
       COALESCE(SUM(reject_qty), 0) AS reject
     FROM production_entries
     WHERE ${where}
     GROUP BY hall`,
    params
  );

  const machineWhere = filters.hall ? "WHERE hall = ?" : "";
  const machineParams = filters.hall ? [filters.hall] : [];

  const [machineRows] = await pool.query(
    `SELECT
       hall,
       COUNT(*) AS total,
       SUM(status = 'Running') AS running,
       SUM(status = 'Maintenance') AS breakdown
     FROM machines
     ${machineWhere}
     GROUP BY hall`,
    machineParams
  );
  const machineByHall = new Map(machineRows.map((m) => [m.hall, m]));

  return prodRows.map((r) => {
    const target = Number(r.target);
    const actual = Number(r.actual);
    const good = Number(r.good);
    const reject = Number(r.reject);
    const efficiency = safePct(actual, target);
    const quality = safePct(good, actual);
    const oee = round1((efficiency * quality) / 100);

    const m = machineByHall.get(r.hall) || { total: 0, running: 0, breakdown: 0 };
    const total = Number(m.total) || 0;
    const running = Number(m.running) || 0;
    const breakdown = Number(m.breakdown) || 0;
    const status = breakdown > 0 ? "Breakdown" : running < total ? "Idle" : "Running";

    return { hall: r.hall, target, actual, good, reject, efficiency, oee, running, total, breakdown, status };
  });
}
async function getLiveMachines(filters) {
  const { where, params } = buildEntryWhere(filters);
  const hallClause = filters.hall ? "AND m.hall = ?" : "";
  const queryParams = [...params, ...params, ...(filters.hall ? [filters.hall] : [])];

  const [rows] = await pool.query(
    `WITH agg AS (
       SELECT machine_id,
              COALESCE(SUM(target_qty), 0) AS target,
              COALESCE(SUM(actual_qty), 0) AS actual,
              COALESCE(SUM(good_qty), 0)   AS good,
              COALESCE(SUM(reject_qty), 0) AS reject
       FROM production_entries
       WHERE ${where}
       GROUP BY machine_id
     ),
     latest AS (
       SELECT pe.*,
              ROW_NUMBER() OVER (
                PARTITION BY machine_id
                ORDER BY entry_date DESC, updated_at DESC, id DESC
              ) AS rn
       FROM production_entries pe
       WHERE ${where}
     )
     SELECT
       m.id            AS machineId,
       m.machine_code,
       m.machine_name,
       m.hall,
       m.status,
       o.operator_name,
       p.part_name,
       l.actual_cycle_time,
       l.updated_at,
       a.target, a.actual, a.good, a.reject
     FROM machines m
     JOIN agg a          ON a.machine_id = m.id
     LEFT JOIN latest l  ON l.machine_id = m.id AND l.rn = 1
     LEFT JOIN operators o ON o.id = l.operator_id
     LEFT JOIN parts p     ON p.id = l.part_id
     WHERE 1 = 1 ${hallClause}
     ORDER BY m.hall, m.machine_code`,
    queryParams
  );

  return rows.map((r) => {
    const target = Number(r.target);
    const actual = Number(r.actual);
    const good = Number(r.good);
    const reject = Number(r.reject);
    const efficiency = safePct(actual, target);
    const quality = safePct(good, actual);
    const oee = round1((efficiency * quality) / 100);

    return {
      machine: r.machine_code || r.machine_name,
      hall: r.hall,
      operator: r.operator_name || "-",
      part: r.part_name || "-",
      cycleTime: r.actual_cycle_time != null ? Number(r.actual_cycle_time) : "-",
      target,
      actual,
      good,
      reject,
      efficiency,
      oee,
      status: STATUS_MAP[r.status] || r.status,
      lastUpdate: formatLastUpdate(r.updated_at),
    };
  });
}

// ---- Combined payload for the dashboard hook ----
async function getDashboardOverview(filters) {
  const [kpis, monthlyTrend, hallPerformance, liveMachines] = await Promise.all([
    getKpis(filters),
    getMonthlyTrend(filters),
    getHallPerformance(filters),
    getLiveMachines(filters),
  ]);
  return { kpis, monthlyTrend, hallPerformance, liveMachines };
}

module.exports = {
  parseSummaryFilters,
  getDashboardSummary,
  parseFilters,
  getKpis,
  getMonthlyTrend,
  getHallPerformance,
  getLiveMachines,
  getDashboardOverview,
};