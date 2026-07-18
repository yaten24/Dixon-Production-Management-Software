import api from "./axios";

const BASE = "/mould-change-dashboard";

export const getMouldChangeSummary = async (params = {}) => {
  const response = await api.get(`${BASE}/summary`, { params });
  return response.data;
};

export const getRecentMouldChanges = async (params = {}) => {
  const response = await api.get(`${BASE}/recent`, { params });
  return response.data;
};

export const getMouldChangeHeatmap = async (params = {}) => {
  const response = await api.get(`${BASE}/heatmap`, { params });
  return response.data;
};