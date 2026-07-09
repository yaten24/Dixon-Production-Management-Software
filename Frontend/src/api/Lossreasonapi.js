import api from "./axios";

// ==========================================
// Loss Reason API
// Matches: /api/loss-reasons (adjust base path if different)
// ==========================================

const BASE = "/loss-reasons";

export const getAllLossReasons = async () => {
  const res = await api.get(BASE);
  return res.data;
};

export const getLossReasonById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createLossReason = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateLossReason = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const updateLossReasonStatus = async (id, status) => {
  const res = await api.patch(`${BASE}/${id}/status`, { status });
  return res.data;
};

export const deleteLossReason = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};
