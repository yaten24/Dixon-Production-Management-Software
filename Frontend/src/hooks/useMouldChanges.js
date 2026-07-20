import { useState, useEffect, useCallback } from "react";
import {
  listMouldChanges,
  createMouldChange,
  updateMouldChange,
  deleteMouldChange,
  startMouldChange,
  completeMouldChange,
  cancelMouldChange,
} from "../api/mouldChangeApi";

export default function useMouldChanges(filters = {}) {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChanges = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listMouldChanges(filters);
      setChanges(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load mould changes");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const addChange = async (payload) => {
    const res = await createMouldChange(payload);
    await fetchChanges();
    return res;
  };

  const editChange = async (id, payload) => {
    await updateMouldChange(id, payload);
    await fetchChanges();
  };

  const removeChange = async (id) => {
    await deleteMouldChange(id);
    await fetchChanges();
  };

  const start = async (id) => {
    await startMouldChange(id);
    await fetchChanges();
  };

  const complete = async (id, remarks) => {
    const res = await completeMouldChange(id, remarks);
    await fetchChanges();
    return res; // { downtimeMinutes }
  };

  const cancel = async (id, remarks) => {
    await cancelMouldChange(id, remarks);
    await fetchChanges();
  };

  return {
    changes,
    loading,
    error,
    refetch: fetchChanges,
    addChange,
    editChange,
    removeChange,
    start,
    complete,
    cancel,
  };
}
