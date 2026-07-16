// frontend/src/hooks/useProductionStats.js
import { useState, useEffect, useCallback } from "react";
import { fetchProductionStats } from "../api/adminDashboardApi";

/**
 * Handles loading/error/data state for the top ProductionStats cards.
 * @param {{date?: string, hall?: string, shift?: string}} filters
 */
const useProductionStats = (filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProductionStats(filters);
      setData(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Production stats load nahi ho paaye",
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

export default useProductionStats;
