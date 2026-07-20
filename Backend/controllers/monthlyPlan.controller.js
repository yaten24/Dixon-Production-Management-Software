const pool = require('../config/db');

const recalcHeaderTotals = async (conn, monthlyPlanId) => {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS totalParts, COALESCE(SUM(monthly_target_qty),0) AS totalTargetQty
     FROM monthly_plan_details WHERE monthly_plan_id = ?`,
    [monthlyPlanId]
  );
  await conn.query(
    `UPDATE monthly_plan_header SET total_parts = ?, total_target_qty = ? WHERE monthly_plan_id = ?`,
    [rows[0].totalParts, rows[0].totalTargetQty, monthlyPlanId]
  );
};

exports.createHeader = async (req, res) => {
  const { planNumber, planMonth, planYear, hall, workingDays, remarks } = req.body;
  const createdBy = req.user.id;
  try {
    const [result] = await pool.query(
      `INSERT INTO monthly_plan_header (plan_number, plan_month, plan_year, hall, working_days, created_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [planNumber, planMonth, planYear, hall, workingDays, createdBy, remarks || null]
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

exports.listHeaders = async (req, res) => {
  const { month, year, hall, status } = req.query;
  let sql = `SELECT * FROM monthly_plan_header WHERE 1=1`;
  const params = [];
  if (month) { sql += ` AND plan_month = ?`; params.push(month); }
  if (year) { sql += ` AND plan_year = ?`; params.push(year); }
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

// ---- Details (this page) ----

exports.listDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT d.*, p.part_name, p.part_number
       FROM monthly_plan_details d
       JOIN parts p ON p.id = d.part_id
       WHERE d.monthly_plan_id = ?
       ORDER BY d.created_at ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch plan details' });
  }
};

exports.addDetail = async (req, res) => {
  const { id } = req.params;
  const { partId, monthlyTargetQty, plannedCycleTime, remarks } = req.body;

  if (!partId || !monthlyTargetQty) {
    return res.status(400).json({ success: false, message: 'partId and monthlyTargetQty are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [header] = await conn.query(`SELECT status FROM monthly_plan_header WHERE monthly_plan_id = ? FOR UPDATE`, [id]);
    if (!header.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Monthly plan not found' });
    }

    const [result] = await conn.query(
      `INSERT INTO monthly_plan_details
        (monthly_plan_id, part_id, monthly_target_qty, planned_cycle_time, balance_qty, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, partId, monthlyTargetQty, plannedCycleTime || null, monthlyTargetQty, remarks || null]
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

exports.updateDetail = async (req, res) => {
  const { id, detailId } = req.params;
  const { monthlyTargetQty, plannedCycleTime, remarks } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT completed_qty FROM monthly_plan_details WHERE monthly_detail_id = ? AND monthly_plan_id = ? FOR UPDATE`,
      [detailId, id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Plan detail not found' });
    }

    const newBalance = monthlyTargetQty !== undefined ? monthlyTargetQty - rows[0].completed_qty : undefined;

    await conn.query(
      `UPDATE monthly_plan_details SET
        monthly_target_qty = COALESCE(?, monthly_target_qty),
        planned_cycle_time = COALESCE(?, planned_cycle_time),
        balance_qty = COALESCE(?, balance_qty),
        remarks = COALESCE(?, remarks)
       WHERE monthly_detail_id = ? AND monthly_plan_id = ?`,
      [monthlyTargetQty ?? null, plannedCycleTime ?? null, newBalance ?? null, remarks ?? null, detailId, id]
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

exports.deleteDetail = async (req, res) => {
  const { id, detailId } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM monthly_plan_details WHERE monthly_detail_id = ? AND monthly_plan_id = ?`, [detailId, id]);
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