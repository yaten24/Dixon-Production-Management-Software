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

// ==========================================================
// Plan number generator
// ==========================================================
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

// ==========================================================
// Simple header create (no parts) — used only if you need a bare
// header without the combined create-full-plan flow.
// ==========================================================
exports.createHeader = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { planNumber, planMonth, planYear, hall, workingDays, remarks } = req.body;

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

  const resolvedWorkingDays = workingDays === undefined || workingDays === null
    ? DEFAULT_WORKING_DAYS
    : Number(workingDays);

  if (!Number.isFinite(resolvedWorkingDays) || resolvedWorkingDays <= 0) {
    return res.status(400).json({ success: false, message: 'workingDays must be a positive number' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO monthly_plan_header (plan_number, plan_month, plan_year, hall, working_days, created_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [planNumber, monthNum, yearNum, hall || DEFAULT_HALL, resolvedWorkingDays, req.user.id, remarks || null],
    );
    res.status(201).json({ success: true, monthlyPlanId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Plan already exists for this month/year/hall or plan number' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create monthly plan' });
  }
};

// ==========================================================
// List headers (optionally filtered)
// ==========================================================
exports.listHeaders = async (req, res) => {
  const { month, year, hall, status } = req.query;
  let sql = `SELECT * FROM monthly_plan_header WHERE 1=1`;
  const params = [];
  if (month) { sql += ` AND plan_month = ?`; params.push(Number(month)); }
  if (year) { sql += ` AND plan_year = ?`; params.push(Number(year)); }
  if (hall) { sql += ` AND hall = ?`; params.push(hall); }
  if (status) { sql += ` AND status = ?`; params.push(status); }
  sql += ` ORDER BY plan_year DESC, plan_month DESC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch monthly plans' });
  }
};

// ==========================================================
// Get single header
// ==========================================================
exports.getHeader = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`SELECT * FROM monthly_plan_header WHERE monthly_plan_id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Monthly plan not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch monthly plan' });
  }
};

// ==========================================================
// List details for a plan (joined with parts)
// ==========================================================
exports.listDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT d.*, p.part_name, p.part_number, p.product_category, p.standard_cycle_time, p.actual_cycle_time
       FROM monthly_plan_details d
       JOIN parts p ON p.id = d.part_id
       WHERE d.monthly_plan_id = ?
       ORDER BY d.created_at ASC`,
      [id],
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch plan details' });
  }
};

// ==========================================================
// Add a single part to an existing plan
// ==========================================================
exports.addDetail = async (req, res) => {
  const { id } = req.params;
  const { partId, monthlyTargetQty, plannedCycleTime, remarks } = req.body;

  const targetQty = Number(monthlyTargetQty);
  if (!partId || !Number.isFinite(targetQty) || targetQty <= 0) {
    return res.status(400).json({ success: false, message: 'Valid partId and a positive monthlyTargetQty are required' });
  }

  const cycleTime = plannedCycleTime === undefined || plannedCycleTime === null
    ? null
    : Number(plannedCycleTime);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [header] = await conn.query(`SELECT monthly_plan_id FROM monthly_plan_header WHERE monthly_plan_id = ? FOR UPDATE`, [id]);
    if (!header.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Monthly plan not found' });
    }

    const [result] = await conn.query(
      `INSERT INTO monthly_plan_details
        (monthly_plan_id, part_id, monthly_target_qty, planned_cycle_time, balance_qty, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, partId, targetQty, cycleTime, targetQty, remarks || null],
    );

    await recalcHeaderTotals(conn, id);
    await conn.commit();
    res.status(201).json({ success: true, monthlyDetailId: result.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This part is already added to the plan' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add part to plan' });
  } finally {
    conn.release();
  }
};

// ==========================================================
// Update one detail row (target qty / cycle time / remarks)
// ==========================================================
exports.updateDetail = async (req, res) => {
  const { id, detailId } = req.params;
  const { monthlyTargetQty, plannedCycleTime, remarks } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT completed_qty FROM monthly_plan_details WHERE monthly_detail_id = ? AND monthly_plan_id = ? FOR UPDATE`,
      [detailId, id],
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Plan detail not found' });
    }

    let newBalance;
    if (monthlyTargetQty !== undefined && monthlyTargetQty !== null) {
      const targetQty = Number(monthlyTargetQty);
      if (!Number.isFinite(targetQty) || targetQty <= 0) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'monthlyTargetQty must be a positive number' });
      }
      newBalance = targetQty - rows[0].completed_qty;
    }

    const cycleTime = plannedCycleTime === undefined ? undefined
      : plannedCycleTime === null ? null
      : Number(plannedCycleTime);

    await conn.query(
      `UPDATE monthly_plan_details SET
        monthly_target_qty = COALESCE(?, monthly_target_qty),
        planned_cycle_time = ?,
        balance_qty = COALESCE(?, balance_qty),
        remarks = COALESCE(?, remarks)
       WHERE monthly_detail_id = ? AND monthly_plan_id = ?`,
      [
        monthlyTargetQty ?? null,
        cycleTime === undefined ? undefined : cycleTime,
        newBalance ?? null,
        remarks ?? null,
        detailId,
        id,
      ].map((v) => (v === undefined ? null : v)),
    );

    await recalcHeaderTotals(conn, id);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update plan detail' });
  } finally {
    conn.release();
  }
};

// ==========================================================
// Delete one detail row
// ==========================================================
exports.deleteDetail = async (req, res) => {
  const { id, detailId } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `DELETE FROM monthly_plan_details WHERE monthly_detail_id = ? AND monthly_plan_id = ?`,
      [detailId, id],
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Plan detail not found' });
    }
    await recalcHeaderTotals(conn, id);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete plan detail' });
  } finally {
    conn.release();
  }
};

// ==========================================================
// Create full plan (header + parts together)
// ==========================================================
exports.createFullPlan = async (req, res) => {
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

// ==========================================================
// Delete a header (cascades to details via FK)
// ==========================================================
exports.deleteHeader = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM monthly_plan_header WHERE monthly_plan_id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Monthly plan not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete monthly plan' });
  }
};