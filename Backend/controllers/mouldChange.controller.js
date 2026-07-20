const pool = require('../config/db');

const STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];
const CHANGE_TYPES = ['Planned', 'Unplanned'];
const SHIFTS = ['A', 'B'];

const toMinutes = (start, end) => {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(diffMs / 60000));
};

// ==========================================================
// Create a mould change — covers both Planned (tied to a daily
// plan/detail row) and Unplanned (ad-hoc, machine-only) flows.
// ==========================================================
exports.createMouldChange = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const {
    changeType, dailyPlanId, dailyDetailId, machineCode,
    oldPartId, newPartId, standardCycleTime, actualCycleTime,
    targetQty, plannedDate, plannedShift, timeSlot, scheduledTime,
    reason, remarks,
  } = req.body;

  const type = changeType || 'Unplanned';
  if (!CHANGE_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'changeType must be Planned or Unplanned' });
  }
  if (!machineCode) {
    return res.status(400).json({ success: false, message: 'machineCode is required' });
  }
  if (plannedShift && !SHIFTS.includes(plannedShift)) {
    return res.status(400).json({ success: false, message: 'plannedShift must be A or B' });
  }

  // Planned changes must be tied to a daily plan row
  if (type === 'Planned' && (!dailyPlanId || !dailyDetailId)) {
    return res.status(400).json({ success: false, message: 'Planned mould changes require dailyPlanId and dailyDetailId' });
  }
  // Unplanned changes must carry a reason (why it happened)
  if (type === 'Unplanned' && !reason) {
    return res.status(400).json({ success: false, message: 'Unplanned mould changes require a reason' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Machine must exist
    const [machine] = await conn.query(`SELECT machine_code FROM machines WHERE machine_code = ? FOR UPDATE`, [machineCode]);
    if (!machine.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: `Machine ${machineCode} not found` });
    }

    // Edge case: block a new change if this machine already has one
    // actively "In Progress" or still "Planned" and unresolved.
    const [openChanges] = await conn.query(
      `SELECT mould_change_id FROM mould_changes
       WHERE machine_code = ? AND status IN ('Planned','In Progress') FOR UPDATE`,
      [machineCode],
    );
    if (openChanges.length > 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: `Machine ${machineCode} already has an open mould change (id ${openChanges[0].mould_change_id})` });
    }

    // Validate daily plan linkage for Planned type
    if (type === 'Planned') {
      const [detail] = await conn.query(
        `SELECT dd.daily_detail_id, dd.part_id AS current_part_id, dp.daily_plan_id
         FROM daily_plan_details dd
         JOIN daily_plan_header dp ON dp.daily_plan_id = dd.daily_plan_id
         WHERE dd.daily_detail_id = ? AND dd.daily_plan_id = ?`,
        [dailyDetailId, dailyPlanId],
      );
      if (!detail.length) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: 'Referenced daily plan / detail row not found' });
      }
    }

    // Validate parts if provided
    for (const [label, partId] of [['oldPartId', oldPartId], ['newPartId', newPartId]]) {
      if (partId) {
        const [p] = await conn.query(`SELECT id FROM parts WHERE id = ?`, [partId]);
        if (!p.length) {
          await conn.rollback();
          return res.status(404).json({ success: false, message: `${label} ${partId} does not reference a valid part` });
        }
      }
    }

    const [result] = await conn.query(
      `INSERT INTO mould_changes
        (change_type, daily_plan_id, daily_detail_id, machine_code, old_part_id, new_part_id,
         standard_cycle_time, actual_cycle_time, target_qty, planned_date, planned_shift, time_slot,
         scheduled_time, reason, remarks, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Planned', ?)`,
      [
        type, dailyPlanId || null, dailyDetailId || null, machineCode,
        oldPartId || null, newPartId || null,
        standardCycleTime ?? null, actualCycleTime ?? null, targetQty ?? null,
        plannedDate || null, plannedShift || null, timeSlot || null,
        scheduledTime || null, reason || null, remarks || null, req.user.id,
      ],
    );

    await conn.commit();
    res.status(201).json({ success: true, mouldChangeId: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create mould change' });
  } finally {
    conn.release();
  }
};

// ==========================================================
// Start a mould change — Planned -> In Progress
// ==========================================================
exports.startMouldChange = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(`SELECT status FROM mould_changes WHERE mould_change_id = ? FOR UPDATE`, [id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Mould change not found' });
    }
    if (rows[0].status !== 'Planned') {
      await conn.rollback();
      return res.status(409).json({ success: false, message: `Cannot start a change that is already ${rows[0].status}` });
    }

    await conn.query(
      `UPDATE mould_changes SET status = 'In Progress', actual_start_time = NOW() WHERE mould_change_id = ?`,
      [id],
    );
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to start mould change' });
  } finally {
    conn.release();
  }
};

// ==========================================================
// Complete a mould change — computes downtime_minutes automatically
// ==========================================================
exports.completeMouldChange = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT status, actual_start_time FROM mould_changes WHERE mould_change_id = ? FOR UPDATE`,
      [id],
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Mould change not found' });
    }
    if (rows[0].status !== 'In Progress') {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Only an In Progress change can be completed' });
    }
    if (!rows[0].actual_start_time) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Change has no start time recorded' });
    }

    const endTime = new Date();
    const downtime = toMinutes(rows[0].actual_start_time, endTime);

    await conn.query(
      `UPDATE mould_changes
       SET status = 'Completed', actual_end_time = ?, downtime_minutes = ?, remarks = COALESCE(?, remarks)
       WHERE mould_change_id = ?`,
      [endTime, downtime, remarks ?? null, id],
    );
    await conn.commit();
    res.json({ success: true, downtimeMinutes: downtime });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to complete mould change' });
  } finally {
    conn.release();
  }
};

// ==========================================================
// Cancel a mould change — cannot cancel a Completed one
// ==========================================================
exports.cancelMouldChange = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(`SELECT status FROM mould_changes WHERE mould_change_id = ? FOR UPDATE`, [id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Mould change not found' });
    }
    if (rows[0].status === 'Completed') {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Cannot cancel a completed mould change' });
    }
    if (rows[0].status === 'Cancelled') {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Mould change is already cancelled' });
    }

    await conn.query(
      `UPDATE mould_changes SET status = 'Cancelled', remarks = COALESCE(?, remarks) WHERE mould_change_id = ?`,
      [remarks ?? null, id],
    );
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to cancel mould change' });
  } finally {
    conn.release();
  }
};

// ==========================================================
// Update editable fields (only while still Planned — once
// In Progress/Completed the record becomes an audit trail)
// ==========================================================
exports.updateMouldChange = async (req, res) => {
  const { id } = req.params;
  const {
    machineCode, oldPartId, newPartId, standardCycleTime, actualCycleTime,
    targetQty, plannedDate, plannedShift, timeSlot, scheduledTime, reason, remarks,
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(`SELECT status FROM mould_changes WHERE mould_change_id = ? FOR UPDATE`, [id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Mould change not found' });
    }
    if (rows[0].status !== 'Planned') {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Only a Planned mould change can be edited' });
    }

    if (plannedShift && !SHIFTS.includes(plannedShift)) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'plannedShift must be A or B' });
    }

    await conn.query(
      `UPDATE mould_changes SET
        machine_code = COALESCE(?, machine_code),
        old_part_id = ?,
        new_part_id = ?,
        standard_cycle_time = ?,
        actual_cycle_time = ?,
        target_qty = ?,
        planned_date = ?,
        planned_shift = ?,
        time_slot = ?,
        scheduled_time = ?,
        reason = ?,
        remarks = ?
       WHERE mould_change_id = ?`,
      [
        machineCode || null,
        oldPartId ?? null, newPartId ?? null,
        standardCycleTime ?? null, actualCycleTime ?? null,
        targetQty ?? null, plannedDate ?? null, plannedShift ?? null,
        timeSlot ?? null, scheduledTime ?? null,
        reason ?? null, remarks ?? null, id,
      ],
    );
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update mould change' });
  } finally {
    conn.release();
  }
};

// ==========================================================
// Delete — only allowed while still Planned
// ==========================================================
exports.deleteMouldChange = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`SELECT status FROM mould_changes WHERE mould_change_id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Mould change not found' });
    if (rows[0].status !== 'Planned') {
      return res.status(409).json({ success: false, message: 'Only a Planned mould change can be deleted — cancel it instead if already started' });
    }
    await pool.query(`DELETE FROM mould_changes WHERE mould_change_id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete mould change' });
  }
};

// ==========================================================
// List with filters
// ==========================================================
exports.listMouldChanges = async (req, res) => {
  const { dailyPlanId, machineCode, status, changeType, date, shift, from, to } = req.query;
  let sql = `
    SELECT mc.*, m.machine_name, m.hall,
           op.part_number AS old_part_number, op.part_name AS old_part_name,
           np.part_number AS new_part_number, np.part_name AS new_part_name
    FROM mould_changes mc
    JOIN machines m ON m.machine_code = mc.machine_code
    LEFT JOIN parts op ON op.id = mc.old_part_id
    LEFT JOIN parts np ON np.id = mc.new_part_id
    WHERE 1=1`;
  const params = [];

  if (dailyPlanId) { sql += ` AND mc.daily_plan_id = ?`; params.push(dailyPlanId); }
  if (machineCode) { sql += ` AND mc.machine_code = ?`; params.push(machineCode); }
  if (status) { sql += ` AND mc.status = ?`; params.push(status); }
  if (changeType) { sql += ` AND mc.change_type = ?`; params.push(changeType); }
  if (date) { sql += ` AND mc.planned_date = ?`; params.push(date); }
  if (shift) { sql += ` AND mc.planned_shift = ?`; params.push(shift); }
  if (from) { sql += ` AND mc.created_at >= ?`; params.push(from); }
  if (to) { sql += ` AND mc.created_at <= ?`; params.push(to); }

  sql += ` ORDER BY mc.created_at DESC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch mould changes' });
  }
};

exports.getMouldChange = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT mc.*, m.machine_name, m.hall,
              op.part_number AS old_part_number, op.part_name AS old_part_name,
              np.part_number AS new_part_number, np.part_name AS new_part_name
       FROM mould_changes mc
       JOIN machines m ON m.machine_code = mc.machine_code
       LEFT JOIN parts op ON op.id = mc.old_part_id
       LEFT JOIN parts np ON np.id = mc.new_part_id
       WHERE mc.mould_change_id = ?`,
      [id],
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Mould change not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch mould change' });
  }
};