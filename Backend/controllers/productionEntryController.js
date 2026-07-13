const db = require("../config/db");
const ProductionEntry = require("../models/productionEntryModel");
const Part = require("../models/part.model");

// FIX: mysql2 throws "Bind parameters must not contain undefined" if any
// param is undefined (e.g. an optional field the client didn't send, like
// reject.remarks, mould.old_part_id, etc). This normalizes undefined -> null
// so the query never crashes because of a missing optional field.
const n = (v) => (v === undefined ? null : v);

// ==========================================================
// Get All Production Entries
// ==========================================================

exports.getAllProductionEntries = async (req, res) => {
  try {
    const entries = await ProductionEntry.getAll();

    return res.status(200).json({
      success: true,
      message: "Production entries fetched successfully.",
      data: entries,
      error: null,
    });
  } catch (err) {
    console.error("getAllProductionEntries failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch production entries.",
      data: null,
      error: err.message,
    });
  }
};

// ==========================================================
// Get Production Entry By Id (with rejects/losses/mould changes)
// ==========================================================

exports.getProductionEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await ProductionEntry.getById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Production entry not found.",
        data: null,
        error: null,
      });
    }

    entry.rejects = await ProductionEntry.getRejectDetails(id);
    entry.losses = await ProductionEntry.getLossDetails(id);
    entry.mould_changes = await ProductionEntry.getMouldChanges(id);

    return res.status(200).json({
      success: true,
      message: "Production entry fetched successfully.",
      data: entry,
      error: null,
    });
  } catch (err) {
    console.error("getProductionEntryById failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch production entry.",
      data: null,
      error: err.message,
    });
  }
};

// ==========================================================
// Delete Production Entry
// ==========================================================

exports.deleteProductionEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await ProductionEntry.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Production entry not found.",
        data: null,
        error: null,
      });
    }

    await ProductionEntry.delete(id);

    return res.status(200).json({
      success: true,
      message: "Production entry deleted successfully.",
      data: null,
      error: null,
    });
  } catch (err) {
    console.error("deleteProductionEntry failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete production entry.",
      data: null,
      error: err.message,
    });
  }
};

exports.createProductionEntry = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const created_by = req.user.id;

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
      rejects = [],
      losses = [],
      mould_changes = [],
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (
      !production_id ||
      !entry_date ||
      !hall ||
      !shift ||
      !time_slot ||
      !machine_id ||
      !operator_id ||
      !part_id
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
        data: null,
        error: null,
      });
    }

    // ==========================================
    // Duplicate Production ID
    // ==========================================

    const alreadyExists =
      await ProductionEntry.findByProductionId(production_id);

    if (alreadyExists) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "Production ID already exists.",
        data: null,
        error: null,
      });
    }

    // ==========================================
    // Create Main Entry
    // ==========================================

    const productionResult = await ProductionEntry.create(connection, {
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
    });

    const productionEntryId = productionResult.insertId;

    // ==========================================
    // Reject Details
    // ==========================================

    if (Array.isArray(rejects) && rejects.length > 0) {
      for (const reject of rejects) {
        await connection.query(
          `
          INSERT INTO production_reject_details
          (
              production_entry_id,
              reject_reason_id,
              reject_qty,
              remarks,
              created_by
          )
          VALUES (?,?,?,?,?)
          `,
          [
            productionEntryId,
            n(reject.reject_reason_id),
            n(reject.reject_qty),
            n(reject.remarks),
            created_by,
          ],
        );
      }
    }

    // ==========================================
    // Loss Details
    // ==========================================

    if (Array.isArray(losses) && losses.length > 0) {
      for (const loss of losses) {
        await connection.query(
          `
          INSERT INTO production_loss_times
          (
              production_entry_id,
              loss_reason_id,
              loss_minutes,
              remarks,
              created_by
          )
          VALUES (?,?,?,?,?)
          `,
          [
            productionEntryId,
            n(loss.loss_reason_id),
            n(loss.loss_minutes),
            n(loss.remarks),
            created_by,
          ],
        );
      }
    }

    // ==========================================
    // Mould Change Details
    // ==========================================

    if (Array.isArray(mould_changes) && mould_changes.length > 0) {
      for (const mould of mould_changes) {
        await connection.query(
          `
          INSERT INTO mould_change_entries
          (
              production_entry_id,
              machine_id,
              hall,
              shift,
              old_part_id,
              old_part_number,
              new_part_id,
              new_part_number,
              duration_minutes,
              remarks,
              created_by
          )
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
          `,
          [
            productionEntryId,
            n(machine_id),
            n(hall),
            n(shift),
            n(mould.old_part_id),
            n(mould.old_part_number),
            n(mould.new_part_id),
            n(mould.new_part_number),
            n(mould.duration_minutes),
            n(mould.remarks),
            created_by,
          ],
        );

        // Keep the NEW part's actual_cycle_time in sync with what was
        // actually observed on the floor after the mould change.
        // FIX: pass `connection` so this runs inside the SAME open
        // transaction (see part.model.js for why — otherwise this
        // deadlocks against the FK lock this same transaction holds
        // on the parts row, causing "Lock wait timeout exceeded").
        if (mould.new_part_id && mould.mould_actual_cycle_time) {
          await Part.updateActualCycleTime(
            connection,
            mould.new_part_id,
            mould.mould_actual_cycle_time,
          );
        }
      }
    }

    // Keep the main part's actual_cycle_time in sync too.
    // FIX: same reason — use the transaction connection, not the pool.
    if (part_id && actual_cycle_time) {
      await Part.updateActualCycleTime(connection, part_id, actual_cycle_time);
    }

    // ==========================================
    // Activity Log
    // ==========================================

    await connection.query(
      `
      INSERT INTO activity_logs
      (
          user_id,
          module,
          action,
          record_id,
          description
      )
      VALUES (?,?,?,?,?)
      `,
      [
        created_by,
        "Production Entry",
        "CREATE",
        productionEntryId,
        "Production entry created successfully.",
      ],
    );

    // ==========================================
    // Commit Transaction
    // ==========================================

    await connection.commit();

    const productionEntry = await ProductionEntry.getById(productionEntryId);

    productionEntry.rejects =
      await ProductionEntry.getRejectDetails(productionEntryId);

    productionEntry.losses =
      await ProductionEntry.getLossDetails(productionEntryId);

    productionEntry.mould_changes =
      await ProductionEntry.getMouldChanges(productionEntryId);

    return res.status(201).json({
      success: true,
      message: "Production entry created successfully.",
      data: productionEntry,
      error: null,
    });
  } catch (err) {
    await connection.rollback();

    console.error("createProductionEntry failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create production entry.",
      data: null,
      error: err.message,
    });
  } finally {
    connection.release();
  }
};

// ==========================================================
// Update Production Entry
// ==========================================================

exports.updateProductionEntry = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const updated_by = req.user.id;

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
      rejects = [],
      losses = [],
      mould_changes = [],
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!id) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Production entry id is required.",
        data: null,
        error: null,
      });
    }

    if (
      !production_id ||
      !entry_date ||
      !hall ||
      !shift ||
      !time_slot ||
      !machine_id ||
      !operator_id ||
      !part_id
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
        data: null,
        error: null,
      });
    }

    // ==========================================
    // Entry Must Exist
    // ==========================================

    const existing = await ProductionEntry.getById(id);

    if (!existing) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Production entry not found.",
        data: null,
        error: null,
      });
    }

    // ==========================================
    // Duplicate Production ID (only a conflict if some OTHER row owns it)
    // ==========================================

    const duplicateOwner =
      await ProductionEntry.findByProductionId(production_id);

    if (duplicateOwner && String(duplicateOwner.id) !== String(id)) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "Production ID already exists.",
        data: null,
        error: null,
      });
    }

    // ==========================================
    // Update Main Entry
    // ==========================================

    await ProductionEntry.update(connection, id, {
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
    });

    // ==========================================
    // Replace Reject Details
    // ==========================================

    await ProductionEntry.deleteRejectDetails(connection, id);

    if (Array.isArray(rejects) && rejects.length > 0) {
      for (const reject of rejects) {
        await connection.query(
          `
          INSERT INTO production_reject_details
          (
              production_entry_id,
              reject_reason_id,
              reject_qty,
              remarks,
              created_by
          )
          VALUES (?,?,?,?,?)
          `,
          [
            id,
            n(reject.reject_reason_id),
            n(reject.reject_qty),
            n(reject.remarks),
            updated_by,
          ],
        );
      }
    }

    // ==========================================
    // Replace Loss Details
    // ==========================================

    await ProductionEntry.deleteLossDetails(connection, id);

    if (Array.isArray(losses) && losses.length > 0) {
      for (const loss of losses) {
        await connection.query(
          `
          INSERT INTO production_loss_times
          (
              production_entry_id,
              loss_reason_id,
              loss_minutes,
              remarks,
              created_by
          )
          VALUES (?,?,?,?,?)
          `,
          [
            id,
            n(loss.loss_reason_id),
            n(loss.loss_minutes),
            n(loss.remarks),
            updated_by,
          ],
        );
      }
    }

    // ==========================================
    // Replace Mould Change Details
    // ==========================================

    await ProductionEntry.deleteMouldChanges(connection, id);

    if (Array.isArray(mould_changes) && mould_changes.length > 0) {
      for (const mould of mould_changes) {
        await connection.query(
          `
          INSERT INTO mould_change_entries
          (
              production_entry_id,
              machine_id,
              hall,
              shift,
              old_part_id,
              old_part_number,
              new_part_id,
              new_part_number,
              duration_minutes,
              remarks,
              created_by
          )
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
          `,
          [
            id,
            n(machine_id),
            n(hall),
            n(shift),
            n(mould.old_part_id),
            n(mould.old_part_number),
            n(mould.new_part_id),
            n(mould.new_part_number),
            n(mould.duration_minutes),
            n(mould.remarks),
            updated_by,
          ],
        );

        // Same sync as create — keep new part's actual_cycle_time current
        // whenever an entry is edited too. FIX: pass `connection` (see
        // part.model.js for why this must run on the same transaction).
        if (mould.new_part_id && mould.mould_actual_cycle_time) {
          await Part.updateActualCycleTime(
            connection,
            mould.new_part_id,
            mould.mould_actual_cycle_time,
          );
        }
      }
    }

    // Sync main part's actual_cycle_time on update as well.
    // FIX: use the transaction connection, not the pool.
    if (part_id && actual_cycle_time) {
      await Part.updateActualCycleTime(connection, part_id, actual_cycle_time);
    }

    // ==========================================
    // Activity Log
    // ==========================================

    await connection.query(
      `
      INSERT INTO activity_logs
      (
          user_id,
          module,
          action,
          record_id,
          description
      )
      VALUES (?,?,?,?,?)
      `,
      [
        updated_by,
        "Production Entry",
        "UPDATE",
        id,
        "Production entry updated successfully.",
      ],
    );

    // ==========================================
    // Commit Transaction
    // ==========================================

    await connection.commit();

    const productionEntry = await ProductionEntry.getById(id);

    productionEntry.rejects = await ProductionEntry.getRejectDetails(id);
    productionEntry.losses = await ProductionEntry.getLossDetails(id);
    productionEntry.mould_changes = await ProductionEntry.getMouldChanges(id);

    return res.status(200).json({
      success: true,
      message: "Production entry updated successfully.",
      data: productionEntry,
      error: null,
    });
  } catch (err) {
    await connection.rollback();

    console.error("updateProductionEntry failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update production entry.",
      data: null,
      error: err.message,
    });
  } finally {
    connection.release();
  }
};