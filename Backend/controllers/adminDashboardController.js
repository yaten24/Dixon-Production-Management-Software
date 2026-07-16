// backend/controllers/dashboardController.js
const pool = require("../config/db");

/**
 * Internal helper — target quantity PLAN se aata hai (production_plan_header +
 * production_plan_details), production_entries se nahi. Shift A/B individually
 * aur combined overall dono return karta hai.
 *
 * @param {string} planningDate - YYYY-MM-DD
 * @param {string|undefined} hall
 */
const getShiftWiseTarget = async (planningDate, hall) => {
  const filters = ["h.planning_date = ?"];
  const params = [planningDate];

  if (hall) {
    filters.push("h.hall = ?");
    params.push(hall);
  }

  const whereClause = filters.join(" AND ");

  const [rows] = await pool.query(
    `SELECT
       h.shift,
       COALESCE(SUM(d.target_qty), 0)          AS targetQty,
       COUNT(DISTINCT d.machine_code)          AS plannedMachines,
       COUNT(DISTINCT h.plan_id)               AS totalPlans
     FROM production_plan_header h
     JOIN production_plan_details d ON d.plan_id = h.plan_id
     WHERE ${whereClause}
     GROUP BY h.shift`,
    params,
  );

  // Defaults so a shift with no plan yet still returns clean zeros, not undefined
  const shiftMap = {
    A: { targetQty: 0, plannedMachines: 0, totalPlans: 0 },
    B: { targetQty: 0, plannedMachines: 0, totalPlans: 0 },
  };

  rows.forEach((r) => {
    if (shiftMap[r.shift]) {
      shiftMap[r.shift] = {
        targetQty: Number(r.targetQty),
        plannedMachines: Number(r.plannedMachines),
        totalPlans: Number(r.totalPlans),
      };
    }
  });

  const overall = {
    targetQty: shiftMap.A.targetQty + shiftMap.B.targetQty,
    plannedMachines: shiftMap.A.plannedMachines + shiftMap.B.plannedMachines,
    totalPlans: shiftMap.A.totalPlans + shiftMap.B.totalPlans,
  };

  return { shiftA: shiftMap.A, shiftB: shiftMap.B, overall };
};

/**
 * GET /api/dashboard/production-stats
 * Optional query params: date (YYYY-MM-DD, default today), hall, shift
 *
 * targetQty  -> plan tables se (production_plan_header + details)
 * actual/good/reject/loss/efficiency -> production_entries se (jo actually hua)
 */
const getProductionStats = async (req, res) => {
  try {
    const { date, hall, shift } = req.query;
    const entryDate = date || new Date().toISOString().slice(0, 10); // default: today

    // ---------- 1) TARGET from plan ----------
    const targetSummary = await getShiftWiseTarget(entryDate, hall);
    const targetQty =
      shift === "A"
        ? targetSummary.shiftA.targetQty
        : shift === "B"
          ? targetSummary.shiftB.targetQty
          : targetSummary.overall.targetQty;

    // ---------- 2) ACTUALS from production_entries ----------
    const filters = ["entry_date = ?"];
    const params = [entryDate];

    if (hall) {
      filters.push("hall = ?");
      params.push(hall);
    }
    if (shift) {
      filters.push("shift = ?");
      params.push(shift);
    }

    const whereClause = filters.join(" AND ");

    const [rows] = await pool.query(
      `SELECT
         COALESCE(SUM(actual_qty), 0)     AS actualQty,
         COALESCE(SUM(good_qty), 0)       AS goodQty,
         COALESCE(SUM(reject_qty), 0)     AS rejectQty,
         COALESCE(SUM(loss_minutes), 0)   AS lossMinutes,
         COALESCE(AVG(efficiency), 0)     AS avgEfficiency,
         COUNT(DISTINCT machine_id)       AS activeMachines
       FROM production_entries
       WHERE ${whereClause}`,
      params,
    );

    const stats = rows[0];

    const rejectionRate =
      stats.actualQty > 0
        ? Number(((stats.rejectQty / stats.actualQty) * 100).toFixed(2))
        : 0;

    const achievement =
      targetQty > 0
        ? Number(((stats.actualQty / targetQty) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      date: entryDate,
      data: {
        targetQty: Number(targetQty),
        actualQty: Number(stats.actualQty),
        goodQty: Number(stats.goodQty),
        rejectQty: Number(stats.rejectQty),
        lossMinutes: Number(stats.lossMinutes),
        efficiency: Number(Number(stats.avgEfficiency).toFixed(2)),
        rejectionRate,
        achievement,
        activeMachines: Number(stats.activeMachines),
      },
    });
  } catch (err) {
    console.error("getProductionStats error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch production stats",
    });
  }
};

/**
 * GET /api/dashboard/target-summary
 * Optional query params: date (YYYY-MM-DD, default today), hall
 *
 * Dedicated endpoint: Shift A target, Shift B target, aur Overall — teeno
 * clearly separate, plan tables se.
 */
const getTargetSummary = async (req, res) => {
  try {
    const { date, hall } = req.query;
    const planningDate = date || new Date().toISOString().slice(0, 10);

    const summary = await getShiftWiseTarget(planningDate, hall);

    return res.status(200).json({
      success: true,
      date: planningDate,
      hall: hall || "All",
      data: summary, // { shiftA, shiftB, overall }
    });
  } catch (err) {
    console.error("getTargetSummary error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch target summary",
    });
  }
};

/**
 * GET /api/dashboard/production-overview
 * Optional query params: date (YYYY-MM-DD, default today), shift
 *
 * Hall-wise Target vs Actual vs Rejection — for the ProductionChart bar graph.
 * target     -> plan tables (production_plan_header + production_plan_details)
 * actual/rejection -> production_entries (jo actually production floor par hua)
 *
 * Response: { success, date, data: [{ hall, target, actual, rejection }, ...] }
 */
const getProductionOverview = async (req, res) => {
  try {
    const { date, shift } = req.query;
    const entryDate = date || new Date().toISOString().slice(0, 10);

    // ---------- TARGET per hall, from plan ----------
    const targetFilters = ["h.planning_date = ?"];
    const targetParams = [entryDate];
    if (shift) {
      targetFilters.push("h.shift = ?");
      targetParams.push(shift);
    }

    const [targetRows] = await pool.query(
      `SELECT h.hall, COALESCE(SUM(d.target_qty), 0) AS target
       FROM production_plan_header h
       JOIN production_plan_details d ON d.plan_id = h.plan_id
       WHERE ${targetFilters.join(" AND ")}
       GROUP BY h.hall`,
      targetParams,
    );

    // ---------- ACTUAL + REJECTION per hall, from entries ----------
    const entryFilters = ["entry_date = ?"];
    const entryParams = [entryDate];
    if (shift) {
      entryFilters.push("shift = ?");
      entryParams.push(shift);
    }

    const [entryRows] = await pool.query(
      `SELECT hall,
              COALESCE(SUM(actual_qty), 0) AS actual,
              COALESCE(SUM(reject_qty), 0) AS rejection
       FROM production_entries
       WHERE ${entryFilters.join(" AND ")}
       GROUP BY hall`,
      entryParams,
    );

    // ---------- merge target + actual by hall name ----------
    const hallMap = {};

    targetRows.forEach((r) => {
      hallMap[r.hall] = {
        hall: r.hall,
        target: Number(r.target),
        actual: 0,
        rejection: 0,
      };
    });

    entryRows.forEach((r) => {
      if (!hallMap[r.hall]) {
        hallMap[r.hall] = { hall: r.hall, target: 0, actual: 0, rejection: 0 };
      }
      hallMap[r.hall].actual = Number(r.actual);
      hallMap[r.hall].rejection = Number(r.rejection);
    });

    const data = Object.values(hallMap).sort((a, b) =>
      a.hall.localeCompare(b.hall, undefined, { numeric: true }),
    );

    return res.status(200).json({
      success: true,
      date: entryDate,
      data,
    });
  } catch (err) {
    console.error("getProductionOverview error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch production overview",
    });
  }
};

/**
 * GET /api/dashboard/rejection-analysis
 * Optional query params: date (YYYY-MM-DD, default today), hall, shift
 *
 * Reason-wise rejection quantity from production_reject_details, joined to
 * production_entries (for the date/hall/shift filter) and rejection_reasons
 * (for the display name).
 *
 * Response: { success, date, data: [{ reason, qty }], totalReject, rejectionRate }
 */
const getRejectionAnalysis = async (req, res) => {
  try {
    const { date, hall, shift } = req.query;
    const entryDate = date || new Date().toISOString().slice(0, 10);

    const filters = ["pe.entry_date = ?"];
    const params = [entryDate];
    if (hall) {
      filters.push("pe.hall = ?");
      params.push(hall);
    }
    if (shift) {
      filters.push("pe.shift = ?");
      params.push(shift);
    }
    const whereClause = filters.join(" AND ");

    // ---------- reason-wise breakdown ----------
    const [reasonRows] = await pool.query(
      `SELECT rr.reason_name AS reason, COALESCE(SUM(prd.reject_qty), 0) AS qty
       FROM production_reject_details prd
       JOIN production_entries pe ON pe.id = prd.production_entry_id
       JOIN rejection_reasons rr ON rr.id = prd.reject_reason_id
       WHERE ${whereClause}
       GROUP BY rr.id, rr.reason_name
       HAVING qty > 0
       ORDER BY qty DESC`,
      params,
    );

    // ---------- total actual qty for the same filter, to compute rejection % ----------
    const [actualRows] = await pool.query(
      `SELECT COALESCE(SUM(actual_qty), 0) AS totalActual
       FROM production_entries pe
       WHERE ${whereClause}`,
      params,
    );

    const data = reasonRows.map((r) => ({
      reason: r.reason,
      qty: Number(r.qty),
    }));
    const totalReject = data.reduce((sum, r) => sum + r.qty, 0);
    const totalActual = Number(actualRows[0].totalActual);
    const rejectionRate =
      totalActual > 0
        ? Number(((totalReject / totalActual) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      date: entryDate,
      data,
      totalReject,
      rejectionRate,
    });
  } catch (err) {
    console.error("getRejectionAnalysis error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rejection analysis",
    });
  }
};

module.exports = {
  getProductionStats,
  getTargetSummary,
  getProductionOverview,
  getRejectionAnalysis,
};
