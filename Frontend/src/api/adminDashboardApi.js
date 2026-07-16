// frontend/src/services/dashboardApi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * Fetch production stats (top cards) for a given date/hall/shift.
 * @param {{date?: string, hall?: string, shift?: string}} params
 */
export const fetchProductionStats = async (params = {}) => {
  const response = await api.get("/admin/dashboard/production-stats", { params });
  return response.data; // { success, date, data: {...} }
};

/**
 * Fetch shift-wise target summary (Shift A, Shift B, Overall) from the
 * production plan tables.
 * @param {{date?: string, hall?: string}} params
 */
export const fetchTargetSummary = async (params = {}) => {
  const response = await api.get("/admin/dashboard/target-summary", { params });
  return response.data; // { success, date, hall, data: { shiftA, shiftB, overall } }
};

/**
 * Fetch hall-wise Target vs Actual vs Rejection for the ProductionChart.
 * @param {{date?: string, shift?: string}} params
 */
export const fetchProductionOverview = async (params = {}) => {
  const response = await api.get("/admin/dashboard/production-overview", { params });
  return response.data; // { success, date, data: [{ hall, target, actual, rejection }] }
};

/**
 * Fetch reason-wise rejection breakdown for the RejectionAnalysis donut.
 * @param {{date?: string, hall?: string, shift?: string}} params
 */
export const fetchRejectionAnalysis = async (params = {}) => {
  const response = await api.get("/admin/dashboard/rejection-analysis", { params });
  return response.data; // { success, date, data: [{ reason, qty }], totalReject, rejectionRate }
};

/**
 * Fetch reason-wise downtime breakdown for the LossTimeAnalysis donut.
 * @param {{date?: string, hall?: string, shift?: string}} params
 */
export const fetchLossTimeAnalysis = async (params = {}) => {
  const response = await api.get("/admin/dashboard/loss-time-analysis", { params });
  return response.data; // { success, date, data: [{ reason, minutes }], totalLoss, lossPercentage }
};

/**
 * Fetch daily rejection + loss time trend (zero-filled rolling window).
 * @param {{days?: number, endDate?: string, hall?: string, shift?: string}} params
 */
export const fetchRejectionLossTrend = async (params = {}) => {
  const response = await api.get("/admin/dashboard/rejection-loss-trend", { params });
  return response.data; // { success, startDate, endDate, data: [{ date, day, rejection, lossTime }] }
};

export default api;