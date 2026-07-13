import axios from "axios";

// NOTE: if you already have a shared axios instance (the one AuthContext
// uses, with withCredentials + httpOnly cookie handling baked in), import
// and use THAT instead of creating a new one here — reusing it avoids
// repeating the "hardcoded localhost URL" bug you fixed earlier.
// Set VITE_API_BASE_URL in your .env for prod builds.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// GET /parts?page=&limit=&search=&category=&customer=&source=&status=
// -> { success, count, total, page, limit, totalPages, data }
// filters = { search, category, customer, source, status }
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

export const deletePart = (id) =>
  api.delete(`/parts/${id}`).then((res) => res.data);

export default api;
