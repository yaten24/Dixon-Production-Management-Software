const db = require("../config/db");
const DashboardModel = require("./dashboardModel");

const buildFilters = ({ hall, from, to, machineCode, shift }) => {
  const conditions = ["pe.hall = ?"];
  const params = [hall];

  if (from) { conditions.push("pe.entry_date >= ?"); params.push(from); }
  if (to) { conditions.push("pe.entry_date <= ?"); params.push(to); }
  if (machineCode && machineCode !== "All") { conditions.push("m.machine_code = ?"); params.push(machineCode); }
  if (shift && shift !== "All") { conditions.push("pe.shift = ?"); params.push(shift); }

  return { where: conditions.join(" AND "), params };
};

// FIX: added total_good + ideal_run_seconds — both required for a correct
// Quality and Performance calculation in calculateOEE().
exports.getStats = async (filters) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      COALESCE(SUM(pe.target_qty), 0) AS total_target,
      COALESCE(SUM(pe.actual_qty), 0) AS total_actual,
      COALESCE(SUM(pe.reject_qty), 0) AS total_reject,
      COALESCE(SUM(pe.good_qty), 0) AS total_good,
      COALESCE(SUM(pe.loss_minutes), 0) AS total_loss_minutes,
      COALESCE(SUM(pe.actual_qty * pe.standard_cycle_time), 0) AS ideal_run_seconds,
      COUNT(DISTINCT pe.machine_id) AS machines_reporting
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    `,
    params,
  );

  return rows[0];
};

exports.getMachineWise = async (filters) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      m.machine_code AS machine,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual,
      COALESCE(SUM(pe.reject_qty), 0) AS rejection,
      COALESCE(SUM(pe.good_qty), 0) AS good,
      COALESCE(SUM(pe.loss_minutes), 0) AS loss_minutes,
      COALESCE(SUM(pe.actual_qty * pe.standard_cycle_time), 0) AS ideal_run_seconds
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    GROUP BY m.machine_code
    ORDER BY m.machine_code ASC
    `,
    params,
  );

  return rows.map((r) => {
    const target = Number(r.target) || 0;
    const actual = Number(r.actual) || 0;
    return {
      machine: r.machine,
      target,
      actual,
      rejection: Number(r.rejection) || 0,
      good: Number(r.good) || 0,
      lossMinutes: Number(r.loss_minutes) || 0,
      idealRunSeconds: Number(r.ideal_run_seconds) || 0,
      achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
    };
  });
};

// FIX: `pe.time_slot` is a VARCHAR like "08:00 - 09:00", not a number.
// The frontend chart keys hourly bars by numeric hour (0-23) — passing the
// raw string through meant `byHour.get(d.hour)` never matched anything,
// so every bar rendered as 0 regardless of filters. Now we parse the
// leading hour out of the slot string and return it as `hour` (int).
const parseSlotStartHour = (slot) => {
  if (!slot) return null;
  const startStr = slot.split(/[-–]/)[0]?.trim() || "";
  const hourStr = startStr.split(":")[0];
  const hour = parseInt(hourStr, 10);
  return Number.isNaN(hour) ? null : hour;
};

exports.getHourlyTrend = async ({ hall, date, machineCode, shift }) => {
  const conditions = ["pe.hall = ?", "pe.entry_date = ?"];
  const params = [hall, date];

  if (machineCode && machineCode !== "All") { conditions.push("m.machine_code = ?"); params.push(machineCode); }
  if (shift && shift !== "All") { conditions.push("pe.shift = ?"); params.push(shift); }

  const [rows] = await db.query(
    `
    SELECT
      pe.time_slot AS slot,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY pe.time_slot
    `,
    params,
  );

  return rows
    .map((r) => {
      const target = Number(r.target) || 0;
      const actual = Number(r.actual) || 0;
      return {
        hour: parseSlotStartHour(r.slot),
        timeSlot: r.slot,
        target,
        actual,
        achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
      };
    })
    .filter((r) => r.hour !== null)
    .sort((a, b) => a.hour - b.hour);
};

exports.getShiftSummary = async (filters) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      pe.shift,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    GROUP BY pe.shift
    `,
    params,
  );

  const result = { A: { target: 0, actual: 0 }, B: { target: 0, actual: 0 } };
  rows.forEach((r) => {
    if (r.shift === "A" || r.shift === "B") {
      result[r.shift] = { target: Number(r.target) || 0, actual: Number(r.actual) || 0 };
    }
  });
  return result;
};

exports.getTopRejects = async (filters, limit = 5) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      m.machine_code AS machine,
      COALESCE(SUM(pe.reject_qty), 0) AS reject,
      COALESCE(SUM(pe.actual_qty), 0) AS production
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    GROUP BY m.machine_code
    HAVING reject > 0
    ORDER BY reject DESC
    LIMIT ?
    `,
    [...params, limit],
  );

  return rows.map((r) => ({
    machine: r.machine,
    reject: Number(r.reject) || 0,
    production: Number(r.production) || 0,
  }));
};

exports.getMachinesForHall = async (hall) => {
  const [rows] = await db.query(
    `SELECT id, machine_code, machine_name FROM machines WHERE hall = ? ORDER BY machine_code ASC`,
    [hall],
  );
  return rows;
};

// NEW: per-machine, per-hour breakdown — powers the Heatmap page.
exports.getMachineHourlyTrend = async ({ hall, date, shift }) => {
  const conditions = ["pe.hall = ?", "pe.entry_date = ?"];
  const params = [hall, date];
  if (shift && shift !== "All") { conditions.push("pe.shift = ?"); params.push(shift); }

  const [rows] = await db.query(
    `
    SELECT
      m.machine_code AS machine,
      pe.time_slot AS slot,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY m.machine_code, pe.time_slot
    `,
    params,
  );

  return rows
    .map((r) => {
      const target = Number(r.target) || 0;
      const actual = Number(r.actual) || 0;
      return {
        machine: r.machine,
        hour: parseSlotStartHour(r.slot),
        target,
        actual,
        achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
      };
    })
    .filter((r) => r.hour !== null);
};

exports.getShiftContext = DashboardModel.getShiftContext;