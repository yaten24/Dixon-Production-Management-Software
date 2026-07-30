// src/hooks/useMachineWiseProduction.js
import { useCallback, useEffect, useState } from "react";
import { fetchMachineWiseSummary } from "../api/machineWiseProductionApi";

const EMPTY = { rows: [], totals: {} };

export default function useMachineWiseProduction({ year, month, hall, shift }) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchMachineWiseSummary({ year, month, hall, shift });
      setData(result || EMPTY);
    } catch (err) {
      setError(err?.response?.data?.message || "Backend se connect nahi ho paya");
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [year, month, hall, shift]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, error, refetch: load };
}