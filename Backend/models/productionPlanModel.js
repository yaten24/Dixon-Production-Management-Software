const pool = require("../config/db");

const generatePlanNumber = async (hall, shift, date) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as cnt FROM production_plan_header WHERE planning_date = ?`,
    [date],
  );
  const seq = String(rows[0].cnt + 1).padStart(3, "0");
  const hallCode = hall.replace(/\s+/g, "").toUpperCase();
  const dateCode = date.replace(/-/g, "");
  return `PP-${dateCode}-${hallCode}-${shift}-${seq}`;
};

const checkExistingPlan = async (date, hall, shift) => {
  const [rows] = await pool.query(
    `SELECT plan_id FROM production_plan_header WHERE planning_date = ? AND hall = ? AND shift = ?`,
    [date, hall, shift],
  );
  return rows[0] || null;
};

const createPlan = async ({
  planning_date,
  hall,
  shift,
  machines,
  created_by,
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (!machines || machines.length === 0) {
      throw new Error("No machines provided for selected hall");
    }

    const planNumber = await generatePlanNumber(hall, shift, planning_date);

    const [header] = await conn.query(
      `INSERT INTO production_plan_header
        (plan_number, planning_date, hall, shift, total_machines, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [planNumber, planning_date, hall, shift, machines.length, created_by],
    );

    const planId = header.insertId;

    const values = machines.map((m) => [planId, m.machine_code]);
    await conn.query(
      `INSERT INTO production_plan_details (plan_id, machine_code) VALUES ?`,
      [values],
    );

    await conn.commit();
    return planId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getPlanById = async (planId) => {
  const [[header]] = await pool.query(
    `SELECT * FROM production_plan_header WHERE plan_id = ?`,
    [planId],
  );

  if (!header) return null;

  const [details] = await pool.query(
    `SELECT
        d.detail_id, d.plan_id, d.machine_code,
        m.machine_name,
        d.operator_id,
        o.operator_name,
        d.part_id,
        p.part_number, p.part_name,
        p.standard_cycle_time AS cycle_time,
        p.actual_cycle_time AS actual_cycle_time,
        d.target_qty, d.priority, d.machine_status, d.remarks
     FROM production_plan_details d
     JOIN machines m ON m.machine_code = d.machine_code
     LEFT JOIN operators o ON o.operator_code = d.operator_id
     LEFT JOIN parts p ON p.id = d.part_id
     WHERE d.plan_id = ?
     ORDER BY d.machine_code`,
    [planId],
  );

  const detailIds = details.map((d) => d.detail_id);
  let mouldChanges = [];

  if (detailIds.length > 0) {
    [mouldChanges] = await pool.query(
      `SELECT
          mc.mould_change_id, mc.detail_id, mc.production_id, mc.status,
          mc.change_type, mc.scheduled_time, mc.reason,
          mc.old_part_id, op.part_number AS old_part_number,
          op.standard_cycle_time AS old_part_standard_cycle_time,
          op.actual_cycle_time AS old_part_actual_cycle_time,
          mc.new_part_id, np.part_number AS new_part_number, np.part_name AS new_part_name,
          np.standard_cycle_time AS new_part_standard_cycle_time,
          mc.target_qty AS new_part_target_quantity,
          np.actual_cycle_time AS new_part_actual_cycle_time
          
       FROM mould_changes mc
       LEFT JOIN parts op ON op.id = mc.old_part_id
       LEFT JOIN parts np ON np.id = mc.new_part_id
       WHERE mc.detail_id IN (?)
       ORDER BY mc.scheduled_time`,
      [detailIds],
    );
  }

  const detailsWithMould = details.map((d) => ({
    ...d,
    mould_changes: mouldChanges.filter((mc) => mc.detail_id === d.detail_id),
  }));

  return { header, details: detailsWithMould };
};

const updateDetail = async (detailId, { operator_id, part_id, target_qty }) => {
  await pool.query(
    `UPDATE production_plan_details
     SET operator_id = ?, part_id = ?, target_qty = ?
     WHERE detail_id = ?`,
    [operator_id || null, part_id || null, target_qty || 0, detailId],
  );

  const [[row]] = await pool.query(
    `SELECT plan_id FROM production_plan_details WHERE detail_id = ?`,
    [detailId],
  );

  await recalcHeaderStats(row.plan_id);
  return row.plan_id;
};

const recalcHeaderStats = async (planId) => {
  const [[stats]] = await pool.query(
    `SELECT
        COUNT(*) as total_machines,
        SUM(CASE WHEN operator_id IS NOT NULL AND part_id IS NOT NULL AND target_qty > 0 THEN 1 ELSE 0 END) as planned_machines,
        SUM(target_qty) as total_target_qty
     FROM production_plan_details
     WHERE plan_id = ?`,
    [planId],
  );

  await pool.query(
    `UPDATE production_plan_header
     SET total_machines = ?, planned_machines = ?, total_target_qty = ?
     WHERE plan_id = ?`,
    [
      stats.total_machines,
      stats.planned_machines || 0,
      stats.total_target_qty || 0,
      planId,
    ],
  );
};

const publishPlan = async (planId, approvedBy) => {
  await pool.query(
    `UPDATE production_plan_header
     SET status = 'Published', approved_by = ?, approved_at = NOW()
     WHERE plan_id = ?`,
    [approvedBy, planId],
  );
};

module.exports = {
  checkExistingPlan,
  createPlan,
  getPlanById,
  updateDetail,
  publishPlan,
};
