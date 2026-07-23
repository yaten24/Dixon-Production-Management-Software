import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  HiOutlineArrowUturnLeft,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlinePlay,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineWrenchScrewdriver,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowLeft,
  HiOutlineCog6Tooth,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
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

function PageTitleStrip({ eyebrow, title, subtitle, showBack = true, actions }) {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-[#C6C6C6] bg-white">
      {/* Gradient accent line */}
      <div
        className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)" }}
      />

      <div className="flex h-11 w-full items-center justify-between gap-3 px-3">
        {/* Left: back button + heading block — single centered row */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              title="Back"
              aria-label="Go back"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#C6C6C6] bg-white p-0 leading-none text-[#0F1D24] outline-none transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] focus-visible:ring-2 focus-visible:ring-[#FDC94D] focus-visible:ring-offset-1"
            >
              <HiOutlineArrowLeft className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}

          <div
            className={`flex min-w-0 flex-1 flex-col justify-center gap-0.5 ${
              showBack ? "border-l border-[#C6C6C6] pl-2.5" : ""
            }`}
          >
            <div className="flex items-baseline gap-2">
              {eyebrow && (
                <span className="shrink-0 text-[10px] font-bold uppercase leading-none tracking-wider text-[#0F1D24]/60">
                  {eyebrow}
                </span>
              )}
              {/* <h1 className="truncate text-[13px] font-bold leading-none tracking-tight text-[#0F1D24]">
                {title}
              </h1> */}
            </div>
            {subtitle && (
              <p className="truncate font-mono text-[10px] leading-none text-[#9B9B9B]">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: action button group — same fixed height, gap-line trick */}
        {actions && (
          <div className="flex h-7 shrink-0 items-stretch gap-px bg-[#C6C6C6] [&>*]:flex [&>*]:items-center [&>*]:whitespace-nowrap">
            {actions}
          </div>
        )}
      </div>
    </header>
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
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
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
// Themed custom date picker — replaces the native <input type="date">
// with a calendar panel matching ThemedSelect's visual language.
// Value/onChange use plain "YYYY-MM-DD" strings, same as native input.
//
// NOTE: this panel is `position: absolute` and must never sit inside
// an ancestor with `overflow-hidden` / `overflow-auto` — that clips
// the popup instead of letting it float over the page. Give the
// popup a high z-index (z-50) so it always sits above cards/tables.
// ============================================================
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDateDisplay(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return `${String(d).padStart(2, "0")} ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
}

function toISO(year, month, day) {
  const dt = new Date(year, month, day);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

function ThemedDatePicker({ value, onChange, disabled = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(`${value}T00:00:00`) : new Date();
    return isNaN(d) ? new Date() : d;
  });
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (value) {
      const d = new Date(`${value}T00:00:00`);
      if (!isNaN(d)) setViewDate(d);
    }
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = (d) => value === toISO(year, month, d);
  const isToday = (d) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d;
  };

  const goToday = () => {
    const t = new Date();
    setViewDate(t);
    onChange(toISO(t.getFullYear(), t.getMonth(), t.getDate()));
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
        <span className={value ? "truncate font-mono text-[#0F1D24]" : "truncate text-[#9B9B9B]"}>
          {value ? formatDateDisplay(value) : "-- select date --"}
        </span>
        <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0 text-[#9B9B9B]" />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-64 border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
          <div className="flex items-center justify-between bg-[#0F1D24] px-2 py-1.5">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="flex h-6 w-6 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10"
            >
              ‹
            </button>
            <span className="text-[11.5px] font-bold text-white">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="flex h-6 w-6 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-[#C6C6C6] p-px">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w} className="bg-[#FAFAFA] py-1 text-center text-[9px] font-bold uppercase text-[#9B9B9B]">
                {w}
              </div>
            ))}
            {cells.map((d, idx) => (
              <button
                type="button"
                key={idx}
                disabled={!d}
                onClick={() => {
                  onChange(toISO(year, month, d));
                  setOpen(false);
                }}
                className={`h-7 bg-white text-[11px] font-medium transition-colors duration-100
                  ${!d ? "cursor-default" : "hover:bg-[#FDC94D]/25"}
                  ${d && isSelected(d) ? "bg-[#0F1D24] text-[#FDC94D] hover:bg-[#0F1D24]" : "text-[#0F1D24]"}
                  ${d && isToday(d) && !isSelected(d) ? "font-bold underline decoration-[#FDC94D] decoration-2 underline-offset-2" : ""}`}
              >
                {d || ""}
              </button>
            ))}
          </div>

          <div className="border-t border-[#C6C6C6] px-2 py-1.5 text-right">
            <button
              type="button"
              onClick={goToday}
              className="text-[10.5px] font-semibold text-[#0F1D24] hover:underline"
            >
              Today
            </button>
          </div>
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

          <div>
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
                    {mc.planned_date || "-"} {mc.planned_shift ? `· Shift ${mc.planned_shift}` : ""}
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
  const [activeMachineId, setActiveMachineId] = useState(null); // master-detail selection for View 2

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

  // Default the master-detail selection to the first machine once the hall's
  // machine list loads for a new plan.
  useEffect(() => {
    if (header?.isNew && hallMachines.length > 0 && activeMachineId === null) {
      setActiveMachineId(hallMachines[0].id);
    }
    if (!header?.isNew) setActiveMachineId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header?.isNew, hallMachines]);

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

  const clearAssignment = (machineId) => {
    setRowAssignments((prev) => {
      const next = { ...prev };
      delete next[machineId];
      return next;
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

  const selectedMonthlyPlan = monthlyPlans.find((p) => String(p.monthly_plan_id) === String(monthlyPlanId));

  // ==========================================================
  // View 1 — Setup form (desktop-style: context sidebar + form panel)
  // ==========================================================
  if (!header) {
    return (
      <div className="min-h-screen bg-[#EFEFEF]">
        <PageTitleStrip
          eyebrow="Production Planning"
          title="Daily Production Plan"
          subtitle="Start a new plan"
        />

        <main className="w-full">
          {/* NOTE: no overflow-hidden here — the ThemedDatePicker popup is
              position:absolute and would get clipped by an ancestor that
              hides overflow. Sharp-corner panels don't need it anyway. */}
          <form
            onSubmit={handleStart}
            className="mx-auto grid max-w-4xl grid-cols-1 gap-px border border-[#C6C6C6] bg-[#C6C6C6] md:grid-cols-[260px_1fr]"
          >
            {/* Context / summary sidebar */}
            <div className="bg-[#0F1D24] p-5 text-white">
              <div className="mb-1 flex items-center gap-2">
                <HiOutlineClipboardDocumentList className="h-4 w-4 text-[#FDC94D]" />
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#FDC94D]">New Daily Plan</h2>
              </div>
              <p className="text-[11.5px] leading-relaxed text-white/70">
                Select a monthly plan and the hall, date and shift to pull in that hall's machines
                for allocation.
              </p>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">Monthly Plan</p>
                  <p className="text-[12.5px] font-semibold">{selectedMonthlyPlan?.plan_number || "Not selected"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">Date</p>
                  <p className="font-mono text-[12.5px] font-semibold">{formatDateDisplay(planningDate)}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">Hall</p>
                    <p className="text-[12.5px] font-semibold">{hall}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">Shift</p>
                    <p className="text-[12.5px] font-semibold">Shift {shift}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div className="bg-white">
              <div className="border-b border-[#C6C6C6] bg-[#FAFAFA] px-4 py-2.5">
                <h2 className="text-[13px] font-bold text-[#0F1D24]">Plan Setup</h2>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Monthly Plan</label>
                  <ThemedSelect
                    value={monthlyPlanId}
                    onChange={setMonthlyPlanId}
                    options={monthlyPlans.map((p) => ({ value: p.monthly_plan_id, label: p.plan_number }))}
                    placeholder="-- select monthly plan --"
                  />
                </div>

                <div className="h-px w-full bg-[#C6C6C6]" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
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

                {error && <p className="text-[11.5px] font-semibold text-red-600">{error}</p>}
                {!monthlyPlanId && (
                  <p className="text-[10.5px] text-[#9B9B9B]">Pick a monthly plan to continue.</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-px bg-[#C6C6C6] border-t border-[#C6C6C6]">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-10 items-center justify-center bg-white px-4 text-[12px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !monthlyPlanId}
                  className="flex h-10 items-center justify-center bg-[#0F1D24] px-5 text-[12px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Start Planning"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    );
  }

  // ==========================================================
  // View 2 — New plan: master-detail machine assignment
  // Left: scrollable list of the hall's machines with an
  // assigned/unassigned indicator. Right: a focused form to
  // set Part, Target Qty, Planned CT and Operator Code for
  // whichever machine is selected — the classic desktop-app
  // "list + detail pane" pattern instead of one dense table row.
  // ==========================================================
  if (header.isNew) {
    const assignedCount = Object.keys(rowAssignments).filter(
      (id) => rowAssignments[id]?.monthlyDetailId && rowAssignments[id]?.targetQty
    ).length;
    const activeMachine = hallMachines.find((m) => m.id === activeMachineId);
    const activeAssignment = activeMachineId ? rowAssignments[activeMachineId] || {} : {};

    const goToMachine = (offset) => {
      const idx = hallMachines.findIndex((m) => m.id === activeMachineId);
      const next = hallMachines[idx + offset];
      if (next) setActiveMachineId(next.id);
    };

    return (
      <div className="min-h-screen bg-[#EFEFEF]">
        <PageTitleStrip
          eyebrow="Production Planning"
          title={`New Daily Plan — ${hall} · Shift ${shift}`}
          subtitle={`${planningDate} · ${assignedCount} of ${hallMachines.length} machines assigned`}
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

        <main className="w-full">
          <div className="grid grid-cols-1 gap-px border border-[#C6C6C6] bg-[#C6C6C6] md:grid-cols-[280px_1fr]">
            {/* Machine list */}
            <div className="max-h-[520px] overflow-y-auto bg-white">
              <div className="sticky top-0 border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 py-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
                  Hall Machines
                </h2>
              </div>
              {hallMachines.map((m) => {
                const a = rowAssignments[m.id];
                const assigned = !!(a?.monthlyDetailId && a?.targetQty);
                const isActive = m.id === activeMachineId;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setActiveMachineId(m.id)}
                    className={`flex w-full items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2 text-left transition-colors duration-100
                      ${isActive ? "bg-[#0F1D24] text-[#FDC94D]" : "bg-white text-[#0F1D24] hover:bg-[#FAFAFA]"}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[11.5px] font-semibold">{m.machine_code}</p>
                      <p className={`truncate text-[10.5px] ${isActive ? "text-[#FDC94D]/70" : "text-[#9B9B9B]"}`}>
                        {m.machine_name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 border px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide
                        ${assigned
                          ? isActive
                            ? "border-[#FDC94D]/60 bg-[#FDC94D]/10 text-[#FDC94D]"
                            : "border-green-600/30 bg-green-50 text-green-700"
                          : isActive
                            ? "border-white/30 bg-white/10 text-white/70"
                            : "border-[#C6C6C6] bg-[#F5F5F5] text-[#9B9B9B]"}`}
                    >
                      {assigned ? "Assigned" : "Empty"}
                    </span>
                  </button>
                );
              })}
              {hallMachines.length === 0 && (
                <p className="px-3 py-6 text-center text-[11.5px] text-[#9B9B9B]">No machines found for this hall.</p>
              )}
            </div>

            {/* Detail form */}
            <div className="bg-white">
              {activeMachine ? (
                <>
                  <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-[#FAFAFA] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <HiOutlineCog6Tooth className="h-4 w-4 text-[#0F1D24]" />
                      <div>
                        <h2 className="text-[13px] font-bold text-[#0F1D24]">
                          {activeMachine.machine_code} <span className="font-normal text-[#9B9B9B]">{activeMachine.machine_name}</span>
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-px bg-[#C6C6C6]">
                      <button
                        type="button"
                        onClick={() => goToMachine(-1)}
                        title="Previous machine"
                        className="flex h-7 w-7 items-center justify-center bg-white text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
                      >
                        <HiOutlineArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToMachine(1)}
                        title="Next machine"
                        className="flex h-7 w-7 items-center justify-center bg-white text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
                      >
                        <HiOutlineArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Part</label>
                      <ThemedSelect
                        value={activeAssignment.monthlyDetailId || ""}
                        onChange={(val) => handlePartPick(activeMachineId, val)}
                        options={monthlyParts.map((p) => ({ value: p.monthly_detail_id, label: `${p.part_number} - ${p.part_name}` }))}
                        placeholder="-- select part --"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Target Qty</label>
                        <input
                          type="number" min="1" value={activeAssignment.targetQty || ""}
                          onChange={(e) => setAssignment(activeMachineId, { targetQty: e.target.value })}
                          placeholder="0"
                          className="h-9 w-full border border-[#C6C6C6] px-2.5 text-[12.5px] font-mono outline-none focus:border-[#0F1D24]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Planned Cycle Time</label>
                        <input
                          type="number" step="0.01" min="0" value={activeAssignment.plannedCycleTime || ""}
                          onChange={(e) => setAssignment(activeMachineId, { plannedCycleTime: e.target.value })}
                          placeholder="seconds"
                          className="h-9 w-full border border-[#C6C6C6] px-2.5 text-[12.5px] font-mono outline-none focus:border-[#0F1D24]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Operator Code (optional)</label>
                      <input
                        value={activeAssignment.operatorCode || ""}
                        onChange={(e) => setAssignment(activeMachineId, { operatorCode: e.target.value })}
                        placeholder="e.g. OP-014"
                        className="h-9 w-full border border-[#C6C6C6] px-2.5 text-[12.5px] outline-none focus:border-[#0F1D24]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-px bg-[#C6C6C6] border-t border-[#C6C6C6]">
                    <button
                      type="button"
                      onClick={() => clearAssignment(activeMachineId)}
                      className="flex h-10 items-center justify-center gap-1.5 bg-white px-4 text-[12px] font-semibold text-red-600 transition-colors duration-100 hover:bg-red-50"
                    >
                      <HiOutlineTrash className="h-3.5 w-3.5" />
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => goToMachine(1)}
                      className="flex h-10 items-center justify-center gap-1.5 bg-[#0F1D24] px-5 text-[12px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90"
                    >
                      Save &amp; Next
                      <HiOutlineArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-10 text-[11.5px] text-[#9B9B9B]">
                  Select a machine from the list to assign a part.
                </div>
              )}
            </div>
          </div>

          {(formError || error) && <p className="text-[11.5px] font-semibold text-red-600">{formError || error}</p>}

          <button onClick={handleCreatePlan} disabled={creating}
            className="border border-[#0F1D24] bg-[#FDC94D] px-4 py-2 text-[12.5px] font-bold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-50">
            {creating ? "Creating..." : `Create Plan (${assignedCount} machine${assignedCount === 1 ? "" : "s"})`}
          </button>
        </main>
      </div>
    );
  }

  // ==========================================================
  // View 3 — Existing plan: stats + editable machine table + mould changes
  // ==========================================================
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <PageTitleStrip
        eyebrow={header.plan_number}
        title={`${header.planning_date} · ${header.hall} · Shift ${header.shift}`}
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
  );
}