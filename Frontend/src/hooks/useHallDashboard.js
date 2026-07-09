import { useState, useEffect, useCallback } from "react";
import {
  getHallStats,
  getHallMachineWise,
  getHallHourlyTrend,
  getHallShiftSummary,
  getHallTopRejects,
  getHallMachines,
} from "../api/hallDashboardApi";

// ==========================================================
// Fetches everything the Hall Dashboard needs in one place.
// `filters` = { from, to, machine } — from/to used by stats,
// machine-wise, shift-summary, top-rejects. Hourly trend always
// uses `to` (or today) as the single day it charts, since an
// hour-by-hour view only makes sense for one day at a time.
// ==========================================================
const useHallDashboard = (hallCode, filters) => {
  const [stats, setStats] = useState(null);
  const [machineWise, setMachineWise] = useState([]);
  const [hourlyTrend, setHourlyTrend] = useState([]);
  const [shiftSummary, setShiftSummary] = useState(null);
  const [topRejects, setTopRejects] = useState([]);
  const [machines, setMachines] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!hallCode) return;

    setLoading(true);
    setError(null);

    const commonParams = {
      hall: hallCode,
      from: filters.from,
      to: filters.to,
      machine: filters.machine,
    };

    try {
      const [
        statsRes,
        machineWiseRes,
        hourlyRes,
        shiftRes,
        rejectsRes,
        machinesRes,
      ] = await Promise.all([
        getHallStats(commonParams),
        getHallMachineWise(commonParams),
        getHallHourlyTrend({
          hall: hallCode,
          date: filters.to,
          machine: filters.machine,
        }),
        getHallShiftSummary(commonParams),
        getHallTopRejects({ ...commonParams, limit: 5 }),
        getHallMachines({ hall: hallCode }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (machineWiseRes.success) setMachineWise(machineWiseRes.data);
      if (hourlyRes.success) setHourlyTrend(hourlyRes.data.trend);
      if (shiftRes.success) setShiftSummary(shiftRes.data);
      if (rejectsRes.success) setTopRejects(rejectsRes.data);
      if (machinesRes.success) setMachines(machinesRes.data);
    } catch (err) {
      console.error("useHallDashboard fetch failed:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load hall dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [hallCode, filters.from, filters.to, filters.machine]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    stats,
    machineWise,
    hourlyTrend,
    shiftSummary,
    topRejects,
    machines,
    loading,
    error,
    refresh: fetchAll,
  };
};

export default useHallDashboard;