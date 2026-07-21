export const hours = ["08", "09", "10", "11", "12", "13", "14", "15", "16"];

export const halls = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C8"];

// Keys now match `halls` exactly (space, not hyphen) — accent lookups
// were silently failing before and falling back to navy for every card.
export const HALL_ACCENT = {
  "Hall 1": "#2563EB",
  "Hall 2": "#16A34A",
  "Hall 3": "#F97316",
  "Hall 4": "#8B5CF6",
  "C8": "#0EA5E9",
};

// Single source of truth for hall -> route, encoded so hall names with
// spaces survive as URL path segments.
export const hallRouteConfig = [
  ...halls.map((hall) => ({ hall, route: `/production/halls/${encodeURIComponent(hall)}` })),
  { hall: "All", route: "/production/halls/All" },
];