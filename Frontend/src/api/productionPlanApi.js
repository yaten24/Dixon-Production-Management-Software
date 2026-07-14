import api from "./axios";

export const checkPlan = (date, hall, shift) =>
  api.get("/production-plan/check", { params: { date, hall, shift } }).then((r) => r.data);

export const createPlan = (payload) =>
  api.post("/production-plan", payload).then((r) => r.data);

export const getPlan = (planId) =>
  api.get(`/production-plan/${planId}`).then((r) => r.data);

export const updateDetail = (detailId, payload) =>
  api.put(`/production-plan/detail/${detailId}`, payload).then((r) => r.data);

export const publishPlan = (planId) =>
  api.put(`/production-plan/${planId}/publish`).then((r) => r.data);