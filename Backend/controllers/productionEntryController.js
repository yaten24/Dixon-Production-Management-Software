const db = require("../config/db");
const ProductionEntry = require("../models/productionEntryModel");

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

    // FIX: created_by used to be pulled from req.body — meaning the
    // frontend (or anyone hitting the API directly with a tool like
    // Postman) could claim to be any user by just changing a field in
    // the request. It's now taken exclusively from req.user, which comes
    // from the verified JWT in authMiddleware — impossible to spoof
    // without a valid session for that account.
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
            reject.reject_reason_id,
            reject.reject_qty,
            reject.remarks || null,
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
            loss.loss_reason_id,
            loss.loss_minutes,
            loss.remarks || null,
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
            machine_id,
            hall,
            shift,
            mould.old_part_id,
            mould.old_part_number,
            mould.new_part_id,
            mould.new_part_number,
            mould.duration_minutes,
            mould.remarks || null,
            created_by,
          ],
        );
      }
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

    // FIX: same as create — created_by (used for the activity log entry
    // on this update) comes from the verified JWT, not from req.body.
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
            reject.reject_reason_id,
            reject.reject_qty,
            reject.remarks || null,
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
            loss.loss_reason_id,
            loss.loss_minutes,
            loss.remarks || null,
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
            machine_id,
            hall,
            shift,
            mould.old_part_id,
            mould.old_part_number,
            mould.new_part_id,
            mould.new_part_number,
            mould.duration_minutes,
            mould.remarks || null,
            updated_by,
          ],
        );
      }
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
