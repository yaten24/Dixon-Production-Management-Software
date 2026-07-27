import api from "./axios";

export const getAllParts = (page = 1, limit = 100, filters = {}) =>
  api
    .get("/parts", { params: { page, limit, ...filters } })
    .then((res) => res.data);

// GET /parts/filter-options -> { success, data: { categories, customers, sources } }
export const getFilterOptions = () =>
  api.get("/parts/filter-options").then((res) => res.data);

export const addPartQuick = (payload) =>
  api.post("/parts/quick-add", payload).then((res) => res.data);

export const getPartById = (id) =>
  api.get(`/parts/${id}`).then((res) => res.data);

export const searchParts = (keyword) =>
  api.get("/parts/search", { params: { keyword } }).then((res) => res.data);

export const addPart = (payload) =>
  api.post("/parts", payload).then((res) => res.data);

export const updatePart = (id, payload) =>
  api.put(`/parts/${id}`, payload).then((res) => res.data);

export const updateActualCycleTime = (id, actual_cycle_time) =>
  api
    .put(`/parts/${id}/actual-cycle-time`, { actual_cycle_time })
    .then((res) => res.data);

export const deletePart = (id) =>
  api.delete(`/parts/${id}`).then((res) => res.data);

export default api;
