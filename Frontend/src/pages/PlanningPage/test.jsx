import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  HiOutlineArrowUturnLeft,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlinePlay,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineWrenchScrewdriver,
  HiOutlineSquares2X2,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Header, { HEADER_HEIGHT } from "../../compenents/dashboard/Header";
import useDailyProductionPlan from "../../hooks/useDailyProductionPlan";
import { listMonthlyPlans } from "../../api/monthlyPlanApi";
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
// Date helpers — backend sometimes sends a full ISO datetime
// ("2026-07-19T18:30:00.000Z") for date-only fields. Feeding that
// straight into a date input/picker produced a blank/invalid value —
// BUG FIX: always normalize through toDateKey() to a local
// "YYYY-MM-DD" string before it reaches an input or picker.
// ============================================================
const toDateKey = (input) => {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const todayKey = () => toDateKey(new Date());

const formatDateLabel = (key) => {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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
// Page toolbar — sits directly under the shared app Header
// (same logo/branding, no duplicate strip). Just breadcrumb +
// back + page-specific actions, bordered like the rest of the
// desktop UI.
// ============================================================
function PageToolbar({ eyebrow, title, subtitle, backHref, actions }) {
  const navigate = useNavigate();
  return (
    <div className="w-full border-b border-[#C6C6C6] bg-white">
      <div className="flex h-[38px] w-full flex-wrap items-center justify-between gap-2 px-3">
        <div className="flex items-center gap-2">
          {backHref !== undefined && (
            <button
              onClick={() => (backHref ? navigate(backHref) : navigate(-1))}
              title="Back"
              className="flex h-6 w-6 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100"
            >
              <HiOutlineArrowUturnLeft className="h-3.5 w-3.5" />
            </button>
          )}
          <div className={backHref !== undefined ? "border-l border-[#C6C6C6] pl-2.5" : ""}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1D24]/60">
              {eyebrow}
            </span>
            <h1 className="text-[13px] font-bold tracking-tight text-[#0F1D24] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="font-mono text-[10px] text-[#9B9B9B] leading-tight">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-stretch h-6 gap-px bg-[#C6C6C6]">{actions}</div>}
      </div>
    </div>
  );
}

// ============================================================
// Themed custom dropdown — flat bordered panel, no motion,
// matches the desktop-app design tokens (sharp corners, navy fill)
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
        className={`flex h-8 w-full items-center justify-between border px-2.5 text-[11.5px] font-medium outline-none transition-colors duration-100
          ${disabled ? "cursor-not-allowed border-[#C6C6C6] bg-[#F5F5F5] text-[#9B9B9B]" : "border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24]"}
          ${open ? "border-[#0F1D24]" : ""}`}
      >
        <span className={selected ? "truncate text-[#0F1D24]" : "truncate text-[#9B9B9B]"}>
          {selected ? selected.label : placeholder}
        </span>
        <HiOutlineChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#9B9B9B] transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
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
              className={`cursor-pointer border-b border-[#C6C6C6] px-2.5 py-1.5 text-[11.5px] font-medium last:border-b-0 transition-colors duration-100
                ${String(opt.value) === String(value) ? "bg-[#0F1D24] text-[#FDC94D]" : "text-[#0F1D24] hover:bg-[#FDC94D]/20"}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// Themed custom date picker — desktop-style calendar dropdown.
// Replaces native <input type="date"> (whose OS-rendered picker
// broke the flat/bordered desktop look and clashed with sharp
// corners elsewhere). Always emits/consumes "YYYY-MM-DD" via
// toDateKey, so no timezone drift between what's shown and stored.
// ============================================================
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function ThemedDatePicker({ value, onChange, disabled = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(`${value}T00:00:00`) : new Date()));
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (value) setViewDate(new Date(`${value}T00:00:00`));
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, key: toDateKey(new Date(year, month - 1, daysInPrevMonth - i)), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: toDateKey(new Date(year, month, d)), inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const nextDay = cells.length - (startOffset + daysInMonth) + 1;
    cells.push({ day: nextDay, key: toDateKey(new Date(year, month + 1, nextDay)), inMonth: false });
    if (cells.length >= 42) break;
  }

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handlePick = (key) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-full items-center justify-between border px-2.5 text-[11.5px] font-medium outline-none transition-colors duration-100
          ${disabled ? "cursor-not-allowed border-[#C6C6C6] bg-[#F5F5F5] text-[#9B9B9B]" : "border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24]"}
          ${open ? "border-[#0F1D24]" : ""}`}
      >
        <span className={value ? "truncate text-[#0F1D24]" : "truncate text-[#9B9B9B]"}>
          {value ? formatDateLabel(value) : "-- select date --"}
        </span>
        <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0 text-[#9B9B9B]" />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-64 border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
          {/* Month nav */}
          <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-[#FAFAFA] px-2 py-1.5">
            <button
              type="button"
              onClick={goPrevMonth}
              className="flex h-6 w-6 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100"
            >
              <HiOutlineChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11.5px] font-bold text-[#0F1D24]">{monthLabel}</span>
            <button
              type="button"
              onClick={goNextMonth}
              className="flex h-6 w-6 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100"
            >
              <HiOutlineChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-[#C6C6C6] bg-white">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w} className="py-1 text-center text-[9.5px] font-bold uppercase text-[#9B9B9B]">
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-px bg-[#C6C6C6] p-px">
            {cells.slice(0, 42).map((cell, i) => {
              const isSelected = cell.key === value;
              const isToday = cell.key === todayKey();
              return (
                <button
                  key={`${cell.key}-${i}`}
                  type="button"
                  onClick={() => handlePick(cell.key)}
                  className={`flex h-7 items-center justify-center bg-white text-[11px] font-semibold transition-colors duration-100
                    ${!cell.inMonth ? "text-[#C6C6C6]" : "text-[#0F1D24]"}
                    ${isSelected ? "bg-[#0F1D24] text-[#FDC94D]" : "hover:bg-[#FDC94D]/20"}
                    ${isToday && !isSelected ? "border border-[#FDC94D]" : ""}`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <button
            type="button"
            onClick={() => handlePick(todayKey())}
            className="w-full border-t border-[#C6C6C6] bg-[#FAFAFA] py-1.5 text-[11px] font-semibold text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100"
          >
            Today
          </button>
        </div>
      )}
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
  // BUG FIX: header.planning_date can arrive as a full ISO datetime —
  // normalize to YYYY-MM-DD so the picker shows a valid pre-selected date.
  const [plannedDate, setPlannedDate] = useState(header.planning_date ? toDateKey(header.planning_date) : "");
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
      <div className="w-full max-w-xl border border-[#C6C6C6] bg-white shadow-[0_8px_24px_rgba(15,29,36,0.25)]">
        <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-[#FAFAFA] px-4 py-2.5">
          <div>
            <h2 className="text-[13px] font-bold text-[#0F1D24]">New Mould Change</h2>
            <p className="font-mono text-[11px] text-[#9B9B9B]">
              {row.machine_code} <span className="text-[#0F1D24]">{row.machine_name}</span>
            </p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center border border-[#C6C6C6] bg-white text-[#9B9B9B] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100">
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>

        {/* z-index: date picker panel needs to sit above sibling fields in
            this grid, so the grid itself must not clip/stack below it —
            BUG FIX: added relative z-10 on the date field wrapper only. */}
        <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Change Type</label>
            <ThemedSelect value={changeType} onChange={setChangeType} options={CHANGE_TYPES.map((t) => ({ value: t, label: t }))} />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Current Part</label>
            <div className="flex h-8 items-center border border-[#C6C6C6] bg-[#F5F5F5] px-2.5 text-[11.5px] text-[#9B9B9B]">
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
              className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11.5px] font-mono outline-none focus:border-[#0F1D24]" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Actual Cycle Time</label>
            <input type="number" step="0.01" min="0" value={actualCycleTime} onChange={(e) => setActualCycleTime(e.target.value)}
              className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11.5px] font-mono outline-none focus:border-[#0F1D24]" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Target Qty</label>
            <input type="number" min="0" value={targetQty} onChange={(e) => setTargetQty(e.target.value)}
              className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11.5px] font-mono outline-none focus:border-[#0F1D24]" />
          </div>

          <div className="relative z-10">
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Planned Date</label>
            <ThemedDatePicker value={plannedDate} onChange={setPlannedDate} />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Planned Shift</label>
            <ThemedSelect value={plannedShift} onChange={setPlannedShift} options={SHIFTS.map((s) => ({ value: s, label: `Shift ${s}` }))} />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Time Slot</label>
            <input value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} placeholder="e.g. 10:00-11:00"
              className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11.5px] outline-none focus:border-[#0F1D24]" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Scheduled Time</label>
            <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
              className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11.5px] outline-none focus:border-[#0F1D24]" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Remarks (optional)</label>
            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any notes for this mould change"
              className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11.5px] outline-none focus:border-[#0F1D24]" />
          </div>
        </div>

        {formError && <p className="border-t border-[#C6C6C6] px-4 py-2 text-[11.5px] font-semibold text-red-600">{formError}</p>}

        <div className="flex items-center justify-end gap-px bg-[#C6C6C6] border-t border-[#C6C6C6]">
          <button onClick={onClose}
            className="flex h-9 items-center justify-center bg-white px-3 text-[11.5px] font-semibold text-[#0F1D24] hover:bg-[#F5F5F5] transition-colors duration-100">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex h-9 items-center justify-center gap-1.5 bg-[#0F1D24] px-4 text-[11.5px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90 disabled:opacity-50">
            {submitting ? "Adding..." : "Add Mould Change"}
          </button>
        </div>
      </div>
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
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 border border-[#C6C6C6] bg-[#FAFAFA] px-3 py-2">
        <HiOutlineWrenchScrewdriver className="h-4 w-4 text-[#0F1D24]" />
        <h2 className="text-[13px] font-bold text-[#0F1D24]">Mould Changes</h2>
      </div>

      {mcError && <p className="text-[11.5px] font-semibold text-red-600">{mcError}</p>}

      <div className="overflow-x-auto border border-[#C6C6C6] bg-white">
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
                <tr key={mc.mould_change_id} className="border-t border-[#C6C6C6]">
                  <td className="px-2.5 py-2 font-mono font-semibold text-[#0F1D24]">{mc.machine_code}</td>
                  <td className="px-2.5 py-2 text-[#0F1D24]">{mc.change_type}</td>
                  <td className="px-2.5 py-2 text-[#0F1D24]">{mc.reason || "-"}</td>
                  <td className="px-2.5 py-2">
                    <span className={`border border-[#C6C6C6] px-2 py-0.5 text-[10.5px] font-bold ${MC_STATUS_COLORS[mc.status] || MC_STATUS_COLORS.Planned}`}>
                      {mc.status}
                    </span>
                  </td>
                  <td className="px-2.5 py-2 font-mono text-[#9B9B9B]">
                    {mc.planned_date ? formatDateLabel(toDateKey(mc.planned_date)) : "-"} {mc.planned_shift ? `· Shift ${mc.planned_shift}` : ""}
                  </td>
                  <td className="px-2.5 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {mc.status === "Planned" && (
                        <button onClick={() => handleStart(mc.mould_change_id)} title="Start"
                          className="flex h-6 w-6 items-center justify-center text-[#0F1D24] hover:bg-[#FDC94D]/25">
                          <HiOutlinePlay className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {mc.status === "In Progress" && (
                        <button onClick={() => handleComplete(mc.mould_change_id)} title="Complete"
                          className="flex h-6 w-6 items-center justify-center text-green-600 hover:bg-green-50">
                          <HiOutlineCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(mc.status === "Planned" || mc.status === "In Progress") && (
                        <button onClick={() => handleCancel(mc.mould_change_id)} title="Cancel"
                          className="flex h-6 w-6 items-center justify-center text-red-500 hover:bg-red-50">
                          <HiOutlineXMark className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {mc.status === "Planned" && (
                        <button onClick={() => handleDelete(mc.mould_change_id)} title="Delete"
                          className="flex h-6 w-6 items-center justify-center text-red-500 hover:bg-red-50">
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
  const navigate = useNavigate();
  const {
    loading, header, details, hallMachines, monthlyParts, error,
    startPlanning, submitNewPlan, removeRow, publish, reset,
  } = useDailyProductionPlan();

  // ---- Setup form state ----
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [monthlyPlanId, setMonthlyPlanId] = useState("");
  // BUG FIX: new Date().toISOString() is UTC — near midnight this could
  // roll to the wrong local day. Use the local-timezone key instead.
  const [planningDate, setPlanningDate] = useState(todayKey());
  const [hall, setHall] = useState(HALLS[0]);
  const [shift, setShift] = useState("A");

  // ---- New-plan machine-row assignment state (only used before creation) ----
  const [rowAssignments, setRowAssignments] = useState({});
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // ---- Mould change: fetched for the currently open existing plan only ----
  const mcEnabled = !!(header && !header.isNew);
  const mcFilters = useMemo(
    () => (mcEnabled ? { hall: header.hall, shift: header.shift, planningDate: toDateKey(header.planning_date) } : {}),
    [mcEnabled, header?.hall, header?.shift, header?.planning_date]
  );
  const { changes: mouldChanges, mcLoading, mcError, addChange, removeChange, start, complete, cancel } = useMouldChanges(mcFilters, mcEnabled);
  const [mcModalRow, setMcModalRow] = useState(null);

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

  const mainPadding = { paddingTop: HEADER_HEIGHT };

  // ==========================================================
  // View 1 — Setup form
  // ==========================================================
  if (!header) {
    return (
      <div className="min-h-screen bg-[#EFEFEF]">
        <Header />
        <div style={mainPadding}>
          <PageToolbar
            eyebrow="Production Planning"
            title="Daily Production Plan"
            backHref="/employee/dashboard"
            actions={
              // BUG FIX: this button was labelled "Dashboard" but called
              // window.history.back(), which doesn't reliably land on the
              // dashboard route. Now it navigates there explicitly.
              <button
                onClick={() => navigate("/employee/dashboard")}
                className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
              >
                <HiOutlineSquares2X2 className="h-3 w-3" />
                Dashboard
              </button>
            }
          />

          <main className="w-full px-3 pb-6 pt-3">
            <form onSubmit={handleStart} className="mx-auto max-w-lg border border-[#C6C6C6] bg-white">
              <div className="border-b border-[#C6C6C6] bg-[#FAFAFA] px-4 py-2.5">
                <h2 className="text-[13px] font-bold text-[#0F1D24]">Start Planning</h2>
              </div>

              <div className="p-4">
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
                  <div className="relative z-10">
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Date</label>
                    <ThemedDatePicker value={planningDate} onChange={setPlanningDate} />
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
                  className="h-9 w-full border border-[#0F1D24] bg-[#0F1D24] text-[13px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24] disabled:opacity-50">
                  {loading ? "Loading..." : "Start Planning"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================================
  // View 2 — New plan: assign parts to machines before creating
  // ==========================================================
  if (header.isNew) {
    return (
      <div className="min-h-screen bg-[#EFEFEF]">
        <Header />
        <div style={mainPadding}>
          <PageToolbar
            eyebrow="Production Planning"
            title={`New Daily Plan — ${hall} · Shift ${shift}`}
            subtitle={formatDateLabel(planningDate)}
            backHref="/employee/dashboard"
            actions={
              <button
                onClick={reset}
                className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
              >
                <HiOutlineArrowUturnLeft className="h-3 w-3" />
                Change Selection
              </button>
            }
          />

          <main className="w-full space-y-2 px-3 pb-6 pt-3">
            <div className="overflow-x-auto border border-[#C6C6C6] bg-white">
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
                      <tr key={m.id} className="border-t border-[#C6C6C6]">
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
                            className="h-7 w-20 border border-[#C6C6C6] px-1.5 text-right text-[11.5px] font-mono outline-none focus:border-[#0F1D24]"
                          />
                        </td>
                        <td className="px-2.5 py-1.5 text-right">
                          <input
                            type="number" step="0.01" min="0" value={a.plannedCycleTime || ""}
                            onChange={(e) => setAssignment(m.id, { plannedCycleTime: e.target.value })}
                            className="h-7 w-20 border border-[#C6C6C6] px-1.5 text-right text-[11.5px] font-mono outline-none focus:border-[#0F1D24]"
                          />
                        </td>
                        <td className="px-2.5 py-1.5">
                          <input
                            value={a.operatorCode || ""}
                            onChange={(e) => setAssignment(m.id, { operatorCode: e.target.value })}
                            placeholder="optional"
                            className="h-7 w-full border border-[#C6C6C6] px-1.5 text-[11.5px] outline-none focus:border-[#0F1D24]"
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
              className="border border-[#0F1D24] bg-[#FDC94D] px-4 py-2 text-[12.5px] font-bold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-50">
              {creating ? "Creating..." : "Create Plan"}
            </button>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================================
  // View 3 — Existing plan: stats + editable machine table + mould changes
  // ==========================================================
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <Header />
      <div style={mainPadding}>
        <PageToolbar
          eyebrow={header.plan_number}
          title={`${formatDateLabel(toDateKey(header.planning_date))} · ${header.hall} · Shift ${header.shift}`}
          backHref="/employee/dashboard"
          actions={
            <>
              <span className={`flex items-center bg-white px-2.5 text-[11px] font-bold ${STATUS_COLORS[header.status] || STATUS_COLORS.Draft}`}>
                {header.status}
              </span>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
              >
                <HiOutlineArrowUturnLeft className="h-3 w-3" />
                Change Selection
              </button>
              {header.status === "Draft" && (
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HiOutlinePaperAirplane className="h-3 w-3" />
                  Publish Plan
                </button>
              )}
            </>
          }
        />

        <main className="w-full space-y-1.5 px-3 pb-6 pt-3">
          {/* Stats */}
          <div className="flex flex-wrap gap-4 border border-[#C6C6C6] bg-white px-3 py-2 text-[11.5px] font-mono text-[#0F1D24]">
            <span>Total Machines: <b>{header.total_machines}</b></span>
            <span>Planned Machines: <b>{header.planned_machines}</b></span>
            <span>Total Target Qty: <b>{header.total_target_qty}</b></span>
          </div>

          {/* Machine table */}
          <div className="overflow-x-auto border border-[#C6C6C6] bg-white">
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
                    <tr key={row.daily_detail_id} className="border-t border-[#C6C6C6]">
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
                          <span className="border border-[#C6C6C6] bg-[#9B9B9B]/15 px-2 py-0.5 text-[10.5px] font-bold text-[#0F1D24]">
                            In Progress
                          </span>
                        ) : (
                          <button
                            onClick={() => setMcModalRow(row)}
                            className="mx-auto flex h-7 items-center gap-1 border border-[#C6C6C6] px-2 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#F5F5F5]"
                          >
                            <HiOutlinePlus className="h-3.5 w-3.5" />
                            Add
                          </button>
                        )}
                      </td>
                      {header.status === "Draft" && (
                        <td className="px-2.5 py-2 text-center">
                          <button onClick={() => removeRow(row.daily_detail_id)}
                            className="mx-auto flex h-6 w-6 items-center justify-center text-red-500 hover:bg-red-50">
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

          {mcModalRow && (
            <MouldChangeModal
              row={mcModalRow}
              header={header}
              monthlyParts={monthlyParts}
              onClose={() => setMcModalRow(null)}
              onSubmit={handleAddMouldChange}
            />
          )}
        </main>
      </div>
    </div>
  );
}