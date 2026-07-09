const db = require("../config/db");

// =========================================
// Get All Production Entries
// =========================================

exports.getAll = async () => {
  const [rows] = await db.query(
    `
        SELECT

            pe.id,

            pe.production_id,

            pe.entry_date,

            pe.hall,

            pe.shift,

            pe.time_slot,

            m.machine_code,

            m.machine_name,

            o.operator_code,

            o.operator_name,

            p.part_number,

            p.part_name,

            pe.standard_cycle_time,

            pe.actual_cycle_time,

            pe.target_qty,

            pe.actual_qty,

            pe.good_qty,

            pe.reject_qty,

            pe.loss_minutes,

            pe.efficiency,

            pe.remarks,

            u.name AS created_by,

            pe.created_at

        FROM production_entries pe

        INNER JOIN machines m
            ON pe.machine_id = m.id

        INNER JOIN operators o
            ON pe.operator_id = o.id

        INNER JOIN parts p
            ON pe.part_id = p.id

        LEFT JOIN users u
            ON pe.created_by = u.id

        ORDER BY pe.created_at DESC

        `,
  );

  return rows;
};

// =========================================
// Get Production Entry By ID
// =========================================

exports.getById = async (id) => {
  const [rows] = await db.query(
    `
        SELECT

            pe.*,

            m.machine_code,

            m.machine_name,

            o.operator_code,

            o.operator_name,

            p.part_number,

            p.part_name,

            u.name AS created_by

        FROM production_entries pe

        INNER JOIN machines m
            ON pe.machine_id = m.id

        INNER JOIN operators o
            ON pe.operator_id = o.id

        INNER JOIN parts p
            ON pe.part_id = p.id

        LEFT JOIN users u
            ON pe.created_by = u.id

        WHERE pe.id = ?

        `,

    [id],
  );

  return rows[0];
};

// =========================================
// Check Production ID
// =========================================

exports.findByProductionId = async (productionId) => {
  const [rows] = await db.query(
    `
        SELECT id
        FROM production_entries
        WHERE production_id = ?
        `,

    [productionId],
  );

  return rows[0];
};

// =========================================
// Create Production Entry
// =========================================

exports.create = async (connection, data) => {
  const {
    production_id,

    entry_date,

    hall,

    shift,

    time_slot,

    machine_id,

    operator_id,

    part_id,

    standard_cycle_time,

    actual_cycle_time,

    target_qty,

    actual_qty,

    good_qty,

    reject_qty,

    loss_minutes,

    efficiency,

    remarks,

    created_by,
  } = data;

  const [result] = await connection.query(
    `
        INSERT INTO production_entries(

            production_id,

            entry_date,

            hall,

            shift,

            time_slot,

            machine_id,

            operator_id,

            part_id,

            standard_cycle_time,

            actual_cycle_time,

            target_qty,

            actual_qty,

            good_qty,

            reject_qty,

            loss_minutes,

            efficiency,

            remarks,

            created_by

        )

        VALUES(

            ?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?

        )
        `,

    [
      production_id,

      entry_date,

      hall,

      shift,

      time_slot,

      machine_id,

      operator_id,

      part_id,

      standard_cycle_time,

      actual_cycle_time,

      target_qty,

      actual_qty,

      good_qty,

      reject_qty,

      loss_minutes,

      efficiency,

      remarks,

      created_by,
    ],
  );

  return result;
};

// =========================================
// Update Production Entry
// (was missing entirely — needed for "Save & Next" re-saves and any
// edit-after-submit flow. Mirrors create()'s column list exactly.)
// =========================================

exports.update = async (connection, id, data) => {
  const {
    production_id,

    entry_date,

    hall,

    shift,

    time_slot,

    machine_id,

    operator_id,

    part_id,

    standard_cycle_time,

    actual_cycle_time,

    target_qty,

    actual_qty,

    good_qty,

    reject_qty,

    loss_minutes,

    efficiency,

    remarks,
  } = data;

  const [result] = await connection.query(
    `
        UPDATE production_entries
        SET

            production_id = ?,

            entry_date = ?,

            hall = ?,

            shift = ?,

            time_slot = ?,

            machine_id = ?,

            operator_id = ?,

            part_id = ?,

            standard_cycle_time = ?,

            actual_cycle_time = ?,

            target_qty = ?,

            actual_qty = ?,

            good_qty = ?,

            reject_qty = ?,

            loss_minutes = ?,

            efficiency = ?,

            remarks = ?,

            updated_at = NOW()

        WHERE id = ?

        `,

    [
      production_id,

      entry_date,

      hall,

      shift,

      time_slot,

      machine_id,

      operator_id,

      part_id,

      standard_cycle_time,

      actual_cycle_time,

      target_qty,

      actual_qty,

      good_qty,

      reject_qty,

      loss_minutes,

      efficiency,

      remarks,

      id,
    ],
  );

  return result;
};

// =========================================
// Delete Production Entry
// =========================================

exports.delete = async (id) => {
  const [result] = await db.query(
    `
        DELETE FROM production_entries
        WHERE id = ?
        `,

    [id],
  );

  return result;
};

// =========================================
// Delete child rows before re-inserting on update
// (rejects / losses / mould changes are fully replaced each update,
// same "replace-all" approach the create flow already uses on insert)
// =========================================

exports.deleteRejectDetails = async (connection, productionEntryId) => {
  await connection.query(
    `DELETE FROM production_reject_details WHERE production_entry_id = ?`,
    [productionEntryId],
  );
};

exports.deleteLossDetails = async (connection, productionEntryId) => {
  await connection.query(
    `DELETE FROM production_loss_times WHERE production_entry_id = ?`,
    [productionEntryId],
  );
};

exports.deleteMouldChanges = async (connection, productionEntryId) => {
  await connection.query(
    `DELETE FROM mould_change_entries WHERE production_entry_id = ?`,
    [productionEntryId],
  );
};

// =========================================
// Get Reject Details
// =========================================

exports.getRejectDetails = async (productionEntryId) => {
  const [rows] = await db.query(
    `
        SELECT

            prd.id,

            rr.reason_code,

            rr.reason_name,

            prd.reject_qty,

            prd.remarks

        FROM production_reject_details prd

        INNER JOIN rejection_reasons rr

            ON prd.reject_reason_id = rr.id

        WHERE prd.production_entry_id = ?

        `,

    [productionEntryId],
  );

  return rows;
};

// =========================================
// Get Loss Details
// =========================================

exports.getLossDetails = async (productionEntryId) => {
  const [rows] = await db.query(
    `
        SELECT

            plt.id,

            lr.reason_code,

            lr.category,

            lr.reason_name,

            plt.loss_minutes,

            plt.remarks

        FROM production_loss_times plt

        INNER JOIN loss_reasons lr

            ON plt.loss_reason_id = lr.id

        WHERE plt.production_entry_id = ?

        `,

    [productionEntryId],
  );

  return rows;
};

// =========================================
// Get Mould Change Details
// =========================================

exports.getMouldChanges = async (productionEntryId) => {
  const [rows] = await db.query(
    `
        SELECT *

        FROM mould_change_entries

        WHERE production_entry_id = ?

        ORDER BY id ASC

        `,

    [productionEntryId],
  );

  return rows;
};
