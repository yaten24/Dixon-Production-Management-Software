const pool = require('../config/db');

const DEFAULT_HALL = 'All Hall';
const DEFAULT_WORKING_DAYS = 26;

// ==========================================================
// Recalculates and persists header-level totals (total target,
// total balance, part count) from the current set of monthly
// plan detail rows. Called inside the same transaction/connection
// as any insert/update/delete on details so totals never drift.
// ==========================================================
const recalcHeaderTotals = async (conn, monthlyPlanId) => {
  const [[totals]] = await conn.query(
    `SELECT
       COALESCE(SUM(monthly_target_qty), 0) AS totalTarget,
       COALESCE(SUM(balance_qty), 0) AS totalBalance,
       COUNT(*) AS partCount
     FROM monthly_plan_details
     WHERE monthly_plan_id = ?`,
    [monthlyPlanId],
  );

  await conn.query(
    `UPDATE monthly_plan_header
     SET total_target_qty = ?, total_balance_qty = ?, part_count = ?
     WHERE monthly_plan_id = ?`,
    [totals.totalTarget, totals.totalBalance, totals.partCount, monthlyPlanId],
  );
};

exports.generatePlanNumber = async (req, res) => {
  const { month, year } = req.query;

  const monthNum = Number(month);
  const yearNum = Number(year);

  if (!month || !year) {
    return res.status(400).json({ success: false, message: 'month and year required' });
  }
  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ success: false, message: 'month must be an integer between 1 and 12' });
  }
  if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
    return res.status(400).json({ success: false, message: 'year must be a valid 4-digit year' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM monthly_plan_header WHERE plan_month = ? AND plan_year = ?`,
      [monthNum, yearNum],
    );
    const seq = String(rows[0].cnt + 1).padStart(3, '0');
    const planNumber = `MP-${yearNum}${String(monthNum).padStart(2, '0')}-${seq}`;
    res.json({ success: true, planNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to generate plan number' });
  }
};

exports.createFullPlan = async (req, res) => {
  // FIX: fail fast with a clear message instead of an uncaught crash if
  // auth middleware didn't attach req.user for some reason.
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { planNumber, planMonth, planYear, hall, workingDays, remarks, parts } = req.body;

  const monthNum = Number(planMonth);
  const yearNum = Number(planYear);

  if (!planNumber || !planMonth || !planYear) {
    return res.status(400).json({ success: false, message: 'planNumber, planMonth, planYear required' });
  }
  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ success: false, message: 'planMonth must be an integer between 1 and 12' });
  }
  if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
    return res.status(400).json({ success: false, message: 'planYear must be a valid 4-digit year' });
  }
  if (!Array.isArray(parts) || parts.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one part is required' });
  }

  // FIX: validate qty is actually numeric (not just truthy) and catch
  // duplicate partIds client-side before ever touching the DB, so the
  // error is immediate and specific instead of a generic ER_DUP_ENTRY
  // after the transaction has already started.
  const seenPartIds = new Set();
  for (const p of parts) {
    const targetQty = Number(p.monthlyTargetQty);
    if (!p.partId || !Number.isFinite(targetQty) || targetQty <= 0) {
      return res.status(400).json({ success: false, message: 'Each part needs a valid partId and a positive monthlyTargetQty' });
    }
    if (seenPartIds.has(p.partId)) {
      return res.status(400).json({ success: false, message: `Duplicate partId in request: ${p.partId}` });
    }
    seenPartIds.add(p.partId);
  }

  // FIX: workingDays could legitimately be 0 in theory — use a proper
  // undefined/null check instead of `||`, which would silently replace
  // 0 with the default.
  const resolvedWorkingDays = workingDays === undefined || workingDays === null
    ? DEFAULT_WORKING_DAYS
    : Number(workingDays);

  if (!Number.isFinite(resolvedWorkingDays) || resolvedWorkingDays <= 0) {
    return res.status(400).json({ success: false, message: 'workingDays must be a positive number' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [headerResult] = await conn.query(
      `INSERT INTO monthly_plan_header (plan_number, plan_month, plan_year, hall, working_days, created_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [planNumber, monthNum, yearNum, hall || DEFAULT_HALL, resolvedWorkingDays, req.user.id, remarks || null],
    );
    const monthlyPlanId = headerResult.insertId;

    for (const p of parts) {
      const targetQty = Number(p.monthlyTargetQty);
      // FIX: same undefined/null-safe handling for plannedCycleTime — a
      // cycle time of 0 (however unlikely) shouldn't be silently nulled.
      const cycleTime = p.plannedCycleTime === undefined || p.plannedCycleTime === null
        ? null
        : Number(p.plannedCycleTime);

      await conn.query(
        `INSERT INTO monthly_plan_details
          (monthly_plan_id, part_id, monthly_target_qty, planned_cycle_time, balance_qty)
         VALUES (?, ?, ?, ?, ?)`,
        [monthlyPlanId, p.partId, targetQty, cycleTime, targetQty],
      );
    }

    await recalcHeaderTotals(conn, monthlyPlanId);
    await conn.commit();
    res.status(201).json({ success: true, monthlyPlanId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Duplicate plan number, or duplicate part in the list' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create plan' });
  } finally {
    conn.release();
  }
};