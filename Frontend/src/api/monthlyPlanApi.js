import api from "./partApi"; // reuse the same shared axios instance (withCredentials + base URL already set)

// ---- Plan number ----

// GET /monthly-plans/next-number?month=&year= -> { success, planNumber }
export const generatePlanNumber = (month, year) =>
  api
    .get("/monthly-plans/next-number", { params: { month, year } })
    .then((res) => res.data);

// ---- Header ----

// POST /monthly-plans/full -> { success, monthlyPlanId }
export const createFullMonthlyPlan = (payload) =>
  api.post("/monthly-plans/full", payload).then((res) => res.data);

// POST /monthly-plans -> { success, monthlyPlanId }
export const createMonthlyPlanHeader = (payload) =>
  api.post("/monthly-plans", payload).then((res) => res.data);

// GET /monthly-plans?month=&year=&hall=&status= -> { success, data: [...] }
export const listMonthlyPlans = (filters = {}) =>
  api.get("/monthly-plans", { params: filters }).then((res) => res.data);

// GET /monthly-plans/:id -> { success, data: {...} }
export const getMonthlyPlan = (id) =>
  api.get(`/monthly-plans/${id}`).then((res) => res.data);

// DELETE /monthly-plans/:id -> { success }
export const deleteMonthlyPlan = (id) =>
  api.delete(`/monthly-plans/${id}`).then((res) => res.data);

// ---- Details ----

// GET /monthly-plans/:id/details -> { success, data: [...] }
export const getMonthlyPlanDetails = (id) =>
  api.get(`/monthly-plans/${id}/details`).then((res) => res.data);

// POST /monthly-plans/:id/details -> { success, monthlyDetailId }
export const addMonthlyPlanDetail = (id, payload) =>
  api.post(`/monthly-plans/${id}/details`, payload).then((res) => res.data);

// PUT /monthly-plans/:id/details/:detailId -> { success }
export const updateMonthlyPlanDetail = (id, detailId, payload) =>
  api.put(`/monthly-plans/${id}/details/${detailId}`, payload).then((res) => res.data);

// DELETE /monthly-plans/:id/details/:detailId -> { success }
export const deleteMonthlyPlanDetail = (id, detailId) =>
  api.delete(`/monthly-plans/${id}/details/${detailId}`).then((res) => res.data);