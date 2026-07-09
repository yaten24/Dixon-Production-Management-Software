const db = require("../config/db.js");

// Get All Operators
const getAllOperators = async () => {
  const [rows] = await db.query(
    "SELECT * FROM operators ORDER BY id DESC"
  );

  return rows;
};

// Get Operator By ID
const getOperatorById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM operators WHERE id = ?",
    [id]
  );

  return rows[0];
};

// Create Operator
const createOperator = async (operator) => {
  const {
    operator_name,
    operator_code,
    shift,
    hall,
  } = operator;

  const [result] = await db.query(
    `INSERT INTO operators
    (operator_name, operator_code, shift, hall)
    VALUES (?, ?, ?, ?)`,
    [
      operator_name,
      operator_code,
      shift,
      hall,
    ]
  );

  return result;
};

// Update Operator
const updateOperator = async (id, operator) => {
  const {
    operator_name,
    operator_code,
    shift,
    hall,
  } = operator;

  const [result] = await db.query(
    `UPDATE operators
     SET
      operator_name = ?,
      operator_code = ?,
      shift = ?,
      hall = ?
     WHERE id = ?`,
    [
      operator_name,
      operator_code,
      shift,
      hall,
      id,
    ]
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

module.exports = {
  getAllOperators,
  getOperatorById,
  createOperator,
  updateOperator,
  deleteOperator,
  getOperatorByCode,
};