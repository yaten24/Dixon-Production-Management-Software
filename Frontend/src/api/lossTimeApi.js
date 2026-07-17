import api from "../utils/api"; // adjust this import to match your existing axios instance

const toQueryString = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const getLossSummary = async (filters) => {
  const response = await api.get(`/loss-time/summary${toQueryString(filters)}`);
  return response.data;
};

export const getHallWiseLoss = async (filters) => {
  const response = await api.get(`/loss-time/hall-wise${toQueryString(filters)}`);
  return response.data;
};

export const getReasonWiseLoss = async (filters) => {
  const response = await api.get(`/loss-time/reason-wise${toQueryString(filters)}`);
  return response.data;
};

export const getHeatMapData = async (filters) => {
  const response = await api.get(`/loss-time/heatmap${toQueryString(filters)}`);
  return response.data;
};

export const getHourlyLossTotals = async (filters) => {
  const response = await api.get(`/loss-time/hourly-totals${toQueryString(filters)}`);
  return response.data;
};

export const getRecentEvents = async (filters) => {
  const response = await api.get(`/loss-time/recent-events${toQueryString(filters)}`);
  return response.data;
};

export const getLossTimeFilters = async () => {
  const response = await api.get(`/loss-time/filters`);
  return response.data;
};