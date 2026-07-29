const pool = require("../config/db");

/*
 * ASSUMED SCHEMA (only production_loss_times was given by the client;
 * everything else below is inferred from the fields the frontend already
 * renders — rename columns/tables here to match your real schema).
 *
 * production_entries
 *   id, entry_date, hall, shift, time_slot, machine_code,
 *   operator_name, part_name, target_qty, actual_qty, good_qty,
 *   reject_qty, reject_reason, created_at
 *
 * machines
 *   id, machine_code, machine_name, hall
 *
 * loss_reasons
 *   id, reason
 *
 * production_loss_times (as given)
 *   id, production_entry_id, loss_reason_id, loss_minutes, remarks,
 *   created_by, created_at, updated_at
 */

const EFFICIENCY_EXPR = `ROUND(CASE WHEN pe.target_qty > 0 THEN pe.actual_qty / pe.target_qty * 100 ELSE 0 END, 1)`;

// builds a WHERE clause + params array from optional filters, always
// starting from a base condition (e.g. "pe.entry_date = ?")
function buildWhere(base, baseParams, { hall, shift, machine }) {
  const clauses = [base];
  const params = [...baseParams];
  if (hall) { clauses.push("pe.hall = ?"); params.push(hall); }
  if (shift) { clauses.push("pe.shift = ?"); params.push(shift); }
  if (machine) { clauses.push("pe.machine_code = ?"); params.push(machine); }
  return { where: clauses.join(" AND "), params };
}

async function totalsFor(where, params) {
  const [[row]] = await pool.query(
    `SELECT
       COALESCE(SUM(pe.target_qty), 0) AS target,
       COALESCE(SUM(pe.actual_qty), 0) AS actual,
       COALESCE(SUM(pe.reject_qty), 0) AS reject
     FROM production_entries pe
     WHERE ${where}`,
    params,
  );
  const achievement = row.target > 0 ? Math.round((row.actual / row.target) * 1000) / 10 : 0;
  return { target: row.target, actual: row.actual, reject: row.reject, achievement };
}

async function topRejectsFor(where, params) {
  const [rows] = await pool.query(
    `SELECT COALESCE(pe.reject_reason, 'Unspecified') AS reason, SUM(pe.reject_qty) AS qty
     FROM production_entries pe
     WHERE ${where}
     GROUP BY reason
     HAVING qty > 0
     ORDER BY qty DESC
     LIMIT 5`,
    params,
  );
  return rows;
}

async function topLossReasonsFor(where, params) {
  const [rows] = await pool.query(
    `SELECT lr.reason AS reason, SUM(plt.loss_minutes) AS minutes
     FROM production_loss_times plt
     JOIN production_entries pe ON pe.id = plt.production_entry_id
     JOIN loss_reasons lr ON lr.id = plt.loss_reason_id
     WHERE ${where}
     GROUP BY lr.reason
     ORDER BY minutes DESC
     LIMIT 5`,
    params,
  );
  return rows;
}

// ---------------------------------------------------------------
// DAILY REPORT — raw entry list for one business date
// ---------------------------------------------------------------
async function getDailyReport({ date, hall, shift, machine }) {
  const { where, params } = buildWhere("pe.entry_date = ?", [date], { hall, shift, machine });

  const [entries] = await pool.query(
    `SELECT
       pe.id AS production_id, pe.hall, pe.shift, pe.time_slot, pe.machine_code,
       pe.operator_name, pe.part_name, pe.target_qty, pe.actual_qty, pe.good_qty,
       pe.reject_qty, COALESCE(pl.loss_minutes, 0) AS loss_minutes,
       ${EFFICIENCY_EXPR} AS efficiency
     FROM production_entries pe
     LEFT JOIN (
       SELECT production_entry_id, SUM(loss_minutes) AS loss_minutes
       FROM production_loss_times GROUP BY production_entry_id
     ) pl ON pl.production_entry_id = pe.id
     WHERE ${where}
     ORDER BY pe.hall, pe.shift, pe.time_slot`,
    params,
  );

  const totals = await totalsFor(where, params);
  return { entries, totals };
}

// ---------------------------------------------------------------
// DAILY SUMMARY — totals sliced by hall / shift / machine, plus
// top reject and loss reasons for the day
// ---------------------------------------------------------------
async function getDailySummary({ date, hall, shift, machine }) {
  const { where, params } = buildWhere("pe.entry_date = ?", [date], { hall, shift, machine });

  const totals = await totalsFor(where, params);

  const [hallWise] = await pool.query(
    `SELECT pe.hall,
       SUM(pe.target_qty) AS target, SUM(pe.actual_qty) AS actual, SUM(pe.reject_qty) AS reject,
       ROUND(CASE WHEN SUM(pe.target_qty) > 0 THEN SUM(pe.actual_qty)/SUM(pe.target_qty)*100 ELSE 0 END, 1) AS achievement
     FROM production_entries pe WHERE ${where} GROUP BY pe.hall ORDER BY pe.hall`,
    params,
  );

  const [shiftWise] = await pool.query(
    `SELECT pe.shift,
       SUM(pe.target_qty) AS target, SUM(pe.actual_qty) AS actual, SUM(pe.reject_qty) AS reject,
       ROUND(CASE WHEN SUM(pe.target_qty) > 0 THEN SUM(pe.actual_qty)/SUM(pe.target_qty)*100 ELSE 0 END, 1) AS achievement
     FROM production_entries pe WHERE ${where} GROUP BY pe.shift ORDER BY pe.shift`,
    params,
  );

  const [machineWise] = await pool.query(
    `SELECT pe.machine_code, COALESCE(m.machine_name, pe.machine_code) AS machine_name, pe.hall,
       SUM(pe.target_qty) AS target, SUM(pe.actual_qty) AS actual, SUM(pe.reject_qty) AS reject,
       ROUND(CASE WHEN SUM(pe.target_qty) > 0 THEN SUM(pe.actual_qty)/SUM(pe.target_qty)*100 ELSE 0 END, 1) AS efficiency
     FROM production_entries pe
     LEFT JOIN machines m ON m.machine_code = pe.machine_code
     WHERE ${where}
     GROUP BY pe.machine_code, machine_name, pe.hall
     ORDER BY pe.machine_code`,
    params,
  );

  const topRejects = await topRejectsFor(where, params);
  const topLossReasons = await topLossReasonsFor(where, params);

  return { totals, hallWise, shiftWise, machineWise, topRejects, topLossReasons };
}

// ---------------------------------------------------------------
// MONTHLY REPORT — day-by-day rollup for one month
// ---------------------------------------------------------------
async function getMonthlyReport({ month, year, hall }) {
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const { where, params } = buildWhere(
    "pe.entry_date >= ? AND pe.entry_date < DATE_ADD(?, INTERVAL 1 MONTH)",
    [monthStart, monthStart],
    { hall },
  );

  const [dayWise] = await pool.query(
    `SELECT pe.entry_date,
       SUM(pe.target_qty) AS target, SUM(pe.actual_qty) AS actual, SUM(pe.good_qty) AS goodQty,
       SUM(pe.reject_qty) AS reject, COALESCE(SUM(pl.loss_minutes), 0) AS lossMinutes,
       ROUND(AVG(${EFFICIENCY_EXPR}), 1) AS avgEfficiency,
       ROUND(CASE WHEN SUM(pe.target_qty) > 0 THEN SUM(pe.actual_qty)/SUM(pe.target_qty)*100 ELSE 0 END, 1) AS achievement
     FROM production_entries pe
     LEFT JOIN (
       SELECT production_entry_id, SUM(loss_minutes) AS loss_minutes
       FROM production_loss_times GROUP BY production_entry_id
     ) pl ON pl.production_entry_id = pe.id
     WHERE ${where}
     GROUP BY pe.entry_date
     ORDER BY pe.entry_date`,
    params,
  );

  const totals = await totalsFor(where, params);
  return { dayWise, totals };
}

// ---------------------------------------------------------------
// MONTHLY SUMMARY — hall/shift rollups, top reasons, daily trend
// ---------------------------------------------------------------
async function getMonthlySummary({ month, year, hall }) {
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const { where, params } = buildWhere(
    "pe.entry_date >= ? AND pe.entry_date < DATE_ADD(?, INTERVAL 1 MONTH)",
    [monthStart, monthStart],
    { hall },
  );

  const totals = await totalsFor(where, params);

  const [hallWise] = await pool.query(
    `SELECT pe.hall,
       SUM(pe.target_qty) AS target, SUM(pe.actual_qty) AS actual, SUM(pe.reject_qty) AS reject,
       ROUND(CASE WHEN SUM(pe.target_qty) > 0 THEN SUM(pe.actual_qty)/SUM(pe.target_qty)*100 ELSE 0 END, 1) AS achievement
     FROM production_entries pe WHERE ${where} GROUP BY pe.hall ORDER BY pe.hall`,
    params,
  );

  const [shiftWise] = await pool.query(
    `SELECT pe.shift,
       SUM(pe.target_qty) AS target, SUM(pe.actual_qty) AS actual, SUM(pe.reject_qty) AS reject,
       ROUND(CASE WHEN SUM(pe.target_qty) > 0 THEN SUM(pe.actual_qty)/SUM(pe.target_qty)*100 ELSE 0 END, 1) AS achievement
     FROM production_entries pe WHERE ${where} GROUP BY pe.shift ORDER BY pe.shift`,
    params,
  );

  const [dailyTrend] = await pool.query(
    `SELECT pe.entry_date,
       SUM(pe.target_qty) AS target, SUM(pe.actual_qty) AS actual,
       ROUND(CASE WHEN SUM(pe.target_qty) > 0 THEN SUM(pe.actual_qty)/SUM(pe.target_qty)*100 ELSE 0 END, 1) AS achievement
     FROM production_entries pe WHERE ${where} GROUP BY pe.entry_date ORDER BY pe.entry_date`,
    params,
  );

  const topRejects = await topRejectsFor(where, params);
  const topLossReasons = await topLossReasonsFor(where, params);

  return { totals, hallWise, shiftWise, topRejects, topLossReasons, dailyTrend };
}

// ---------------------------------------------------------------
// FILTERS — halls + machines for the dropdowns
// ---------------------------------------------------------------
async function getFilters() {
  const [hallRows] = await pool.query(
    `SELECT DISTINCT hall FROM production_entries WHERE hall IS NOT NULL ORDER BY hall`,
  );
  const [machineRows] = await pool.query(
    `SELECT machine_code, machine_name FROM machines ORDER BY machine_code`,
  );
  return { halls: hallRows.map((r) => r.hall), machines: machineRows };
}

module.exports = {
  getDailyReport,
  getDailySummary,
  getMonthlyReport,
  getMonthlySummary,
  getFilters,
};