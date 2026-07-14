const pool = require("../config/db");

const createMouldChange = async ({
  change_type = "Planned",
  plan_id = null,
  detail_id = null,
  machine_code,
  old_part_id = null,
  new_part_id = null,
  planned_date = null,
  planned_shift = null,
  scheduled_time = null,
  reason = null,
  remarks = null,
  created_by,
}) => {
  const [result] = await pool.query(
    `INSERT INTO mould_changes
      (change_type, plan_id, detail_id, machine_code, old_part_id, new_part_id,
       planned_date, planned_shift, scheduled_time, reason, remarks, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Planned', ?)`,
    [
      change_type,
      plan_id,
      detail_id,
      machine_code,
      old_part_id,
      new_part_id,
      planned_date,
      planned_shift,
      scheduled_time,
      reason,
      remarks,
      created_by,
    ],
  );
  return result.insertId;
};

const getMouldChangeById = async (id) => {
  const [[row]] = await pool.query(
    `SELECT * FROM mould_changes WHERE mould_change_id = ?`,
    [id],
  );
  return row || null;
};

const updateMouldChange = async (
  id,
  { new_part_id, scheduled_time, reason, remarks, status },
) => {
  await pool.query(
    `UPDATE mould_changes SET
        new_part_id = COALESCE(?, new_part_id),
        scheduled_time = COALESCE(?, scheduled_time),
        reason = COALESCE(?, reason),
        remarks = COALESCE(?, remarks),
        status = COALESCE(?, status)
     WHERE mould_change_id = ?`,
    [new_part_id, scheduled_time, reason, remarks, status, id],
  );
};

const deleteMouldChange = async (id) => {
  await pool.query(`DELETE FROM mould_changes WHERE mould_change_id = ?`, [id]);
};

const getMouldChangesByPlan = async (planId) => {
  const [rows] = await pool.query(
    `SELECT mc.*,
            np.part_number AS new_part_number, np.part_name AS new_part_name,
            op.part_number AS old_part_number, op.part_name AS old_part_name
     FROM mould_changes mc
     LEFT JOIN parts np ON np.id = mc.new_part_id
     LEFT JOIN parts op ON op.id = mc.old_part_id
     WHERE mc.plan_id = ?
     ORDER BY mc.scheduled_time`,
    [planId],
  );
  return rows;
};

// 🔑 CORE LINKING LOGIC — production entry save flow se yeh call hoga.
// Jab operator ek machine pe production entry save karta hai jisme part change
// hua ho, yeh function us machine/date/shift ke liye pending "Planned" mould
// change dhoondh ke production_id attach kar deta hai aur status Completed kar deta hai.
const linkProductionToMouldChange = async ({
  machine_code,
  planning_date,
  shift,
  new_part_id,
  old_part_id,
  production_id,
}) => {
  const [[match]] = await pool.query(
    `SELECT mould_change_id FROM mould_changes
     WHERE machine_code = ?
       AND planned_date = ?
       AND planned_shift = ?
       AND status = 'Planned'
       AND (new_part_id = ? OR new_part_id IS NULL)
     ORDER BY mould_change_id DESC
     LIMIT 1`,
    [machine_code, planning_date, shift, new_part_id],
  );

  if (!match) return null;

  await pool.query(
    `UPDATE mould_changes
     SET production_id = ?,
         status = 'Completed',
         old_part_id = COALESCE(old_part_id, ?),
         actual_start_time = COALESCE(actual_start_time, NOW()),
         actual_end_time = NOW()
     WHERE mould_change_id = ?`,
    [production_id, old_part_id, match.mould_change_id],
  );

  return match.mould_change_id;
};

module.exports = {
  createMouldChange,
  getMouldChangeById,
  updateMouldChange,
  deleteMouldChange,
  getMouldChangesByPlan,
  linkProductionToMouldChange,
};
