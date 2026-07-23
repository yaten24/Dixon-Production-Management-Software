// backend/utils/shiftHours.js
// Shift A: 08:00–20:00 same day. Shift B: 20:00–08:00 next day.
// `timeSlot` here is the canonical string we expect in production_entries.time_slot,
// e.g. "08:00-09:00". If your insert code writes a different format, change pad() /
// the template below to match — the frontend never needs to know this format, it
// only reads `hour` and `shift` off the API response.

const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];

const pad = (n) => String(n).padStart(2, "0");

function buildHourSlots() {
  return ORDERED_HOURS.map((hour) => {
    const nextHour = (hour + 1) % 24;
    return {
      hour,
      shift: SHIFT_A_HOURS.includes(hour) ? "A" : "B",
      timeSlot: `${pad(hour)}:00-${pad(nextHour)}:00`,
    };
  });
}

// Has this hour's shift slot already started, relative to `currentHour`?
// Shift B wraps past midnight, so hours 0-7 belong to "yesterday's" shift day
// until the clock actually reaches them again.
function hasHourStarted(slotHour, currentHour) {
  if (slotHour >= 8) return currentHour >= slotHour;
  if (currentHour < 8) return currentHour >= slotHour;
  return false;
}

module.exports = { SHIFT_A_HOURS, SHIFT_B_HOURS, ORDERED_HOURS, buildHourSlots, hasHourStarted };