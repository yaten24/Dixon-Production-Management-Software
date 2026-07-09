const db = require("../config/db");

// ===============================
// Get All Loss Reasons
// ===============================

exports.getAll = async () => {
  const [rows] = await db.query(
    `
        SELECT
            id,
            reason_code,
            category,
            reason_name,
            status,
            created_at,
            updated_at
        FROM loss_reasons
        ORDER BY id ASC
        `,
  );

  return rows;
};

// ===============================
// Get Loss Reason By ID
// ===============================

exports.getById = async (id) => {
  const [rows] = await db.query(
    `
        SELECT
            id,
            reason_code,
            category,
            reason_name,
            status,
            created_at,
            updated_at
        FROM loss_reasons
        WHERE id = ?
        `,

    [id],
  );

  return rows[0];
};

// ===============================
// Check Duplicate Code
// ===============================

exports.findByCode = async (reasonCode) => {
  const [rows] = await db.query(
    `
        SELECT id
        FROM loss_reasons
        WHERE reason_code = ?
        `,

    [reasonCode],
  );

  return rows[0];
};

// ===============================
// Check Duplicate Name
// ===============================

exports.findByName = async (reasonName) => {
  const [rows] = await db.query(
    `
        SELECT id
        FROM loss_reasons
        WHERE reason_name = ?
        `,

    [reasonName],
  );

  return rows[0];
};

// ===============================
// Create Loss Reason
// ===============================

exports.create = async (data) => {
  const { reason_code, category, reason_name, status } = data;

  const [result] = await db.query(
    `
        INSERT INTO loss_reasons
        (
            reason_code,
            category,
            reason_name,
            status
        )
        VALUES
        (
            ?,?,?,?
        )
        `,

    [reason_code, category, reason_name, status],
  );

  return result;
};

// ===============================
// Update Loss Reason
// ===============================

exports.update = async (id, data) => {
  const { reason_code, category, reason_name, status } = data;

  const [result] = await db.query(
    `
        UPDATE loss_reasons
        SET

            reason_code = ?,
            category = ?,
            reason_name = ?,
            status = ?

        WHERE id = ?
        `,

    [reason_code, category, reason_name, status, id],
  );

  return result;
};

// ===============================
// Delete Loss Reason
// ===============================

exports.delete = async (id) => {
  const [result] = await db.query(
    `
        DELETE
        FROM loss_reasons
        WHERE id = ?
        `,

    [id],
  );

  return result;
};

// ===============================
// Update Status
// ===============================

exports.updateStatus = async (id, status) => {
  const [result] = await db.query(
    `
        UPDATE loss_reasons
        SET status = ?
        WHERE id = ?
        `,

    [status, id],
  );

  return result;
};
