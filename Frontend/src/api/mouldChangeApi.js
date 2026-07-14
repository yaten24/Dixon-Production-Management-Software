import api from "./axios";

export const createMouldChange = (payload) =>
  api.post("/mould-change", payload).then((r) => r.data);

export const updateMouldChange = (id, payload) =>
  api.put(`/mould-change/${id}`, payload).then((r) => r.data);

export const deleteMouldChange = (id) =>
  api.delete(`/mould-change/${id}`).then((r) => r.data);

export const getMouldChangesByPlan = (planId) =>
  api.get(`/mould-change/plan/${planId}`).then((r) => r.data);
