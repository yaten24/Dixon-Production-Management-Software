import { useState, useEffect, useCallback } from "react";
import {
  getHallStats,
  getHallMachineWise,
  getHallHourlyTrend,
  getHallShiftSummary,
  getHallTopRejects,
  getHallMachines,
} from "../api/hallDashboardApi";

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
      shift: filters.shift,
    };

    // FIX: Promise.allSettled — ek endpoint fail hone se baaki data
    // discard nahi hota, jitna successful hai utna dikhta rahega
    const results = await Promise.allSettled([
      getHallStats(commonParams),
      getHallMachineWise(commonParams),
      getHallHourlyTrend({ hall: hallCode, date: filters.to, machine: filters.machine, shift: filters.shift }),
      getHallShiftSummary(commonParams),
      getHallTopRejects({ ...commonParams, limit: 5 }),
      getHallMachines({ hall: hallCode }),
    ]);

    const [statsRes, machineWiseRes, hourlyRes, shiftRes, rejectsRes, machinesRes] = results;
    const failures = [];

    if (statsRes.status === "fulfilled" && statsRes.value.success) setStats(statsRes.value.data);
    else failures.push("stats");

    if (machineWiseRes.status === "fulfilled" && machineWiseRes.value.success) setMachineWise(machineWiseRes.value.data);
    else failures.push("machine-wise");

    if (hourlyRes.status === "fulfilled" && hourlyRes.value.success) setHourlyTrend(hourlyRes.value.data.trend);
    else failures.push("hourly-trend");

    if (shiftRes.status === "fulfilled" && shiftRes.value.success) setShiftSummary(shiftRes.value.data);
    else failures.push("shift-summary");

    if (rejectsRes.status === "fulfilled" && rejectsRes.value.success) setTopRejects(rejectsRes.value.data);
    else failures.push("top-rejects");

    if (machinesRes.status === "fulfilled" && machinesRes.value.success) setMachines(machinesRes.value.data);
    else failures.push("machines");

    if (failures.length) {
      setError(`Kuch sections load nahi ho paaye: ${failures.join(", ")}`);
    }

    setLoading(false);
  }, [hallCode, filters.from, filters.to, filters.machine, filters.shift]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    stats, machineWise, hourlyTrend, shiftSummary, topRejects, machines,
    loading, error, refresh: fetchAll,
  };
};

export default useHallDashboard;