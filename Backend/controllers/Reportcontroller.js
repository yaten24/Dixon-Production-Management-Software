/**
 * reportController.js
 * ---------------------------------------------------------
 * API for the Reports page (ReportsPage.jsx + useProductionReports hook).
 *
 * Endpoints implemented here (mounted under /api/reports and /api):
 *   GET /api/reports/daily            -> getDailyReport
 *   GET /api/reports/daily-summary    -> getDailySummary
 *   GET /api/reports/monthly          -> getMonthlyReport
 *   GET /api/reports/monthly-summary  -> getMonthlySummary
 *   GET /api/reports/filters          -> getReportFilters
 *   GET /api/rejection-reasons        -> getRejectionReasonsList
 *   GET /api/loss-reasons             -> getLossReasonsList
 *
 * ASSUMPTIONS (adjust to match your actual schema if different):
 *   - mysql2/promise pool exported from "../config/db.js" as `module.exports = pool;`
 *   - production_entries columns: id, production_id, entry_date, hall, shift,
 *     time_slot, machine_id, operator_id, part_id, target_qty, actual_qty,
 *     good_qty, reject_qty, loss_minutes, efficiency
 *   - machines: id, machine_code, machine_name
 *   - operators: id, operator_name
 *   - parts: id, part_name, part_number
 *   - production_reject_details: production_entry_id, reject_reason_id, reject_qty
 *   - rejection_reasons: id, reason_code, reason_name, status
 *   - production_loss_times: production_entry_id, loss_reason_id, loss_minutes
 *   - loss_reasons: id, reason_code, reason_name, status
 *
 * Response shape (every endpoint): { success, message, data }
 * The frontend hook does `setData(res.data)` on the axios response, i.e. it
 * stores the WHOLE body ({ success, message, data }). ReportsPage then reads
 * `data.entries`, `data.totals`, etc. — so `data` in ReportsPage.jsx actually
 * refers to `data.data` from the API. To avoid an extra nesting bug, every
 * function below returns the report payload directly under `data`, matching
 * exactly the field names ReportsPage.jsx destructures.
 * ---------------------------------------------------------
 */

const pool = require("../config/db");

// ----------------------------------------------------------------
// Shared filter builders
// ----------------------------------------------------------------

/**
 * Daily-scoped filter (used by /daily and /daily-summary).
 * query: { date, hall, shift, machine }
 *   - date: "YYYY-MM-DD" (required, but we default defensively)
 *   - hall: hall code, or "" / undefined for all halls
 *   - shift: "A" | "B", or "" / undefined for all shifts
 *   - machine: machine_code, or "" / undefined for all machines
 */
const buildDailyFilter = (query) => {
  const { date, hall, shift, machine } = query;

  const conditions = [];
  const params = [];

  if (date) {
    conditions.push("DATE(e.entry_date) = ?");
    params.push(date);
  }
  if (hall) {
    conditions.push("e.hall = ?");
    params.push(hall);
  }
  if (shift) {
    conditions.push("e.shift = ?");
    params.push(shift);
  }
  if (machine) {
    conditions.push("m.machine_code = ?");
    params.push(machine);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereSql, params };
};

/**
 * Monthly-scoped filter (used by /monthly and /monthly-summary).
 * query: { month, year, hall }
 */
const buildMonthlyFilter = (query) => {
  const { month, year, hall } = query;

  const conditions = [];
  const params = [];

  if (year) {
    conditions.push("YEAR(e.entry_date) = ?");
    params.push(year);
  }
  if (month) {
    conditions.push("MONTH(e.entry_date) = ?");
    params.push(month);
  }
  if (hall) {
    conditions.push("e.hall = ?");
    params.push(hall);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereSql, params };
};

/** Achievement % = actual / target * 100, safe against divide-by-zero. */
const pct = (numerator, denominator) =>
  denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;

// ----------------------------------------------------------------
// GET /api/reports/daily
// ----------------------------------------------------------------
const getDailyReport = async (req, res) => {
  try {
    const { whereSql, params } = buildDailyFilter(req.query);

    const [entries] = await pool.query(
      `
      SELECT
        e.id, e.production_id, e.entry_date, e.hall, e.shift, e.time_slot,
        e.machine_id, m.machine_code, m.machine_name,
        e.operator_id, o.operator_name,
        e.part_id, p.part_name, p.part_number,
        e.target_qty, e.actual_qty, e.good_qty, e.reject_qty,
        e.loss_minutes, e.efficiency
      FROM production_entries e
      JOIN machines m ON m.id = e.machine_id
      JOIN operators o ON o.id = e.operator_id
      JOIN parts p ON p.id = e.part_id
      ${whereSql}
      ORDER BY e.hall ASC, e.shift ASC, e.time_slot ASC
      `,
      params,
    );

    return res.json({
      success: true,
      message: "Daily report fetched successfully.",
      data: { entries },
    });
  } catch (err) {
    console.error("getDailyReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily report.",
      error: err.message,
    });
  }
};

// ----------------------------------------------------------------
// GET /api/reports/daily-summary
// ----------------------------------------------------------------
const getDailySummary = async (req, res) => {
  try {
    const { whereSql, params } = buildDailyFilter(req.query);
    const data = await buildSummaryPayload(whereSql, params);

    return res.json({
      success: true,
      message: "Daily summary fetched successfully.",
      data,
    });
  } catch (err) {
    console.error("getDailySummary error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily summary.",
      error: err.message,
    });
  }
};

// ----------------------------------------------------------------
// GET /api/reports/monthly
// ----------------------------------------------------------------
const getMonthlyReport = async (req, res) => {
  try {
    const { whereSql, params } = buildMonthlyFilter(req.query);

    const [dayWise] = await pool.query(
      `
      SELECT
        DATE(e.entry_date) AS entry_date,
        COALESCE(SUM(e.target_qty), 0) AS target,
        COALESCE(SUM(e.actual_qty), 0) AS actual,
        COALESCE(SUM(e.good_qty), 0) AS goodQty,
        COALESCE(SUM(e.reject_qty), 0) AS reject,
        COALESCE(SUM(e.loss_minutes), 0) AS lossMinutes,
        ROUND(COALESCE(AVG(e.efficiency), 0), 1) AS avgEfficiency
      FROM production_entries e
      ${whereSql}
      GROUP BY DATE(e.entry_date)
      ORDER BY entry_date ASC
      `,
      params,
    );

    const shaped = dayWise.map((d) => ({
      ...d,
      achievement: pct(d.actual, d.target),
    }));

    return res.json({
      success: true,
      message: "Monthly report fetched successfully.",
      data: { dayWise: shaped },
    });
  } catch (err) {
    console.error("getMonthlyReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly report.",
      error: err.message,
    });
  }
};

// ----------------------------------------------------------------
// GET /api/reports/monthly-summary
// ----------------------------------------------------------------
const getMonthlySummary = async (req, res) => {
  try {
    const { whereSql, params } = buildMonthlyFilter(req.query);
    const data = await buildSummaryPayload(whereSql, params);

    // Daily trend, additional to the shared summary payload
    const [dailyTrend] = await pool.query(
      `
      SELECT
        DATE(e.entry_date) AS entry_date,
        COALESCE(SUM(e.target_qty), 0) AS target,
        COALESCE(SUM(e.actual_qty), 0) AS actual
      FROM production_entries e
      ${whereSql}
      GROUP BY DATE(e.entry_date)
      ORDER BY entry_date ASC
      `,
      params,
    );

    data.dailyTrend = dailyTrend.map((d) => ({
      ...d,
      achievement: pct(d.actual, d.target),
    }));

    return res.json({
      success: true,
      message: "Monthly summary fetched successfully.",
      data,
    });
  } catch (err) {
    console.error("getMonthlySummary error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly summary.",
      error: err.message,
    });
  }
};

// ----------------------------------------------------------------
// Shared summary builder — used by both daily-summary and
// monthly-summary so totals/hallWise/shiftWise/machineWise/
// topRejects/topLossReasons stay logically identical.
// ----------------------------------------------------------------
const buildSummaryPayload = async (whereSql, params) => {
  // Totals
  const [[totalsRow]] = await pool.query(
    `
    SELECT
      COALESCE(SUM(e.target_qty), 0) AS target,
      COALESCE(SUM(e.actual_qty), 0) AS actual,
      COALESCE(SUM(e.reject_qty), 0) AS reject
    FROM production_entries e
    ${whereSql}
    `,
    params,
  );
  const totals = {
    target: totalsRow.target,
    actual: totalsRow.actual,
    reject: totalsRow.reject,
    achievement: pct(totalsRow.actual, totalsRow.target),
  };

  // Hall-wise
  const [hallRows] = await pool.query(
    `
    SELECT
      e.hall AS hall,
      COALESCE(SUM(e.target_qty), 0) AS target,
      COALESCE(SUM(e.actual_qty), 0) AS actual,
      COALESCE(SUM(e.reject_qty), 0) AS reject
    FROM production_entries e
    ${whereSql}
    GROUP BY e.hall
    ORDER BY actual DESC
    `,
    params,
  );
  const hallWise = hallRows.map((h) => ({ ...h, achievement: pct(h.actual, h.target) }));

  // Shift-wise
  const [shiftRows] = await pool.query(
    `
    SELECT
      e.shift AS shift,
      COALESCE(SUM(e.target_qty), 0) AS target,
      COALESCE(SUM(e.actual_qty), 0) AS actual,
      COALESCE(SUM(e.reject_qty), 0) AS reject
    FROM production_entries e
    ${whereSql}
    GROUP BY e.shift
    ORDER BY e.shift ASC
    `,
    params,
  );
  const shiftWise = shiftRows.map((s) => ({ ...s, achievement: pct(s.actual, s.target) }));

  // Machine-wise
  const [machineRows] = await pool.query(
    `
    SELECT
      m.machine_code AS machine_code,
      m.machine_name AS machine_name,
      e.hall AS hall,
      COALESCE(SUM(e.target_qty), 0) AS target,
      COALESCE(SUM(e.actual_qty), 0) AS actual,
      COALESCE(SUM(e.reject_qty), 0) AS reject,
      ROUND(COALESCE(AVG(e.efficiency), 0), 1) AS efficiency
    FROM production_entries e
    JOIN machines m ON m.id = e.machine_id
    ${whereSql}
    GROUP BY m.machine_code, m.machine_name, e.hall
    ORDER BY actual DESC
    `,
    params,
  );
  const machineWise = machineRows;

  // Top reject reasons (uses same filter, joined through e)
  const [topRejects] = await pool.query(
    `
    SELECT
      rr.reason_name AS reason,
      COALESCE(SUM(prd.reject_qty), 0) AS qty
    FROM production_reject_details prd
    JOIN rejection_reasons rr ON rr.id = prd.reject_reason_id
    JOIN production_entries e ON e.id = prd.production_entry_id
    ${whereSql}
    GROUP BY rr.id, rr.reason_name
    ORDER BY qty DESC
    LIMIT 5
    `,
    params,
  );

  // Top loss reasons
  const [topLossReasons] = await pool.query(
    `
    SELECT
      lr.reason_name AS reason,
      COALESCE(SUM(plt.loss_minutes), 0) AS minutes
    FROM production_loss_times plt
    JOIN loss_reasons lr ON lr.id = plt.loss_reason_id
    JOIN production_entries e ON e.id = plt.production_entry_id
    ${whereSql}
    GROUP BY lr.id, lr.reason_name
    ORDER BY minutes DESC
    LIMIT 5
    `,
    params,
  );

  return { totals, hallWise, shiftWise, machineWise, topRejects, topLossReasons };
};

// ----------------------------------------------------------------
// GET /api/reports/filters -> { halls: [...], machines: [...] }
// ----------------------------------------------------------------
const getReportFilters = async (req, res) => {
  try {
    const [hallRows] = await pool.query(
      `SELECT DISTINCT hall FROM production_entries WHERE hall IS NOT NULL ORDER BY hall ASC`,
    );
    const [machineRows] = await pool.query(
      `SELECT machine_code, machine_name FROM machines ORDER BY machine_code ASC`,
    );

    return res.json({
      halls: hallRows.map((r) => r.hall),
      machines: machineRows,
    });
  } catch (err) {
    console.error("getReportFilters error:", err);
    return res.status(500).json({ halls: [], machines: [], error: err.message });
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
  getDailyReport,
  getDailySummary,
  getMonthlyReport,
  getMonthlySummary,
  getReportFilters,
  getRejectionReasonsList,
  getLossReasonsList,
};