const db = require("../config/db");

// ======================================
// Get All Rejection Reasons
// ======================================

exports.getAll = async () => {
  const [rows] = await db.query(
    `
        SELECT
            id,
            reason_code,
            reason_name,
            status,
            created_at,
            updated_at
        FROM rejection_reasons
        ORDER BY id ASC
        `,
  );

  return rows;
};

// ======================================
// Get Rejection Reason By ID
// ======================================

exports.getById = async (id) => {
  const [rows] = await db.query(
    `
        SELECT
            id,
            reason_code,
            reason_name,
            status,
            created_at,
            updated_at
        FROM rejection_reasons
        WHERE id = ?
        `,

    [id],
  );

  return rows[0];
};

// ======================================
// Find By Reason Code
// ======================================

exports.findByCode = async (reasonCode) => {
  const [rows] = await db.query(
    `
        SELECT id
        FROM rejection_reasons
        WHERE reason_code = ?
        `,

    [reasonCode],
  );

  return rows[0];
};

// ======================================
// Find By Reason Name
// ======================================

exports.findByName = async (reasonName) => {
  const [rows] = await db.query(
    `
        SELECT id
        FROM rejection_reasons
        WHERE reason_name = ?
        `,

    [reasonName],
  );

  return rows[0];
};

// ======================================
// Create Rejection Reason
// ======================================

exports.create = async (data) => {
  const { reason_code, reason_name, status } = data;

  const [result] = await db.query(
    `
        INSERT INTO rejection_reasons
        (
            reason_code,
            reason_name,
            status
        )
        VALUES
        (
            ?, ?, ?
        )
        `,

    [reason_code, reason_name, status],
  );

  return result;
};

// ======================================
// Update Rejection Reason
// ======================================

exports.update = async (id, data) => {
  const { reason_code, reason_name, status } = data;

  const [result] = await db.query(
    `
        UPDATE rejection_reasons
        SET

            reason_code = ?,
            reason_name = ?,
            status = ?

        WHERE id = ?
        `,

    [reason_code, reason_name, status, id],
  );

  return result;
};

// ======================================
// Delete Rejection Reason
// ======================================

exports.delete = async (id) => {
  const [result] = await db.query(
    `
        DELETE
        FROM rejection_reasons
        WHERE id = ?
        `,

    [id],
  );

  return result;
};

// ======================================
// Update Status
// ======================================

exports.updateStatus = async (id, status) => {
  const [result] = await db.query(
    `
        UPDATE rejection_reasons
        SET status = ?
        WHERE id = ?
        `,

    [status, id],
  );

  return result;
};
