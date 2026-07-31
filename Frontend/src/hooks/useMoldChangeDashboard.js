import { useState, useEffect, useCallback, useRef } from "react";
import { getMoldChangeDashboardData, getMoldChangeReasons } from "../api/moldChangeDashboardApi";

export const DEFAULT_MOLD_CHANGE_DATA = {
  totalChanges: 0,
  avgDowntime: 0,
  plannedCount: 0,
  unplannedCount: 0,
  topReason: null,
  topHall: null,
  topMachine: null,
  hallWise: [],
  hallsMissing: [],
  reasonDistribution: [],
  reasonsTracked: 0,
  topMachines: [],
  hourlyTrend: [],
};

/**
 * Fetches all five mould-change dashboard sections for a given filter set.
 * filters = { filterType, date, month, changeType, status, reason }
 *
 * - Aborts the in-flight request whenever `filters` changes, so a slow/late
 *   response from a superseded filter set can never overwrite fresher data.
 * - Skips a redundant refetch if `filters` is referentially the same value
 *   as last time (guards against callers that don't memoize their filters
 *   object) unless `force` is passed (used by the manual Refresh button).
 */
export function useMoldChangeData(filters) {
  const [data, setData] = useState(DEFAULT_MOLD_CHANGE_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const lastKeyRef = useRef(null);

  const fetchAll = useCallback(
    async (force = false) => {
      const key = JSON.stringify(filters);
      if (!force && lastKeyRef.current === key) return;
      lastKeyRef.current = key;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await getMoldChangeDashboardData(filters, controller.signal);
        if (controller.signal.aborted) return;
        setData(result);
      } catch (err) {
        if (err.name === "AbortError") return; // superseded by a newer fetch
        console.error("Failed to load mould change dashboard data:", err);
        setError(err.message || "Failed to load mould change dashboard");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchAll();
    return () => abortRef.current?.abort();
  }, [fetchAll]);

  return { data, loading, error, refetch: () => fetchAll(true) };
}

/**
 * Loads the distinct list of mould-change reasons once, for the reason
 * filter dropdown. Not date/filter-scoped.
 */
export function useReasonOptions() {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMoldChangeReasons()
      .then((res) => {
        if (!cancelled) setReasons(res.reasons ?? []);
      })
      .catch((err) => console.error("Failed to load mould change reasons:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { reasons, loading };
}