/**
 * reportController.js
 * Rewritten for the current schema:
 *   production_entries (denormalized reject_qty/loss_minutes) +
 *   production_reject_details / production_loss_times (per-reason breakdown) +
 *   mould_changes (linked via production_id -> production_entries.id)
 *
 * Single combined endpoint (matches frontend's getProductionReport call):
 *   GET /api/production/history/production
 *       ?fromDate&toDate&hall&shift&machineId&operatorId&partId
 *       &rejectReasonId&lossReasonId&mouldChange&page&limit
 *
 *   GET /api/production/history/rejection-reasons
 *   GET /api/production/history/loss-reasons
 */

const pool = require("../config/db");

// ----------------------------------------------------------------
// Filter builder — every condition is scoped to `e` (production_entries)
// so it can be reused (unchanged) inside the breakdown/mould-change
// subqueries via EXISTS, keeping all sections consistent with the
// same filter set.
// ----------------------------------------------------------------
const buildFilters = (query) => {
  const {
    fromDate,
    toDate,
    hall,
    shift,
    machineId,
    operatorId,
    partId,
    rejectReasonId,
    lossReasonId,
    mouldChange,
  } = query;

  const conditions = [];
  const params = [];

  if (fromDate && toDate) {
    conditions.push("e.entry_date BETWEEN ? AND ?");
    params.push(fromDate, toDate);
  } else if (fromDate) {
    conditions.push("e.entry_date >= ?");
    params.push(fromDate);
  } else if (toDate) {
    conditions.push("e.entry_date <= ?");
    params.push(toDate);
  }

  if (hall && hall !== "All") {
    const halls = String(hall).split(",").map((h) => h.trim()).filter(Boolean);
    if (halls.length) {
      conditions.push(`e.hall IN (${halls.map(() => "?").join(",")})`);
      params.push(...halls);
    }
  }

  if (shift && shift !== "All") {
    conditions.push("e.shift = ?");
    params.push(shift);
  }

  if (machineId) {
    conditions.push("e.machine_id = ?");
    params.push(machineId);
  }

  if (operatorId) {
    conditions.push("e.operator_id = ?");
    params.push(operatorId);
  }

  if (partId) {
    conditions.push("e.part_id = ?");
    params.push(partId);
  }

  if (rejectReasonId) {
    conditions.push(
      "EXISTS (SELECT 1 FROM production_reject_details prd WHERE prd.production_entry_id = e.id AND prd.reject_reason_id = ?)"
    );
    params.push(rejectReasonId);
  }

  if (lossReasonId) {
    conditions.push(
      "EXISTS (SELECT 1 FROM production_loss_times plt WHERE plt.production_entry_id = e.id AND plt.loss_reason_id = ?)"
    );
    params.push(lossReasonId);
  }

  if (mouldChange === "yes") {
    conditions.push("EXISTS (SELECT 1 FROM mould_changes mc WHERE mc.production_id = e.id)");
  } else if (mouldChange === "no") {
    conditions.push("NOT EXISTS (SELECT 1 FROM mould_changes mc WHERE mc.production_id = e.id)");
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereSql, params };
};

const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

// ----------------------------------------------------------------
// GET /api/production/history/production
// Returns everything the Reports page needs in one shot:
// entries, summary, hallBreakdown, rejectionBreakdown, lossBreakdown,
// mouldChangeStats.
// ----------------------------------------------------------------
const getProductionReport = async (req, res) => {
  try {
    const { whereSql, params } = buildFilters(req.query);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(2000, Math.max(1, parseInt(req.query.limit, 10) || 1000));
    const offset = (page - 1) * limit;

    // ---- Entries (detailed table) ----
    const [entries] = await pool.query(
      `
      SELECT
        e.id, e.production_id, e.entry_date, e.hall, e.shift, e.time_slot,
        m.machine_code, m.machine_name,
        o.operator_name,
        p.part_name, p.part_number,
        e.standard_cycle_time, e.actual_cycle_time,
        e.target_qty, e.actual_qty, e.good_qty, e.reject_qty,
        e.loss_minutes, e.efficiency, e.remarks
      FROM production_entries e
      JOIN machines m ON m.id = e.machine_id
      JOIN operators o ON o.id = e.operator_id
      JOIN parts p ON p.id = e.part_id
      ${whereSql}
      ORDER BY e.entry_date DESC, e.hall ASC, e.shift ASC, e.time_slot ASC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    // ---- Summary totals ----
    const [[totalsRow]] = await pool.query(
      `
      SELECT
        COUNT(*) AS totalMachines,
        COUNT(DISTINCT e.machine_id) AS distinctMachines,
        COALESCE(SUM(e.target_qty), 0) AS totalTarget,
        COALESCE(SUM(e.actual_qty), 0) AS totalActual,
        COALESCE(SUM(e.good_qty), 0) AS totalGood,
        COALESCE(SUM(e.reject_qty), 0) AS totalReject,
        COALESCE(SUM(e.loss_minutes), 0) AS totalLossMinutes,
        ROUND(COALESCE(AVG(e.efficiency), 0), 1) AS avgEfficiency
      FROM production_entries e
      JOIN machines m ON m.id = e.machine_id
      ${whereSql}
      `,
      params
    );

    // ---- Hall-wise breakdown ----
    const [hallBreakdown] = await pool.query(
      `
      SELECT
        e.hall AS hallName,
        COALESCE(SUM(e.target_qty), 0) AS target,
        COALESCE(SUM(e.actual_qty), 0) AS actual,
        COALESCE(SUM(e.reject_qty), 0) AS reject
      FROM production_entries e
      JOIN machines m ON m.id = e.machine_id
      ${whereSql}
      GROUP BY e.hall
      ORDER BY actual DESC
      `,
      params
    );

    // ---- Rejection reason-wise breakdown (via production_reject_details) ----
    const [rejectionBreakdown] = await pool.query(
      `
      SELECT
        rr.reason_code AS reasonCode,
        rr.reason_name AS reasonName,
        COALESCE(SUM(prd.reject_qty), 0) AS totalQty,
        COUNT(DISTINCT prd.production_entry_id) AS entriesCount
      FROM production_reject_details prd
      JOIN rejection_reasons rr ON rr.id = prd.reject_reason_id
      JOIN production_entries e ON e.id = prd.production_entry_id
      JOIN machines m ON m.id = e.machine_id
      ${whereSql}
      GROUP BY rr.id, rr.reason_code, rr.reason_name
      ORDER BY totalQty DESC
      LIMIT 10
      `,
      params
    );

    // ---- Loss reason-wise breakdown (via production_loss_times) ----
    const [lossBreakdown] = await pool.query(
      `
      SELECT
        lr.reason_code AS reasonCode,
        lr.reason_name AS reasonName,
        COALESCE(SUM(plt.loss_minutes), 0) AS totalMinutes,
        COUNT(DISTINCT plt.production_entry_id) AS entriesCount
      FROM production_loss_times plt
      JOIN loss_reasons lr ON lr.id = plt.loss_reason_id
      JOIN production_entries e ON e.id = plt.production_entry_id
      JOIN machines m ON m.id = e.machine_id
      ${whereSql}
      GROUP BY lr.id, lr.reason_code, lr.reason_name
      ORDER BY totalMinutes DESC
      LIMIT 10
      `,
      params
    );

    // ---- Mould change stats — same filter set, joined through the
    // linked production_entries row so date/hall/shift filters apply
    // identically to mould-change data. ----
    const [[mcRow]] = await pool.query(
      `
      SELECT
        COUNT(mc.mould_change_id) AS totalChanges,
        COALESCE(SUM(mc.downtime_minutes), 0) AS totalDurationMinutes,
        ROUND(COALESCE(AVG(mc.downtime_minutes), 0), 1) AS avgDurationMinutes
      FROM mould_changes mc
      JOIN production_entries e ON e.id = mc.production_id
      JOIN machines m ON m.id = e.machine_id
      ${whereSql}
      `,
      params
    );

    return res.json({
      success: true,
      message: "Production report fetched successfully.",
      data: {
        entries,
        summary: {
          totalMachines: totalsRow.totalMachines,
          distinctMachines: totalsRow.distinctMachines,
          totalTarget: totalsRow.totalTarget,
          totalActual: totalsRow.totalActual,
          totalGood: totalsRow.totalGood,
          totalReject: totalsRow.totalReject,
          totalLossMinutes: totalsRow.totalLossMinutes,
          avgEfficiency: totalsRow.avgEfficiency,
        },
        hallBreakdown,
        rejectionBreakdown,
        lossBreakdown,
        mouldChangeStats: {
          totalChanges: mcRow.totalChanges,
          totalDurationMinutes: mcRow.totalDurationMinutes,
          avgDurationMinutes: mcRow.avgDurationMinutes,
        },
      },
    });
  } catch (err) {
    console.error("getProductionReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch production report.",
      error: err.message,
    });
  }
};

// ----------------------------------------------------------------
// GET /api/production/history/rejection-reasons
// ----------------------------------------------------------------
const getRejectionReasonsList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, reason_code, reason_name, status
       FROM rejection_reasons
       WHERE status = 'Active'
       ORDER BY reason_name ASC`
    );
    return res.json({ success: true, message: "Rejection reasons fetched successfully.", data: rows });
  } catch (err) {
    console.error("getRejectionReasonsList error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch rejection reasons.", error: err.message });
  }
};

// ----------------------------------------------------------------
// GET /api/production/history/loss-reasons
// ----------------------------------------------------------------
const getLossReasonsList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, reason_code, category, reason_name, status
       FROM loss_reasons
       WHERE status = 'Active'
       ORDER BY reason_name ASC`
    );
    return res.json({ success: true, message: "Loss reasons fetched successfully.", data: rows });
  } catch (err) {
    console.error("getLossReasonsList error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch loss reasons.", error: err.message });
  }
};

module.exports = {
  getProductionReport,
  getRejectionReasonsList,
  getLossReasonsList,
};