const pool = require("../config/db");

/**
 * The dashboard shows ONE day's data at a time. If the frontend doesn't
 * pass a `date`, we default to today. This is what makes "uss date ka hi
 * data" work - every query below is scoped to exactly one entry_date.
 */
const getFilterDate = (query) => query.date || new Date().toISOString().slice(0, 10);

/**
 * WHERE-based filter clause for queries that don't need zero-filled
 * master lists (summary totals, hourly totals, recent events).
 */
const buildFilterClause = (query, alias = "pe") => {
  const date = getFilterDate(query);
  const conditions = [`${alias}.entry_date = ?`, `${alias}.loss_minutes > 0`];
  const params = [date];

  if (query.reasonId) {
    conditions.push(`${alias}.reason_id = ?`);
    params.push(query.reasonId);
  }

  return { where: `WHERE ${conditions.join(" AND ")}`, params, date };
};

// GET /api/loss-time/summary?date=&reasonId=
exports.getSummary = async (req, res) => {
  try {
    const { where, params, date } = buildFilterClause(req.query);

    const [[totals]] = await pool.query(
      `SELECT
         COALESCE(SUM(pe.loss_minutes), 0)               AS totalLossMinutes,
         COALESCE(SUM(pe.target_qty - pe.actual_qty), 0) AS productionLoss,
         COALESCE(AVG(pe.loss_minutes), 0)                AS averageDowntime,
         COUNT(*)                                          AS totalEvents
       FROM production_entries pe
       ${where}`,
      params
    );

    const [[highestHall]] = await pool.query(
      `SELECT pe.hall AS hall, SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       ${where}
       GROUP BY pe.hall
       ORDER BY lossMinutes DESC
       LIMIT 1`,
      params
    );

    const [[highestMachine]] = await pool.query(
      `SELECT m.machine_name AS machine, SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       JOIN machines m ON m.id = pe.machine_id
       ${where}
       GROUP BY m.machine_name
       ORDER BY lossMinutes DESC
       LIMIT 1`,
      params
    );

    const [[highestReason]] = await pool.query(
      `SELECT lr.reason_name AS reason, SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       JOIN loss_reasons lr ON lr.id = pe.reason_id
       ${where}
       GROUP BY lr.reason_name
       ORDER BY lossMinutes DESC
       LIMIT 1`,
      params
    );

    const totalEvents = Number(totals.totalEvents);

    res.json({
      date,
      hasData: totalEvents > 0,
      totalLossMinutes: Number(totals.totalLossMinutes),
      productionLoss: Number(totals.productionLoss),
      averageDowntime: totalEvents ? Number(Number(totals.averageDowntime).toFixed(1)) : 0,
      totalEvents,
      highestHall: highestHall || null,
      highestMachine: highestMachine || null,
      highestReason: highestReason || null,
    });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ message: "Failed to load loss time summary" });
  }
};

// GET /api/loss-time/hall-wise?date=&reasonId=
// Always returns EVERY hall that has ever logged production, zero-filled
// for the ones with no loss on the selected date.
exports.getHallWiseLoss = async (req, res) => {
  try {
    const date = getFilterDate(req.query);
    const { reasonId } = req.query;

    const dataConditions = ["pe.entry_date = ?", "pe.loss_minutes > 0"];
    const dataParams = [date];
    if (reasonId) {
      dataConditions.push("pe.reason_id = ?");
      dataParams.push(reasonId);
    }

    const [halls] = await pool.query(
      `SELECT DISTINCT hall FROM production_entries WHERE hall IS NOT NULL ORDER BY hall`
    );

    const [rows] = await pool.query(
      `SELECT pe.hall AS hall, SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       WHERE ${dataConditions.join(" AND ")}
       GROUP BY pe.hall`,
      dataParams
    );

    const lossMap = new Map(rows.map((r) => [r.hall, Number(r.lossMinutes)]));

    const result = halls
      .map((h) => ({ hall: h.hall, lossMinutes: lossMap.get(h.hall) || 0 }))
      .sort((a, b) => b.lossMinutes - a.lossMinutes);

    res.json(result);
  } catch (err) {
    console.error("getHallWiseLoss error:", err);
    res.status(500).json({ message: "Failed to load hall wise loss" });
  }
};

// GET /api/loss-time/reason-wise?date=&reasonId=
// Always returns EVERY active reason from loss_reasons, zero-filled.
exports.getReasonWiseLoss = async (req, res) => {
  try {
    const date = getFilterDate(req.query);
    const { reasonId } = req.query;

    const dataConditions = ["pe.entry_date = ?", "pe.loss_minutes > 0"];
    const dataParams = [date];
    if (reasonId) {
      dataConditions.push("pe.reason_id = ?");
      dataParams.push(reasonId);
    }

    const reasonConditions = ["status = 'Active'"];
    const reasonParams = [];
    if (reasonId) {
      reasonConditions.push("id = ?");
      reasonParams.push(reasonId);
    }

    const [reasons] = await pool.query(
      `SELECT id, reason_name FROM loss_reasons WHERE ${reasonConditions.join(" AND ")} ORDER BY reason_name`,
      reasonParams
    );

    const [rows] = await pool.query(
      `SELECT pe.reason_id AS reasonId, SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       WHERE ${dataConditions.join(" AND ")}
       GROUP BY pe.reason_id`,
      dataParams
    );

    const lossMap = new Map(rows.map((r) => [r.reasonId, Number(r.lossMinutes)]));

    const result = reasons
      .map((r) => ({ reason: r.reason_name, lossMinutes: lossMap.get(r.id) || 0 }))
      .sort((a, b) => b.lossMinutes - a.lossMinutes);

    res.json(result);
  } catch (err) {
    console.error("getReasonWiseLoss error:", err);
    res.status(500).json({ message: "Failed to load reason wise loss" });
  }
};

// GET /api/loss-time/heatmap?date=&reasonId=
// Always returns EVERY active machine x all 24 hours, zero-filled.
exports.getHeatMapData = async (req, res) => {
  try {
    const date = getFilterDate(req.query);
    const { reasonId } = req.query;

    const [machines] = await pool.query(
      `SELECT id, machine_name AS name FROM machines WHERE status = 'Active' ORDER BY machine_name`
    );

    const dataConditions = [
      "pe.entry_date = ?",
      "pe.loss_minutes > 0",
      "pe.start_time IS NOT NULL",
    ];
    const dataParams = [date];
    if (reasonId) {
      dataConditions.push("pe.reason_id = ?");
      dataParams.push(reasonId);
    }

    const [rows] = await pool.query(
      `SELECT pe.machine_id AS machineId, HOUR(pe.start_time) AS hour,
              SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       WHERE ${dataConditions.join(" AND ")}
       GROUP BY pe.machine_id, HOUR(pe.start_time)`,
      dataParams
    );

    const lossMap = new Map(
      rows.map((r) => [`${r.machineId}-${Number(r.hour)}`, Number(r.lossMinutes)])
    );

    const grid = [];
    machines.forEach((m) => {
      for (let hour = 0; hour < 24; hour++) {
        grid.push({
          machine: m.name,
          hour,
          lossMinutes: lossMap.get(`${m.id}-${hour}`) || 0,
        });
      }
    });

    res.json(grid);
  } catch (err) {
    console.error("getHeatMapData error:", err);
    res.status(500).json({ message: "Failed to load heat map data" });
  }
};

// GET /api/loss-time/hourly-totals?date=&reasonId=
// Always returns all 24 hours, zero-filled.
exports.getHourlyLossTotals = async (req, res) => {
  try {
    const { where, params } = buildFilterClause(req.query);
    const [rows] = await pool.query(
      `SELECT HOUR(pe.start_time) AS hour, SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       ${where} AND pe.start_time IS NOT NULL
       GROUP BY HOUR(pe.start_time)`,
      params
    );

    const byHour = new Map(rows.map((r) => [Number(r.hour), Number(r.lossMinutes)]));
    const filled = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      lossMinutes: byHour.get(hour) || 0,
    }));

    res.json(filled);
  } catch (err) {
    console.error("getHourlyLossTotals error:", err);
    res.status(500).json({ message: "Failed to load hourly loss totals" });
  }
};

// GET /api/loss-time/recent-events?date=&reasonId=&limit=
exports.getRecentEvents = async (req, res) => {
  try {
    const { where, params } = buildFilterClause(req.query);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const [rows] = await pool.query(
      `SELECT
         pe.id,
         lr.reason_name                    AS reason,
         pe.entry_date                      AS date,
         pe.hall                            AS hall,
         m.machine_name                     AS machine,
         pe.start_time                      AS startTime,
         pe.end_time                        AS endTime,
         o.operator_name                    AS operator,
         p.part_name                        AS part,
         pe.shift                           AS shift,
         (pe.target_qty - pe.actual_qty)    AS productionLoss,
         pe.loss_minutes                    AS lossMinutes,
         pe.remarks                         AS remarks
       FROM production_entries pe
       LEFT JOIN loss_reasons lr ON lr.id = pe.reason_id
       LEFT JOIN machines m ON m.id = pe.machine_id
       LEFT JOIN operators o ON o.id = pe.operator_id
       LEFT JOIN parts p ON p.id = pe.part_id
       ${where}
       ORDER BY pe.start_time DESC
       LIMIT ?`,
      [...params, limit]
    );

    res.json(rows);
  } catch (err) {
    console.error("getRecentEvents error:", err);
    res.status(500).json({ message: "Failed to load recent events" });
  }
};

// GET /api/loss-time/filters
// Reason dropdown options. Not date-scoped - always all active reasons.
exports.getFilterOptions = async (req, res) => {
  try {
    const [reasons] = await pool.query(
      `SELECT id, reason_name AS name FROM loss_reasons WHERE status = 'Active' ORDER BY reason_name`
    );

    res.json({ reasons });
  } catch (err) {
    console.error("getFilterOptions error:", err);
    res.status(500).json({ message: "Failed to load filter options" });
  }
};