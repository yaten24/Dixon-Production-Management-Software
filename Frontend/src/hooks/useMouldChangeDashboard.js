import { useState, useEffect, useCallback } from "react";
import { getMouldChangeSummary } from "../api/mouldChangeDashboardApi";

const todayStr = () => new Date().toISOString().split("T")[0];

const useMouldChangeDashboard = () => {
  const [date, setDate] = useState(todayStr());
  const [hall, setHall] = useState("All");
  const [reason, setReason] = useState("All");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMouldChangeSummary({
        date,
        hall: hall !== "All" ? hall : undefined,
        reason: reason !== "All" ? reason : undefined,
      });
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
      setData(null); // bug fix: previously stale data from a prior date stayed on screen after a failed fetch
    } finally {
      setLoading(false);
    }
  }, [date, hall, reason]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const resetFilters = () => {
    setDate(todayStr());
    setHall("All");
    setReason("All");
  };

  return {
    date,
    setDate,
    hall,
    setHall,
    reason,
    setReason,
    data,
    loading,
    error,
    refresh: fetchSummary,
    resetFilters,
  };
};

export default useMouldChangeDashboard;