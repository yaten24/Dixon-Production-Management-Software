import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const BASE = "/production-entries";

// GET /production-entries
export const getAllProductionEntries = async () => {
  const res = await api.get(BASE);
  return res.data;
};

// GET /production-entries/:id
export const getProductionEntryById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// POST /production-entries
export const createProductionEntry = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

// PUT /production-entries/:id
export const updateProductionEntry = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

// DELETE /production-entries/:id
export const deleteProductionEntry = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export default api;
