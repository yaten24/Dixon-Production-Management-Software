const db = require("../config/db");

const getHallSummary = async (date) => {
  const [rows] = await db.query(
    `SELECT 
        hall,
        SUM(target_qty) AS target,
        SUM(actual_qty) AS actual,
        SUM(reject_qty) AS rejection
     FROM production_entries
     WHERE entry_date = ?
     GROUP BY hall`,
    [date]
  );
  return rows;
};

const getOverallHourlyData = async (date) => {
  const [rows] = await db.query(
    `SELECT 
        time_slot AS hour,
        SUM(target_qty) AS target,
        SUM(actual_qty) AS actual
     FROM production_entries
     WHERE entry_date = ?
     GROUP BY time_slot
     ORDER BY time_slot ASC`,
    [date]
  );
  return rows;
};

module.exports = { getHallSummary, getOverallHourlyData };