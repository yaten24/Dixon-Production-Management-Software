// src/hooks/useRejectionDashboard.js

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getRejectionDashboardData,
  getHourlyRejectionTrend,
  getRecentRejections,
} from "../api/productionRejectDetailsApi";
import { getAllRejectionReasons } from "../api/rejectionReasonApi";
import { getAllMachines } from "../api/machineApi";

/* ---------------- Helpers ---------------- */

// YYYY-MM-DD in local time (matches <input type="date"> format)
const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ⭐ Safely pull an array out of any common API response shape:
// - [...]                         (plain array)
// - { data: [...] }               (axios-style wrapper)
// - { data: { data: [...] } }     (double-wrapped)
// - { rows: [...] }, { result: [...] }, { items: [...] }
// - anything else → []
const asArray = (res) => {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== "object") return [];

  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.rows)) return res.rows;
  if (Array.isArray(res.result)) return res.result;
  if (Array.isArray(res.items)) return res.items;

  console.warn("Unexpected API response shape, expected an array:", res);
  return [];
};

const sumBy = (rows, keyFn) => {
  const map = {};
  rows.forEach((row) => {
    const key = keyFn(row);
    map[key] = (map[key] || 0) + Number(row.rejectQty || 0);
  });
  return map;
};

const topEntry = (map) => {
  const entries = Object.entries(map);
  if (!entries.length) return null;
  return entries.reduce(
    (best, [key, qty]) => (qty > best.qty ? { key, qty } : best),
    { key: entries[0][0], qty: entries[0][1] },
  );
};

/* ---------------- Hook ---------------- */

export const useRejectionDashboard = () => {
  // Applied filters — actually sent to API. Default date = today.
  const [appliedDate, setAppliedDate] = useState(getTodayDate());
  const [appliedReasonId, setAppliedReasonId] = useState("All");

  // Raw data from backend
  const [rejectionData, setRejectionData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]); // [{ id, label }]
  const [allHalls, setAllHalls] = useState([]); // full list of halls (from machines)

  // Recent rejections (fetched lazily when modal opens)
  const [recentData, setRecentData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /* ---------------- Fetch: rejection reasons (for filter dropdown + full reason list) ---------------- */

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllRejectionReasons();
        const reasons = asArray(res);
        setReasonOptions(
          reasons.map((r) => ({
            id: r.id,
            label: r.reason_name || r.name || r.reason || String(r.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load rejection reasons", err);
        setReasonOptions([]);
      }
    })();
  }, []);

  /* ---------------- Fetch: machines → derive full hall list ---------------- */

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllMachines();
        const machines = asArray(res);
        const halls = [
          ...new Set(machines.map((m) => m.hall).filter(Boolean)),
        ];
        halls.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        setAllHalls(halls);
      } catch (err) {
        console.error("Failed to load machines/halls", err);
        setAllHalls([]);
      }
    })();
  }, []);

  /* ---------------- Fetch: main dashboard data ---------------- */

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRejectionDashboardData({
        date: appliedDate,
        reasonId: appliedReasonId,
      });
      setRejectionData(asArray(res));
    } catch (err) {
      console.error("Failed to load rejection dashboard data", err);
      setError("Failed to load rejection data. Please try again.");
      setRejectionData([]);
    } finally {
      setLoading(false);
    }
  }, [appliedDate, appliedReasonId]);

  /* ---------------- Fetch: hourly trend (date-based only) ---------------- */

  const fetchTrendData = useCallback(async () => {
    setTrendLoading(true);
    try {
      const res = await getHourlyRejectionTrend({ date: appliedDate });
      setTrendData(asArray(res));
    } catch (err) {
      console.error("Failed to load hourly trend", err);
      setTrendData([]);
    } finally {
      setTrendLoading(false);
    }
  }, [appliedDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData, refreshKey]);

  /* ---------------- Actions ---------------- */

  const applyFilters = useCallback((date, reasonId) => {
    setAppliedDate(date);
    setAppliedReasonId(reasonId);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const loadRecent = useCallback(async (limit = 20) => {
    try {
      const res = await getRecentRejections(limit);
      setRecentData(asArray(res));
    } catch (err) {
      console.error("Failed to load recent rejections", err);
      setRecentData([]);
    }
  }, []);

  /* ---------------- Derived / summary data ---------------- */

  const totalRejectQty = useMemo(
    () => rejectionData.reduce((sum, row) => sum + Number(row.rejectQty || 0), 0),
    [rejectionData],
  );

  const highestReason = useMemo(() => {
    const top = topEntry(sumBy(rejectionData, (row) => row.reason));
    return top ? { reason: top.key, qty: top.qty } : {};
  }, [rejectionData]);

  const hallChartData = useMemo(() => {
    const map = sumBy(rejectionData, (row) => row.hall);
    return Object.entries(map).map(([hall, qty]) => ({ hall, qty }));
  }, [rejectionData]);

  const highestHall = useMemo(() => {
    const top = topEntry(sumBy(rejectionData, (row) => row.hall));
    return top ? { hall: top.key, qty: top.qty } : {};
  }, [rejectionData]);

  const machineChartData = useMemo(() => {
    const map = sumBy(rejectionData, (row) => row.machine);
    return Object.entries(map)
      .map(([machine, qty]) => ({ machine, qty }))
      .sort((a, b) => b.qty - a.qty);
  }, [rejectionData]);

  const highestMachine = useMemo(() => {
    const top = topEntry(sumBy(rejectionData, (row) => row.machine));
    return top ? { machine: top.key, qty: top.qty } : {};
  }, [rejectionData]);

  const reasonChartRows = useMemo(() => {
    const map = sumBy(rejectionData, (row) => row.reason);
    return Object.entries(map).map(([reason, qty]) => ({ reason, qty }));
  }, [rejectionData]);

  const trendChartData = useMemo(() => {
    const map = sumBy(trendData, (row) => row.hour);
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, qty]) => ({ hour, qty }));
  }, [trendData]);

  // Full list of reason labels (for pie chart "always show all reasons")
  const allReasonLabels = useMemo(
    () => reasonOptions.map((r) => r.label).filter(Boolean),
    [reasonOptions],
  );

  return {
    // raw
    rejectionData,
    reasonOptions,
    allHalls,
    allReasonLabels,
    recentData,

    // loading/error
    loading,
    trendLoading,
    error,

    // filters
    appliedDate,
    appliedReasonId,
    applyFilters,
    refresh,
    loadRecent,

    // derived
    totalRejectQty,
    highestReason,
    hallChartData,
    highestHall,
    machineChartData,
    highestMachine,
    reasonChartRows,
    trendChartData,
  };
};