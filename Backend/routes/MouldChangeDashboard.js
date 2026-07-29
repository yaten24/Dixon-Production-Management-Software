// routes/mouldChangeRoutes.js
// ==========================================================
// Mould Change Dashboard API — maps 1:1 to MouldChangeDashboard.jsx
// (same shape as the Rejection Dashboard API so the two dashboards
// read as one consistent app).
//
// ASSUMPTIONS (adjust to match your project):
//   - `../db` exports a mysql2/promise pool: `const pool = require('mysql2/promise').createPool(...)`
//   - DB: dixon_production_dehradun, tables: machines, mould_changes
//   - Mount this router in app.js/server.js with:
//       app.use('/api/mould-changes', require('./routes/mouldChangeRoutes'));
// ==========================================================

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // <-- adjust path to your actual db pool

const REASON_COLORS = ['#DC2626', '#F59E0B', '#0F1D24', '#9CA3AF', '#6B7280', '#374151'];

// Build a reusable WHERE clause + params for filters shared across endpoints.
// date        -> filters on planned_date (falls back to DATE(actual_start_time) if null)
// changeType  -> 'Planned' | 'Unplanned' | 'All'/undefined
// status      -> 'Planned' | 'In Progress' | 'Completed' | 'Cancelled' | 'All'/undefined
function buildFilters({ date, changeType, status }) {
  const clauses = ['1=1'];
  const params = [];

  if (date) {
    clauses.push('(mc.planned_date = ? OR (mc.planned_date IS NULL AND DATE(mc.actual_start_time) = ?))');
    params.push(date, date);
  }
  if (changeType && changeType !== 'All') {
    clauses.push('mc.change_type = ?');
    params.push(changeType);
  }
  if (status && status !== 'All') {
    clauses.push('mc.status = ?');
    params.push(status);
  }
  return { where: clauses.join(' AND '), params };
}

// ----------------------------------------------------------
// GET /api/mould-changes/summary
// -> { totalChanges, avgDowntime, plannedCount, unplannedCount, topReason, topHall, topMachine }
// ----------------------------------------------------------
router.get('/summary', async (req, res) => {
  try {
    const { where, params } = buildFilters(req.query);

    const [[totals]] = await pool.query(
      `SELECT
         COUNT(*) AS totalChanges,
         COALESCE(AVG(mc.downtime_minutes), 0) AS avgDowntime,
         SUM(CASE WHEN mc.change_type = 'Planned' THEN 1 ELSE 0 END) AS plannedCount,
         SUM(CASE WHEN mc.change_type = 'Unplanned' THEN 1 ELSE 0 END) AS unplannedCount
       FROM mould_changes mc
       WHERE ${where}`,
      params
    );

    const [[topReason]] = await pool.query(
      `SELECT mc.reason, COUNT(*) AS qty
       FROM mould_changes mc
       WHERE ${where} AND mc.reason IS NOT NULL AND mc.reason <> ''
       GROUP BY mc.reason
       ORDER BY qty DESC
       LIMIT 1`,
      params
    );

    const [[topHall]] = await pool.query(
      `SELECT m.hall, COUNT(*) AS qty
       FROM mould_changes mc
       JOIN machines m ON m.machine_code = mc.machine_code
       WHERE ${where}
       GROUP BY m.hall
       ORDER BY qty DESC
       LIMIT 1`,
      params
    );

    const [[topMachine]] = await pool.query(
      `SELECT mc.machine_code, COALESCE(SUM(mc.downtime_minutes), 0) AS downtime
       FROM mould_changes mc
       WHERE ${where}
       GROUP BY mc.machine_code
       ORDER BY downtime DESC
       LIMIT 1`,
      params
    );

    res.json({
      totalChanges: totals.totalChanges,
      avgDowntime: Math.round(totals.avgDowntime * 10) / 10,
      plannedCount: totals.plannedCount,
      unplannedCount: totals.unplannedCount,
      topReason: topReason ? { label: topReason.reason, qty: topReason.qty } : null,
      topHall: topHall ? { label: topHall.hall, qty: topHall.qty } : null,
      topMachine: topMachine ? { label: topMachine.machine_code, qty: topMachine.downtime } : null,
    });
  } catch (err) {
    console.error('GET /mould-changes/summary', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ----------------------------------------------------------
// GET /api/mould-changes/hall-wise
// -> { hallWise: [{hall, qty}], hallsMissing: [hall,...] }
// Uses LEFT JOIN so halls with zero mould changes still appear.
// ----------------------------------------------------------
router.get('/hall-wise', async (req, res) => {
  try {
    const { date, changeType, status } = req.query;
    const joinClauses = ['mc.machine_code = m.machine_code'];
    const params = [];

    if (date) {
      joinClauses.push('(mc.planned_date = ? OR (mc.planned_date IS NULL AND DATE(mc.actual_start_time) = ?))');
      params.push(date, date);
    }
    if (changeType && changeType !== 'All') {
      joinClauses.push('mc.change_type = ?');
      params.push(changeType);
    }
    if (status && status !== 'All') {
      joinClauses.push('mc.status = ?');
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT m.hall, COUNT(mc.mould_change_id) AS qty
       FROM machines m
       LEFT JOIN mould_changes mc ON ${joinClauses.join(' AND ')}
       GROUP BY m.hall
       ORDER BY qty DESC`,
      params
    );

    const hallWise = rows.map((r) => ({ hall: r.hall, qty: Number(r.qty) }));
    const hallsMissing = hallWise.filter((r) => r.qty === 0).map((r) => r.hall);

    res.json({ hallWise, hallsMissing });
  } catch (err) {
    console.error('GET /mould-changes/hall-wise', err);
    res.status(500).json({ error: 'Failed to fetch hall-wise data' });
  }
});

// ----------------------------------------------------------
// GET /api/mould-changes/reason-distribution
// -> { reasonDistribution: [{reason, qty, color}], reasonsTracked }
// ----------------------------------------------------------
router.get('/reason-distribution', async (req, res) => {
  try {
    const { where, params } = buildFilters(req.query);

    const [rows] = await pool.query(
      `SELECT mc.reason, COUNT(*) AS qty
       FROM mould_changes mc
       WHERE ${where} AND mc.reason IS NOT NULL AND mc.reason <> ''
       GROUP BY mc.reason
       ORDER BY qty DESC`,
      params
    );

    const reasonDistribution = rows.map((r, i) => ({
      reason: r.reason,
      qty: Number(r.qty),
      color: REASON_COLORS[i % REASON_COLORS.length],
    }));

    res.json({ reasonDistribution, reasonsTracked: reasonDistribution.length });
  } catch (err) {
    console.error('GET /mould-changes/reason-distribution', err);
    res.status(500).json({ error: 'Failed to fetch reason distribution' });
  }
});

// ----------------------------------------------------------
// GET /api/mould-changes/top-machines?limit=5
// -> { topMachines: [{machine, qty}] }   qty = total downtime minutes
// ----------------------------------------------------------
router.get('/top-machines', async (req, res) => {
  try {
    const { where, params } = buildFilters(req.query);
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);

    const [rows] = await pool.query(
      `SELECT mc.machine_code AS machine, COALESCE(SUM(mc.downtime_minutes), 0) AS qty
       FROM mould_changes mc
       WHERE ${where}
       GROUP BY mc.machine_code
       ORDER BY qty DESC
       LIMIT ?`,
      [...params, limit]
    );

    res.json({ topMachines: rows.map((r) => ({ machine: r.machine, qty: Number(r.qty) })) });
  } catch (err) {
    console.error('GET /mould-changes/top-machines', err);
    res.status(500).json({ error: 'Failed to fetch top machines' });
  }
});

// ----------------------------------------------------------
// GET /api/mould-changes/hourly-trend?date=YYYY-MM-DD
// -> { hourlyTrend: [{hour, qty}] }   qty = total downtime minutes in that hour
// ----------------------------------------------------------
router.get('/hourly-trend', async (req, res) => {
  try {
    const { date, changeType, status } = req.query;
    const clauses = ['mc.actual_start_time IS NOT NULL'];
    const params = [];

    if (date) {
      clauses.push('DATE(mc.actual_start_time) = ?');
      params.push(date);
    }
    if (changeType && changeType !== 'All') {
      clauses.push('mc.change_type = ?');
      params.push(changeType);
    }
    if (status && status !== 'All') {
      clauses.push('mc.status = ?');
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT HOUR(mc.actual_start_time) AS hour, COALESCE(SUM(mc.downtime_minutes), 0) AS qty
       FROM mould_changes mc
       WHERE ${clauses.join(' AND ')}
       GROUP BY HOUR(mc.actual_start_time)`,
      params
    );

    res.json({ hourlyTrend: rows.map((r) => ({ hour: Number(r.hour), qty: Number(r.qty) })) });
  } catch (err) {
    console.error('GET /mould-changes/hourly-trend', err);
    res.status(500).json({ error: 'Failed to fetch hourly trend' });
  }
});

// ----------------------------------------------------------
// GET /api/mould-changes  (paginated list/table view)
// query: date, changeType, status, hall, page=1, limit=25
// ----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { where, params } = buildFilters(req.query);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);
    const offset = (page - 1) * limit;

    let hallClause = '';
    const hallParams = [];
    if (req.query.hall && req.query.hall !== 'All') {
      hallClause = 'AND m.hall = ?';
      hallParams.push(req.query.hall);
    }

    const [rows] = await pool.query(
      `SELECT mc.*, m.hall
       FROM mould_changes mc
       JOIN machines m ON m.machine_code = mc.machine_code
       WHERE ${where} ${hallClause}
       ORDER BY COALESCE(mc.actual_start_time, mc.scheduled_time, mc.planned_date) DESC
       LIMIT ? OFFSET ?`,
      [...params, ...hallParams, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM mould_changes mc
       JOIN machines m ON m.machine_code = mc.machine_code
       WHERE ${where} ${hallClause}`,
      [...params, ...hallParams]
    );

    res.json({ data: rows, page, limit, total });
  } catch (err) {
    console.error('GET /mould-changes', err);
    res.status(500).json({ error: 'Failed to fetch mould changes' });
  }
});

// ----------------------------------------------------------
// POST /api/mould-changes  (create a Planned mould change)
// ----------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      change_type = 'Planned',
      plan_id, detail_id, machine_code, old_part_id, new_part_id,
      planned_date, planned_shift, time_slot, scheduled_time,
      standard_cycle_time, target_qty, reason, remarks, created_by,
    } = req.body;

    if (!machine_code || !created_by) {
      return res.status(400).json({ error: 'machine_code and created_by are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO mould_changes
        (change_type, plan_id, detail_id, machine_code, old_part_id, new_part_id,
         planned_date, planned_shift, time_slot, scheduled_time,
         standard_cycle_time, target_qty, reason, remarks, status, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'Planned', ?)`,
      [change_type, plan_id ?? null, detail_id ?? null, machine_code, old_part_id ?? null, new_part_id ?? null,
       planned_date ?? null, planned_shift ?? null, time_slot ?? null, scheduled_time ?? null,
       standard_cycle_time ?? null, target_qty ?? null, reason ?? null, remarks ?? null, created_by]
    );

    res.status(201).json({ mould_change_id: result.insertId });
  } catch (err) {
    console.error('POST /mould-changes', err);
    res.status(500).json({ error: 'Failed to create mould change' });
  }
});

// ----------------------------------------------------------
// PUT /api/mould-changes/:id  (start/complete execution, edit fields)
// Accepts any subset of: status, actual_start_time, actual_end_time,
// downtime_minutes, actual_cycle_time, reason, remarks, production_id
// ----------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const allowed = [
      'status', 'actual_start_time', 'actual_end_time', 'downtime_minutes',
      'actual_cycle_time', 'reason', 'remarks', 'production_id',
      'new_part_id', 'planned_date', 'planned_shift', 'scheduled_time',
    ];
    const updates = [];
    const params = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    params.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE mould_changes SET ${updates.join(', ')} WHERE mould_change_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mould change not found' });
    }
    res.json({ updated: true });
  } catch (err) {
    console.error('PUT /mould-changes/:id', err);
    res.status(500).json({ error: 'Failed to update mould change' });
  }
});

// ----------------------------------------------------------
// DELETE /api/mould-changes/:id  (cancel a planned mould change)
// ----------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE mould_changes SET status = 'Cancelled' WHERE mould_change_id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mould change not found' });
    }
    res.json({ cancelled: true });
  } catch (err) {
    console.error('DELETE /mould-changes/:id', err);
    res.status(500).json({ error: 'Failed to cancel mould change' });
  }
});

module.exports = router;