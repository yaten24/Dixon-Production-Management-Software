import api from "./axios";

// ==========================================
// Rejection Reason API
// Matches: /api/rejection-reasons (adjust base path if different)
// ==========================================

const BASE = "/rejection-reasons";

export const getAllRejectionReasons = async () => {
  const res = await api.get(BASE);
  return res.data;
};

export const getRejectionReasonById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createRejectionReason = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateRejectionReason = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const updateRejectionReasonStatus = async (id, status) => {
  const res = await api.patch(`${BASE}/${id}/status`, { status });
  return res.data;
};

export const deleteRejectionReason = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};
