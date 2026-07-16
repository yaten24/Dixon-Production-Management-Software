const pool = require("../config/db");

/**
 * Builds a WHERE clause + params from the dashboard's active filters.
 * Every query on this page only cares about rows that actually have
 * loss minutes recorded, so that condition is always included.
 */
const buildFilterClause = (query, alias = "pe") => {
  const { hall, machineId, shift, reasonId } = query;
  const conditions = [`${alias}.loss_minutes > 0`];
  const params = [];

  if (hall) {
    conditions.push(`${alias}.hall = ?`);
    params.push(hall);
  }
  if (machineId) {
    conditions.push(`${alias}.machine_id = ?`);
    params.push(machineId);
  }
  if (shift) {
    conditions.push(`${alias}.shift = ?`);
    params.push(shift);
  }
  if (reasonId) {
    conditions.push(`${alias}.reason_id = ?`);
    params.push(reasonId);
  }

  return { where: `WHERE ${conditions.join(" AND ")}`, params };
};

// GET /api/loss-time/summary
exports.getSummary = async (req, res) => {
  try {
    const { where, params } = buildFilterClause(req.query);

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

    res.json({
      totalLossMinutes: Number(totals.totalLossMinutes),
      productionLoss: Number(totals.productionLoss),
      averageDowntime: totals.totalEvents
        ? Number(Number(totals.averageDowntime).toFixed(1))
        : 0,
      totalEvents: Number(totals.totalEvents),
      highestHall: highestHall || null,
      highestMachine: highestMachine || null,
      highestReason: highestReason || null,
    });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ message: "Failed to load loss time summary" });
  }
};

// GET /api/loss-time/hall-wise
exports.getHallWiseLoss = async (req, res) => {
  try {
    const { where, params } = buildFilterClause(req.query);
    const [rows] = await pool.query(
      `SELECT pe.hall AS hall, SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       ${where}
       GROUP BY pe.hall
       ORDER BY lossMinutes DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("getHallWiseLoss error:", err);
    res.status(500).json({ message: "Failed to load hall wise loss" });
  }
};

// GET /api/loss-time/reason-wise
exports.getReasonWiseLoss = async (req, res) => {
  try {
    const { where, params } = buildFilterClause(req.query);
    const [rows] = await pool.query(
      `SELECT lr.reason_name AS reason, SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       JOIN loss_reasons lr ON lr.id = pe.reason_id
       ${where}
       GROUP BY lr.reason_name
       ORDER BY lossMinutes DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("getReasonWiseLoss error:", err);
    res.status(500).json({ message: "Failed to load reason wise loss" });
  }
};

// GET /api/loss-time/heatmap
exports.getHeatMapData = async (req, res) => {
  try {
    const { where, params } = buildFilterClause(req.query);
    const [rows] = await pool.query(
      `SELECT m.machine_name AS machine, HOUR(pe.start_time) AS hour,
              SUM(pe.loss_minutes) AS lossMinutes
       FROM production_entries pe
       JOIN machines m ON m.id = pe.machine_id
       ${where} AND pe.start_time IS NOT NULL
       GROUP BY m.machine_name, HOUR(pe.start_time)`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("getHeatMapData error:", err);
    res.status(500).json({ message: "Failed to load heat map data" });
  }
};

// GET /api/loss-time/hourly-totals
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

// GET /api/loss-time/recent-events
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
       ORDER BY pe.entry_date DESC, pe.start_time DESC
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
exports.getFilterOptions = async (req, res) => {
  try {
    const [halls] = await pool.query(
      `SELECT DISTINCT hall FROM production_entries WHERE hall IS NOT NULL ORDER BY hall`
    );
    const [shifts] = await pool.query(
      `SELECT DISTINCT shift FROM production_entries WHERE shift IS NOT NULL ORDER BY shift`
    );
    const [reasons] = await pool.query(
      `SELECT id, reason_name AS name FROM loss_reasons WHERE status = 'Active' ORDER BY reason_name`
    );

    res.json({
      halls: halls.map((r) => r.hall),
      shifts: shifts.map((r) => r.shift),
      reasons,
    });
  } catch (err) {
    console.error("getFilterOptions error:", err);
    res.status(500).json({ message: "Failed to load filter options" });
  }
};