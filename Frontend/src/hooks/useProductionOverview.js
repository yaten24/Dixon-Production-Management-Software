// frontend/src/hooks/useProductionOverview.js
import { useState, useEffect, useCallback } from "react";
import { fetchProductionOverview } from "../api/adminDashboardApi";

/**
 * Loads hall-wise Target/Actual/Rejection for the ProductionChart bar graph.
 * @param {{date?: string, shift?: string}} filters
 */
const useProductionOverview = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProductionOverview(filters);
      setData(res.data); // [{ hall, target, actual, rejection }]
    } catch (err) {
      setError(
        err?.response?.data?.message || "Production overview load nahi ho paaya"
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

export default useProductionOverview;