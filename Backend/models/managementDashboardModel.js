// backend/models/dashboardModel.js
const pool = require("../config/db");

const dashboardModel = {
  async getDayTarget(hall) {
    const params = [];
    let where = "WHERE entry_date = CURDATE()";
    if (hall) { where += " AND hall = ?"; params.push(hall); }
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(target_qty),0) AS target,
              COALESCE(SUM(actual_qty),0) AS actual,
              COALESCE(SUM(good_qty),0) AS good,
              COALESCE(SUM(reject_qty),0) AS reject
       FROM production_entries ${where}`,
      params
    );
    return rows[0];
  },

  async getShiftData(hall) {
    const params = [];
    let where = "WHERE entry_date = CURDATE()";
    if (hall) { where += " AND hall = ?"; params.push(hall); }
    const [rows] = await pool.query(
      `SELECT shift AS label,
              COALESCE(SUM(target_qty),0) AS target,
              COALESCE(SUM(actual_qty),0) AS actual
       FROM production_entries ${where}
       GROUP BY shift ORDER BY shift`,
      params
    );
    return rows.map(r => ({ label: `Shift ${r.label}`, target: Number(r.target), actual: Number(r.actual) }));
  },

  async getLossTime(hall) {
    const params = [];
    let where = "pe.entry_date = CURDATE()";
    if (hall) { where += " AND pe.hall = ?"; params.push(hall); }
    const [today] = await pool.query(
      `SELECT COALESCE(SUM(plt.loss_minutes),0) AS lossMinutes
       FROM production_loss_times plt
       JOIN production_entries pe ON pe.id = plt.production_entry_id
       WHERE ${where}`,
      params
    );

    const rejParams = [];
    let rejWhere = "pe.entry_date = CURDATE()";
    if (hall) { rejWhere += " AND pe.hall = ?"; rejParams.push(hall); }
    const [todayReject] = await pool.query(
      `SELECT COALESCE(SUM(reject_qty),0) AS partsLost
       FROM production_entries pe WHERE ${rejWhere}`,
      rejParams
    );

    const monthParams = [];
    let monthWhere = "pe.entry_date >= DATE_FORMAT(CURDATE(),'%Y-%m-01')";
    if (hall) { monthWhere += " AND pe.hall = ?"; monthParams.push(hall); }
    const [month] = await pool.query(
      `SELECT COALESCE(SUM(plt.loss_minutes),0) AS lossMinutes
       FROM production_loss_times plt
       JOIN production_entries pe ON pe.id = plt.production_entry_id
       WHERE ${monthWhere}`,
      monthParams
    );
    const [monthReject] = await pool.query(
      `SELECT COALESCE(SUM(reject_qty),0) AS partsLost
       FROM production_entries pe WHERE ${monthWhere}`,
      monthParams
    );

    return {
      todayLossMinutes: Number(today[0].lossMinutes),
      todayPartsLost: Number(todayReject[0].partsLost),
      monthLossMinutes: Number(month[0].lossMinutes),
      monthPartsLost: Number(monthReject[0].partsLost),
    };
  },

  async getMachineStatus(hall) {
    const params = [];
    let where = "";
    if (hall) { where = "WHERE hall = ?"; params.push(hall); }
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status='Running' THEN 1 ELSE 0 END) AS active
       FROM machines ${where}`,
      params
    );
    return { total: Number(rows[0].total), active: Number(rows[0].active) };
  },

  async getUserStatus() {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS active FROM users WHERE status = 'Active'`
    );
    return { active: Number(rows[0].active), label: "Active Users" };
  },

  async getLastDay(hall) {
    const params = [];
    let where = "WHERE entry_date = CURDATE() - INTERVAL 1 DAY";
    if (hall) { where += " AND hall = ?"; params.push(hall); }
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(CURDATE() - INTERVAL 1 DAY, '%d %b %Y') AS dateLabel,
              COALESCE(SUM(target_qty),0) AS target,
              COALESCE(SUM(actual_qty),0) AS actual,
              COALESCE(ROUND(AVG(efficiency),0),0) AS oee
       FROM production_entries ${where}`,
      params
    );
    return rows[0];
  },

  async getCurrentMonth(hall) {
    const params = [];
    let where = "WHERE entry_date >= DATE_FORMAT(CURDATE(),'%Y-%m-01')";
    if (hall) { where += " AND hall = ?"; params.push(hall); }
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(target_qty),0) AS target,
              COALESCE(SUM(actual_qty),0) AS actual
       FROM production_entries ${where}`,
      params
    );
    return rows[0];
  },

  async getWeeklyOee(hall) {
    const params = [];
    let where = "WHERE entry_date >= CURDATE() - INTERVAL 6 DAY";
    if (hall) { where += " AND hall = ?"; params.push(hall); }
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(entry_date, '%a') AS day, entry_date,
              COALESCE(ROUND(AVG(efficiency),0),0) AS oee
       FROM production_entries ${where}
       GROUP BY entry_date ORDER BY entry_date`,
      params
    );
    return rows.map(r => ({ day: r.day, oee: Number(r.oee) }));
  },

  async getMouldChangeSummary(hall) {
    const params = [];
    let where = "WHERE (planned_date = CURDATE() OR DATE(created_at) = CURDATE())";
    if (hall) { where += " AND machine_code IN (SELECT machine_code FROM machines WHERE hall = ?)"; params.push(hall); }
    const [rows] = await pool.query(
      `SELECT
        SUM(CASE WHEN change_type='Planned' THEN 1 ELSE 0 END) AS planned,
        SUM(CASE WHEN change_type='Unplanned' THEN 1 ELSE 0 END) AS unplanned,
        SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status IN ('Planned','In Progress') THEN 1 ELSE 0 END) AS pending,
        COALESCE(ROUND(AVG(downtime_minutes),0),0) AS avgChangeTime
       FROM mould_changes ${where}`,
      params
    );
    const r = rows[0];
    return {
      planned: Number(r.planned) || 0,
      unplanned: Number(r.unplanned) || 0,
      completed: Number(r.completed) || 0,
      pending: Number(r.pending) || 0,
      avgChangeTime: Number(r.avgChangeTime) || 0,
    };
  },
};

module.exports = dashboardModel;