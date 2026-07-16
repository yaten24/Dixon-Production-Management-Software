// frontend/src/hooks/useLossTimeAnalysis.js
import { useState, useEffect, useCallback } from "react";
import { fetchLossTimeAnalysis } from "../api/adminDashboardApi";

/**
 * Loads reason-wise downtime breakdown for the LossTimeAnalysis donut.
 * @param {{date?: string, hall?: string, shift?: string}} filters
 */
const useLossTimeAnalysis = (filters = {}) => {
  const [data, setData] = useState([]);
  const [totalLoss, setTotalLoss] = useState(0);
  const [lossPercentage, setLossPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchLossTimeAnalysis(filters);
      setData(res.data); // [{ reason, minutes }]
      setTotalLoss(res.totalLoss);
      setLossPercentage(res.lossPercentage);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Loss time analysis load nahi ho paaya"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, totalLoss, lossPercentage, loading, error, refetch: load };
};

export default useLossTimeAnalysis;