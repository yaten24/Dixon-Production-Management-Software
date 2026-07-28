// backend/services/productionHeatmapService.js
const pool = require("../config/db");
const { getHallCodeFromId } = require("../config/halls");
const { buildHourSlots, hasHourStarted } = require("../config/shiftHours");

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Pull the starting hour out of a time_slot string regardless of exact
// formatting — handles "08:00-09:00", "8:00-9:00", "08:00:00-09:00:00", etc.
// Returns null if nothing parseable is found.
function parseStartHour(timeSlot) {
  if (!timeSlot) return null;
  const match = String(timeSlot).match(/(\d{1,2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  return Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : null;
}

async function getHourlyHeatmap({ hallId, date }) {
  const hallCode = getHallCodeFromId(hallId);
  if (!hallCode) {
    const err = new Error(`Unknown hall id: ${hallId}`);
    err.status = 404;
    throw err;
  }

  const entryDate = date || todayISO();
  const hourSlots = buildHourSlots();
  const currentHour = new Date().getHours();

  const [machines] = await pool.query(
    `SELECT id, machine_code, machine_name, status
       FROM machines
      WHERE hall = ?
      ORDER BY machine_code ASC`,
    [hallCode]
  );

  if (machines.length === 0) {
    console.warn(
      `[heatmap] No machines found for hall="${hallCode}" (hallId=${hallId}). ` +
        `Check machines.hall values match HALL_ID_TO_CODE in config/halls.js.`
    );
    return {
      hall: hallCode,
      hallId: Number(hallId),
      date: entryDate,
      generatedAt: new Date().toISOString(),
      machines: [],
    };
  }

  const machineIds = machines.map((m) => m.id);

  // NOTE: matching hall with TRIM(LOWER(...)) on both sides guards against
  // whitespace/casing mismatches between machines.hall and
  // production_entries.hall coming from different insert code paths.
  const [entries] = await pool.query(
    `SELECT machine_id, time_slot,
            SUM(target_qty) AS target_qty,
            SUM(actual_qty) AS actual_qty,
            SUM(good_qty)   AS good_qty,
            SUM(reject_qty) AS reject_qty
       FROM production_entries
      WHERE TRIM(LOWER(hall)) = TRIM(LOWER(?))
        AND entry_date = ?
        AND machine_id IN (?)
      GROUP BY machine_id, time_slot`,
    [hallCode, entryDate, machineIds]
  );

  // ---- DIAGNOSTICS: only fires when nothing matched, so it won't spam
  // logs once things are working. Tells you exactly which layer is empty. ----
  if (entries.length === 0) {
    console.warn(
      `[heatmap] 0 production_entries rows for hall="${hallCode}", ` +
        `entry_date="${entryDate}", machineIds=[${machineIds.join(",")}].`
    );
    try {
      const [anyForDate] = await pool.query(
        `SELECT hall, entry_date, time_slot, machine_id
           FROM production_entries
          WHERE entry_date = ?
          LIMIT 5`,
        [entryDate]
      );
      console.warn(
        `[heatmap] Sample rows for entry_date="${entryDate}" (any hall/machine):`,
        JSON.stringify(anyForDate)
      );

      const [anyForHall] = await pool.query(
        `SELECT hall, entry_date, time_slot, machine_id
           FROM production_entries
          WHERE hall = ?
          ORDER BY id DESC
          LIMIT 5`,
        [hallCode]
      );
      console.warn(
        `[heatmap] Sample rows for hall="${hallCode}" (any date):`,
        JSON.stringify(anyForHall)
      );
    } catch (diagErr) {
      console.warn("[heatmap] diagnostic query failed:", diagErr.message);
    }
  }

  // Build lookup keyed by machine_id + PARSED HOUR (not the raw time_slot
  // string) so formatting differences between insert code and this service
  // can't cause a silent miss.
  const entryMap = new Map();
  for (const row of entries) {
    const hour = parseStartHour(row.time_slot);
    if (hour === null) {
      console.warn(`[heatmap] Could not parse hour from time_slot="${row.time_slot}" (machine_id=${row.machine_id})`);
      continue;
    }
    entryMap.set(`${row.machine_id}__${hour}`, row);
  }

  const machineRows = machines.map((m) => {
    let sumTarget = 0;
    let sumAchieved = 0;
    let sumReject = 0;

    const hourly = hourSlots.map((slot) => {
      const row = entryMap.get(`${m.id}__${slot.hour}`);

      // Real data always wins — never let hasHourStarted() hide it.
      if (row) {
        const target = Number(row.target_qty) || 0;
        const achieved = Number(row.actual_qty) || 0;
        const reject = Number(row.reject_qty) || 0;
        sumTarget += target;
        sumAchieved += achieved;
        sumReject += reject;
        return { hour: slot.hour, shift: slot.shift, target, achieved, reject };
      }

      const started = hasHourStarted(slot.hour, currentHour);
      if (!started) {
        return { hour: slot.hour, shift: slot.shift, target: null, achieved: null, reject: null };
      }
      return { hour: slot.hour, shift: slot.shift, target: 0, achieved: 0, reject: 0 };
    });

    const efficiency = sumTarget > 0 ? Math.round((sumAchieved / sumTarget) * 1000) / 10 : null;
    const rejectRate = sumAchieved > 0 ? Math.round((sumReject / sumAchieved) * 1000) / 10 : null;

    return {
      machineId: m.id,
      machineCode: m.machine_code,
      machineName: m.machine_name,
      status: m.status,
      hourly,
      summary: { target: sumTarget, achieved: sumAchieved, reject: sumReject, efficiency, rejectRate },
    };
  });

  return {
    hall: hallCode,
    hallId: Number(hallId),
    date: entryDate,
    generatedAt: new Date().toISOString(),
    machines: machineRows,
  };
}

module.exports = { getHourlyHeatmap };