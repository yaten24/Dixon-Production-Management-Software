import api from "./partApi";

export const listMouldChanges = (filters = {}) =>
  api.get("/mould-changes", { params: filters }).then((res) => res.data);

export const getMouldChange = (id) =>
  api.get(`/mould-changes/${id}`).then((res) => res.data);

export const createMouldChange = (payload) =>
  api.post("/mould-changes", payload).then((res) => res.data);

export const updateMouldChange = (id, payload) =>
  api.put(`/mould-changes/${id}`, payload).then((res) => res.data);

export const deleteMouldChange = (id) =>
  api.delete(`/mould-changes/${id}`).then((res) => res.data);

export const startMouldChange = (id) =>
  api.patch(`/mould-changes/${id}/start`).then((res) => res.data);

export const completeMouldChange = (id, remarks) =>
  api
    .patch(`/mould-changes/${id}/complete`, { remarks })
    .then((res) => res.data);

export const cancelMouldChange = (id, remarks) =>
  api.patch(`/mould-changes/${id}/cancel`, { remarks }).then((res) => res.data);
