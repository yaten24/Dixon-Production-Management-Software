// src/api/productionApi.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.3.87:5000/api";

const api = axios.create({ baseURL: BASE_URL });

/**
 * Fetch dashboard data (summary + part-wise rows) for the given filters.
 * periodType: "day" | "month" | "year"
 * periodValue: "YYYY-MM-DD" | "YYYY-MM" | "YYYY" (matching periodType)
 */
export async function fetchProductionDashboard({ periodType, periodValue, category, customer }) {
  const params = { periodType, periodValue };
  if (category) params.category = category;
  if (customer) params.customer = customer;

  const { data } = await api.get("/new/production/parts/dashboard", { params });
  return data.data;
}

/** Fetch distinct category / customer values for the filter dropdowns */
export async function fetchProductionFilters() {
  const { data } = await api.get("/new/production/parts/filters");
  return data.data;
}