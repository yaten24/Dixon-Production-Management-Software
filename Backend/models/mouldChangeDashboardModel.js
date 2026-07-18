const pool = require("../config/db"); // adjust path to your mysql2 pool

const HALL_LIST = ["Hall-1", "Hall-2", "Hall-3", "Hall-4", "C-8"];

// Edit this list to match your actual 19 downtime reasons
const REASON_LIST = [
  "Bin Trolly Short",
  "Conveyor Stop",
  "Defect Rework Loss",
  "Insert Ejector Pin Slider Pin Spring Coupler Copper Electrode Change",
  "Machine Breakdown",
  "Mould Breakdown",
  "Mould Change",
  "Mould Polishing Cleaning",
  "Power Failure",
  "Raw Material Shortage",
  "Robot Fault",
  "Setting Change",
  "Shift Changeover",
  "Tool Change",
  "Trial Run",
  "Operator Not Available",
  "Quality Hold",
  "Water Chiller Fault",
  "Others",
];

const SHIFT_A_HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08..19
const SHIFT_B_HOURS = [
  ...Array.from({ length: 4 }, (_, i) => i + 20), // 20..23
  ...Array.from({ length: 8 }, (_, i) => i), // 00..07
];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];

const isAll = (v) => !v || v === "All";

const getHallWiseLoss = async (date, reason) => {
  const params = [date];
  let reasonClause = "";
  if (!isAll(reason)) {
    reasonClause = " AND mc.reason = ?";
    params.push(reason);
  }

  const [rows] = await pool.query(
    `SELECT m.hall AS hall, COALESCE(SUM(mc.downtime_minutes), 0) AS lossMinutes
     FROM machines m
     LEFT JOIN mould_changes mc
       ON mc.machine_code = m.machine_code
       AND mc.planned_date = ?
       ${reasonClause}
     GROUP BY m.hall`,
    params
  );

  const map = {};
  rows.forEach((r) => (map[r.hall] = Number(r.lossMinutes) || 0));

  return HALL_LIST.map((hall) => ({
    hall,
    lossMinutes: map[hall] || 0,
  }));
};

const getReasonWiseLoss = async (date, hall) => {
  const params = [date];
  let hallClause = "";
  if (!isAll(hall)) {
    hallClause = " AND m.hall = ?";
    params.push(hall);
  }

  const [rows] = await pool.query(
    `SELECT mc.reason AS reason, COALESCE(SUM(mc.downtime_minutes), 0) AS lossMinutes
     FROM mould_changes mc
     LEFT JOIN machines m ON m.machine_code = mc.machine_code
     WHERE mc.planned_date = ? ${hallClause}
     GROUP BY mc.reason`,
    params
  );

  const map = {};
  rows.forEach((r) => (map[r.reason] = Number(r.lossMinutes) || 0));

  const total = Object.values(map).reduce((s, v) => s + v, 0);

  return REASON_LIST.map((reason) => {
    const lossMinutes = map[reason] || 0;
    return {
      reason,
      lossMinutes,
      percent: total > 0 ? Number(((lossMinutes / total) * 100).toFixed(1)) : 0,
    };
  }).sort((a, b) => b.lossMinutes - a.lossMinutes);
};

const buildShiftBuckets = (map, valueKeys) => {
  const buildShift = (hours) =>
    hours.map((h) => {
      const entry = map[h] || {};
      const out = { hour: h, label: String(h).padStart(2, "0") };
      valueKeys.forEach((k) => (out[k] = entry[k] || 0));
      return out;
    });
  return { shiftA: buildShift(SHIFT_A_HOURS), shiftB: buildShift(SHIFT_B_HOURS) };
};

const getHourlyLoss = async (date, reason, hall) => {
  const params = [date];
  let extraClause = "";
  if (!isAll(reason)) {
    extraClause += " AND mc.reason = ?";
    params.push(reason);
  }
  if (!isAll(hall)) {
    extraClause += " AND m.hall = ?";
    params.push(hall);
  }

  const [rows] = await pool.query(
    `SELECT HOUR(mc.actual_start_time) AS hr, COALESCE(SUM(mc.downtime_minutes), 0) AS lossMinutes
     FROM mould_changes mc
     LEFT JOIN machines m ON m.machine_code = mc.machine_code
     WHERE mc.planned_date = ? AND mc.actual_start_time IS NOT NULL ${extraClause}
     GROUP BY HOUR(mc.actual_start_time)`,
    params
  );

  const map = {};
  rows.forEach((r) => (map[r.hr] = { lossMinutes: Number(r.lossMinutes) || 0 }));

  return buildShiftBuckets(map, ["lossMinutes"]);
};

// Fixed: previously selected raw columns (machine_code, downtime_minutes, status...)
// that didn't match what the frontend table renders (oldMould/newMould/operator/
// changeDate/changeTime), so the UI silently fell back to fake demo rows every time.
const getRecentMouldChanges = async ({ date, hall, reason, limit = 20 } = {}) => {
  const params = [];
  let whereClause = "WHERE mc.actual_start_time IS NOT NULL";

  if (date) {
    whereClause += " AND mc.planned_date = ?";
    params.push(date);
  }
  if (!isAll(hall)) {
    whereClause += " AND m.hall = ?";
    params.push(hall);
  }
  if (!isAll(reason)) {
    whereClause += " AND mc.reason = ?";
    params.push(reason);
  }

  params.push(Number(limit) || 20);

  const [rows] = await pool.query(
    `SELECT
        mc.mould_change_id AS id,
        mc.machine_code AS machine,
        m.hall AS hall,
        mc.change_type AS changeType,
        mc.reason AS reason,
        op.part_name AS oldMould,
        np.part_name AS newMould,
        DATE_FORMAT(mc.actual_start_time, '%Y-%m-%d') AS changeDate,
        DATE_FORMAT(mc.actual_start_time, '%h:%i %p') AS changeTime,
        COALESCE(mc.downtime_minutes, 0) AS changeDuration,
        u.name AS operator,
        mc.status AS status
     FROM mould_changes mc
     LEFT JOIN machines m ON m.machine_code = mc.machine_code
     LEFT JOIN parts op ON op.id = mc.old_part_id
     LEFT JOIN parts np ON np.id = mc.new_part_id
     LEFT JOIN users u ON u.id = mc.created_by
     ${whereClause}
     ORDER BY mc.actual_start_time DESC
     LIMIT ?`,
    params
  );

  return rows;
};

// Fixed: previously counted change_type = 'Planned' as "planned" and
// status = 'Completed' as "actual" with no relation between the two, and no
// reason/hall filter — so "actual" mould changes for a totally different hall
// or reason could inflate the bar. Now planned = rows scheduled for the date,
// actual = rows from that same scheduled set that were actually completed.
const getHallWiseMouldChanges = async (date, { reason, hall } = {}) => {
  const params = [date];
  let extraClause = "";
  if (!isAll(reason)) {
    extraClause += " AND mc.reason = ?";
    params.push(reason);
  }

  const [rows] = await pool.query(
    `SELECT m.hall AS hall,
       COALESCE(SUM(CASE WHEN mc.change_type = 'Planned' THEN 1 ELSE 0 END), 0) AS planned,
       COALESCE(SUM(CASE WHEN mc.change_type = 'Planned' AND mc.status = 'Completed' THEN 1 ELSE 0 END), 0) AS actual
     FROM machines m
     LEFT JOIN mould_changes mc
       ON mc.machine_code = m.machine_code
       AND mc.planned_date = ?
       ${extraClause}
     GROUP BY m.hall`,
    params
  );

  const map = {};
  rows.forEach((r) => (map[r.hall] = { planned: Number(r.planned) || 0, actual: Number(r.actual) || 0 }));

  const list = HALL_LIST.map((h) => ({
    hall: h,
    planned: map[h]?.planned || 0,
    actual: map[h]?.actual || 0,
  }));

  return isAll(hall) ? list : list.filter((h) => h.hall === hall);
};

const getPlannedVsUnplanned = async (date, { reason, hall } = {}) => {
  const params = [date];
  let extraClause = "";
  if (!isAll(reason)) {
    extraClause += " AND mc.reason = ?";
    params.push(reason);
  }
  if (!isAll(hall)) {
    extraClause += " AND m.hall = ?";
    params.push(hall);
  }

  const [rows] = await pool.query(
    `SELECT mc.change_type AS changeType, COUNT(*) AS cnt
     FROM mould_changes mc
     LEFT JOIN machines m ON m.machine_code = mc.machine_code
     WHERE mc.planned_date = ? ${extraClause}
     GROUP BY mc.change_type`,
    params
  );

  let planned = 0;
  let unplanned = 0;
  rows.forEach((r) => {
    if (r.changeType === "Planned") planned = Number(r.cnt) || 0;
    if (r.changeType === "Unplanned") unplanned = Number(r.cnt) || 0;
  });

  return { planned, unplanned };
};

const getHourlyPlannedUnplanned = async (date, { reason, hall } = {}) => {
  const params = [date];
  let extraClause = "";
  if (!isAll(reason)) {
    extraClause += " AND mc.reason = ?";
    params.push(reason);
  }
  if (!isAll(hall)) {
    extraClause += " AND m.hall = ?";
    params.push(hall);
  }

  const [rows] = await pool.query(
    `SELECT HOUR(mc.actual_start_time) AS hr, mc.change_type AS changeType, COUNT(*) AS cnt
     FROM mould_changes mc
     LEFT JOIN machines m ON m.machine_code = mc.machine_code
     WHERE mc.planned_date = ? AND mc.actual_start_time IS NOT NULL ${extraClause}
     GROUP BY HOUR(mc.actual_start_time), mc.change_type`,
    params
  );

  const map = {};
  rows.forEach((r) => {
    if (!map[r.hr]) map[r.hr] = { planned: 0, unplanned: 0 };
    if (r.changeType === "Planned") map[r.hr].planned = Number(r.cnt) || 0;
    if (r.changeType === "Unplanned") map[r.hr].unplanned = Number(r.cnt) || 0;
  });

  return buildShiftBuckets(map, ["planned", "unplanned"]);
};

// New: hall x hour heatmap of mould-change activity for the "Heatmap" button.
const getMouldChangeHeatmap = async (date, { reason, hall } = {}) => {
  const params = [date];
  let extraClause = "";
  if (!isAll(reason)) {
    extraClause += " AND mc.reason = ?";
    params.push(reason);
  }

  const [rows] = await pool.query(
    `SELECT m.hall AS hall, HOUR(mc.actual_start_time) AS hr, COUNT(*) AS cnt
     FROM mould_changes mc
     LEFT JOIN machines m ON m.machine_code = mc.machine_code
     WHERE mc.planned_date = ? AND mc.actual_start_time IS NOT NULL ${extraClause}
     GROUP BY m.hall, HOUR(mc.actual_start_time)`,
    params
  );

  const map = {};
  rows.forEach((r) => {
    if (!map[r.hall]) map[r.hall] = {};
    map[r.hall][r.hr] = Number(r.cnt) || 0;
  });

  const halls = isAll(hall) ? HALL_LIST : HALL_LIST.filter((h) => h === hall);

  let max = 0;
  const grid = halls.map((h) => {
    const cells = ORDERED_HOURS.map((hr) => {
      const cnt = map[h]?.[hr] || 0;
      if (cnt > max) max = cnt;
      return { hour: hr, label: String(hr).padStart(2, "0"), count: cnt };
    });
    return { hall: h, cells };
  });

  return { hours: ORDERED_HOURS, grid, max };
};

module.exports = {
  HALL_LIST,
  REASON_LIST,
  getHallWiseLoss,
  getReasonWiseLoss,
  getHourlyLoss,
  getRecentMouldChanges,
  getHallWiseMouldChanges,
  getPlannedVsUnplanned,
  getHourlyPlannedUnplanned,
  getMouldChangeHeatmap,
};