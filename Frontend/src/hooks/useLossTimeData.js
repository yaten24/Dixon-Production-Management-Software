import { useState, useEffect, useCallback } from "react";
import {
  getLossSummary,
  getHallWiseLoss,
  getReasonWiseLoss,
  getHeatMapData,
  getHourlyLossTotals,
  getRecentEvents,
  getLossTimeFilters,
} from "../api/lossTimeApi";

const INITIAL_FILTERS = {
  machineId: "",
  reasonId: "",
};

/**
 * Owns filter state + all data fetching for the Loss Time Dashboard.
 * Filters only take effect when applyFilters() is called (Apply button),
 * matching the original dashboard's Apply/Reset UX.
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
  const [filterOptions, setFilterOptions] = useState({ halls: [], shifts: [], reasons: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdown options only need to load once
  useEffect(() => {
    getLossTimeFilters()
      .then(setFilterOptions)
      .catch((err) => console.error("Failed to load filter options:", err));
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

  return {
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    filterOptions,
    summary,
    hallWiseData,
    reasonWiseData,
    heatMapData,
    hourlyData,
    recentEvents,
    loading,
    error,
    refetch,
  };
};

export default useLossTimeData;