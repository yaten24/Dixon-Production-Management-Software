// ==========================================================
// URL uses numeric ids (/production/hall/1 .. /production/hall/5)
// but the DB stores hall as free-text strings — 4 of them follow
// "Hall N" and the 5th is "C-8" (legacy naming, kept as-is since
// that's what's already in the database).
//
// IMPORTANT: these strings must match EXACTLY what's stored in
// production_entries.hall / machines.hall (case + spacing sensitive).
// ==========================================================
export const HALL_ID_TO_CODE = {
  1: "Hall 1",
  2: "Hall 2",
  3: "Hall 3",
  4: "Hall 4",
  5: "C-8",
};

// Reverse lookup — used by HallCards to build the route from a hall name
export const HALL_CODE_TO_ID = Object.fromEntries(
  Object.entries(HALL_ID_TO_CODE).map(([id, code]) => [code, id]),
);

export const getHallCodeFromId = (hallId) => HALL_ID_TO_CODE[hallId] || null;

// ==========================================================
// Static per-hall config for the Hall Cards grid (dashboard home page).
// route is derived from HALL_CODE_TO_ID so it always matches the
// numeric URL scheme (/production/hall/:hallId) used by HallDashboard.
// ==========================================================
export const hallRouteConfig = [
  { hall: "Hall 1", route: `/production/halls/${HALL_CODE_TO_ID["Hall 1"]}` },
  { hall: "Hall 2", route: `/production/halls/${HALL_CODE_TO_ID["Hall 2"]}` },
  { hall: "Hall 3", route: `/production/halls/${HALL_CODE_TO_ID["Hall 3"]}` },
  { hall: "Hall 4", route: `/production/halls/${HALL_CODE_TO_ID["Hall 4"]}` },
  { hall: "C-8", route: `/production/halls/${HALL_CODE_TO_ID["C-8"]}` },
];
