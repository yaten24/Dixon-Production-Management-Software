const pool = require("../config/db"); // adjust path if your pool file is elsewhere

const REASON_COLORS = [
  "#DC2626",
  "#F59E0B",
  "#0F1D24",
  "#9CA3AF",
  "#2563EB",
  "#16A34A",
  "#7C3AED",
  "#EA580C",
];

// A mould change may only have planned_date (not yet executed) or only
// actual_start_time (unplanned, executed directly) — this covers both.
const EFFECTIVE_DATE = "COALESCE(mc.planned_date, DATE(mc.actual_start_time))";

// filters = { filterType: 'daily'|'monthly', date, month, changeType, status, reason }
function buildFilter(filters) {
  const clauses = [];
  const params = [];

  if (filters.filterType === "monthly" && filters.month) {
    clauses.push(`DATE_FORMAT(${EFFECTIVE_DATE}, '%Y-%m') = ?`);
    params.push(filters.month); // 'YYYY-MM'
  } else if (filters.date) {
    clauses.push(`${EFFECTIVE_DATE} = ?`);
    params.push(filters.date); // 'YYYY-MM-DD'
  }

  if (filters.changeType && filters.changeType !== "All") {
    clauses.push("mc.change_type = ?");
    params.push(filters.changeType);
  }
  if (filters.status && filters.status !== "All") {
    clauses.push("mc.status = ?");
    params.push(filters.status);
  }
  if (filters.reason && filters.reason !== "All") {
    clauses.push("mc.reason = ?");
    params.push(filters.reason);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

const BASE_JOIN = `
  FROM mould_changes mc
  LEFT JOIN machines m ON m.machine_code = mc.machine_code
`;

async function getDistinctReasons() {
  const [rows] = await pool.query(
    `SELECT DISTINCT reason FROM mould_changes WHERE reason IS NOT NULL AND reason <> '' ORDER BY reason ASC`,
  );
  return rows.map((r) => r.reason);
}

async function getAllHalls() {
  const [rows] = await pool.query(
    `SELECT DISTINCT hall FROM machines WHERE hall IS NOT NULL ORDER BY hall ASC`,
  );
  return rows.map((r) => r.hall);
}

async function getSummary(filters) {
  const { where, params } = buildFilter(filters);

  const [[totals]] = await pool.query(
    `SELECT
       COUNT(*) AS totalChanges,
       COALESCE(AVG(mc.downtime_minutes), 0) AS avgDowntime,
       SUM(mc.change_type = 'Planned') AS plannedCount,
       SUM(mc.change_type = 'Unplanned') AS unplannedCount
     ${BASE_JOIN}
     ${where}`,
    params,
  );

  const [[topReasonRow]] = await pool.query(
    `SELECT mc.reason AS label, COUNT(*) AS qty
     ${BASE_JOIN}
     ${where} ${where ? "AND" : "WHERE"} mc.reason IS NOT NULL AND mc.reason <> ''
     GROUP BY mc.reason
     ORDER BY qty DESC
     LIMIT 1`,
    params,
  );

  const [[topHallRow]] = await pool.query(
    `SELECT m.hall AS label, COUNT(*) AS qty
     ${BASE_JOIN}
     ${where} ${where ? "AND" : "WHERE"} m.hall IS NOT NULL
     GROUP BY m.hall
     ORDER BY qty DESC
     LIMIT 1`,
    params,
  );

  const [[topMachineRow]] = await pool.query(
    `SELECT COALESCE(m.machine_name, mc.machine_code) AS label, SUM(mc.downtime_minutes) AS qty
     ${BASE_JOIN}
     ${where}
     GROUP BY label
     ORDER BY qty DESC
     LIMIT 1`,
    params,
  );

  return {
    totalChanges: Number(totals.totalChanges),
    avgDowntime: Math.round(Number(totals.avgDowntime) * 10) / 10,
    plannedCount: Number(totals.plannedCount),
    unplannedCount: Number(totals.unplannedCount),
    topReason: topReasonRow ? { label: topReasonRow.label, qty: Number(topReasonRow.qty) } : { label: "—", qty: 0 },
    topHall: topHallRow ? { label: topHallRow.label, qty: Number(topHallRow.qty) } : { label: "—", qty: 0 },
    topMachine: topMachineRow ? { label: topMachineRow.label, qty: Number(topMachineRow.qty) } : { label: "—", qty: 0 },
  };
}

async function getHallWise(filters) {
  const { where, params } = buildFilter(filters);
  const [allHalls, [rows]] = await Promise.all([
    getAllHalls(),
    pool.query(
      `SELECT m.hall AS hall, COUNT(*) AS qty
       ${BASE_JOIN}
       ${where} ${where ? "AND" : "WHERE"} m.hall IS NOT NULL
       GROUP BY m.hall`,
      params,
    ),
  ]);

  const hallMap = new Map(rows.map((r) => [r.hall, Number(r.qty)]));
  const hallWise = allHalls
    .map((hall) => ({ hall, qty: hallMap.get(hall) || 0 }))
    .sort((a, b) => b.qty - a.qty);
  const hallsMissing = allHalls.filter((h) => !hallMap.has(h));

  return { hallWise, hallsMissing };
}

async function getReasonDistribution(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT mc.reason AS reason, COUNT(*) AS qty
     ${BASE_JOIN}
     ${where} ${where ? "AND" : "WHERE"} mc.reason IS NOT NULL AND mc.reason <> ''
     GROUP BY mc.reason
     ORDER BY qty DESC`,
    params,
  );

  const reasonDistribution = rows.map((r, i) => ({
    reason: r.reason,
    qty: Number(r.qty),
    color: REASON_COLORS[i % REASON_COLORS.length],
  }));

  return { reasonDistribution, reasonsTracked: reasonDistribution.length };
}

async function getTopMachines(filters, limit = 5) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT COALESCE(m.machine_name, mc.machine_code) AS machine, SUM(mc.downtime_minutes) AS qty
     ${BASE_JOIN}
     ${where}
     GROUP BY machine
     ORDER BY qty DESC
     LIMIT ?`,
    [...params, limit],
  );
  return { topMachines: rows.map((r) => ({ machine: r.machine, qty: Number(r.qty) || 0 })) };
}

// hour parsed from time_slot (e.g. '08:00-09:00'), falling back to
// actual_start_time when time_slot wasn't recorded. Adjust the
// SUBSTRING_INDEX expression if your time_slot format differs.
async function getHourlyTrend(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT
       COALESCE(
         CAST(SUBSTRING_INDEX(mc.time_slot, ':', 1) AS UNSIGNED),
         HOUR(mc.actual_start_time)
       ) AS hour,
       SUM(mc.downtime_minutes) AS qty
     ${BASE_JOIN}
     ${where} ${where ? "AND" : "WHERE"} (mc.time_slot IS NOT NULL OR mc.actual_start_time IS NOT NULL)
     GROUP BY hour
     ORDER BY hour ASC`,
    params,
  );
  return { hourlyTrend: rows.map((r) => ({ hour: Number(r.hour), qty: Number(r.qty) || 0 })) };
}

module.exports = {
  getDistinctReasons,
  getSummary,
  getHallWise,
  getReasonDistribution,
  getTopMachines,
  getHourlyTrend,
};