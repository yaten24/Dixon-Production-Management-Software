/**
 * reportController.js
 * ---------------------------------------------------------
 * API for the Reports page.
 *
 * ASSUMPTIONS (adjust to match your actual project if different):
 *   - You are using mysql2/promise with a shared pool exported from
 *     "../config/db.js" as `module.exports = pool;`
 *   - The pool/connection is configured with `dateStrings: true` so that
 *     DATE columns (entry_date) come back as "YYYY-MM-DD" strings instead
 *     of JS Date objects (avoids timezone shift bugs). If it's NOT
 *     configured that way, the DATE_FORMAT() calls below already protect
 *     you, so it will work either way.
 *   - loss_reasons table mirrors rejection_reasons:
 *       id, reason_code, reason_name, status ENUM('Active','Inactive')
 *
 * Response shape (every endpoint):
 *   { success: true/false, message: "...", data: ... }
 * This matches the pattern already used by getAllProductionEntries()
 * on the frontend (res.success / res.data / res.message).
 * ---------------------------------------------------------
 */

const pool = require("../config/db");

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

/**
 * Builds the shared WHERE clause + params for filtering production_entries (alias "e").
 * Every report sub-query (summary, hall breakdown, rejection breakdown,
 * loss breakdown, mould-change stats, entries list) reuses this so the
 * numbers stay consistent across the whole page.
 */
const buildBaseFilter = (query) => {
  const {
    fromDate,
    toDate,
    hall, // "All" | "Hall-1" | "Hall-1,Hall-2"
    shift, // "All" | "A" | "B"
    machineId,
    operatorId,
    partId,
  } = query;

  const conditions = [];
  const params = [];

  // ---- Date range filter ----
  // entry_date is a DATE column, but we defensively format it anyway in
  // case the driver ever returns a datetime/ISO value.
  if (fromDate) {
    conditions.push("DATE(e.entry_date) >= ?");
    params.push(fromDate);
  }
  if (toDate) {
    conditions.push("DATE(e.entry_date) <= ?");
    params.push(toDate);
  }

  // ---- Hall filter (supports comma-separated multi-hall) ----
  if (hall && hall !== "All") {
    const halls = String(hall)
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (halls.length) {
      conditions.push(`e.hall IN (${halls.map(() => "?").join(",")})`);
      params.push(...halls);
    }
  }

  // ---- Shift filter ----
  if (shift && shift !== "All") {
    conditions.push("e.shift = ?");
    params.push(shift);
  }

  // ---- Machine / Operator / Part filters ----
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

  // ---- Rejection reason filter (only entries that recorded this reason) ----
  if (query.rejectReasonId) {
    conditions.push(
      `EXISTS (
         SELECT 1 FROM production_reject_details prd
         WHERE prd.production_entry_id = e.id
           AND prd.reject_reason_id = ?
       )`,
    );
    params.push(query.rejectReasonId);
  }

  // ---- Loss reason filter (only entries that recorded this loss reason) ----
  if (query.lossReasonId) {
    conditions.push(
      `EXISTS (
         SELECT 1 FROM production_loss_times plt
         WHERE plt.production_entry_id = e.id
           AND plt.loss_reason_id = ?
       )`,
    );
    params.push(query.lossReasonId);
  }

  // ---- Mould change filter ----
  // mouldChange = "yes" -> only entries that had a mould change
  // mouldChange = "no"  -> only entries with NO mould change
  if (query.mouldChange === "yes") {
    conditions.push(
      `EXISTS (SELECT 1 FROM mould_change_entries mce WHERE mce.production_entry_id = e.id)`,
    );
  } else if (query.mouldChange === "no") {
    conditions.push(
      `NOT EXISTS (SELECT 1 FROM mould_change_entries mce WHERE mce.production_entry_id = e.id)`,
    );
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereSql, params };
};

// ----------------------------------------------------------------
// GET /api/reports/production
// ----------------------------------------------------------------
const getProductionReport = async (req, res) => {
  try {
    const { whereSql, params } = buildBaseFilter(req.query);

    // Optional pagination for the raw entries table (defaults: all rows)
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = req.query.limit
      ? Math.max(parseInt(req.query.limit, 10), 1)
      : null;
    const offset = (page - 1) * (limit || 0);

    // ---------------- 1) Entries (joined for display names) ----------------
    let entriesSql = `
      SELECT
        e.id, e.production_id, e.entry_date, e.hall, e.shift, e.time_slot,
        e.machine_id, m.machine_name, m.machine_code,
        e.operator_id, o.operator_name,
        e.part_id, p.part_name, p.part_number,
        e.standard_cycle_time, e.actual_cycle_time,
        e.target_qty, e.actual_qty, e.good_qty, e.reject_qty,
        e.loss_minutes, e.efficiency, e.remarks
      FROM production_entries e
      JOIN machines m ON m.id = e.machine_id
      JOIN operators o ON o.id = e.operator_id
      JOIN parts p ON p.id = e.part_id
      ${whereSql}
      ORDER BY e.entry_date DESC, e.hall ASC, e.shift ASC, e.time_slot ASC
    `;
    const entriesParams = [...params];
    if (limit) {
      entriesSql += " LIMIT ? OFFSET ?";
      entriesParams.push(limit, offset);
    }
    const [entries] = await pool.query(entriesSql, entriesParams);

    // ---------------- 2) Summary stats ----------------
    const [[summaryRow]] = await pool.query(
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
      ${whereSql}
      `,
      params,
    );

    // ---------------- 3) Hall-wise breakdown ----------------
    const [hallBreakdown] = await pool.query(
      `
      SELECT
        e.hall AS hallName,
        COALESCE(SUM(e.actual_qty), 0) AS actual,
        COALESCE(SUM(e.target_qty), 0) AS target,
        COALESCE(SUM(e.reject_qty), 0) AS reject
      FROM production_entries e
      ${whereSql}
      GROUP BY e.hall
      ORDER BY actual DESC
      `,
      params,
    );

    // ---------------- 4) Rejection reason-wise breakdown ----------------
    const rejectWhere = whereSql
      ? whereSql.replace(/\be\./g, "e.") // clause already aliases e.*, reused as-is
      : "";
    const [rejectionBreakdown] = await pool.query(
      `
      SELECT
        rr.id AS reasonId,
        rr.reason_code AS reasonCode,
        rr.reason_name AS reasonName,
        COALESCE(SUM(prd.reject_qty), 0) AS totalQty,
        COUNT(DISTINCT prd.production_entry_id) AS entriesCount
      FROM production_reject_details prd
      JOIN rejection_reasons rr ON rr.id = prd.reject_reason_id
      JOIN production_entries e ON e.id = prd.production_entry_id
      ${rejectWhere}
      GROUP BY rr.id, rr.reason_code, rr.reason_name
      ORDER BY totalQty DESC
      `,
      params,
    );

    // ---------------- 5) Loss reason-wise breakdown ----------------
    const [lossBreakdown] = await pool.query(
      `
      SELECT
        lr.id AS reasonId,
        lr.reason_code AS reasonCode,
        lr.reason_name AS reasonName,
        COALESCE(SUM(plt.loss_minutes), 0) AS totalMinutes,
        COUNT(DISTINCT plt.production_entry_id) AS entriesCount
      FROM production_loss_times plt
      JOIN loss_reasons lr ON lr.id = plt.loss_reason_id
      JOIN production_entries e ON e.id = plt.production_entry_id
      ${rejectWhere}
      GROUP BY lr.id, lr.reason_code, lr.reason_name
      ORDER BY totalMinutes DESC
      `,
      params,
    );

    // ---------------- 6) Mould change stats ----------------
    const [[mouldChangeRow]] = await pool.query(
      `
      SELECT
        COUNT(*) AS totalChanges,
        COALESCE(SUM(mce.duration_minutes), 0) AS totalDurationMinutes,
        ROUND(COALESCE(AVG(mce.duration_minutes), 0), 1) AS avgDurationMinutes
      FROM mould_change_entries mce
      JOIN production_entries e ON e.id = mce.production_entry_id
      ${rejectWhere}
      `,
      params,
    );

    // ---------------- 7) Total row count (for pagination UI) ----------------
    const [[{ totalCount }]] = await pool.query(
      `SELECT COUNT(*) AS totalCount FROM production_entries e ${whereSql}`,
      params,
    );

    return res.json({
      success: true,
      message: "Report data fetched successfully.",
      data: {
        entries,
        pagination: limit
          ? {
              page,
              limit,
              totalCount,
              totalPages: Math.ceil(totalCount / limit),
            }
          : { page: 1, limit: totalCount, totalCount, totalPages: 1 },
        summary: {
          totalMachines: summaryRow.totalMachines,
          distinctMachines: summaryRow.distinctMachines,
          totalTarget: summaryRow.totalTarget,
          totalActual: summaryRow.totalActual,
          totalGood: summaryRow.totalGood,
          totalReject: summaryRow.totalReject,
          totalLossMinutes: summaryRow.totalLossMinutes,
          avgEfficiency: summaryRow.avgEfficiency,
        },
        hallBreakdown,
        rejectionBreakdown,
        lossBreakdown,
        mouldChangeStats: {
          totalChanges: mouldChangeRow.totalChanges,
          totalDurationMinutes: mouldChangeRow.totalDurationMinutes,
          avgDurationMinutes: mouldChangeRow.avgDurationMinutes,
        },
      },
    });
  } catch (err) {
    console.error("getProductionReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report data.",
      error: err.message,
    });
  }
};

// ----------------------------------------------------------------
// GET /api/rejection-reasons  -> dropdown list
// ----------------------------------------------------------------
const getRejectionReasonsList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, reason_code, reason_name, status
       FROM rejection_reasons
       WHERE status = 'Active'
       ORDER BY reason_name ASC`,
    );
    return res.json({
      success: true,
      message: "Rejection reasons fetched successfully.",
      data: rows,
    });
  } catch (err) {
    console.error("getRejectionReasonsList error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rejection reasons.",
      error: err.message,
    });
  }
};

// ----------------------------------------------------------------
// GET /api/loss-reasons  -> dropdown list (mirrors rejection reasons)
// ----------------------------------------------------------------
const getLossReasonsList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, reason_code, reason_name, status
       FROM loss_reasons
       WHERE status = 'Active'
       ORDER BY reason_name ASC`,
    );
    return res.json({
      success: true,
      message: "Loss reasons fetched successfully.",
      data: rows,
    });
  } catch (err) {
    console.error("getLossReasonsList error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch loss reasons.",
      error: err.message,
    });
  }
};

module.exports = {
  getProductionReport,
  getRejectionReasonsList,
  getLossReasonsList,
};
