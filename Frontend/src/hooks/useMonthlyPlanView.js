import { useState, useEffect, useCallback } from "react";
import {
  getMonthlyPlan,
  getMonthlyPlanDetails,
  addMonthlyPlanDetail,
  updateMonthlyPlanDetail,
  deleteMonthlyPlanDetail,
} from "../api/monthlyPlanApi";

export default function useMonthlyPlanView(id) {
  const [header, setHeader] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [headerRes, detailsRes] = await Promise.all([
        getMonthlyPlan(id),
        getMonthlyPlanDetails(id),
      ]);
      setHeader(headerRes.data);
      setDetails(detailsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addPart = async (payload) => {
    await addMonthlyPlanDetail(id, payload);
    await fetchAll();
  };

  const updatePart = async (detailId, payload) => {
    await updateMonthlyPlanDetail(id, detailId, payload);
    await fetchAll();
  };

  const removePart = async (detailId) => {
    await deleteMonthlyPlanDetail(id, detailId);
    await fetchAll();
  };

  return { header, details, loading, error, addPart, updatePart, removePart, refetch: fetchAll };
}