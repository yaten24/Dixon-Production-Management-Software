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

const getHallWiseLoss = async (date, reason) => {
  const params = [date];
  let reasonClause = "";
  if (reason && reason !== "All") {
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

const getReasonWiseLoss = async (date) => {
  const [rows] = await pool.query(
    `SELECT reason, COALESCE(SUM(downtime_minutes), 0) AS lossMinutes
     FROM mould_changes
     WHERE planned_date = ?
     GROUP BY reason`,
    [date]
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

const getHourlyLoss = async (date, reason) => {
  const params = [date];
  let reasonClause = "";
  if (reason && reason !== "All") {
    reasonClause = " AND reason = ?";
    params.push(reason);
  }

  const [rows] = await pool.query(
    `SELECT HOUR(actual_start_time) AS hr, COALESCE(SUM(downtime_minutes), 0) AS lossMinutes
     FROM mould_changes
     WHERE planned_date = ? AND actual_start_time IS NOT NULL ${reasonClause}
     GROUP BY HOUR(actual_start_time)`,
    params
  );

  const map = {};
  rows.forEach((r) => (map[r.hr] = Number(r.lossMinutes) || 0));

  const shiftAHours = Array.from({ length: 12 }, (_, i) => i + 8); // 08..19
  const shiftBHours = [
    ...Array.from({ length: 4 }, (_, i) => i + 20), // 20..23
    ...Array.from({ length: 8 }, (_, i) => i), // 00..07
  ];

  const buildShift = (hours) =>
    hours.map((h) => ({
      hour: h,
      label: String(h).padStart(2, "0"),
      lossMinutes: map[h] || 0,
    }));

  return {
    shiftA: buildShift(shiftAHours),
    shiftB: buildShift(shiftBHours),
  };
};

const getRecentMouldChanges = async (limit = 20) => {
  const [rows] = await pool.query(
    `SELECT mc.mould_change_id, mc.machine_code, m.hall, mc.reason,
            mc.downtime_minutes, mc.actual_start_time, mc.actual_end_time, mc.status
     FROM mould_changes mc
     LEFT JOIN machines m ON m.machine_code = mc.machine_code
     ORDER BY mc.actual_start_time DESC
     LIMIT ?`,
    [Number(limit)]
  );
  return rows;
};

const getHallWiseMouldChanges = async (date) => {
  const [rows] = await pool.query(
    `SELECT m.hall AS hall,
       COALESCE(SUM(CASE WHEN mc.change_type = 'Planned' THEN 1 ELSE 0 END), 0) AS planned,
       COALESCE(SUM(CASE WHEN mc.status = 'Completed' THEN 1 ELSE 0 END), 0) AS actual
     FROM machines m
     LEFT JOIN mould_changes mc
       ON mc.machine_code = m.machine_code
       AND mc.planned_date = ?
     GROUP BY m.hall`,
    [date]
  );

  const map = {};
  rows.forEach((r) => (map[r.hall] = { planned: Number(r.planned) || 0, actual: Number(r.actual) || 0 }));

  return HALL_LIST.map((hall) => ({
    hall,
    planned: map[hall]?.planned || 0,
    actual: map[hall]?.actual || 0,
  }));
};

const getPlannedVsUnplanned = async (date) => {
  const [rows] = await pool.query(
    `SELECT change_type, COUNT(*) AS cnt
     FROM mould_changes
     WHERE planned_date = ?
     GROUP BY change_type`,
    [date]
  );

  let planned = 0;
  let unplanned = 0;
  rows.forEach((r) => {
    if (r.change_type === "Planned") planned = Number(r.cnt) || 0;
    if (r.change_type === "Unplanned") unplanned = Number(r.cnt) || 0;
  });

  return { planned, unplanned };
};

module.exports = {
  HALL_LIST,
  REASON_LIST,
  getHallWiseLoss,
  getReasonWiseLoss,
  getHourlyLoss,
  getRecentMouldChanges,
  getHallWiseMouldChanges,
  getPlannedVsUnplanned
};