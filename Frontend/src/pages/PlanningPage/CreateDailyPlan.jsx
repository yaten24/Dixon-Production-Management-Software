import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineArrowUturnLeft,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlinePlus,
  HiOutlinePlay,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import useDailyProductionPlan from "../../hooks/useDailyProductionPlan";
import { listMonthlyPlans, generatePlanNumber as generateMonthlyNumber } from "../../api/monthlyPlanApi";
import { generateDailyPlanNumber } from "../../api/dailyPlanApi";
import api from "../../api/partApi";

const HALLS = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C-8"];
const SHIFTS = ["A", "B"];

const STATUS_COLORS = {
  Draft: "bg-[#9B9B9B]/15 text-[#0F1D24]",
  Published: "bg-[#FDC94D]/25 text-[#0F1D24]",
  Completed: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-700",
};

// ============================================================
// Mould Change — API layer (kept in this file on purpose)
// ============================================================
const listMouldChanges = (filters = {}) =>
  api.get("/mould-changes", { params: filters }).then((res) => res.data);

const createMouldChange = (payload) =>
  api.post("/mould-changes", payload).then((res) => res.data);

const deleteMouldChange = (id) =>
  api.delete(`/mould-changes/${id}`).then((res) => res.data);

const startMouldChange = (id) =>
  api.patch(`/mould-changes/${id}/start`).then((res) => res.data);

const completeMouldChange = (id, remarks) =>
  api.patch(`/mould-changes/${id}/complete`, { remarks }).then((res) => res.data);

const cancelMouldChange = (id, remarks) =>
  api.patch(`/mould-changes/${id}/cancel`, { remarks }).then((res) => res.data);

// ============================================================
// Mould Change — data hook (kept in this file on purpose)
// ============================================================
function useMouldChanges(filters = {}, enabled = true) {
  const [changes, setChanges] = useState([]);
  const [mcLoading, setMcLoading] = useState(false);
  const [mcError, setMcError] = useState("");

  const fetchChanges = useCallback(async () => {
    if (!enabled) return;
    setMcLoading(true);
    setMcError("");
    try {
      const res = await listMouldChanges(filters);
      setChanges(res?.data || res || []);
    } catch (err) {
      setMcError(err.response?.data?.message || "Failed to load mould changes");
    } finally {
      setMcLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), enabled]);

  useEffect(() => {
    if (enabled) fetchChanges();
    else setChanges([]);
  }, [fetchChanges, enabled]);

  const addChange = async (payload) => {
    const res = await createMouldChange(payload);
    await fetchChanges();
    return res;
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

  return { changes, mcLoading, mcError, refetch: fetchChanges, addChange, removeChange, start, complete, cancel };
}

// Matches backend statuses: row is inserted as 'Planned', then moves to
// 'In Progress' (start), then 'Completed' or 'Cancelled'.
const MC_STATUS_COLORS = {
  Planned: "bg-[#9B9B9B]/15 text-[#0F1D24]",
  "In Progress": "bg-[#FDC94D]/25 text-[#0F1D24]",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

// Backend: CHANGE_TYPES = ['Planned', 'Unplanned']
const CHANGE_TYPES = ["Planned", "Unplanned"];

// Free-text-ish reasons for Unplanned changes (backend requires `reason` when Unplanned)
const MC_REASONS = ["Breakdown", "Quality Issue", "Trial Run", "Tool Damage", "Other"];

// ============================================================
// Themed custom dropdown — matches the app's design tokens
// (dark navy header tone, mono uppercase labels, sharp corners)
// ============================================================
function ThemedSelect({ value, onChange, options, placeholder = "-- select --", disabled = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-full items-center justify-between rounded-sm border px-2.5 text-[11.5px] font-medium outline-none transition-colors
          ${disabled ? "cursor-not-allowed border-[#C6C6C6]/60 bg-[#F5F5F5] text-[#9B9B9B]" : "border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24]"}
          ${open ? "border-[#0F1D24]" : ""}`}
      >
        <span className={selected ? "truncate text-[#0F1D24]" : "truncate text-[#9B9B9B]"}>
          {selected ? selected.label : placeholder}
        </span>
        <HiOutlineChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#9B9B9B] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-[#C6C6C6] bg-white shadow-lg"
          >
            {options.length === 0 && (
              <li className="px-2.5 py-2 text-[11.5px] text-[#9B9B9B]">No options</li>
            )}
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`cursor-pointer px-2.5 py-1.5 text-[11.5px] font-medium transition-colors
                  ${String(opt.value) === String(value) ? "bg-[#0F1D24] text-[#FDC94D]" : "text-[#0F1D24] hover:bg-[#FDC94D]/20"}`}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Add Mould Change — modal scoped to one machine row.
// Fields mirror the backend controller exactly:
// changeType, dailyPlanId, dailyDetailId, machineCode, oldPartId, newPartId,
// standardCycleTime, actualCycleTime, targetQty, plannedDate, plannedShift,
// timeSlot, scheduledTime, reason, remarks.
// ============================================================
function MouldChangeModal({ row, header, monthlyParts, onClose, onSubmit }) {
  const [changeType, setChangeType] = useState("Unplanned");
  const [newPartId, setNewPartId] = useState("");
  const [standardCycleTime, setStandardCycleTime] = useState(row.planned_cycle_time ?? "");
  const [actualCycleTime, setActualCycleTime] = useState("");
  const [targetQty, setTargetQty] = useState(row.target_qty ?? "");
  const [plannedDate, setPlannedDate] = useState(header.planning_date || "");
  const [plannedShift, setPlannedShift] = useState(header.shift || "");
  const [timeSlot, setTimeSlot] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const partOptions = monthlyParts.map((p) => ({ value: p.part_id, label: `${p.part_number} - ${p.part_name}` }));
  const reasonOptions = MC_REASONS.map((r) => ({ value: r, label: r }));

  const handleSubmit = async () => {
    setFormError("");
    if (changeType === "Unplanned" && !reason) {
      setFormError("Reason is required for an Unplanned mould change");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        changeType,
        dailyPlanId: header.daily_plan_id,
        dailyDetailId: row.daily_detail_id,
        machineCode: row.machine_code,
        oldPartId: row.part_id || null,
        newPartId: newPartId || null,
        standardCycleTime: standardCycleTime !== "" ? Number(standardCycleTime) : null,
        actualCycleTime: actualCycleTime !== "" ? Number(actualCycleTime) : null,
        targetQty: targetQty !== "" ? Number(targetQty) : null,
        plannedDate: plannedDate || null,
        plannedShift: plannedShift || null,
        timeSlot: timeSlot || null,
        scheduledTime: scheduledTime || null,
        reason: reason || null,
        remarks: remarks || null,
      });
      onClose();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add mould change");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-xl rounded-sm border border-[#C6C6C6] bg-white"
      >
        <div className="flex items-center justify-between border-b border-[#C6C6C6]/60 px-4 py-2.5">
          <div>
            <h2 className="text-[13px] font-bold text-[#0F1D24]">New Mould Change</h2>
            <p className="font-mono text-[11px] text-[#9B9B9B]">
              {row.machine_code} <span className="text-[#0F1D24]">{row.machine_name}</span>
            </p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-sm text-[#9B9B9B] hover:bg-[#F5F5F5] hover:text-[#0F1D24]">
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Change Type</label>
            <ThemedSelect value={changeType} onChange={setChangeType} options={CHANGE_TYPES.map((t) => ({ value: t, label: t }))} />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Current Part</label>
            <div className="flex h-8 items-center rounded-sm border border-[#C6C6C6]/60 bg-[#F5F5F5] px-2.5 text-[11.5px] text-[#9B9B9B]">
              {row.part_number ? `${row.part_number} - ${row.part_name}` : "-"}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">New Part</label>
            <ThemedSelect value={newPartId} onChange={setNewPartId} options={partOptions} placeholder="-- select new part --" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Reason {changeType === "Unplanned" && <span className="text-red-500">*</span>}</label>
            <ThemedSelect value={reason} onChange={setReason} options={reasonOptions} placeholder="-- select reason --" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Standard Cycle Time</label>
            <input type="number" step="0.01" min="0" value={standardCycleTime} onChange={(e) => setStandardCycleTime(e.target.value)}
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[11.5px] font-mono outline-none focus:border-[#0F1D24]" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Actual Cycle Time</label>
            <input type="number" step="0.01" min="0" value={actualCycleTime} onChange={(e) => setActualCycleTime(e.target.value)}
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[11.5px] font-mono outline-none focus:border-[#0F1D24]" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Target Qty</label>
            <input type="number" min="0" value={targetQty} onChange={(e) => setTargetQty(e.target.value)}
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[11.5px] font-mono outline-none focus:border-[#0F1D24]" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Planned Date</label>
            <input type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)}
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[11.5px] outline-none focus:border-[#0F1D24]" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Planned Shift</label>
            <ThemedSelect value={plannedShift} onChange={setPlannedShift} options={SHIFTS.map((s) => ({ value: s, label: `Shift ${s}` }))} />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Time Slot</label>
            <input value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} placeholder="e.g. 10:00-11:00"
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[11.5px] outline-none focus:border-[#0F1D24]" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Scheduled Time</label>
            <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[11.5px] outline-none focus:border-[#0F1D24]" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Remarks (optional)</label>
            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any notes for this mould change"
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[11.5px] outline-none focus:border-[#0F1D24]" />
          </div>
        </div>

        {formError && <p className="border-t border-[#C6C6C6]/60 px-4 py-2 text-[11.5px] font-semibold text-red-600">{formError}</p>}

        <div className="flex items-center justify-end gap-2 border-t border-[#C6C6C6]/60 px-4 py-2.5">
          <button onClick={onClose}
            className="flex h-8 items-center justify-center rounded-sm border border-[#C6C6C6] px-3 text-[11.5px] font-semibold text-[#0F1D24] hover:border-[#0F1D24]">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex h-8 items-center justify-center gap-1.5 rounded-sm bg-[#0F1D24] px-4 text-[11.5px] font-semibold text-[#FDC94D] disabled:opacity-50">
            {submitting ? "Adding..." : "Add Mould Change"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================
// Mould Change history — list + actions for this plan's hall/shift
// ============================================================
function MouldChangeHistory({ changes, mcLoading, mcError, start, complete, cancel, removeChange }) {
  const handleStart = async (id) => {
    if (!confirm("Start this mould change now?")) return;
    await start(id);
  };

  const handleComplete = async (id) => {
    const remarks = window.prompt("Completion remarks (optional):", "") ?? "";
    await complete(id, remarks || null);
  };

  const handleCancel = async (id) => {
    const remarks = window.prompt("Reason for cancelling (optional):", "") ?? "";
    if (!confirm("Cancel this mould change?")) return;
    await cancel(id, remarks || null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this mould change record?")) return;
    await removeChange(id);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-sm border border-[#C6C6C6]/50 bg-white px-3 py-2">
        <HiOutlineWrenchScrewdriver className="h-4 w-4 text-[#0F1D24]" />
        <h2 className="text-[13px] font-bold text-[#0F1D24]">Mould Changes</h2>
      </div>

      {mcError && <p className="text-[11.5px] font-semibold text-red-600">{mcError}</p>}

      <div className="overflow-x-auto rounded-sm border border-[#C6C6C6] bg-white">
        <table className="w-full min-w-[820px] text-[12px]">
          <thead className="bg-[#0F1D24] text-white">
            <tr>
              <th className="px-2.5 py-2 text-left font-semibold">Machine</th>
              <th className="px-2.5 py-2 text-left font-semibold">Type</th>
              <th className="px-2.5 py-2 text-left font-semibold">Reason</th>
              <th className="px-2.5 py-2 text-left font-semibold">Status</th>
              <th className="px-2.5 py-2 text-left font-semibold">Planned</th>
              <th className="px-2.5 py-2 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mcLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-[11.5px] text-[#9B9B9B]">Loading mould changes...</td>
              </tr>
            )}
            {!mcLoading && changes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-[11.5px] text-[#9B9B9B]">No mould changes recorded yet.</td>
              </tr>
            )}
            {!mcLoading &&
              changes.map((mc) => (
                <tr key={mc.mould_change_id} className="border-t border-[#C6C6C6]/60">
                  <td className="px-2.5 py-2 font-mono font-semibold text-[#0F1D24]">{mc.machine_code}</td>
                  <td className="px-2.5 py-2 text-[#0F1D24]">{mc.change_type}</td>
                  <td className="px-2.5 py-2 text-[#0F1D24]">{mc.reason || "-"}</td>
                  <td className="px-2.5 py-2">
                    <span className={`rounded-sm px-2 py-0.5 text-[10.5px] font-bold ${MC_STATUS_COLORS[mc.status] || MC_STATUS_COLORS.Planned}`}>
                      {mc.status}
                    </span>
                  </td>
                  <td className="px-2.5 py-2 font-mono text-[#9B9B9B]">
                    {mc.planned_date || "-"} {mc.planned_shift ? `· Shift ${mc.planned_shift}` : ""}
                  </td>
                  <td className="px-2.5 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {mc.status === "Planned" && (
                        <button onClick={() => handleStart(mc.mould_change_id)} title="Start"
                          className="flex h-6 w-6 items-center justify-center rounded-sm text-[#0F1D24] hover:bg-[#FDC94D]/25">
                          <HiOutlinePlay className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {mc.status === "In Progress" && (
                        <button onClick={() => handleComplete(mc.mould_change_id)} title="Complete"
                          className="flex h-6 w-6 items-center justify-center rounded-sm text-green-600 hover:bg-green-50">
                          <HiOutlineCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(mc.status === "Planned" || mc.status === "In Progress") && (
                        <button onClick={() => handleCancel(mc.mould_change_id)} title="Cancel"
                          className="flex h-6 w-6 items-center justify-center rounded-sm text-red-500 hover:bg-red-50">
                          <HiOutlineXMark className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {mc.status === "Planned" && (
                        <button onClick={() => handleDelete(mc.mould_change_id)} title="Delete"
                          className="flex h-6 w-6 items-center justify-center rounded-sm text-red-500 hover:bg-red-50">
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Main component
// ============================================================
export default function DailyProductionPlan() {
  const {
    loading, header, details, hallMachines, monthlyParts, error,
    startPlanning, submitNewPlan, addRow, updateRow, removeRow, publish, reset,
  } = useDailyProductionPlan();

  // ---- Setup form state ----
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [monthlyPlanId, setMonthlyPlanId] = useState("");
  const [planningDate, setPlanningDate] = useState(new Date().toISOString().split("T")[0]);
  const [hall, setHall] = useState(HALLS[0]);
  const [shift, setShift] = useState("A");

  // ---- New-plan machine-row assignment state (only used before creation) ----
  const [rowAssignments, setRowAssignments] = useState({}); // machineId -> { monthlyDetailId, targetQty, plannedCycleTime, operatorCode }
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // ---- Mould change: fetched for the currently open existing plan only ----
  const mcEnabled = !!(header && !header.isNew);
  const mcFilters = useMemo(
    () => (mcEnabled ? { hall: header.hall, shift: header.shift, planningDate: header.planning_date } : {}),
    [mcEnabled, header?.hall, header?.shift, header?.planning_date]
  );
  const { changes: mouldChanges, mcLoading, mcError, addChange, removeChange, start, complete, cancel } = useMouldChanges(mcFilters, mcEnabled);
  const [mcModalRow, setMcModalRow] = useState(null); // machine row currently adding a mould change for

  // Machine codes that already have an open (Planned / In Progress) mould change —
  // the backend blocks creating a second one for the same machine.
  const openMachineCodes = useMemo(() => {
    const set = new Set();
    mouldChanges.forEach((mc) => {
      if (mc.status === "Planned" || mc.status === "In Progress") set.add(mc.machine_code);
    });
    return set;
  }, [mouldChanges]);

  useEffect(() => {
    listMonthlyPlans().then((res) => setMonthlyPlans(res.data || [])).catch(() => setMonthlyPlans([]));
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!monthlyPlanId) return;
    setRowAssignments({});
    await startPlanning({ monthlyPlanId, planningDate, hall, shift });
  };

  const setAssignment = (machineId, patch) => {
    setRowAssignments((prev) => ({ ...prev, [machineId]: { ...prev[machineId], ...patch } }));
  };

  const handlePartPick = (machineId, monthlyDetailId) => {
    const md = monthlyParts.find((p) => p.monthly_detail_id === Number(monthlyDetailId));
    setAssignment(machineId, {
      monthlyDetailId: md?.monthly_detail_id || "",
      partId: md?.part_id || "",
      plannedCycleTime: md?.planned_cycle_time || md?.actual_cycle_time || "",
      targetQty: rowAssignments[machineId]?.targetQty || "",
    });
  };

  const handleCreatePlan = async () => {
    setFormError("");
    const machineRows = hallMachines
      .map((m) => ({ machine: m, a: rowAssignments[m.id] }))
      .filter(({ a }) => a?.monthlyDetailId && a?.targetQty);

    if (machineRows.length === 0) {
      setFormError("Assign a part and target qty to at least one machine");
      return;
    }

    setCreating(true);
    try {
      const planNumber = await generateDailyPlanNumber(planningDate, hall, shift).then((r) => r.planNumber);
      await submitNewPlan({
        monthlyPlanId,
        planNumber,
        planningDate,
        hall,
        shift,
        machines: machineRows.map(({ machine, a }) => ({
          machineId: machine.id,
          monthlyDetailId: a.monthlyDetailId,
          partId: a.partId,
          targetQty: Number(a.targetQty),
          plannedCycleTime: a.plannedCycleTime ? Number(a.plannedCycleTime) : null,
          operatorCode: a.operatorCode || null,
        })),
      });
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create plan");
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Publish this plan? It cannot be edited after publishing.")) return;
    await publish();
  };

  const handleAddMouldChange = async (payload) => {
    await addChange(payload);
  };

  // ==========================================================
  // View 1 — Setup form
  // ==========================================================
  if (!header) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-4">
        <motion.form
          onSubmit={handleStart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-lg rounded-sm border border-[#C6C6C6] bg-white p-4"
        >
          <h1 className="mb-3 text-base font-bold text-[#0F1D24]">Daily Production Plan</h1>

          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Monthly Plan</label>
            <ThemedSelect
              value={monthlyPlanId}
              onChange={setMonthlyPlanId}
              options={monthlyPlans.map((p) => ({ value: p.monthly_plan_id, label: p.plan_number }))}
              placeholder="-- select monthly plan --"
              className="h-9"
            />
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Date</label>
              <input
                type="date" value={planningDate} onChange={(e) => setPlanningDate(e.target.value)} required
                className="h-9 w-full rounded-sm border border-[#C6C6C6] px-2 text-[12.5px] outline-none focus:border-[#0F1D24]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Hall</label>
              <ThemedSelect value={hall} onChange={setHall} options={HALLS.map((h) => ({ value: h, label: h }))} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Shift</label>
              <ThemedSelect value={shift} onChange={setShift} options={SHIFTS.map((s) => ({ value: s, label: `Shift ${s}` }))} />
            </div>
          </div>

          {error && <p className="mb-2 text-[11.5px] font-semibold text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="h-9 w-full rounded-sm bg-[#0F1D24] text-[13px] font-semibold text-[#FDC94D] disabled:opacity-50">
            {loading ? "Loading..." : "Start Planning"}
          </button>
        </motion.form>
      </div>
    );
  }

  // ==========================================================
  // View 2 — New plan: assign parts to machines before creating
  // ==========================================================
  if (header.isNew) {
    return (
      <div className="min-h-screen space-y-2 bg-[#F5F5F5] p-2">
        <div className="flex items-center justify-between rounded-sm border border-[#C6C6C6]/50 bg-white px-3 py-2">
          <div>
            <h1 className="text-[13px] font-bold text-[#0F1D24]">New Daily Plan — {hall} · Shift {shift}</h1>
            <p className="font-mono text-[11px] text-[#9B9B9B]">{planningDate}</p>
          </div>
          <button onClick={reset}
            className="flex h-8 items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-3 text-[11px] font-semibold text-[#0F1D24] hover:border-[#0F1D24]">
            <HiOutlineArrowUturnLeft className="h-3.5 w-3.5" />
            Change Selection
          </button>
        </div>

        <div className="overflow-x-auto rounded-sm border border-[#C6C6C6] bg-white">
          <table className="w-full min-w-[760px] text-[12px]">
            <thead className="bg-[#0F1D24] text-white">
              <tr>
                <th className="px-2.5 py-2 text-left font-semibold">Machine</th>
                <th className="px-2.5 py-2 text-left font-semibold">Part</th>
                <th className="px-2.5 py-2 text-right font-semibold font-mono">Target Qty</th>
                <th className="px-2.5 py-2 text-right font-semibold font-mono">Planned CT</th>
                <th className="px-2.5 py-2 text-left font-semibold">Operator Code</th>
              </tr>
            </thead>
            <tbody>
              {hallMachines.map((m) => {
                const a = rowAssignments[m.id] || {};
                return (
                  <tr key={m.id} className="border-t border-[#C6C6C6]/60">
                    <td className="px-2.5 py-1.5 font-mono font-semibold text-[#0F1D24]">
                      {m.machine_code} <span className="text-[#9B9B9B]">{m.machine_name}</span>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <ThemedSelect
                        value={a.monthlyDetailId || ""}
                        onChange={(val) => handlePartPick(m.id, val)}
                        options={monthlyParts.map((p) => ({ value: p.monthly_detail_id, label: `${p.part_number} - ${p.part_name}` }))}
                        placeholder="-- none --"
                      />
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <input
                        type="number" min="1" value={a.targetQty || ""}
                        onChange={(e) => setAssignment(m.id, { targetQty: e.target.value })}
                        className="h-7 w-20 rounded-sm border border-[#C6C6C6] px-1.5 text-right text-[11.5px] font-mono outline-none focus:border-[#0F1D24]"
                      />
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <input
                        type="number" step="0.01" min="0" value={a.plannedCycleTime || ""}
                        onChange={(e) => setAssignment(m.id, { plannedCycleTime: e.target.value })}
                        className="h-7 w-20 rounded-sm border border-[#C6C6C6] px-1.5 text-right text-[11.5px] font-mono outline-none focus:border-[#0F1D24]"
                      />
                    </td>
                    <td className="px-2.5 py-1.5">
                      <input
                        value={a.operatorCode || ""}
                        onChange={(e) => setAssignment(m.id, { operatorCode: e.target.value })}
                        placeholder="optional"
                        className="h-7 w-full rounded-sm border border-[#C6C6C6] px-1.5 text-[11.5px] outline-none focus:border-[#0F1D24]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(formError || error) && <p className="text-[11.5px] font-semibold text-red-600">{formError || error}</p>}

        <button onClick={handleCreatePlan} disabled={creating}
          className="rounded-sm bg-[#FDC94D] px-4 py-2 text-[12.5px] font-bold text-[#0F1D24] disabled:opacity-50">
          {creating ? "Creating..." : "Create Plan"}
        </button>
      </div>
    );
  }

  // ==========================================================
  // View 3 — Existing plan: stats + editable machine table + mould changes
  // ==========================================================
  return (
    <div className="min-h-screen space-y-1 bg-[#F5F5F5] p-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-between rounded-sm border border-[#C6C6C6]/50 bg-white px-3 py-2 shadow-sm"
      >
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#0F1D24]">{header.plan_number}</h1>
          <p className="mt-0.5 font-mono text-[11px] text-[#9B9B9B]">
            {header.planning_date} · {header.hall} · Shift {header.shift}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-sm px-2.5 py-1 text-[11px] font-bold ${STATUS_COLORS[header.status] || STATUS_COLORS.Draft}`}>
            {header.status}
          </span>
          <button onClick={reset}
            className="flex h-8 items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-3 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24] hover:bg-[#F5F5F5]">
            <HiOutlineArrowUturnLeft className="h-3.5 w-3.5" />
            Change Selection
          </button>
          <AnimatePresence>
            {header.status === "Draft" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublish}
                disabled={loading}
                className="flex h-8 items-center gap-1.5 rounded-sm bg-[#0F1D24] px-3 text-xs font-semibold text-[#FDC94D] transition-all hover:bg-[#0F1D24]/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiOutlinePaperAirplane className="h-3.5 w-3.5" />
                Publish Plan
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 rounded-sm border border-[#C6C6C6] bg-white px-3 py-2 text-[11.5px] font-mono text-[#0F1D24]">
        <span>Total Machines: <b>{header.total_machines}</b></span>
        <span>Planned Machines: <b>{header.planned_machines}</b></span>
        <span>Total Target Qty: <b>{header.total_target_qty}</b></span>
      </div>

      {/* Machine table */}
      <div className="overflow-x-auto rounded-sm border border-[#C6C6C6] bg-white">
        <table className="w-full min-w-[820px] text-[12px]">
          <thead className="bg-[#0F1D24] text-white">
            <tr>
              <th className="px-2.5 py-2 text-left font-semibold">Machine</th>
              <th className="px-2.5 py-2 text-left font-semibold">Part</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Target</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Planned CT</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Est. Hours</th>
              <th className="px-2.5 py-2 text-center font-semibold">Mould Change</th>
              {header.status === "Draft" && <th className="px-2.5 py-2 text-center font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {details.map((row) => {
              const openChange = openMachineCodes.has(row.machine_code);
              return (
                <tr key={row.daily_detail_id} className="border-t border-[#C6C6C6]/60">
                  <td className="px-2.5 py-2 font-mono font-semibold text-[#0F1D24]">
                    {row.machine_code} <span className="text-[#9B9B9B]">{row.machine_name}</span>
                  </td>
                  <td className="px-2.5 py-2">
                    <div className="font-mono text-[#0F1D24]">{row.part_number}</div>
                    <div className="text-[#9B9B9B]">{row.part_name}</div>
                  </td>
                  <td className="px-2.5 py-2 text-right font-mono">{row.target_qty}</td>
                  <td className="px-2.5 py-2 text-right font-mono">{row.planned_cycle_time ?? "-"}</td>
                  <td className="px-2.5 py-2 text-right font-mono">{row.estimated_run_hours ?? "-"}</td>
                  <td className="px-2.5 py-2 text-center">
                    {openChange ? (
                      <span className="rounded-sm bg-[#9B9B9B]/15 px-2 py-0.5 text-[10.5px] font-bold text-[#0F1D24]">
                        In Progress
                      </span>
                    ) : (
                      <button
                        onClick={() => setMcModalRow(row)}
                        className="flex h-7 items-center gap-1 rounded-sm border border-[#C6C6C6] px-2 text-[11px] font-semibold text-[#0F1D24] hover:border-[#0F1D24] mx-auto"
                      >
                        <HiOutlinePlus className="h-3.5 w-3.5" />
                        Add
                      </button>
                    )}
                  </td>
                  {header.status === "Draft" && (
                    <td className="px-2.5 py-2 text-center">
                      <button onClick={() => removeRow(row.daily_detail_id)}
                        className="flex h-6 w-6 items-center justify-center rounded-sm text-red-500 hover:bg-red-50 mx-auto">
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {details.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-[11.5px] text-[#9B9B9B]">No machine assignments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mould change history */}
      <MouldChangeHistory
        changes={mouldChanges}
        mcLoading={mcLoading}
        mcError={mcError}
        start={start}
        complete={complete}
        cancel={cancel}
        removeChange={removeChange}
      />

      <AnimatePresence>
        {mcModalRow && (
          <MouldChangeModal
            row={mcModalRow}
            header={header}
            monthlyParts={monthlyParts}
            onClose={() => setMcModalRow(null)}
            onSubmit={handleAddMouldChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}