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
//
// NOTE: this is only used as a FALLBACK for slots that have no DB row yet
// (see productionHeatmapService.js — real entries always win, regardless
// of what this returns). It just decides whether an empty slot should be
// shown as "future" (null) or "started but no entry" (0).
//
// Shift B wraps past midnight:
//  - hours 20-23 belong to "today's" evening — started once currentHour
//    reaches them, OR once we're past midnight into the early morning (0-7).
//  - hours 0-7 belong to the shift that began the previous evening — they're
//    "started" for as long as we're still within that overnight window
//    (currentHour < 8) and we've reached/passed that hour, i.e. this is
//    still an in-progress overnight shift.
function hasHourStarted(slotHour, currentHour) {
  if (slotHour >= 8) {
    // Shift A (8-19) or Shift B evening (20-23):
    // started if we've reached that hour today, or if it's already
    // past midnight (meaning that evening fully happened).
    return currentHour >= slotHour || currentHour < 8;
  }
  // Shift B early-morning hours (0-7): only "started" while we're still
  // inside that overnight window and have reached the hour.
  return currentHour < 8 && currentHour >= slotHour;
}

module.exports = { SHIFT_A_HOURS, SHIFT_B_HOURS, ORDERED_HOURS, buildHourSlots, hasHourStarted };