// src/hooks/useProductionDashboard.js
import { useState, useEffect, useCallback } from "react";
import { fetchProductionDashboard, fetchProductionFilters } from "../api/PartsProductionApi";

function getDefaultPeriodValue(periodType) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  if (periodType === "day") return `${yyyy}-${mm}-${dd}`;
  if (periodType === "year") return `${yyyy}`;
  return `${yyyy}-${mm}`; // month
}

export default function useProductionDashboard() {
  const [periodType, setPeriodTypeState] = useState("month");
  const [periodValue, setPeriodValue] = useState(getDefaultPeriodValue("month"));
  const [category, setCategory] = useState("");
  const [customer, setCustomer] = useState("");

  const [filterOptions, setFilterOptions] = useState({ categories: [], customers: [] });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Switching Day/Month/Year resets periodValue to a sane default for that mode
  const setPeriodType = (type) => {
    setPeriodTypeState(type);
    setPeriodValue(getDefaultPeriodValue(type));
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProductionDashboard({ periodType, periodValue, category, customer });
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load production data");
    } finally {
      setLoading(false);
    }
  }, [periodType, periodValue, category, customer]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchProductionFilters()
      .then(setFilterOptions)
      .catch(() => {
        // silently ignore — filters just won't populate the dropdowns
      });
  }, []);

  return {
    periodType,
    periodValue,
    category,
    customer,
    filterOptions,
    data,
    loading,
    error,
    setPeriodType,
    setPeriodValue,
    setCategory,
    setCustomer,
    refresh: load,
  };
}