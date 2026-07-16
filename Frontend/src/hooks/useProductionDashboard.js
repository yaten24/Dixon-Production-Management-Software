import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const useProductionDashboard = (date) => {
  const [summary, setSummary] = useState({
    overall: { target: 0, actual: 0, rejection: 0 },
    hallSummary: [],
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setSummary(summaryRes.value.data.data);
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