import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "/api/reports";

// ==========================================================
// Generic fetch hook — pass reportType + params, it hits the
// matching backend endpoint. `enabled` lets a tab defer fetching
// until it's actually active.
// ==========================================================
const ENDPOINTS = {
  daily: "/daily",
  "daily-summary": "/daily-summary",
  monthly: "/monthly",
  "monthly-summary": "/monthly-summary",
};

const useProductionReports = (reportType, params, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}${ENDPOINTS[reportType]}`, {
        params,
      });
      // The API responds with { success, message, data }. ReportsPage.jsx
      // reads data.entries / data.totals / data.hallWise etc. directly, so
      // we unwrap the envelope here instead of storing the whole response.
      if (res.data?.success === false) {
        setError(res.data.message || "Failed to load report");
        setData(null);
      } else {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [reportType, JSON.stringify(params), enabled]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, loading, error, refresh: fetchReport };
};

export const useReportFilters = () => {
  const [filters, setFilters] = useState({ halls: [], machines: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/filters`)
      .then((res) =>
        setFilters({
          halls: Array.isArray(res.data?.halls) ? res.data.halls : [],
          machines: Array.isArray(res.data?.machines) ? res.data.machines : [],
        }),
      )
      .catch(() => setFilters({ halls: [], machines: [] }))
      .finally(() => setLoading(false));
  }, []);

  return { ...filters, loading };
};

export default useProductionReports;