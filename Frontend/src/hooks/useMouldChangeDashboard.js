import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "/api/mould-change-dashboard";
const todayStr = () => new Date().toISOString().split("T")[0];

const useMouldChangeDashboard = () => {
  const [date, setDate] = useState(todayStr());
  const [reason, setReason] = useState("All");
  const [reasonOptions, setReasonOptions] = useState(["All"]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/summary`, {
        params: { date, reason },
        withCredentials: true,
      });
      setData(res.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [date, reason]);

  const fetchReasonOptions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/reasons`, { withCredentials: true });
      setReasonOptions(res.data.data);
    } catch (err) {
      console.error("Failed to load reason options:", err);
    }
  }, []);

  useEffect(() => { fetchReasonOptions(); }, [fetchReasonOptions]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const resetFilters = () => {
    setDate(todayStr());
    setReason("All");
  };

  return { date, setDate, reason, setReason, reasonOptions, data, loading, error, refresh: fetchSummary, resetFilters };
};

export default useMouldChangeDashboard;