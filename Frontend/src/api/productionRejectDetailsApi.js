// src/api/productionRejectDetailsApi.js

import api from "./axios";

// ==========================================
// Production Reject Details API
// Table: production_reject_details
// Matches: /api/production-reject-details (adjust base path if different)
// ==========================================

const BASE = "/production-reject-details";

export const getAllRejectDetails = async () => {
  const res = await api.get(BASE);
  return res.data;
};

export const getRejectDetailById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createRejectDetail = async (payload) => {
  // payload: { production_entry_id, reject_reason_id, reject_qty, remarks }
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateRejectDetail = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteRejectDetail = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

// ⭐ Dashboard-specific query — joined data (hall, machine, date, reason)
// filters: { date, reasonId }
export const getRejectionDashboardData = async (filters = {}) => {
  const params = {};
  if (filters.date) params.date = filters.date;
  if (filters.reasonId && filters.reasonId !== "All")
    params.reasonId = filters.reasonId;

  const res = await api.get(`${BASE}/dashboard`, { params });
  return res.data;
};

// ⭐ Hourly trend data for the trend chart (bottom of dashboard)
export const getHourlyRejectionTrend = async (filters = {}) => {
  const params = {};
  if (filters.date) params.date = filters.date;

  const res = await api.get(`${BASE}/hourly-trend`, { params });
  return res.data;
};

// ⭐ Recent rejections (for "Recent Rejections" modal)
export const getRecentRejections = async (limit = 20) => {
  const res = await api.get(`${BASE}/recent`, { params: { limit } });
  return res.data;
};