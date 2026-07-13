const db = require("../config/db.js");

// Shared WHERE builder for search / shift / hall filters.
function buildFilters({ search, shift, hall }) {
  const clauses = [];
  const params = [];

  if (search && search.trim()) {
    clauses.push("(o.operator_name LIKE ? OR o.operator_code LIKE ?)");
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }
  if (shift && shift !== "All") {
    clauses.push("o.shift = ?");
    params.push(shift);
  }
  if (hall && hall !== "All") {
    clauses.push("o.hall = ?");
    params.push(hall);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

// Every operator row + target-vs-actual performance %, computed from production_entries.
// LEFT JOIN so operators with no logged production still show up (0%).
const BASE_SELECT = `
  SELECT
    o.id,
    o.operator_name,
    o.operator_code,
    o.shift,
    o.hall,
    o.created_at,
    o.updated_at,
    COALESCE(SUM(pe.actual_qty), 0)  AS total_actual,
    COALESCE(SUM(pe.target_qty), 0)  AS total_target,
    CASE
      WHEN COALESCE(SUM(pe.target_qty), 0) = 0 THEN 0
      ELSE ROUND((SUM(pe.actual_qty) / SUM(pe.target_qty)) * 100, 2)
    END AS performance
  FROM operators o
  LEFT JOIN production_entries pe ON pe.operator_id = o.id
`;

// Get All Operators — now supports pagination + filters, returns { rows, total }.
const getAllOperators = async ({ page = 1, limit = 100, search = "", shift = "", hall = "" } = {}) => {
  const offset = (page - 1) * limit;
  const { where, params } = buildFilters({ search, shift, hall });

  const [rows] = await db.query(
    `${BASE_SELECT} ${where} GROUP BY o.id ORDER BY o.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await db.query(
    `SELECT COUNT(DISTINCT o.id) AS total FROM operators o ${where}`,
    params
  );

  return { rows, total: countRows[0]?.total || 0 };
};

// Get Operator By ID — now includes performance for the "view" modal.
const getOperatorById = async (id) => {
  const [rows] = await db.query(
    `${BASE_SELECT} WHERE o.id = ? GROUP BY o.id`,
    [id]
  );

  return rows[0];
};

// Create Operator
const createOperator = async (operator) => {
  const { operator_name, operator_code, shift, hall } = operator;

  const [result] = await db.query(
    `INSERT INTO operators
    (operator_name, operator_code, shift, hall)
    VALUES (?, ?, ?, ?)`,
    [operator_name, operator_code, shift, hall]
  );

  return result;
};

// Update Operator
const updateOperator = async (id, operator) => {
  const { operator_name, operator_code, shift, hall } = operator;

  const [result] = await db.query(
    `UPDATE operators
     SET
      operator_name = ?,
      operator_code = ?,
      shift = ?,
      hall = ?
     WHERE id = ?`,
    [operator_name, operator_code, shift, hall, id]
  );

  return result;
};

// Delete Operator
const deleteOperator = async (id) => {
  const [result] = await db.query(
    "DELETE FROM operators WHERE id = ?",
    [id]
  );

  return result;
};

const getOperatorByCode = async (operatorCode) => {
  const [rows] = await db.query(
    "SELECT * FROM operators WHERE operator_code = ?",
    [operatorCode]
  );

  return rows[0];
};

// NEW — distinct shift/hall values, for filter dropdowns.
const getOperatorMeta = async () => {
  const [shiftRows] = await db.query(
    "SELECT DISTINCT shift FROM operators WHERE shift IS NOT NULL AND shift <> '' ORDER BY shift"
  );
  const [hallRows] = await db.query(
    "SELECT DISTINCT hall FROM operators WHERE hall IS NOT NULL AND hall <> '' ORDER BY hall"
  );

  return {
    shifts: shiftRows.map((r) => r.shift),
    halls: hallRows.map((r) => r.hall),
  };
};

// NEW — best operators by completion %. Only counts operators who have logged
// production (total_target > 0), so a fresh operator doesn't wrongly rank as "100%".
const getTopPerformers = async (limit = 5) => {
  const [rows] = await db.query(
    `${BASE_SELECT}
     GROUP BY o.id
     HAVING total_target > 0
     ORDER BY performance DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

// NEW — same filters as getAllOperators, but no pagination: every matching row,
// for the Excel export.
const getOperatorsForExport = async ({ search = "", shift = "", hall = "" } = {}) => {
  const { where, params } = buildFilters({ search, shift, hall });

  const [rows] = await db.query(
    `${BASE_SELECT} ${where} GROUP BY o.id ORDER BY o.id DESC`,
    params
  );
  return rows;
};

module.exports = {
  getAllOperators,
  getOperatorById,
  createOperator,
  updateOperator,
  deleteOperator,
  getOperatorByCode,
  getOperatorMeta,
  getTopPerformers,
  getOperatorsForExport,
};