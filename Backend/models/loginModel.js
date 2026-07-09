const db = require("../config/db");

const Login = {
  // FIX: SELECT * pulled every column (including password) into memory
  // for every lookup, even in places that never needed it. Here we do
  // need the password (for bcrypt.compare in login), so it stays — but
  // it's now explicit, not accidental, and easy to audit.
  findByEmployeeId: async (employeeId) => {
    const [rows] = await db.query(
      `SELECT id, name, email, employee_id, department, role, status, password
       FROM users
       WHERE employee_id = ?
       LIMIT 1`,
      [employeeId],
    );

    return rows[0];
  },

  // Already excludes password — good. Kept as-is, just formatted.
  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT id, name, email, employee_id, department, role, status
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    return rows[0];
  },
};

module.exports = Login;
