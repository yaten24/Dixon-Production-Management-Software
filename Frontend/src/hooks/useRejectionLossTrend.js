// frontend/src/hooks/useRejectionLossTrend.js
import { useState, useEffect, useCallback } from "react";
import { fetchRejectionLossTrend } from "../api/adminDashboardApi";

/**
 * Loads the daily rejection + loss time trend for the RejectionLossTrend chart.
 * @param {{days?: number, endDate?: string, hall?: string, shift?: string}} filters
 */
const useRejectionLossTrend = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchRejectionLossTrend(filters);
      setData(res.data); // [{ date, day, rejection, lossTime }]
    } catch (err) {
      setError(
        err?.response?.data?.message || "Trend data load nahi ho paaya"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};

export default useRejectionLossTrend;