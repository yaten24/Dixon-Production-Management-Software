import api from "./axios"; // adjust path to wherever your parts.js/api.js instance lives

export const generatePlanNumber = (month, year) =>
  api.get("/monthly-plans/next-number", { params: { month, year } }).then((res) => res.data);

export const createFullMonthlyPlan = (payload) =>
  api.post("/monthly-plans/full", payload).then((res) => res.data);

export const getMonthlyPlan = (id) =>
  api.get(`/monthly-plans/${id}`).then((res) => res.data);