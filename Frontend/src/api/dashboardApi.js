import api from "./axios";

// ==========================================================
// GET /api/dashboard/overview
// params: { date?: "YYYY-MM-DD", hall?: "C-8" }
// Uses axiosClient (already configured with credentials: true /
// withCredentials for the httpOnly cookie), so no manual fetch needed.
// ==========================================================
export const getDashboardOverview = (params = {}) => {
  return api
    .get("/dashboard/overview", { params })
    .then((res) => res.data);
};

// ==========================================================
// GET /api/dashboard/halls
// params: { date?: "YYYY-MM-DD" }
// ==========================================================
export const getHallWiseOverview = (params = {}) => {
  return api
    .get("/dashboard/halls", { params })
    .then((res) => res.data);
};