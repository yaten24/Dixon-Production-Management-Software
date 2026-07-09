import { useState, useEffect, useCallback } from "react";
import { getDashboardOverview } from "../api/dashboardApi";

// ==========================================================
// Fetches today's dashboard overview and exposes a manual refresh().
// Accepts optional { hall } filter — pass nothing for all-halls totals.
// ==========================================================
const useDashboardOverview = ({ hall } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getDashboardOverview(hall ? { hall } : {});

      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load dashboard data.");
      }
    } catch (err) {
      console.error("useDashboardOverview fetch failed:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, [hall]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refresh: fetchOverview };
};

export default useDashboardOverview;
