const db = require("../config/db");

// ==========================================================
// Shift context helper
// Business day starts at 08:00 (Shift A) and runs through
// Shift B until 08:00 the next calendar day.
// If the current clock time is before 08:00, we are still inside
// YESTERDAY's Shift B, so the business date rolls back by one day.
// ==========================================================
exports.getShiftContext = (referenceDate = new Date()) => {
  const now = new Date(referenceDate);
  const hour = now.getHours();

  const businessDate = new Date(now);
  if (hour < 8) {
    businessDate.setDate(businessDate.getDate() - 1);
  }

  const currentShift = hour >= 8 && hour < 20 ? "A" : "B";

  const yyyy = businessDate.getFullYear();
  const mm = String(businessDate.getMonth() + 1).padStart(2, "0");
  const dd = String(businessDate.getDate()).padStart(2, "0");

  return {
    businessDate: `${yyyy}-${mm}-${dd}`,
    currentShift,
  };
};

// ==========================================================
// Aggregate totals for a given business date (+ optional hall filter)
// Covers BOTH shifts (A + B) logged under that entry_date.
// ==========================================================
exports.getOverviewTotals = async (entryDate, hall) => {
  const params = [entryDate];
  let whereHall = "";

  if (hall) {
    whereHall = "AND hall = ?";
    params.push(hall);
  }

  const [rows] = await db.query(
    `
    SELECT
      COALESCE(SUM(target_qty), 0)     AS total_target,
      COALESCE(SUM(actual_qty), 0)     AS total_actual,
      COALESCE(SUM(good_qty), 0)       AS total_good,
      COALESCE(SUM(reject_qty), 0)     AS total_reject,
      COALESCE(SUM(loss_minutes), 0)   AS total_loss_minutes,
      COUNT(DISTINCT machine_id)       AS machines_reporting,
      COUNT(*)                         AS total_entries
    FROM production_entries
    WHERE entry_date = ?
    ${whereHall}
    `,
    params,
  );

  return rows[0];
};

// ==========================================================
// Same totals but split by shift (A vs B) — for the shift-wise
// breakdown card / chart on the dashboard.
// ==========================================================
exports.getShiftWiseTotals = async (entryDate, hall) => {
  const params = [entryDate];
  let whereHall = "";

  if (hall) {
    whereHall = "AND hall = ?";
    params.push(hall);
  }

  const [rows] = await db.query(
    `
    SELECT
      shift,
      COALESCE(SUM(target_qty), 0)   AS total_target,
      COALESCE(SUM(actual_qty), 0)   AS total_actual,
      COALESCE(SUM(reject_qty), 0)   AS total_reject,
      COALESCE(SUM(loss_minutes), 0) AS total_loss_minutes,
      COUNT(DISTINCT machine_id)     AS machines_reporting
    FROM production_entries
    WHERE entry_date = ?
    ${whereHall}
    GROUP BY shift
    `,
    params,
  );

  return rows; // [{ shift: 'A', ... }, { shift: 'B', ... }]
};

// ==========================================================
// "Running machines" = machines that have logged a production
// entry for the CURRENT business date + CURRENT shift (i.e. actively
// reporting right now). This avoids depending on a machines.status
// column that may not reliably reflect real-time floor state.
// ==========================================================
exports.getRunningMachinesCount = async (entryDate, currentShift, hall) => {
  const params = [entryDate, currentShift];
  let whereHall = "";

  if (hall) {
    whereHall = "AND hall = ?";
    params.push(hall);
  }

  const [rows] = await db.query(
    `
    SELECT COUNT(DISTINCT machine_id) AS running_count
    FROM production_entries
    WHERE entry_date = ?
      AND shift = ?
    ${whereHall}
    `,
    params,
  );

  return rows[0]?.running_count || 0;
};

// ==========================================================
// Total machines installed (denominator for "X of Y running")
// ==========================================================
exports.getTotalMachinesCount = async (hall) => {
  const params = [];
  let whereHall = "";

  if (hall) {
    whereHall = "WHERE hall = ?";
    params.push(hall);
  }

  const [rows] = await db.query(
    `SELECT COUNT(*) AS total FROM machines ${whereHall}`,
    params,
  );

  return rows[0]?.total || 0;
};

// ==========================================================
// Hall-wise totals for a given business date (both shifts combined)
// ==========================================================
exports.getHallWiseTotals = async (entryDate) => {
  const [rows] = await db.query(
    `
    SELECT
      hall,
      COALESCE(SUM(target_qty), 0)   AS total_target,
      COALESCE(SUM(actual_qty), 0)   AS total_actual,
      COALESCE(SUM(reject_qty), 0)   AS total_reject,
      COALESCE(SUM(loss_minutes), 0) AS total_loss_minutes,
      COUNT(DISTINCT machine_id)     AS machines_reporting
    FROM production_entries
    WHERE entry_date = ?
    GROUP BY hall
    `,
    [entryDate],
  );

  return rows;
};

// ==========================================================
// Machines currently reporting per hall for the CURRENT shift only
// (used to decide "Running" vs "Idle" hall status)
// ==========================================================
exports.getHallWiseRunningMachines = async (entryDate, currentShift) => {
  const [rows] = await db.query(
    `
    SELECT
      hall,
      COUNT(DISTINCT machine_id) AS running_count
    FROM production_entries
    WHERE entry_date = ?
      AND shift = ?
    GROUP BY hall
    `,
    [entryDate, currentShift],
  );

  return rows;
};

// ==========================================================
// Total machines installed, grouped by hall (denominator)
// ==========================================================
exports.getHallWiseMachineCounts = async () => {
  const [rows] = await db.query(
    `
    SELECT hall, COUNT(*) AS total
    FROM machines
    GROUP BY hall
    `,
  );

  return rows;
};