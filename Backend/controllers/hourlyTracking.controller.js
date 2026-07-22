const pool = require("../config/db");

// ==========================================================
// Hourly Target vs Achieved, per machine, for a given daily plan.
// Builds a fixed hour-slot grid (matches the plan's shift) and fills
// in whatever production_entries exist so far — future/未-entered
// hours come back with achieved: null (rendered blank, not red/green).
// ==========================================================
const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];

exports.getHourlyMachineTracking = async (req, res) => {
  const { id } = req.params; // daily_plan_id
  try {
    const [header] = await pool.query(
      `SELECT shift, planning_date FROM daily_plan_header WHERE daily_plan_id = ?`,
      [id],
    );
    if (!header.length)
      return res
        .status(404)
        .json({ success: false, message: "Daily plan not found" });

    const hours = header[0].shift === "A" ? SHIFT_A_HOURS : SHIFT_B_HOURS;

    const [machineRows] = await pool.query(
      `SELECT dd.daily_detail_id, dd.machine_id, dd.target_qty, m.machine_code, m.machine_name, m.tonnage
       FROM daily_plan_details dd
       JOIN machines m ON m.id = dd.machine_id
       WHERE dd.daily_plan_id = ?
       ORDER BY m.machine_code ASC`,
      [id],
    );

    const [entries] = await pool.query(
      `SELECT machine_id, HOUR(entry_hour) AS hour, SUM(actual_qty) AS achieved
       FROM production_entries
       WHERE daily_plan_id = ?
       GROUP BY machine_id, HOUR(entry_hour)`,
      [id],
    );

    const achievedMap = {}; // machine_id -> { hour: achieved }
    entries.forEach((e) => {
      if (!achievedMap[e.machine_id]) achievedMap[e.machine_id] = {};
      achievedMap[e.machine_id][e.hour] = Number(e.achieved);
    });

    // Even hourly split of the machine's total daily target — matches
    // the flat per-hour "Tgt" column in the reference sheet.
    const machines = machineRows.map((m) => {
      const perHourTarget = Math.round(m.target_qty / hours.length);
      return {
        machineId: m.machine_id,
        label: m.tonnage ? `${m.tonnage} T` : m.machine_code,
        machineCode: m.machine_code,
        hourly: hours.map((h) => ({
          hour: h,
          target: perHourTarget,
          achieved: achievedMap[m.machine_id]?.[h] ?? null,
        })),
      };
    });

    res.json({ success: true, data: { hours, machines } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch hourly tracking" });
  }
};
