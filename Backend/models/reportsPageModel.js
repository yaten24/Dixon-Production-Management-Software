// backend/models/reports.model.js
//
// One query function per report, matched 1:1 against the schema you
// supplied (production_entries, mould_changes, production_reject_details,
// production_loss_times, machines, operators, parts, rejection_reasons,
// loss_reasons, daily_plan_header/details, monthly_plan_header/details).
//
// Every function accepts a single `filters` object:
//   { mode: 'daily' | 'monthly', date: 'YYYY-MM-DD', month: 'YYYY-MM', hall }
// `date` drives daily mode, `month` drives monthly mode. Both are
// optional — if neither is passed, daily functions default to CURDATE().

const pool = require("../config/db");

// ---------------------------------------------------------------
// Shared filter helpers
// ---------------------------------------------------------------

// Builds a `WHERE <column> = ?` / `WHERE YEAR()/MONTH() = ?` fragment
// for a plain DATE column, depending on whether `date` or `month` was
// supplied. Falls back to "today" when neither is given.
function dateFilter(column, { date, month }) {
  if (date) return { clause: `${column} = ?`, params: [date] };
  if (month) {
    const [year, mon] = month.split("-");
    return { clause: `YEAR(${column}) = ? AND MONTH(${column}) = ?`, params: [year, mon] };
  }
  return { clause: `${column} = CURDATE()`, params: [] };
}

// Same idea, but for a column that may be a DATETIME (mould_changes has
// no single "the date" column — planned changes use planned_date,
// executed ones use actual_start_time). We coalesce both into one
// effective date before filtering.
const MC_EFFECTIVE_DATE = "COALESCE(mc.planned_date, DATE(mc.actual_start_time))";

function withHall(clause, params, hallColumn, hall) {
  if (hall && hall !== "All") {
    return { clause: `${clause} AND ${hallColumn} = ?`, params: [...params, hall] };
  }
  return { clause, params };
}

async function run(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// ---------------------------------------------------------------
// 1. Daily Production Report — raw entry-level rows for one day
// ---------------------------------------------------------------
async function dailyProductionReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);
  return run(
    `SELECT pe.production_id, pe.entry_date, pe.hall, pe.shift, pe.time_slot,
            m.machine_code, m.machine_name,
            o.operator_name, o.operator_code,
            p.part_number, p.part_name,
            pe.target_qty, pe.actual_qty, pe.good_qty, pe.reject_qty,
            pe.standard_cycle_time, pe.actual_cycle_time,
            pe.loss_minutes, pe.efficiency
     FROM production_entries pe
     JOIN machines m   ON m.id = pe.machine_id
     JOIN operators o  ON o.id = pe.operator_id
     JOIN parts p      ON p.id = pe.part_id
     WHERE ${clause}
     ORDER BY pe.hall, pe.shift, pe.time_slot`,
    params
  );
}

// ---------------------------------------------------------------
// 2. Production Summary Report — totals grouped by day (or by hall
//    when a single day is selected)
// ---------------------------------------------------------------
async function productionSummaryReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);
  const groupBy = filters.month ? "pe.entry_date" : "pe.hall";
  return run(
    `SELECT ${groupBy} AS group_key,
            SUM(pe.target_qty) AS target_qty,
            SUM(pe.actual_qty) AS actual_qty,
            SUM(pe.good_qty)   AS good_qty,
            SUM(pe.reject_qty) AS reject_qty,
            ROUND(AVG(pe.efficiency), 2) AS avg_efficiency
     FROM production_entries pe
     WHERE ${clause}
     GROUP BY ${groupBy}
     ORDER BY ${groupBy}`,
    params
  );
}

// ---------------------------------------------------------------
// 3. Rejection Report By Machine
// ---------------------------------------------------------------
async function rejectionByMachineReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);
  return run(
    `SELECT m.machine_code, m.machine_name,
            SUM(prd.reject_qty)      AS reject_qty,
            COUNT(DISTINCT prd.id)   AS reject_entries
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     JOIN machines m ON m.id = pe.machine_id
     WHERE ${clause}
     GROUP BY m.machine_code, m.machine_name
     ORDER BY reject_qty DESC`,
    params
  );
}

// ---------------------------------------------------------------
// 4. Rejection Summary Report — by reason
// ---------------------------------------------------------------
async function rejectionSummaryReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);
  return run(
    `SELECT rr.reason_code, rr.reason_name,
            SUM(prd.reject_qty) AS reject_qty
     FROM production_reject_details prd
     JOIN production_entries pe ON pe.id = prd.production_entry_id
     JOIN rejection_reasons rr  ON rr.id = prd.reject_reason_id
     WHERE ${clause}
     GROUP BY rr.reason_code, rr.reason_name
     ORDER BY reject_qty DESC`,
    params
  );
}

// ---------------------------------------------------------------
// 5. Loss Report Machine Wise
// ---------------------------------------------------------------
async function lossByMachineReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);
  return run(
    `SELECT m.machine_code, m.machine_name,
            SUM(plt.loss_minutes) AS loss_minutes,
            COUNT(DISTINCT plt.id) AS loss_entries
     FROM production_loss_times plt
     JOIN production_entries pe ON pe.id = plt.production_entry_id
     JOIN machines m ON m.id = pe.machine_id
     WHERE ${clause}
     GROUP BY m.machine_code, m.machine_name
     ORDER BY loss_minutes DESC`,
    params
  );
}

// ---------------------------------------------------------------
// 6. Loss Summary Report — by reason/category
// ---------------------------------------------------------------
async function lossSummaryReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);
  return run(
    `SELECT lr.category, lr.reason_name,
            SUM(plt.loss_minutes) AS loss_minutes
     FROM production_loss_times plt
     JOIN production_entries pe ON pe.id = plt.production_entry_id
     JOIN loss_reasons lr ON lr.id = plt.loss_reason_id
     WHERE ${clause}
     GROUP BY lr.category, lr.reason_name
     ORDER BY loss_minutes DESC`,
    params
  );
}

// ---------------------------------------------------------------
// 7. Mold Change — Machine Wise
// ---------------------------------------------------------------
async function moldChangeByMachineReport(filters) {
  const f = dateFilter(MC_EFFECTIVE_DATE, filters);
  const { clause, params } = withHall(f.clause, f.params, "m.hall", filters.hall);
  return run(
    `SELECT mc.machine_code, m.machine_name,
            COUNT(*) AS total_changes,
            SUM(mc.downtime_minutes) AS total_downtime,
            SUM(mc.change_type = 'Planned')   AS planned_count,
            SUM(mc.change_type = 'Unplanned') AS unplanned_count
     FROM mould_changes mc
     JOIN machines m ON m.machine_code = mc.machine_code
     WHERE ${clause}
     GROUP BY mc.machine_code, m.machine_name
     ORDER BY total_changes DESC`,
    params
  );
}

// ---------------------------------------------------------------
// 8. Mold Change — Shift Wise
// ---------------------------------------------------------------
async function moldChangeByShiftReport(filters) {
  const f = dateFilter(MC_EFFECTIVE_DATE, filters);
  return run(
    `SELECT mc.planned_shift AS shift,
            COUNT(*) AS total_changes,
            SUM(mc.downtime_minutes) AS total_downtime,
            ROUND(AVG(mc.downtime_minutes), 1) AS avg_downtime
     FROM mould_changes mc
     WHERE ${f.clause}
     GROUP BY mc.planned_shift`,
    f.params
  );
}

// ---------------------------------------------------------------
// 9. Mold Change Summary Report — by reason
// ---------------------------------------------------------------
async function moldChangeSummaryReport(filters) {
  const f = dateFilter(MC_EFFECTIVE_DATE, filters);
  return run(
    `SELECT COALESCE(mc.reason, 'Not specified') AS reason,
            COUNT(*) AS total_changes,
            SUM(mc.downtime_minutes) AS total_downtime,
            SUM(mc.status = 'Completed') AS completed_count
     FROM mould_changes mc
     WHERE ${f.clause}
     GROUP BY mc.reason
     ORDER BY total_changes DESC`,
    f.params
  );
}

// ---------------------------------------------------------------
// 10. Machine Performance Report
// ---------------------------------------------------------------
async function machinePerformanceReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);
  return run(
    `SELECT m.machine_code, m.machine_name,
            SUM(pe.target_qty) AS target_qty,
            SUM(pe.actual_qty) AS actual_qty,
            SUM(pe.good_qty)   AS good_qty,
            SUM(pe.reject_qty) AS reject_qty,
            SUM(pe.loss_minutes) AS loss_minutes,
            ROUND(AVG(pe.efficiency), 2) AS avg_efficiency
     FROM production_entries pe
     JOIN machines m ON m.id = pe.machine_id
     WHERE ${clause}
     GROUP BY m.machine_code, m.machine_name
     ORDER BY avg_efficiency DESC`,
    params
  );
}

// ---------------------------------------------------------------
// 11. Operator Performance Report
// ---------------------------------------------------------------
async function operatorPerformanceReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);
  return run(
    `SELECT o.operator_code, o.operator_name,
            SUM(pe.target_qty) AS target_qty,
            SUM(pe.actual_qty) AS actual_qty,
            SUM(pe.good_qty)   AS good_qty,
            SUM(pe.reject_qty) AS reject_qty,
            ROUND(AVG(pe.efficiency), 2) AS avg_efficiency
     FROM production_entries pe
     JOIN operators o ON o.id = pe.operator_id
     WHERE ${clause}
     GROUP BY o.operator_code, o.operator_name
     ORDER BY avg_efficiency DESC`,
    params
  );
}

// ---------------------------------------------------------------
// 12. Shift A / Shift B Summary Report
//     Daily mode -> breakdown by hall. Monthly mode -> breakdown by day.
// ---------------------------------------------------------------
async function shiftSummaryReport(shiftLetter, filters) {
  const f = dateFilter("pe.entry_date", filters);
  const groupBy = filters.month ? "pe.entry_date" : "pe.hall";
  const { clause, params } = withHall(
    `${f.clause} AND pe.shift = ?`,
    [...f.params, shiftLetter],
    "pe.hall",
    filters.hall
  );
  return run(
    `SELECT ${groupBy} AS group_key,
            SUM(pe.target_qty) AS target_qty,
            SUM(pe.actual_qty) AS actual_qty,
            SUM(pe.good_qty)   AS good_qty,
            SUM(pe.reject_qty) AS reject_qty,
            ROUND(AVG(pe.efficiency), 2) AS avg_efficiency
     FROM production_entries pe
     WHERE ${clause}
     GROUP BY ${groupBy}
     ORDER BY ${groupBy}`,
    params
  );
}

// ---------------------------------------------------------------
// 13. OEE Report — machine wise, shift wise & daily, in one payload
//
// NOTE: the schema doesn't store an explicit "available minutes" /
// downtime-vs-runtime master, so a textbook Availability × Performance
// × Quality OEE isn't derivable as-is. Quality and Performance are
// computed from real columns; Availability/OEE use the stored
// `efficiency` column as the closest available proxy. Swap in a real
// availability calc once shift-duration/downtime tracking is in place.
// ---------------------------------------------------------------
async function oeeReport(filters) {
  const f = dateFilter("pe.entry_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "pe.hall", filters.hall);

  const selectCommon = `
    SUM(pe.target_qty) AS target_qty,
    SUM(pe.actual_qty) AS actual_qty,
    SUM(pe.good_qty)   AS good_qty,
    ROUND(SUM(pe.actual_qty) / NULLIF(SUM(pe.target_qty), 0) * 100, 1) AS performance_pct,
    ROUND(SUM(pe.good_qty)   / NULLIF(SUM(pe.actual_qty), 0) * 100, 1) AS quality_pct,
    ROUND(AVG(pe.efficiency), 1) AS availability_pct
  `;

  const [byMachine, byShift, byDay] = await Promise.all([
    run(
      `SELECT m.machine_code, m.machine_name, ${selectCommon}
       FROM production_entries pe
       JOIN machines m ON m.id = pe.machine_id
       WHERE ${clause}
       GROUP BY m.machine_code, m.machine_name`,
      params
    ),
    run(
      `SELECT pe.shift, ${selectCommon}
       FROM production_entries pe
       WHERE ${clause}
       GROUP BY pe.shift`,
      params
    ),
    run(
      `SELECT pe.entry_date, ${selectCommon}
       FROM production_entries pe
       WHERE ${clause}
       GROUP BY pe.entry_date
       ORDER BY pe.entry_date`,
      params
    ),
  ]);

  const withOee = (rows) =>
    rows.map((r) => ({
      ...r,
      oee_pct: Math.round(
        ((r.availability_pct || 0) / 100) *
          ((r.performance_pct || 0) / 100) *
          ((r.quality_pct || 0) / 100) *
          1000
      ) / 10,
    }));

  return {
    byMachine: withOee(byMachine),
    byShift: withOee(byShift),
    byDay: withOee(byDay),
  };
}

// ---------------------------------------------------------------
// 14. Daily Production Plan Report
// ---------------------------------------------------------------
async function dailyPlanReport(filters) {
  const f = dateFilter("dph.planning_date", filters);
  const { clause, params } = withHall(f.clause, f.params, "dph.hall", filters.hall);
  return run(
    `SELECT dph.plan_number, dph.planning_date, dph.hall, dph.shift, dph.status,
            dph.total_machines, dph.planned_machines, dph.total_target_qty,
            dpd.machine_code, dpd.operator_code,
            p.part_number, p.part_name,
            dpd.target_qty, dpd.planned_cycle_time, dpd.estimated_run_hours
     FROM daily_plan_header dph
     JOIN daily_plan_details dpd ON dpd.daily_plan_id = dph.daily_plan_id
     JOIN parts p ON p.id = dpd.part_id
     WHERE ${clause}
     ORDER BY dph.hall, dph.shift, dpd.machine_code`,
    params
  );
}

// ---------------------------------------------------------------
// 15. Monthly Production Plan Report
// ---------------------------------------------------------------
async function monthlyPlanReport(filters) {
  const monthValue = filters.month || filters.date?.slice(0, 7);
  if (!monthValue) return [];
  const [year, mon] = monthValue.split("-");
  const { clause, params } = withHall(
    "mph.plan_month = ? AND mph.plan_year = ?",
    [Number(mon), Number(year)],
    "mph.hall",
    filters.hall
  );
  return run(
    `SELECT mph.plan_number, mph.plan_month, mph.plan_year, mph.hall, mph.status,
            mph.working_days, mph.total_parts, mph.total_target_qty,
            p.part_number, p.part_name,
            mpd.monthly_target_qty, mpd.completed_qty, mpd.balance_qty, mpd.priority
     FROM monthly_plan_header mph
     JOIN monthly_plan_details mpd ON mpd.monthly_plan_id = mph.monthly_plan_id
     JOIN parts p ON p.id = mpd.part_id
     WHERE ${clause}
     ORDER BY mph.hall, mpd.priority`,
    params
  );
}

module.exports = {
  dailyProductionReport,
  productionSummaryReport,
  rejectionByMachineReport,
  rejectionSummaryReport,
  lossByMachineReport,
  lossSummaryReport,
  moldChangeByMachineReport,
  moldChangeByShiftReport,
  moldChangeSummaryReport,
  machinePerformanceReport,
  operatorPerformanceReport,
  shiftSummaryReport,
  oeeReport,
  dailyPlanReport,
  monthlyPlanReport,
};