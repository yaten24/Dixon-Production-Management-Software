// models/productionEntryModel.js
const pool = require("../config/db"); // adjust to your actual pool path

/**
 * Day-wise aggregation of production_entries for a given month.
 * Returns one row per entry_date that has data (missing dates = no entries that day).
 */
async function getDateWiseSummary({ year, month, hall, shift }) {
  const params = [year, month];
  let where = "WHERE YEAR(entry_date) = ? AND MONTH(entry_date) = ?";

  if (hall && hall !== "All" && hall !== "All Halls") {
    where += " AND hall = ?";
    params.push(hall);
  }
  if (shift && shift !== "All" && shift !== "All Shifts") {
    where += " AND shift = ?";
    params.push(shift);
  }

  const [rows] = await pool.query(
    `SELECT
       entry_date,
       SUM(target_qty)   AS target,
       SUM(actual_qty)   AS actual,
       SUM(good_qty)     AS good,
       SUM(reject_qty)   AS reject,
       SUM(loss_minutes) AS loss_minutes,
       ROUND(SUM(efficiency * actual_qty) / NULLIF(SUM(actual_qty), 0), 2) AS daily_efficiency
     FROM production_entries
     ${where}
     GROUP BY entry_date
     ORDER BY entry_date ASC`,
    params
  );

  return rows;
}

module.exports = { getDateWiseSummary };