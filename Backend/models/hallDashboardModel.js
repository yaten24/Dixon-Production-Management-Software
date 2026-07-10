const db = require("../config/db");
const DashboardModel = require("./dashboardModel");

// FIX + FEATURE: ab shift filter bhi supported hai (A / B / All)
const buildFilters = ({ hall, from, to, machineCode, shift }) => {
  const conditions = ["pe.hall = ?"];
  const params = [hall];

  if (from) {
    conditions.push("pe.entry_date >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("pe.entry_date <= ?");
    params.push(to);
  }
  if (machineCode && machineCode !== "All Machines") {
    conditions.push("m.machine_code = ?");
    params.push(machineCode);
  }
  if (shift && shift !== "All") {
    conditions.push("pe.shift = ?");
    params.push(shift);
  }

  return { where: conditions.join(" AND "), params };
};

exports.getStats = async (filters) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      COALESCE(SUM(pe.target_qty), 0) AS total_target,
      COALESCE(SUM(pe.actual_qty), 0) AS total_actual,
      COALESCE(SUM(pe.reject_qty), 0) AS total_reject,
      COALESCE(SUM(pe.loss_minutes), 0) AS total_loss_minutes,
      COUNT(DISTINCT pe.machine_id) AS machines_reporting
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${where}
    `,
    params,
  );

  return rows[0];
};

// FIX: loss_minutes ab per-machine bhi select ho raha hai (OEE ke liye required)
exports.getMachineWise = async (filters) => {
  const { where, params } = buildFilters(filters);

  const [rows] = await db.query(
    `
    SELECT
      m.machine_code AS machine,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual,
      COALESCE(SUM(pe.reject_qty), 0) AS rejection,
      COALESCE(SUM(pe.loss_minutes), 0) AS loss_minutes
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
      lossMinutes: Number(r.loss_minutes) || 0,
      achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
    };
  });
};

// FIX: shift filter yahan bhi honor hoga
exports.getHourlyTrend = async ({ hall, date, machineCode, shift }) => {
  const conditions = ["pe.hall = ?", "pe.entry_date = ?"];
  const params = [hall, date];

  if (machineCode && machineCode !== "All Machines") {
    conditions.push("m.machine_code = ?");
    params.push(machineCode);
  }
  if (shift && shift !== "All") {
    conditions.push("pe.shift = ?");
    params.push(shift);
  }

  const [rows] = await db.query(
    `
    SELECT
      pe.time_slot AS hour,
      COALESCE(SUM(pe.target_qty), 0) AS target,
      COALESCE(SUM(pe.actual_qty), 0) AS actual
    FROM production_entries pe
    INNER JOIN machines m ON pe.machine_id = m.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY pe.time_slot
    `,
    params,
  );

  const sorted = rows.sort((a, b) => {
    const aStart = a.hour?.split(" - ")[0] || "";
    const bStart = b.hour?.split(" - ")[0] || "";
    return aStart.localeCompare(bStart);
  });

  return sorted.map((r) => {
    const target = Number(r.target) || 0;
    const actual = Number(r.actual) || 0;
    return {
      hour: r.hour,
      target,
      actual,
      achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
    };
  });
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
      result[r.shift] = {
        target: Number(r.target) || 0,
        actual: Number(r.actual) || 0,
      };
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

exports.getShiftContext = DashboardModel.getShiftContext;
