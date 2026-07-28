// src/hooks/useDashboardOverview.js
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const EMPTY = {
  dayTarget: { target: 0, actual: 0, good: 0, reject: 0 },
  shiftData: [],
  lossTimeReasons: {
    todayLossMinutes: 0,
    todayPartsLost: 0,
    monthLossMinutes: 0,
    monthPartsLost: 0,
  },
  machineStatus: { active: 0, total: 0 },
  userStatus: { active: 0, label: "Active Users" },
  lastDay: { dateLabel: "", target: 0, actual: 0, oee: 0 },
  currentMonth: { target: 0, actual: 0 },
  weeklyOee: [],
  mouldChangeSummary: {
    planned: 0,
    unplanned: 0,
    completed: 0,
    pending: 0,
    avgChangeTime: 0,
  },
};

export default function useDashboardOverview(
  hall = null,
  { pollMs = 60000 } = {},
) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/dashboard/overview", {
        params: hall ? { hall } : {},
        withCredentials: true,
      });
      setData(res.data?.data || EMPTY);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Backend se connect nahi ho paya",
      );
      setData(EMPTY); // fallback, kabhi undefined nahi hoga
    } finally {
      setLoading(false);
    }
  }, [hall]);

  useEffect(() => {
    fetchData();
    if (!pollMs) return;
    const id = setInterval(fetchData, pollMs);
    return () => clearInterval(id);
  }, [fetchData, pollMs]);

  return { ...data, loading, error, refresh: fetchData };
}