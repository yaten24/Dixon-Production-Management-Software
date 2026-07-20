const pool = require('../config/db');

const recalcHeaderTotals = async (conn, dailyPlanId) => {
  const [[totals]] = await conn.query(
    `SELECT
       COUNT(*) AS totalMachines,
       SUM(CASE WHEN operator_code IS NOT NULL THEN 1 ELSE 0 END) AS plannedMachines,
       COALESCE(SUM(target_qty), 0) AS totalTargetQty
     FROM daily_plan_details
     WHERE daily_plan_id = ?`,
    [dailyPlanId],
  );
  await conn.query(
    `UPDATE daily_plan_header
     SET total_machines = ?, planned_machines = ?, total_target_qty = ?
     WHERE daily_plan_id = ?`,
    [totals.totalMachines, totals.plannedMachines || 0, totals.totalTargetQty, dailyPlanId],
  );
};

// ==========================================================
exports.generatePlanNumber = async (req, res) => {
  const { date, hall, shift } = req.query;
  if (!date || !hall || !shift) {
    return res.status(400).json({ success: false, message: 'date, hall and shift are required' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM daily_plan_header WHERE planning_date = ? AND hall = ? AND shift = ?`,
      [date, hall, shift],
    );
    const seq = String(rows[0].cnt + 1).padStart(2, '0');
    const dateCode = date.replace(/-/g, '');
    const planNumber = `DP-${dateCode}-${hall.replace(/\s+/g, '')}-${shift}-${seq}`;
    res.json({ success: true, planNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to generate plan number' });
  }
};

// ==========================================================
exports.listHeaders = async (req, res) => {
  const { monthlyPlanId, date, hall, shift, status } = req.query;
  let sql = `SELECT * FROM daily_plan_header WHERE 1=1`;
  const params = [];
  if (monthlyPlanId) { sql += ` AND monthly_plan_id = ?`; params.push(monthlyPlanId); }
  if (date) { sql += ` AND planning_date = ?`; params.push(date); }
  if (hall) { sql += ` AND hall = ?`; params.push(hall); }
  if (shift) { sql += ` AND shift = ?`; params.push(shift); }
  if (status) { sql += ` AND status = ?`; params.push(status); }
  sql += ` ORDER BY planning_date DESC, shift ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch daily plans' });
  }
};

exports.getHeader = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`SELECT * FROM daily_plan_header WHERE daily_plan_id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Daily plan not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch daily plan' });
  }
};

exports.listDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT d.*, m.machine_code, m.machine_name, o.operator_name,
              p.part_number, p.part_name, p.product_category
       FROM daily_plan_details d
       JOIN machines m ON m.id = d.machine_id
       LEFT JOIN operators o ON o.operator_code = d.operator_code
       JOIN parts p ON p.id = d.part_id
       WHERE d.daily_plan_id = ?
       ORDER BY m.machine_code ASC`,
      [id],
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch daily plan details' });
  }
};

// ==========================================================
exports.createFullPlan = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { monthlyPlanId, planNumber, planningDate, hall, shift, remarks, machines } = req.body;

  if (!monthlyPlanId || !planNumber || !planningDate || !hall || !shift) {
    return res.status(400).json({ success: false, message: 'monthlyPlanId, planNumber, planningDate, hall, shift are required' });
  }
  if (!['A', 'B'].includes(shift)) {
    return res.status(400).json({ success: false, message: 'shift must be A or B' });
  }
  if (!Array.isArray(machines) || machines.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one machine row is required' });
  }

  const seenMachineIds = new Set();
  for (const m of machines) {
    const qty = Number(m.targetQty);
    if (!m.machineId || !m.partId || !m.monthlyDetailId || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Each machine row needs machineId, partId, monthlyDetailId and a positive targetQty' });
    }
    if (seenMachineIds.has(m.machineId)) {
      return res.status(400).json({ success: false, message: `Duplicate machineId in request: ${m.machineId}` });
    }
    seenMachineIds.add(m.machineId);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [monthlyPlan] = await conn.query(
      `SELECT monthly_plan_id FROM monthly_plan_header WHERE monthly_plan_id = ?`,
      [monthlyPlanId],
    );
    if (!monthlyPlan.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Referenced monthly plan not found' });
    }

    const [headerResult] = await conn.query(
      `INSERT INTO daily_plan_header (monthly_plan_id, plan_number, planning_date, hall, shift, created_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [monthlyPlanId, planNumber, planningDate, hall, shift, req.user.id, remarks || null],
    );
    const dailyPlanId = headerResult.insertId;

    for (const m of machines) {
      const qty = Number(m.targetQty);
      const cycleTime = m.plannedCycleTime === undefined || m.plannedCycleTime === null
        ? null
        : Number(m.plannedCycleTime);
      const estimatedHours = cycleTime > 0 ? Number(((qty * cycleTime) / 3600).toFixed(2)) : null;

      await conn.query(
        `INSERT INTO daily_plan_details
          (daily_plan_id, monthly_detail_id, machine_id, operator_code, part_id, target_qty, planned_cycle_time, estimated_run_hours, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dailyPlanId, m.monthlyDetailId, m.machineId, m.operatorCode || null, m.partId, qty, cycleTime, estimatedHours, m.remarks || null],
      );
    }

    await recalcHeaderTotals(conn, dailyPlanId);
    await conn.commit();
    res.status(201).json({ success: true, dailyPlanId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Duplicate plan number, or a machine already used twice in this plan' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create daily plan' });
  } finally {
    conn.release();
  }
};

// ==========================================================
exports.addDetail = async (req, res) => {
  const { id } = req.params;
  const { monthlyDetailId, machineId, operatorCode, partId, targetQty, plannedCycleTime, remarks } = req.body;

  const qty = Number(targetQty);
  if (!machineId || !partId || !monthlyDetailId || !Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ success: false, message: 'machineId, partId, monthlyDetailId and a positive targetQty are required' });
  }
  const cycleTime = plannedCycleTime === undefined || plannedCycleTime === null ? null : Number(plannedCycleTime);
  const estimatedHours = cycleTime > 0 ? Number(((qty * cycleTime) / 3600).toFixed(2)) : null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [header] = await conn.query(`SELECT daily_plan_id FROM daily_plan_header WHERE daily_plan_id = ? FOR UPDATE`, [id]);
    if (!header.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Daily plan not found' });
    }

    const [result] = await conn.query(
      `INSERT INTO daily_plan_details
        (daily_plan_id, monthly_detail_id, machine_id, operator_code, part_id, target_qty, planned_cycle_time, estimated_run_hours, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, monthlyDetailId, machineId, operatorCode || null, partId, qty, cycleTime, estimatedHours, remarks || null],
    );

    await recalcHeaderTotals(conn, id);
    await conn.commit();
    res.status(201).json({ success: true, dailyDetailId: result.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This machine is already used in this plan' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add machine row' });
  } finally {
    conn.release();
  }
};

exports.updateDetail = async (req, res) => {
  const { id, detailId } = req.params;
  const { operatorCode, targetQty, plannedCycleTime, remarks } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT target_qty, planned_cycle_time FROM daily_plan_details WHERE daily_detail_id = ? AND daily_plan_id = ? FOR UPDATE`,
      [detailId, id],
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Machine row not found' });
    }

    const finalQty = targetQty !== undefined && targetQty !== null ? Number(targetQty) : rows[0].target_qty;
    const finalCycle = plannedCycleTime !== undefined
      ? (plannedCycleTime === null ? null : Number(plannedCycleTime))
      : rows[0].planned_cycle_time;
    const estimatedHours = finalCycle > 0 ? Number(((finalQty * finalCycle) / 3600).toFixed(2)) : null;

    await conn.query(
      `UPDATE daily_plan_details SET
        operator_code = COALESCE(?, operator_code),
        target_qty = ?,
        planned_cycle_time = ?,
        estimated_run_hours = ?,
        remarks = COALESCE(?, remarks)
       WHERE daily_detail_id = ? AND daily_plan_id = ?`,
      [operatorCode || null, finalQty, finalCycle, estimatedHours, remarks ?? null, detailId, id],
    );

    await recalcHeaderTotals(conn, id);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update machine row' });
  } finally {
    conn.release();
  }
};

exports.deleteDetail = async (req, res) => {
  const { id, detailId } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `DELETE FROM daily_plan_details WHERE daily_detail_id = ? AND daily_plan_id = ?`,
      [detailId, id],
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Machine row not found' });
    }
    await recalcHeaderTotals(conn, id);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete machine row' });
  } finally {
    conn.release();
  }
};

exports.deleteHeader = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM daily_plan_header WHERE daily_plan_id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Daily plan not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete daily plan' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['Draft', 'Published', 'Completed', 'Closed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  try {
    const [result] = await pool.query(
      `UPDATE daily_plan_header
       SET status = ?, approved_by = ?, approved_at = ?
       WHERE daily_plan_id = ?`,
      [status, status === 'Published' ? req.user.id : null, status === 'Published' ? new Date() : null, id],
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Daily plan not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};