import { useState, useEffect, useCallback } from "react";
import {
  getLossSummary,
  getHallWiseLoss,
  getReasonWiseLoss,
  getHeatMapData,
  getHourlyLossTotals,
  getRecentEvents,
  getLossTimeFilters,
  getAllMachines,
} from "../api/lossTimeApi";

const todayStr = () => new Date().toISOString().slice(0, 10);

const INITIAL_FILTERS = {
  date: todayStr(),
  reasonId: "",
};

/**
 * Owns filter state + all data fetching for the Loss Time Dashboard.
 * The dashboard always shows exactly one date's data (default: today).
 * Filters only take effect when applyFilters() is called (Apply button).
 */
const useLossTimeData = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const [summary, setSummary] = useState(null);
  const [hallWiseData, setHallWiseData] = useState([]);
  const [reasonWiseData, setReasonWiseData] = useState([]);
  const [heatMapData, setHeatMapData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ reasons: [] });
  const [machinesList, setMachinesList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdown options + the full machine master list only need to load once
  useEffect(() => {
    getLossTimeFilters()
      .then(setFilterOptions)
      .catch((err) => console.error("Failed to load filter options:", err));

    getAllMachines()
      .then(setMachinesList)
      .catch((err) => console.error("Failed to load machines list:", err));
  }, []);

  const fetchAll = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, hallRes, reasonRes, heatMapRes, hourlyRes, recentRes] =
        await Promise.all([
          getLossSummary(activeFilters),
          getHallWiseLoss(activeFilters),
          getReasonWiseLoss(activeFilters),
          getHeatMapData(activeFilters),
          getHourlyLossTotals(activeFilters),
          getRecentEvents(activeFilters),
        ]);

      setSummary(summaryRes);
      setHallWiseData(hallRes);
      setReasonWiseData(reasonRes);
      setHeatMapData(heatMapRes);
      setHourlyData(hourlyRes);
      setRecentEvents(recentRes);
    } catch (err) {
      console.error("Failed to load loss time dashboard data:", err);
      setError("Unable to load loss time data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(appliedFilters);
  }, [appliedFilters, fetchAll]);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
  }, []);

  const refetch = useCallback(() => fetchAll(appliedFilters), [appliedFilters, fetchAll]);

  // Single source of truth for "no data uploaded for this date" state,
  // used to drive the warning banner + zero-state notes across widgets.
  const hasData = summary?.hasData ?? false;

  return {
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    filterOptions,
    machinesList,
    summary,
    hallWiseData,
    reasonWiseData,
    heatMapData,
    hourlyData,
    recentEvents,
    hasData,
    loading,
    error,
    refetch,
  };
};

export default useLossTimeData;