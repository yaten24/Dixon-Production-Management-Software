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
    clauses.push("plt.loss_reason_id = ?");
    params.push(filters.reasonId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

async function getActiveReasons() {
  const [rows] = await pool.query(
    `SELECT id, reason_code, category, reason_name
     FROM loss_reasons
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

async function getTotalLoss(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(plt.loss_minutes), 0) AS total
     FROM production_loss_times plt
     JOIN production_entries pe ON pe.id = plt.production_entry_id
     ${where}`,
    params,
  );
  return Number(rows[0].total);
}

async function getReasonDistribution(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT lr.id AS reason_id, lr.reason_name AS reason, SUM(plt.loss_minutes) AS lossMinutes
     FROM production_loss_times plt
     JOIN production_entries pe ON pe.id = plt.production_entry_id
     JOIN loss_reasons lr ON lr.id = plt.loss_reason_id
     ${where}
     GROUP BY lr.id, lr.reason_name
     ORDER BY lossMinutes DESC`,
    params,
  );
  return rows.map((r, i) => ({
    reason: r.reason,
    lossMinutes: Number(r.lossMinutes),
    color: REASON_COLORS[i % REASON_COLORS.length],
  }));
}

async function getHallWise(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT pe.hall AS hall, SUM(plt.loss_minutes) AS lossMinutes
     FROM production_loss_times plt
     JOIN production_entries pe ON pe.id = plt.production_entry_id
     ${where}
     GROUP BY pe.hall
     ORDER BY lossMinutes DESC`,
    params,
  );
  return rows.map((r) => ({ hall: r.hall, lossMinutes: Number(r.lossMinutes) }));
}

// machines table column assumed: machine_name (adjust if different)
async function getTopMachines(filters, limit = 5) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT
       COALESCE(m.machine_name, CONCAT('Machine #', pe.machine_id)) AS machine,
       SUM(plt.loss_minutes) AS lossMinutes
     FROM production_loss_times plt
     JOIN production_entries pe ON pe.id = plt.production_entry_id
     LEFT JOIN machines m ON m.id = pe.machine_id
     ${where}
     GROUP BY machine
     ORDER BY lossMinutes DESC
     LIMIT ?`,
    [...params, limit],
  );
  return rows.map((r) => ({ machine: r.machine, lossMinutes: Number(r.lossMinutes) }));
}

// time_slot assumed format like '08:00-09:00' — hour parsed from the start.
// Adjust the SUBSTRING_INDEX expression if your time_slot format differs.
async function getHourlyTrend(filters) {
  const { where, params } = buildFilter(filters);
  const [rows] = await pool.query(
    `SELECT
       CAST(SUBSTRING_INDEX(pe.time_slot, ':', 1) AS UNSIGNED) AS hour,
       SUM(plt.loss_minutes) AS lossMinutes
     FROM production_loss_times plt
     JOIN production_entries pe ON pe.id = plt.production_entry_id
     ${where}
     GROUP BY hour
     ORDER BY hour ASC`,
    params,
  );
  return rows.map((r) => ({ hour: Number(r.hour), lossMinutes: Number(r.lossMinutes) }));
}

async function getLossSummary(filters) {
  const [totalLoss, reasonDistribution, hallWise, topMachines, hourlyTrend, allHalls] =
    await Promise.all([
      getTotalLoss(filters),
      getReasonDistribution(filters),
      getHallWise(filters),
      getTopMachines(filters),
      getHourlyTrend(filters),
      getAllHalls(),
    ]);

  const hallMap = new Map(hallWise.map((h) => [h.hall, h.lossMinutes]));
  const fullHallWise = allHalls
    .map((hall) => ({ hall, lossMinutes: hallMap.get(hall) || 0 }))
    .sort((a, b) => b.lossMinutes - a.lossMinutes);
  const hallsMissing = allHalls.filter((h) => !hallMap.has(h));

  const topReason = reasonDistribution[0]
    ? { label: reasonDistribution[0].reason, lossMinutes: reasonDistribution[0].lossMinutes }
    : { label: "—", lossMinutes: 0 };
  const topHall = fullHallWise[0]
    ? { label: fullHallWise[0].hall, lossMinutes: fullHallWise[0].lossMinutes }
    : { label: "—", lossMinutes: 0 };
  const topMachine = topMachines[0]
    ? { label: topMachines[0].machine, lossMinutes: topMachines[0].lossMinutes }
    : { label: "—", lossMinutes: 0 };

  return {
    totalLoss,
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
  getLossSummary,
};