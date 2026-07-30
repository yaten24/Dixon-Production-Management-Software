import { useCallback, useEffect, useState } from "react";
import { fetchDashboardOverview } from "../api/monthlyDashboardApi";

const EMPTY = {
  kpis: {
    target: 0,
    actual: 0,
    good: 0,
    reject: 0,
    efficiency: 0,
    oee: 0,
    runningMachines: 0,
    totalMachines: 0,
    breakdownMachines: 0,
  },
  monthlyTrend: [],
  hallPerformance: [],
  liveMachines: [],
};

export default function useDashboardOverview(hall = null, shift = null, month = null, pollMs = 10000) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchDashboardOverview({ hall, shift, month });
      setData({ ...EMPTY, ...(res?.data || {}) });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err?.response?.data?.message || "Backend se connect nahi ho paya");
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [hall, shift, month]);

  useEffect(() => {
    fetchData();
    if (!pollMs) return;
    const id = setInterval(fetchData, pollMs);
    return () => clearInterval(id);
  }, [fetchData, pollMs]);

  return { ...data, loading, error, lastUpdated, refresh: fetchData };
}