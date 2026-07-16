import { useState, useEffect, useCallback } from "react";
import { fetchTargetSummary } from "../api/adminDashboardApi";

/**
 * Loads Shift A / Shift B / Overall target quantity from the plan tables.
 * @param {{date?: string, hall?: string}} filters
 */
const useTargetSummary = (filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTargetSummary(filters);
      setData(res.data); // { shiftA, shiftB, overall }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Target summary load nahi ho paaya"
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

export default useTargetSummary;