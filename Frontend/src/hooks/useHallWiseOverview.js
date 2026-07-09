import { useState, useEffect, useCallback } from "react";
import { getHallWiseOverview } from "../api/dashboardApi";

// ==========================================================
// Fetches per-hall production totals for today (or a given date)
// and exposes a manual refresh().
// ==========================================================
const useHallWiseOverview = (date) => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getHallWiseOverview(date ? { date } : {});

      if (res.success) {
        setHalls(res.data.halls || []);
      } else {
        setError(res.message || "Failed to load hall data.");
      }
    } catch (err) {
      console.error("useHallWiseOverview fetch failed:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load hall data.",
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  return { halls, loading, error, refresh: fetchHalls };
};

export default useHallWiseOverview;