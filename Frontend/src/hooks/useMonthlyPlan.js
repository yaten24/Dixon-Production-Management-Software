import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axiosInstance';

export default function useMonthlyPlan(monthlyPlanId) {
  const [header, setHeader] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!monthlyPlanId) return;
    setLoading(true);
    setError(null);
    try {
      const [headerRes, detailsRes] = await Promise.all([
        axios.get(`/monthly-plans/${monthlyPlanId}`),
        axios.get(`/monthly-plans/${monthlyPlanId}/details`),
      ]);
      setHeader(headerRes.data.data);
      setDetails(detailsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load monthly plan');
    } finally {
      setLoading(false);
    }
  }, [monthlyPlanId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addPart = async ({ partId, monthlyTargetQty, plannedCycleTime, remarks }) => {
    await axios.post(`/monthly-plans/${monthlyPlanId}/details`, { partId, monthlyTargetQty, plannedCycleTime, remarks });
    await fetchAll();
  };

  const updatePart = async (detailId, payload) => {
    await axios.put(`/monthly-plans/${monthlyPlanId}/details/${detailId}`, payload);
    await fetchAll();
  };

  const removePart = async (detailId) => {
    await axios.delete(`/monthly-plans/${monthlyPlanId}/details/${detailId}`);
    await fetchAll();
  };

  return { header, details, loading, error, addPart, updatePart, removePart, refetch: fetchAll };
}