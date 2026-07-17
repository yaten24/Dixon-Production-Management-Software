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
  // Applied filters — actually sent to API
  const [appliedDate, setAppliedDate] = useState("");
  const [appliedReasonId, setAppliedReasonId] = useState("All");

  // Raw data from backend
  const [rejectionData, setRejectionData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]);

  // Recent rejections (fetched lazily when modal opens)
  const [recentData, setRecentData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /* ---------------- Fetch: rejection reasons (for filter dropdown) ---------------- */

  useEffect(() => {
    (async () => {
      try {
        const reasons = await getAllRejectionReasons();
        // Expecting [{ id, reason_name, status }]  — adjust key if backend differs
        setReasonOptions(
          (reasons || []).map((r) => ({
            id: r.id,
            label: r.reason_name || r.name || r.reason,
          })),
        );
      } catch (err) {
        console.error("Failed to load rejection reasons", err);
      }
    })();
  }, []);

  /* ---------------- Fetch: main dashboard data ---------------- */

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRejectionDashboardData({
        date: appliedDate,
        reasonId: appliedReasonId,
      });
      setRejectionData(data || []);
    } catch (err) {
      console.error("Failed to load rejection dashboard data", err);
      setError("Failed to load rejection data. Please try again.");
      setRejectionData([]);
    } finally {
      setLoading(false);
    }
  }, [appliedDate, appliedReasonId]);

  /* ---------------- Fetch: hourly trend (independent of reason/hall filters, only date) ---------------- */

  const fetchTrendData = useCallback(async () => {
    setTrendLoading(true);
    try {
      const data = await getHourlyRejectionTrend({ date: appliedDate });
      setTrendData(data || []);
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
      const data = await getRecentRejections(limit);
      setRecentData(data || []);
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

  return {
    // raw
    rejectionData,
    reasonOptions,
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