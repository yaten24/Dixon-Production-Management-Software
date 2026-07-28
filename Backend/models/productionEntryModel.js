const db = require("../config/db");

// =========================================
// FIX: mysql2 throws "Bind parameters must not contain undefined" if any
// param is undefined (e.g. an optional field the client didn't send).
// Every value that goes into a query now passes through this helper so
// missing fields become SQL NULL instead of crashing the insert/update.
// =========================================
const n = (v) => (v === undefined ? null : v);

// =========================================
// Get All Production Entries
// =========================================

exports.getAll = async () => {
  const [rows] = await db.query(
    `
        SELECT

            pe.id,

            pe.production_id,

            pe.plan_id,

            pe.plan_detail_id,

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

    plan_id,

    plan_detail_id,

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

            plan_id,

            plan_detail_id,

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
            ?,?,?,?,?,?,?,?,?,?

        )
        `,

    [
      n(production_id),

      n(plan_id),

      n(plan_detail_id),

      n(entry_date),

      n(hall),

      n(shift),

      n(time_slot),

      n(machine_id),

      n(operator_id),

      n(part_id),

      n(standard_cycle_time),

      n(actual_cycle_time),

      n(target_qty),

      n(actual_qty),

      n(good_qty),

      n(reject_qty),

      n(loss_minutes),

      n(efficiency),

      n(remarks),

      n(created_by),
    ],
  );

  return result;
};

// =========================================
// Update Production Entry
// =========================================

exports.update = async (connection, id, data) => {
  const {
    production_id,

    plan_id,

    plan_detail_id,

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

            plan_id = ?,

            plan_detail_id = ?,

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
      n(production_id),

      n(plan_id),

      n(plan_detail_id),

      n(entry_date),

      n(hall),

      n(shift),

      n(time_slot),

      n(machine_id),

      n(operator_id),

      n(part_id),

      n(standard_cycle_time),

      n(actual_cycle_time),

      n(target_qty),

      n(actual_qty),

      n(good_qty),

      n(reject_qty),

      n(loss_minutes),

      n(efficiency),

      n(remarks),

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

// BUG FIX: this used to `DELETE FROM mould_change_entries WHERE
// production_entry_id = ?` — that table doesn't exist. The real table
// (per the schema shared earlier, and per the controller's own
// insertMouldChange, which already writes to it correctly) is
// `mould_changes`, and the column that links a mould-change row back
// to a production entry is `production_id` (holding
// production_entries.id), not `production_entry_id`. This now deletes
// from the right table/column so updates can safely wipe and
// re-insert mould-change rows for an entry, same as the reject/loss
// deletes above.
exports.deleteMouldChanges = async (connection, productionEntryId) => {
  await connection.query(
    `DELETE FROM mould_changes WHERE production_id = ?`,
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

// BUG FIX: same issue as deleteMouldChanges above — this queried the
// non-existent `mould_change_entries` table with a
// `production_entry_id` column. Pointed at the real `mould_changes`
// table, filtered by its real `production_id` column. Also, that
// table's primary key is `mould_change_id`, not `id` — `ORDER BY id`
// was throwing "Unknown column 'id' in 'order clause'" since no such
// column exists on this table.
exports.getMouldChanges = async (productionEntryId) => {
  const [rows] = await db.query(
    `
        SELECT *

        FROM mould_changes

        WHERE production_id = ?

        ORDER BY mould_change_id ASC

        `,

    [productionEntryId],
  );

  return rows;
};