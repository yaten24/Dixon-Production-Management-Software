// backend/controllers/activityLogController.js
const pool = require("../config/db");

const ALLOWED_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "VIEW",
  "LOGIN",
  "LOGOUT",
  "EXPORT",
  "IMPORT",
];

const ALLOWED_SORT_COLUMNS = [
  "created_at",
  "id",
  "module",
  "action",
  "user_id",
];

/**
 * GET /api/activity-logs
 * Query params supported:
 *   user_id      -> exact match
 *   module       -> exact match (e.g. "Orders", "Inventory")
 *   action       -> single action OR comma separated list e.g. action=CREATE,DELETE
 *   record_id    -> exact match
 *   search       -> partial match on description / ip_address / device_info
 *   date_from    -> created_at >= (YYYY-MM-DD or full datetime)
 *   date_to      -> created_at <= (YYYY-MM-DD or full datetime)
 *   sort_by      -> created_at | id | module | action | user_id (default created_at)
 *   sort_order   -> asc | desc (default desc)
 *   page         -> default 1
 *   limit        -> default 25, max 200
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const {
      user_id,
      module,
      action,
      record_id,
      search,
      date_from,
      date_to,
      sort_by = "created_at",
      sort_order = "desc",
      page = 1,
      limit = 25,
    } = req.query;

    const where = [];
    const params = [];

    if (user_id) {
      where.push("al.user_id = ?");
      params.push(user_id);
    }

    if (module) {
      where.push("al.module = ?");
      params.push(module);
    }

    if (action) {
      const actions = action
        .split(",")
        .map((a) => a.trim().toUpperCase())
        .filter((a) => ALLOWED_ACTIONS.includes(a));
      if (actions.length) {
        where.push(`al.action IN (${actions.map(() => "?").join(",")})`);
        params.push(...actions);
      }
    }

    if (record_id) {
      where.push("al.record_id = ?");
      params.push(record_id);
    }

    if (search) {
      where.push(
        "(al.description LIKE ? OR al.ip_address LIKE ? OR al.device_info LIKE ?)",
      );
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (date_from) {
      where.push("al.created_at >= ?");
      params.push(
        date_from.length === 10 ? `${date_from} 00:00:00` : date_from,
      );
    }

    if (date_to) {
      where.push("al.created_at <= ?");
      params.push(date_to.length === 10 ? `${date_to} 23:59:59` : date_to);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const safeSortBy = ALLOWED_SORT_COLUMNS.includes(sort_by)
      ? sort_by
      : "created_at";
    const safeSortOrder =
      String(sort_order).toLowerCase() === "asc" ? "ASC" : "DESC";

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 200);
    const offset = (pageNum - 1) * limitNum;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM activity_logs al ${whereClause}`,
      params,
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT
         al.id, al.user_id, u.name AS user_name, u.email AS user_email,
         al.module, al.action, al.record_id, al.description,
         al.ip_address, al.device_info, al.created_at
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereClause}
       ORDER BY al.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset],
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("getActivityLogs error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch activity logs" });
  }
};

/** GET /api/activity-logs/:id */
exports.getActivityLogById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT al.*, u.name AS user_name, u.email AS user_email
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.id = ?`,
      [req.params.id],
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getActivityLogById error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch activity log" });
  }
};

/** GET /api/activity-logs/meta/modules  -> distinct module list for filter dropdown */
exports.getDistinctModules = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT module FROM activity_logs ORDER BY module ASC",
    );
    res.json({ success: true, data: rows.map((r) => r.module) });
  } catch (err) {
    console.error("getDistinctModules error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch modules" });
  }
};

/** POST /api/activity-logs -> create a log entry (call this from other modules) */
exports.createActivityLog = async (req, res) => {
  try {
    const {
      user_id,
      module,
      action,
      record_id = null,
      description = null,
      ip_address = null,
      device_info = null,
    } = req.body;

    if (!user_id || !module || !action) {
      return res
        .status(400)
        .json({
          success: false,
          message: "user_id, module and action are required",
        });
    }
    if (!ALLOWED_ACTIONS.includes(action)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `action must be one of ${ALLOWED_ACTIONS.join(", ")}`,
        });
    }

    const [result] = await pool.query(
      `INSERT INTO activity_logs
        (user_id, module, action, record_id, description, ip_address, device_info)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        module,
        action,
        record_id,
        description,
        ip_address,
        device_info,
      ],
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    console.error("createActivityLog error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create activity log" });
  }
};
