// models/machineWiseProductionModel.js
const pool = require("../config/db"); // adjust to your actual pool path

/**
 * Machine-wise aggregation for a given month.
 * Starts from `machines` (not production_entries) and LEFT JOINs entries,
 * so EVERY machine appears in the result — machines with zero entries for
 * the period come back with target/actual/etc = 0 and hasData = false.
 *
 * IMPORTANT: month/shift filters go inside the LEFT JOIN's ON clause.
 * If they were in WHERE instead, rows with no matching pe.* would get
 * filtered out entirely (LEFT JOIN would effectively become INNER JOIN),
 * and machines with no data for the period would disappear again.
 */
async function getMachineWiseSummary({ year, month, hall, shift }) {
  const joinParams = [year, month];
  let joinExtra = "";

  if (shift && shift !== "All" && shift !== "All Shifts") {
    joinExtra += " AND pe.shift = ?";
    joinParams.push(shift);
  }

  const whereParams = [];
  let where = "WHERE 1 = 1";
  if (hall && hall !== "All" && hall !== "All Halls") {
    where += " AND m.hall = ?";
    whereParams.push(hall);
  }

  const [rows] = await pool.query(
    `SELECT
       m.id                                                                AS machine_id,
       m.machine_code                                                      AS machine_code,
       m.hall                                                              AS hall,
       COALESCE(SUM(pe.target_qty), 0)                                     AS target,
       COALESCE(SUM(pe.actual_qty), 0)                                     AS actual,
       COALESCE(SUM(pe.good_qty), 0)                                       AS good,
       COALESCE(SUM(pe.reject_qty), 0)                                     AS reject,
       COALESCE(SUM(pe.loss_minutes), 0)                                   AS loss_minutes,
       ROUND(AVG(pe.standard_cycle_time), 2)                               AS std_cycle_time,
       ROUND(AVG(pe.actual_cycle_time), 2)                                 AS actual_cycle_time,
       ROUND(SUM(pe.efficiency * pe.actual_qty) / NULLIF(SUM(pe.actual_qty), 0), 2) AS avg_efficiency,
       MAX(pe.entry_date)                                                  AS last_entry_date,
       COUNT(pe.id)                                                        AS entry_count
     FROM machines m
     LEFT JOIN production_entries pe
       ON pe.machine_id = m.id
      AND YEAR(pe.entry_date) = ?
      AND MONTH(pe.entry_date) = ?
      ${joinExtra}
     ${where}
     GROUP BY m.id, m.machine_code, m.hall
     ORDER BY m.machine_code ASC`,
    [...joinParams, ...whereParams]
  );

  return rows;
}

module.exports = { getMachineWiseSummary };