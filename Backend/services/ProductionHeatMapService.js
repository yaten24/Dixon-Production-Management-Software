// backend/services/productionHeatmapService.js
const pool = require("../config/db");
const { getHallCodeFromId } = require("../config/halls");
const { buildHourSlots, hasHourStarted } = require("../config/shiftHours");

function todayISO() {
  return new Date().toISOString().slice(0, 10);
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
    return {
      hall: hallCode,
      hallId: Number(hallId),
      date: entryDate,
      generatedAt: new Date().toISOString(),
      machines: [],
    };
  }

  const machineIds = machines.map((m) => m.id);

  const [entries] = await pool.query(
    `SELECT machine_id, time_slot,
            SUM(target_qty) AS target_qty,
            SUM(actual_qty) AS actual_qty,
            SUM(good_qty)   AS good_qty,
            SUM(reject_qty) AS reject_qty
       FROM production_entries
      WHERE hall = ? AND entry_date = ? AND machine_id IN (?)
      GROUP BY machine_id, time_slot`,
    [hallCode, entryDate, machineIds]
  );

  const entryMap = new Map();
  for (const row of entries) {
    entryMap.set(`${row.machine_id}__${row.time_slot}`, row);
  }

  const machineRows = machines.map((m) => {
    let sumTarget = 0;
    let sumAchieved = 0;

    const hourly = hourSlots.map((slot) => {
      const started = hasHourStarted(slot.hour, currentHour);
      const row = entryMap.get(`${m.id}__${slot.timeSlot}`);

      if (!started) {
        return { hour: slot.hour, shift: slot.shift, target: null, achieved: null };
      }
      if (!row) {
        // Hour has started but no entry logged yet for this machine.
        return { hour: slot.hour, shift: slot.shift, target: 0, achieved: 0 };
      }

      const target = Number(row.target_qty) || 0;
      const achieved = Number(row.actual_qty) || 0;
      sumTarget += target;
      sumAchieved += achieved;

      return { hour: slot.hour, shift: slot.shift, target, achieved };
    });

    const efficiency = sumTarget > 0 ? Math.round((sumAchieved / sumTarget) * 1000) / 10 : null;

    return {
      machineId: m.id,
      machineCode: m.machine_code,
      machineName: m.machine_name,
      status: m.status,
      hourly,
      summary: { target: sumTarget, achieved: sumAchieved, efficiency },
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