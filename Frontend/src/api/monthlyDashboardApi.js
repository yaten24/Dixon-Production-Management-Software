// src/api/monthlyDashboardApi.js
import api from "./axios";

// Called by useDashboardOverview() (src/hooks/useMonthelyDashboardOverview.js)
// GET /dashboard/overview?hall=&shift=&month=
export function fetchDashboardOverview({ hall, shift, month, year } = {}) {
  const params = {};
  if (hall && hall !== "All") params.hall = hall;
  if (shift && shift !== "All") params.shift = shift;
  if (month) params.month = month;
  if (year) params.year = year;

  return api.get("/monthly/dashboard/overview", { params }).then((res) => res.data);
}

export default api;