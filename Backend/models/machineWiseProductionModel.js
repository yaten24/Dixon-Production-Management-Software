// models/machineSummaryModel.js
const pool = require("../config/db"); // adjust to your actual pool path

/**
 * Machine-wise aggregation of production_entries for a given month.
 * One row per machine that has entries in the period.
 * Adjust m.machine_code / m.hall below if your `machines` table uses
 * different column names.
 */
async function getMachineWiseSummary({ year, month, hall, shift }) {
  const params = [year, month];
  let where = "WHERE YEAR(pe.entry_date) = ? AND MONTH(pe.entry_date) = ?";

  if (hall && hall !== "All" && hall !== "All Halls") {
    where += " AND pe.hall = ?";
    params.push(hall);
  }
  if (shift && shift !== "All" && shift !== "All Shifts") {
    where += " AND pe.shift = ?";
    params.push(shift);
  }

  const [rows] = await pool.query(
    `SELECT
       pe.machine_id                                                      AS machine_id,
       m.machine_code                                                     AS machine_code,
       pe.hall                                                            AS hall,
       SUM(pe.target_qty)                                                 AS target,
       SUM(pe.actual_qty)                                                 AS actual,
       SUM(pe.good_qty)                                                   AS good,
       SUM(pe.reject_qty)                                                 AS reject,
       SUM(pe.loss_minutes)                                               AS loss_minutes,
       ROUND(AVG(pe.standard_cycle_time), 2)                              AS std_cycle_time,
       ROUND(AVG(pe.actual_cycle_time), 2)                                AS actual_cycle_time,
       ROUND(SUM(pe.efficiency * pe.actual_qty) / NULLIF(SUM(pe.actual_qty), 0), 2) AS avg_efficiency,
       MAX(pe.entry_date)                                                 AS last_entry_date
     FROM production_entries pe
     LEFT JOIN machines m ON m.id = pe.machine_id
     ${where}
     GROUP BY pe.machine_id, m.machine_code, pe.hall
     ORDER BY actual DESC`,
    params
  );

  return rows;
}

module.exports = { getMachineWiseSummary };