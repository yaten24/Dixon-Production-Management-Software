// backend/config/halls.js
// Keep this in sync with frontend/config/hallMapping.js — same ids, same strings.
// These strings must match the `hall` column values in `machines` / `production_entries`.

const HALL_ID_TO_CODE = {
  1: "Hall 1",
  2: "Hall 2",
  3: "Hall 3",
  4: "Hall 4",
  5: "C8",
};

function getHallCodeFromId(hallId) {
  return HALL_ID_TO_CODE[Number(hallId)] || null;
}

module.exports = { HALL_ID_TO_CODE, getHallCodeFromId };