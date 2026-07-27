// models/adminDashboardModel.js
const pool = require("../config/db");
// NOTE: Assumed pool.js exports a mysql2/promise pool (i.e. `pool.query(...)`
// returns a Promise). If your db.js exports something else (a plain
// mysql2 connection, a wrapped `db.execute`, etc.) just adjust the
// `pool.query(...)` calls below to match your existing pattern —
// e.g. `pool.execute(...)` — the rest of the file stays the same.

/**
 * Users grouped by role (active, not soft-deleted)
 */
async function getUsersByRole() {
  const [rows] = await pool.query(
    `SELECT role AS label, COUNT(*) AS count
     FROM users
     WHERE deleted_at IS NULL
       AND status = 'Active'
     GROUP BY role
     ORDER BY count DESC`
  );
  return rows;
}

/**
 * Machines grouped by hall
 */
async function getMachinesByHall() {
  const [rows] = await pool.query(
    `SELECT hall AS label, COUNT(*) AS count
     FROM machines
     GROUP BY hall
     ORDER BY hall ASC`
  );
  return rows;
}

/**
 * Parts grouped by product category (active only)
 */
async function getPartsByCategory() {
  const [rows] = await pool.query(
    `SELECT product_category AS label, COUNT(*) AS count
     FROM parts
     WHERE status = 'Active'
     GROUP BY product_category
     ORDER BY count DESC`
  );
  return rows;
}

/**
 * Operators grouped by shift
 */
async function getOperatorsByShift() {
  const [rows] = await pool.query(
    `SELECT shift AS label, COUNT(*) AS count
     FROM operators
     GROUP BY shift
     ORDER BY shift ASC`
  );
  return rows;
}

/**
 * Recent additions across users / machines / parts / operators,
 * merged and sorted by created_at, most recent first.
 */
async function getRecentAdditions(limit = 5) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 5;

  const [rows] = await pool.query(
    `(
       SELECT created_at,
              CONCAT('New operator added — ', operator_name, ' (', hall, ')') AS text
       FROM operators
     )
     UNION ALL
     (
       SELECT created_at,
              CONCAT('Machine ', machine_code, ' registered under ', hall) AS text
       FROM machines
     )
     UNION ALL
     (
       SELECT created_at,
              CONCAT('Part "', part_name, '" added to catalog') AS text
       FROM parts
     )
     UNION ALL
     (
       SELECT created_at,
              CONCAT('New ', role, ' account created — ', name) AS text
       FROM users
       WHERE deleted_at IS NULL
     )
     ORDER BY created_at DESC
     LIMIT ?`,
    [safeLimit]
  );
  return rows;
}

module.exports = {
  getUsersByRole,
  getMachinesByHall,
  getPartsByCategory,
  getOperatorsByShift,
  getRecentAdditions,
};