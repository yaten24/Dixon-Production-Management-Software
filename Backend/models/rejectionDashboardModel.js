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

// Builds the shared WHERE clause + params for date/month/reason filters.
// filters = { filterType: 'daily' | 'monthly', date, month, reasonId }
function buildFilter(filters) {
  const clauses = [];
  const params = [];

  if (filters.filterType === "monthly" && filters.month) {
    clauses.push("DATE_FORMAT(pe.entry_date, '%Y-%m') = ?");
    params.push(filters.month); // expects 'YYYY-MM'
  } else if (filters.date) {
    clauses.push("pe.entry_date = ?");
    params.push(filters.date); // expects 'YYYY-MM-DD'
  }

  if (filters.reasonId && filters.reasonId !== "all") {
    clauses.push("prd.reject_reason_id = ?");
    params.push(filters.reasonId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

async function getActiveReasons() {
  const [rows] = await pool.query(
    `SELECT id, reason_code, reason_name
     FROM rejection_reasons
     WHERE status = 'Active'
     ORDER BY reason_name ASC`,
  );
  return rows;
}

async function getAllHalls() {
  const [rows] = await pool.query(
    `SELECT DISTINCT hall FROM production_entries ORDER BY hall ASC`,
  );
  return rows.map((r) => r.hall);
}

async function getTotalRejection(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(prd.reject_qty), 0) AS total
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     ${where}`,
    params,
  );
  return rows[0].total;
}

async function getReasonDistribution(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT rr.id AS reason_id, rr.reason_name AS reason, SUM(prd.reject_qty) AS qty
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     JOIN rejection_reasons rr ON rr.id = prd.reject_reason_id
     ${where}
     GROUP BY rr.id, rr.reason_name
     ORDER BY qty DESC`,
    params,
  );
  return rows.map((r, i) => ({
    reason: r.reason,
    qty: Number(r.qty),
    color: REASON_COLORS[i % REASON_COLORS.length],
  }));
}

async function getHallWise(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT pe.hall AS hall, SUM(prd.reject_qty) AS qty
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     ${where}
     GROUP BY pe.hall
     ORDER BY qty DESC`,
    params,
  );
  return rows.map((r) => ({ hall: r.hall, qty: Number(r.qty) }));
}

// machines table columns assumed: id, machine_name (adjust if different)
async function getTopMachines(filters, limit = 5) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT
       COALESCE(m.machine_name, CONCAT('Machine #', pe.machine_id)) AS machine,
       SUM(prd.reject_qty) AS qty
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     LEFT JOIN machines m ON m.id = pe.machine_id
     ${where}
     GROUP BY machine
     ORDER BY qty DESC
     LIMIT ?`,
    [...params, limit],
  );
  return rows.map((r) => ({ machine: r.machine, qty: Number(r.qty) }));
}

// time_slot assumed format like '08:00-09:00' — hour parsed from the start.
// Adjust the SUBSTRING_INDEX expression if your time_slot format differs.
async function getHourlyTrend(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT
       CAST(SUBSTRING_INDEX(pe.time_slot, ':', 1) AS UNSIGNED) AS hour,
       SUM(prd.reject_qty) AS qty
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     ${where}
     GROUP BY hour
     ORDER BY hour ASC`,
    params,
  );
  return rows.map((r) => ({ hour: Number(r.hour), qty: Number(r.qty) }));
}

async function getRejectionSummary(filters) {
  const [
    totalRejection,
    reasonDistribution,
    hallWise,
    topMachines,
    hourlyTrend,
    allHalls,
  ] = await Promise.all([
    getTotalRejection(filters),
    getReasonDistribution(filters),
    getHallWise(filters),
    getTopMachines(filters),
    getHourlyTrend(filters),
    getAllHalls(),
  ]);

  const hallMap = new Map(hallWise.map((h) => [h.hall, h.qty]));
  const fullHallWise = allHalls
    .map((hall) => ({ hall, qty: hallMap.get(hall) || 0 }))
    .sort((a, b) => b.qty - a.qty);
  const hallsMissing = allHalls.filter((h) => !hallMap.has(h));

  const topReason = reasonDistribution[0]
    ? { label: reasonDistribution[0].reason, qty: reasonDistribution[0].qty }
    : { label: "—", qty: 0 };
  const topHall = fullHallWise[0]
    ? { label: fullHallWise[0].hall, qty: fullHallWise[0].qty }
    : { label: "—", qty: 0 };
  const topMachine = topMachines[0]
    ? { label: topMachines[0].machine, qty: topMachines[0].qty }
    : { label: "—", qty: 0 };

  return {
    totalRejection,
    topReason,
    topHall,
    topMachine,
    hallWise: fullHallWise,
    hallsMissing,
    reasonDistribution,
    reasonsTracked: reasonDistribution.length,
    topMachines,
    hourlyTrend,
  };
}

module.exports = {
  getActiveReasons,
  getRejectionSummary,
};