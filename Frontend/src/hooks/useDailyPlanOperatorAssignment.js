import { useState, useEffect, useCallback, useRef } from "react";
import { getDailyPlan, getDailyPlanDetails, updateDailyPlanDetail } from "../api/dailyPlanApi";

/**
 * Manages operator assignment for a single daily plan's machine rows.
 *
 * Design notes:
 * - `rows` is the source of truth rendered by the page. Each row carries
 *   a `saveState` ("idle" | "saving" | "saved" | "error") so the UI can
 *   show per-row feedback without a global spinner blocking everything.
 * - Assignment is optimistic: we update local state immediately, then
 *   reconcile with the server response. On failure we roll back to the
 *   last known-good operator for that row and surface the error inline.
 * - We do NOT allow assigning while the plan is not "Draft" — once
 *   Published/Completed/Closed, this becomes a read-only audit view.
 */
export default function useDailyPlanOperatorAssignment(dailyPlanId) {
  const [header, setHeader] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Track the last successfully-saved operator per row, for rollback.
  const lastGoodRef = useRef({});

  const load = useCallback(async () => {
    if (!dailyPlanId) return;
    setLoading(true);
    setError("");
    try {
      const [h, d] = await Promise.all([getDailyPlan(dailyPlanId), getDailyPlanDetails(dailyPlanId)]);
      setHeader(h.data);
      const nextRows = (d.data || []).map((r) => ({ ...r, saveState: "idle" }));
      setRows(nextRows);
      lastGoodRef.current = Object.fromEntries(nextRows.map((r) => [r.daily_detail_id, r.operator_code]));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load daily plan");
    } finally {
      setLoading(false);
    }
  }, [dailyPlanId]);

  useEffect(() => { load(); }, [load]);

  const isEditable = header?.status === "Draft";

  // Which operator codes are currently assigned elsewhere in this plan —
  // used to warn/block double-booking an operator across two machines.
  const assignedElsewhere = useCallback(
    (excludeDetailId) =>
      new Set(
        rows
          .filter((r) => r.daily_detail_id !== excludeDetailId && r.operator_code)
          .map((r) => r.operator_code),
      ),
    [rows],
  );

  const setRowState = (detailId, patch) => {
    setRows((prev) => prev.map((r) => (r.daily_detail_id === detailId ? { ...r, ...patch } : r)));
  };

  /**
   * Assign (or clear, if operator is null) an operator to a machine row.
   * Returns { ok, message } so the page can show a toast/inline error
   * without throwing across the hook boundary.
   */
  const assignOperator = async (detailId, operator /* { operator_code, operator_name } | null */) => {
    if (!isEditable) {
      return { ok: false, message: "This plan is no longer editable." };
    }

    const row = rows.find((r) => r.daily_detail_id === detailId);
    if (!row) return { ok: false, message: "Row not found." };

    const newCode = operator?.operator_code || null;

    // Guard: same operator already assigned to a different machine in
    // this plan. One operator can't physically run two machines at once.
    if (newCode && assignedElsewhere(detailId).has(newCode)) {
      return { ok: false, message: `${operator.operator_name || newCode} is already assigned to another machine in this plan.` };
    }

    // No-op guard — avoid a redundant network call.
    if (newCode === row.operator_code) {
      return { ok: true, message: null };
    }

    // Optimistic update
    setRowState(detailId, {
      operator_code: newCode,
      operator_name: operator?.operator_name || null,
      saveState: "saving",
    });

    try {
      await updateDailyPlanDetail(dailyPlanId, detailId, { operatorCode: newCode });
      lastGoodRef.current[detailId] = newCode;
      setRowState(detailId, { saveState: "saved" });
      // Clear the "saved" flash after a moment so it doesn't linger forever.
      setTimeout(() => setRowState(detailId, { saveState: "idle" }), 1500);
      return { ok: true, message: null };
    } catch (err) {
      // Roll back to last known-good state on failure.
      const prevCode = lastGoodRef.current[detailId] ?? null;
      const prevRow = rows.find((r) => r.daily_detail_id === detailId);
      setRowState(detailId, {
        operator_code: prevCode,
        operator_name: prevCode ? prevRow?.operator_name : null,
        saveState: "error",
      });
      const message = err.response?.data?.message || "Failed to save assignment — reverted.";
      return { ok: false, message };
    }
  };

  const clearOperator = (detailId) => assignOperator(detailId, null);

  return { header, rows, loading, error, isEditable, assignOperator, clearOperator, refetch: load };
}