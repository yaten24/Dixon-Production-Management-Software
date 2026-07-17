// src/models/productionRejectDetail.model.js

const pool = require("../config/db"); // mysql2/promise pool

/* ==========================================
   Production Reject Details Model
   Table: production_reject_details
   Joins: production_entries (pe), machines (m), rejection_reasons (rr)
   ========================================== */

// Basic CRUD -------------------------------------------------

const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM production_reject_details ORDER BY created_at DESC`,
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM production_reject_details WHERE id = ?`,
    [id],
  );
  return rows[0] || null;
};

const create = async ({
  production_entry_id,
  reject_reason_id,
  reject_qty,
  remarks,
  created_by,
}) => {
  const [result] = await pool.query(
    `INSERT INTO production_reject_details
      (production_entry_id, reject_reason_id, reject_qty, remarks, created_by)
     VALUES (?, ?, ?, ?, ?)`,
    [production_entry_id, reject_reason_id, reject_qty, remarks || null, created_by || null],
  );
  return getById(result.insertId);
};

const update = async (id, { reject_qty, remarks }) => {
  await pool.query(
    `UPDATE production_reject_details
     SET reject_qty = ?, remarks = ?
     WHERE id = ?`,
    [reject_qty, remarks || null, id],
  );
  return getById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM production_reject_details WHERE id = ?`,
    [id],
  );
  return result.affectedRows > 0;
};

// Dashboard-specific queries -----------------------------------

/**
 * Joined dashboard data: date, hall, machine, reason, rejectQty
 * filters: { date, reasonId }
 * Note: `hall` lives directly on production_entries — no separate halls table.
 */
const getDashboardData = async ({ date, reasonId } = {}) => {
  const conditions = [];
  const params = [];

  if (date) {
    conditions.push("pe.entry_date = ?");
    params.push(date);
  }

  if (reasonId && reasonId !== "All") {
    conditions.push("prd.reject_reason_id = ?");
    params.push(reasonId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT
        pe.entry_date       AS date,
        pe.hall              AS hall,
        m.machine_name         AS machine,
        rr.reason_name           AS reason,
        prd.reject_qty             AS rejectQty,
        prd.remarks,
        prd.created_at
     FROM production_reject_details prd
     JOIN production_entries pe   ON pe.id = prd.production_entry_id
     JOIN machines m               ON m.id  = pe.machine_id
     JOIN rejection_reasons rr     ON rr.id = prd.reject_reason_id
     ${whereClause}
     ORDER BY pe.entry_date DESC, prd.created_at DESC`,
    params,
  );

  return rows;
};

/**
 * Hourly trend: rejection qty grouped by hour of creation
 * filters: { date }
 */
const getHourlyTrend = async ({ date } = {}) => {
  const conditions = [];
  const params = [];

  if (date) {
    conditions.push("pe.entry_date = ?");
    params.push(date);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT
        DATE_FORMAT(prd.created_at, '%H:00') AS hour,
        SUM(prd.reject_qty) AS qty
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     ${whereClause}
     GROUP BY hour
     ORDER BY hour ASC`,
    params,
  );

  return rows;
};

/**
 * Machine-wise aggregated rejection (used for bar chart / heatmap fallback)
 * filters: { date, reasonId }
 */
const getMachineWiseSummary = async ({ date, reasonId } = {}) => {
  const conditions = [];
  const params = [];

  if (date) {
    conditions.push("pe.entry_date = ?");
    params.push(date);
  }

  if (reasonId && reasonId !== "All") {
    conditions.push("prd.reject_reason_id = ?");
    params.push(reasonId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT
        m.machine_name AS machine,
        SUM(prd.reject_qty) AS qty
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     JOIN machines m            ON m.id  = pe.machine_id
     ${whereClause}
     GROUP BY m.machine_name
     ORDER BY qty DESC`,
    params,
  );

  return rows;
};

/**
 * Recent rejections (for modal)
 */
const getRecent = async (limit = 20) => {
  const [rows] = await pool.query(
    `SELECT
        pe.entry_date       AS date,
        pe.hall               AS hall,
        m.machine_name          AS machine,
        rr.reason_name            AS reason,
        prd.reject_qty              AS rejectQty,
        prd.remarks
     FROM production_reject_details prd
     JOIN production_entries pe   ON pe.id = prd.production_entry_id
     JOIN machines m               ON m.id  = pe.machine_id
     JOIN rejection_reasons rr     ON rr.id = prd.reject_reason_id
     ORDER BY prd.created_at DESC
     LIMIT ?`,
    [Number(limit)],
  );

  return rows;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getDashboardData,
  getHourlyTrend,
  getMachineWiseSummary,
  getRecent,
};