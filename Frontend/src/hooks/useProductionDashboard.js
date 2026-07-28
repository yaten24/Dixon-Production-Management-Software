import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const useProductionDashboard = (date) => {
  const [summary, setSummary] = useState({
    overall: { target: 0, actual: 0, rejection: 0 },
    hallSummary: {},
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeHallSummary = (hallSummaryArr = []) => {
    const map = {};
    (hallSummaryArr || []).forEach((h) => {
      if (!h || !h.hall) return;
      const key = String(h.hall).trim();
      map[key] = {
        target: Number(h.target) || 0,
        actual: Number(h.actual) || 0,
        rejection: Number(h.rejection) || 0,
      };
    });
    return map;
  };

  const fetchDashboard = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, hourlyRes] = await Promise.allSettled([
        api.get(`/production-dashboard/summary`, { params: { date } }),
        api.get(`/production-dashboard/hourly`, { params: { date } }),
      ]);

      if (summaryRes.status === "fulfilled") {
        const data = summaryRes.value.data.data || {};
        setSummary({
          overall: {
            target: Number(data.overall?.target) || 0,
            actual: Number(data.overall?.actual) || 0,
            rejection: Number(data.overall?.rejection) || 0,
          },
          hallSummary: normalizeHallSummary(data.hallSummary),
        });
      } else {
        console.error("Summary fetch failed:", summaryRes.reason);
      }

      if (hourlyRes.status === "fulfilled") {
        setHourlyData(hourlyRes.value.data.data);
      } else {
        console.error("Hourly fetch failed:", hourlyRes.reason);
      }

      if (summaryRes.status === "rejected" && hourlyRes.status === "rejected") {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { summary, hourlyData, loading, error, refetch: fetchDashboard };
};

export default useProductionDashboard;