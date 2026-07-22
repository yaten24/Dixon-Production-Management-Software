import { useState, useEffect, useCallback } from "react";
import { getHourlyMachineTracking } from "../api/hourlyTrackingApi";

export default function useHourlyMachineTracking(dailyPlanId) {
  const [hours, setHours] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    if (!dailyPlanId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getHourlyMachineTracking(dailyPlanId);
      setHours(res.data.hours);
      setMachines(res.data.machines);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load hourly tracking");
    } finally {
      setLoading(false);
    }
  }, [dailyPlanId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { hours, machines, loading, error, refetch: fetch };
}
