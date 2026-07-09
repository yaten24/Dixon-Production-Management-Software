import api from "./axios";

// ==========================================
// Production Entry API
// Matches: /api/production-entries (adjust base path if different)
// ==========================================

const BASE = "/production-entries";

export const getAllProductionEntries = async () => {
  const res = await api.get(BASE);
  return res.data;
};

export const getProductionEntryById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createProductionEntry = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateProductionEntry = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteProductionEntry = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};
