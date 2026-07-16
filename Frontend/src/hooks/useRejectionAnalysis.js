// frontend/src/hooks/useRejectionAnalysis.js
import { useState, useEffect, useCallback } from "react";
import { fetchRejectionAnalysis } from "../api/adminDashboardApi";

/**
 * Loads reason-wise rejection breakdown for the RejectionAnalysis donut.
 * @param {{date?: string, hall?: string, shift?: string}} filters
 */
const useRejectionAnalysis = (filters = {}) => {
  const [data, setData] = useState([]);
  const [totalReject, setTotalReject] = useState(0);
  const [rejectionRate, setRejectionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchRejectionAnalysis(filters);
      setData(res.data); // [{ reason, qty }]
      setTotalReject(res.totalReject);
      setRejectionRate(res.rejectionRate);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Rejection analysis load nahi ho paaya",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, totalReject, rejectionRate, loading, error, refetch: load };
};

export default useRejectionAnalysis;
