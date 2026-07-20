import api from "./partApi";

export const generateDailyPlanNumber = (date, hall, shift) =>
  api.get("/daily-plans/next-number", { params: { date, hall, shift } }).then((res) => res.data);

export const createFullDailyPlan = (payload) =>
  api.post("/daily-plans/full", payload).then((res) => res.data);

export const listDailyPlans = (filters = {}) =>
  api.get("/daily-plans", { params: filters }).then((res) => res.data);

export const getDailyPlan = (id) =>
  api.get(`/daily-plans/${id}`).then((res) => res.data);

export const deleteDailyPlan = (id) =>
  api.delete(`/daily-plans/${id}`).then((res) => res.data);

export const getDailyPlanDetails = (id) =>
  api.get(`/daily-plans/${id}/details`).then((res) => res.data);

export const addDailyPlanDetail = (id, payload) =>
  api.post(`/daily-plans/${id}/details`, payload).then((res) => res.data);

export const updateDailyPlanDetail = (id, detailId, payload) =>
  api.put(`/daily-plans/${id}/details/${detailId}`, payload).then((res) => res.data);

export const deleteDailyPlanDetail = (id, detailId) =>
  api.delete(`/daily-plans/${id}/details/${detailId}`).then((res) => res.data);

export const updateDailyPlanStatus = (id, status) =>
  api.patch(`/daily-plans/${id}/status`, { status }).then((res) => res.data);