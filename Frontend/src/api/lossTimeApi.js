import api from "./axios"; // adjust this import to match your existing axios instance

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

// Full machine master list - used to guarantee the heat map always shows
// every machine, independent of whether any loss data exists for the date.
// The real endpoint responds as { success, data: [...] } with a
// `machine_name` field (e.g. "IM-13 - 775 T").
//
// NOTE: whether `response.data` below is the raw server body
// ({success, data:[...]}) or already-unwrapped depends on whether your
// `api` axios instance has a response interceptor. This handles both so
// it works either way - if your other calls in this file ever come back
// empty too, that's the same mismatch and this pattern fixes it there too.
export const getAllMachines = async () => {
  const raw = await api.get(`/machines`);
  const payload = raw?.data !== undefined ? raw.data : raw;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;

  console.error("Unexpected /machines response shape:", raw);
  return [];
};