import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchLossReasons, fetchLossSummary } from "../api/losstimeDashboardApi";

const getToday = () => new Date().toISOString().split("T")[0];
const getThisMonth = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

export default function useLossTimeDashboard() {
  // filterType: 'daily' | 'monthly'
  const [filterType, setFilterType] = useState("daily");

  const [date, setDate] = useState(getToday());
  const [draftDate, setDraftDate] = useState(getToday());

  const [month, setMonth] = useState(getThisMonth());
  const [draftMonth, setDraftMonth] = useState(getThisMonth());

  const [reasonId, setReasonId] = useState("all");
  const [draftReasonId, setDraftReasonId] = useState("all");

  const [reasons, setReasons] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dirty =
    draftDate !== date || draftMonth !== month || draftReasonId !== reasonId;

  const reasonOptions = useMemo(
    () => [
      { id: "all", label: "All Reasons" },
      ...reasons.map((r) => ({ id: String(r.id), label: r.reason_name })),
    ],
    [reasons],
  );

  const loadReasons = useCallback(async () => {
    try {
      const list = await fetchLossReasons();
      setReasons(list);
    } catch (err) {
      console.error("Failed to load loss reasons:", err);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLossSummary({ filterType, date, month, reasonId });
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load loss time dashboard");
    } finally {
      setLoading(false);
    }
  }, [filterType, date, month, reasonId]);

  useEffect(() => {
    loadReasons();
  }, [loadReasons]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const applyFilters = useCallback(() => {
    setDate(draftDate);
    setMonth(draftMonth);
    setReasonId(draftReasonId);
  }, [draftDate, draftMonth, draftReasonId]);

  const resetFilters = useCallback(() => {
    const today = getToday();
    const thisMonth = getThisMonth();
    setFilterType("daily");
    setDraftDate(today);
    setDate(today);
    setDraftMonth(thisMonth);
    setMonth(thisMonth);
    setDraftReasonId("all");
    setReasonId("all");
  }, []);

  return {
    filterType,
    setFilterType,
    draftDate,
    setDraftDate,
    draftMonth,
    setDraftMonth,
    draftReasonId,
    setDraftReasonId,
    reasonOptions,
    dirty,
    applyFilters,
    resetFilters,
    refresh: loadSummary,
    data,
    loading,
    error,
  };
}