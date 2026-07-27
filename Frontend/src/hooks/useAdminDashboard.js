import { useCallback, useEffect, useState } from "react";

// Adjust if your frontend uses a different env var / base URL setup.
const API_BASE = import.meta.env?.VITE_API_BASE_URL;

const EMPTY_DATA = {
  users: { total: 0, byRole: [] },
  machines: { total: 0, byHall: [] },
  parts: { total: 0, byCategory: [] },
  operators: { total: 0, byShift: [] },
  recentAdditions: [],
};

/**
 * Fetches admin dashboard summary counts from
 * GET /api/admin/dashboard/summary
 */
export default function useAdminDashboard() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/summary`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Failed to fetch admin dashboard summary");
      }

      setData(json.data);
    } catch (err) {
      setError(err.message || "Something went wrong while fetching dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}