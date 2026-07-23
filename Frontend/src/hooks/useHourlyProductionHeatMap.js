import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 5000;
const API_BASE = "http://localhost:5000/api";


export function useHourlyProductionHeatmap(hallId, { date, pollMs = POLL_INTERVAL_MS } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const fetchOnce = useCallback(
    async ({ silent } = {}) => {
      if (!hallId) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (!silent) setLoading(true);

      try {
        const params = new URLSearchParams();
        if (date) params.set("date", date);
        const qs = params.toString() ? `?${params.toString()}` : "";

        const res = await fetch(`${API_BASE}/production/halls/${hallId}/heatmap${qs}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load heatmap");

        setData(json.data);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Something went wrong");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [hallId, date]
  );

  useEffect(() => {
    fetchOnce({ silent: false });

    const startPolling = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => fetchOnce({ silent: true }), pollMs);
    };
    startPolling();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchOnce({ silent: true });
        startPolling();
      } else {
        clearInterval(timerRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timerRef.current);
      abortRef.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchOnce, pollMs]);

  const refresh = useCallback(() => fetchOnce({ silent: false }), [fetchOnce]);

  return { data, error, loading, lastUpdated, refresh };
}