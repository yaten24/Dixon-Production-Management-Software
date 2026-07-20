import api from "./partApi"; // reuse the same shared axios instance (withCredentials + base URL already set)

// GET /monthly-plans/next-number?month=&year= -> { success, planNumber }
export const generatePlanNumber = (month, year) =>
  api
    .get("/monthly-plans/next-number", { params: { month, year } })
    .then((res) => res.data);

// POST /monthly-plans/full -> { success, monthlyPlanId }
export const createFullMonthlyPlan = (payload) =>
  api.post("/monthly-plans/full", payload).then((res) => res.data);

export const getMonthlyPlan = (id) =>
  api.get(`/monthly-plans/${id}`).then((res) => res.data);

export const getMonthlyPlanDetails = (id) =>
  api.get(`/monthly-plans/${id}/details`).then((res) => res.data);