// src/hooks/useDateWiseProduction.js
import { useCallback, useEffect, useState } from "react";
import { fetchMonthlyDateWiseSummary } from "../api/datewiseProductionApi";

const EMPTY = { rows: [], totals: {} };

export default function useDateWiseProduction({ year, month, hall, shift }) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchMonthlyDateWiseSummary({ year, month, hall, shift });
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