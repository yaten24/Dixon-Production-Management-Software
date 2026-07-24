import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  FaClipboardList,
  FaSearch,
  FaChevronRight,
  FaChevronDown,
  FaChevronLeft,
  FaSave,
  FaUndo,
  FaIndustry,
  FaCube,
  FaClock,
  FaExclamationTriangle,
  FaSyncAlt,
  FaCheckCircle,
  FaClipboardCheck,
  FaArrowLeft,
  FaCheck,
  FaPlus,
  FaTrash,
  FaUser,
  FaBarcode,
  FaTachometerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import { getOperatorByCode, createOperator, searchOperators } from "../api/operatorApi";
import { searchParts, addPartQuick } from "../api/partApi";
import useProductionEntry from "../hooks/useProductionEntry";
// NOTE: MouldChangeSection is no longer used — the "Mould Change" tab is
// now built inline in this file (see the `activeTab === "mould"` block
// near the bottom) using only the formData field names that were already
// referenced elsewhere in this file (mouldPart, mouldStandardCycleTime,
// new_part_id, new_part_number, mouldReject). If the original
// MouldChangeSection tracked additional fields (e.g. the old/removed
// mould, downtime minutes, technician), those aren't reproduced here
// since their exact field names weren't visible in this file — let me
// know the field names and I'll wire them in.

// ============================================================
// THEME TOKENS
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";

const HALLS = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C8"];
const SHIFTS = [
  { value: "A", label: "Shift A (Day)" },
  { value: "B", label: "Shift B (Night)" },
];

const TABS = [
  { key: "entry", label: "Production Entry", icon: FaClipboardList },
  { key: "mould", label: "Mould Change", icon: FaSyncAlt },
];

// ASSUMPTION: the form captures one time-slot entry per machine and the
// codebase doesn't expose an explicit "planned run minutes" field, so OEE's
// Availability is computed against a fixed 60-minute slot. If a time slot in
// your data represents a different duration, change this constant (or wire
// it to a real field once one exists) and the OEE panel below updates
// automatically. It's also used as the Loss Time breakup's cap-check limit
// (see the ReasonBreakup bug-fix note further down).
const PLANNED_MINUTES_PER_SLOT = 60;

const generatePartNumber = (base) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds())}`;
  const cleanBase = (base || "PART").trim().toUpperCase().replace(/\s+/g, "-");
  return `${cleanBase}-${datePart}-${timePart}`;
};

// ============================================================
// Date helpers (used by CustomDatePicker below)
// ============================================================
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseDateKey = (key) => {
  if (!key) return new Date();
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const formatDateDisplay = (key) =>
  !key
    ? "Select date"
    : parseDateKey(key).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// ============================================================
// Themed dropdown — flat bordered, no motion
// ============================================================
function ThemedSelect({ value, onChange, options, icon: Icon, placeholder = "Select", disabled = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center gap-2 border px-2.5 text-[12.5px] font-semibold text-[#0F1D24] outline-none transition-colors duration-100 ${
          disabled ? "cursor-not-allowed border-[#C6C6C6] bg-[#F5F5F5] text-[#9B9B9B]" : open ? "border-[#0F1D24] bg-white" : "border-[#C6C6C6] bg-white hover:border-[#0F1D24]"
        }`}
      >
        {Icon && <Icon className="flex-shrink-0 text-[12px] text-[#0F1D24]/70" />}
        <span className={`min-w-0 flex-1 truncate text-left ${!selected ? "font-medium text-[#9B9B9B]" : ""}`}>
          {selected?.label || placeholder}
        </span>
        <FaChevronDown className={`flex-shrink-0 text-[9px] text-[#9B9B9B] transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-56 w-full overflow-y-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
          {options.length === 0 && <div className="px-2.5 py-2 text-[11.5px] text-[#9B9B9B]">No options</div>}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`flex w-full items-center gap-2 border-b border-[#C6C6C6] px-2.5 py-1.5 text-left text-[12px] font-medium last:border-b-0 transition-colors duration-100 ${
                o.value === value ? "bg-[#0F1D24] text-[#FDC94D]" : "text-[#0F1D24] hover:bg-[#FDC94D]/20"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CustomDatePicker — desktop-style themed date picker, replacing
// the native <input type="date">. The calendar panel is portaled
// to document.body with `position: fixed` coordinates (rather than
// `absolute` inside the trigger) so it never gets clipped by the
// scrollable <main> panel this field sits inside.
// ============================================================
function CustomDatePicker({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDateKey(value));
  const [coords, setCoords] = useState(null);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => { setViewDate(parseDateKey(value)); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCoords = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const panelWidth = 240; // w-60
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    setCoords({ top: rect.bottom + 4, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateCoords();
    const reposition = () => updateCoords();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, updateCoords]);

  const selectedKey = value || "";
  const todayKey = toDateKey(new Date());

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) cells.push(new Date(year, month, day));
    return cells;
  }, [viewDate]);

  const changeMonth = (delta) => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  const handleSelect = (date) => { onChange(toDateKey(date)); setOpen(false); };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center gap-2 border px-2.5 text-[12.5px] font-semibold outline-none transition-colors duration-100 ${
          disabled ? "cursor-not-allowed border-[#C6C6C6] bg-[#F5F5F5] text-[#9B9B9B]" : open ? "border-[#0F1D24] bg-white text-[#0F1D24]" : "border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24]"
        }`}
      >
        <FaCalendarAlt className="flex-shrink-0 text-[11px] text-[#0F1D24]/70" />
        <span className="min-w-0 flex-1 truncate text-left">{formatDateDisplay(selectedKey)}</span>
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          style={{ position: "fixed", top: coords.top, left: coords.left }}
          className="z-[9999] w-60 border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.15)]"
        >
          <div className="flex items-center justify-between bg-[#0F1D24] px-2 py-1.5">
            <button type="button" onClick={() => changeMonth(-1)} className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10">
              <FaChevronLeft className="text-[10px]" />
            </button>
            <span className="text-[11px] font-bold text-white">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            <button type="button" onClick={() => changeMonth(1)} className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10">
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-[#C6C6C6] p-px">
            {WEEKDAYS.map((w, i) => (
              <div key={`${w}-${i}`} className="flex h-5 items-center justify-center bg-[#FAFAFA] text-[9px] font-bold uppercase text-[#9B9B9B]">
                {w}
              </div>
            ))}
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="h-6 bg-white" />;
              const key = toDateKey(date);
              const isSelected = key === selectedKey, isToday = key === todayKey;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => handleSelect(date)}
                  className={`h-6 bg-white text-[10px] font-semibold transition-colors duration-100 hover:bg-[#FDC94D]/25
                    ${isSelected ? "bg-[#0F1D24] text-[#FDC94D] hover:bg-[#0F1D24]" : "text-[#0F1D24]"}
                    ${isToday && !isSelected ? "font-bold underline decoration-[#FDC94D] decoration-2 underline-offset-2" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[#C6C6C6] px-2 py-1.5">
            <button type="button" onClick={() => handleSelect(new Date())} className="text-[10.5px] font-semibold text-[#0F1D24] hover:underline">
              Today
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-[10.5px] font-medium text-[#9B9B9B] hover:text-[#0F1D24]">
              Close
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ============================================================
// Field — label + input wrapper
// ============================================================
function Field({ label, required, suffix, children }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-[#0F1D24]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {suffix ? (
        <div className="flex border border-[#C6C6C6] bg-white">
          <div className="flex-1">{children}</div>
          <span className="flex items-center border-l border-[#C6C6C6] bg-[#FAFAFA] px-2 text-[11px] font-semibold text-[#9B9B9B]">
            {suffix}
          </span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

const numInputClass =
  "h-9 w-full border-0 bg-transparent px-2.5 text-[12.5px] font-mono font-semibold text-[#0F1D24] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const plainInputClass =
  "h-9 w-full border border-[#C6C6C6] bg-white px-2.5 text-[12.5px] font-mono font-semibold text-[#0F1D24] outline-none transition-colors duration-100 focus:border-[#0F1D24] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const readonlyBoxClass =
  "flex h-9 items-center border border-[#C6C6C6] bg-[#FAFAFA] px-2.5 text-[12.5px] font-mono font-semibold text-[#0F1D24]";
const textInputClass =
  "h-9 w-full border border-[#C6C6C6] bg-white px-2.5 text-[12.5px] font-semibold text-[#0F1D24] outline-none transition-colors duration-100 focus:border-[#0F1D24]";

// ============================================================
// ReasonBreakup — shared row-based dropdown breakup used for
// Reject, Loss Time, and Mould Reject. Only rows the user actually
// added take up space.
//
// `valueField` tells the component which key on each row holds the
// number ("qty" for Reject/Mould Reject, "minutes" for Loss Time).
// This used to be auto-detected from `rows[0]`, which broke down for
// an empty list or any row shape that didn't happen to carry the
// expected key — now it's explicit, so it can never silently write
// to (or total up) the wrong field.
//
// `matchMode` controls how the total is validated against
// `matchAgainst`:
//   - "equal" (Reject / Mould Reject): breakup total must equal the
//     entry's total reject qty.
//   - "max" (Loss Time): there's no separate "total loss minutes"
//     field to reconcile against, so this is a cap check instead —
//     breakup total must not exceed the planned slot length. This
//     replaces the previous `matchAgainst={0}` wiring, which made
//     `matchValue > 0` always false and silently disabled the
//     mismatch warning for Loss Time entirely (the actual bug).
// ============================================================
function ReasonBreakup({ title, rows, reasonOptions, updateRow, addRow, removeRow, unitLabel, totalLabel, valueField, matchAgainst, matchMode = "equal" }) {
  const total = rows.reduce((sum, r) => sum + (Number(r[valueField]) || 0), 0);
  const matchValue = Number(matchAgainst) || 0;
  const isEqualMode = matchMode === "equal";
  const isMatched = isEqualMode && matchValue > 0 && matchValue === total;
  const isMismatched = isEqualMode
    ? matchValue > 0 && matchValue !== total
    : matchValue > 0 && total > matchValue;

  return (
    <div className="flex flex-col border border-[#C6C6C6] bg-white">
      <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 py-2">
        <h3 className="text-[12.5px] font-bold text-[#0F1D24]">{title}</h3>
        <button
          type="button"
          onClick={addRow}
          className="flex h-7 items-center gap-1 border border-[#0F1D24] bg-[#0F1D24] px-2 text-[10.5px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
        >
          <FaPlus className="text-[9px]" />
          Add Reason
        </button>
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        {rows.length === 0 ? (
          <p className="border border-dashed border-[#C6C6C6] bg-[#FAFAFA] py-3 text-center text-[11px] text-[#9B9B9B]">
            No reasons added — click "Add Reason".
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-end gap-1.5">
                <div className="min-w-0 flex-1">
                  <ThemedSelect
                    value={row.reason}
                    onChange={(v) => updateRow(idx, "reason", v)}
                    options={reasonOptions.map((r) => ({ value: r, label: r }))}
                    placeholder="-- select reason --"
                  />
                </div>
                <div className="w-24 flex-shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={row[valueField]}
                    placeholder={unitLabel}
                    onChange={(e) => updateRow(idx, valueField, e.target.value)}
                    className={plainInputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-red-300 bg-red-50 text-red-600 transition-colors duration-100 hover:bg-red-600 hover:text-white"
                >
                  <FaTrash className="text-[11px]" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5">
          <div className="border border-[#C6C6C6] bg-[#FAFAFA] px-3 py-1.5 font-mono text-[11.5px] font-bold text-[#0F1D24]">
            {totalLabel}: {total}
          </div>
          {isMismatched && (
            <span className="border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700">
              {isEqualMode
                ? `Mismatch: entry (${matchValue}) ≠ breakup (${total})`
                : `Breakup (${total} min) exceeds the planned slot (${matchValue} min)`}
            </span>
          )}
          {isMatched && (
            <span className="border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
              <FaCheck className="mr-1 inline text-[9px]" />Matched
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// OeeCard — flat stat card used in the Availability/Performance/
// Quality/OEE panel, with the formula shown as a caption so it's
// always visible next to the number it produced.
// ============================================================
function OeeCard({ label, value, formula, tone = "#0F1D24" }) {
  return (
    <div className="relative border border-[#C6C6C6] bg-white p-3">
      {/* <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: tone }} /> */}
      <p className="text-[9px] font-bold uppercase leading-none tracking-wider text-[#9B9B9B]">{label}</p>
      <p className="mt-1.5 font-mono text-[22px] font-extrabold leading-none tabular-nums text-[#0F1D24]">{value}%</p>
      <p className="mt-1.5 text-[9.5px] leading-snug text-[#9B9B9B]">{formula}</p>
    </div>
  );
}

// ============================================================
// Main page — fully wired to useProductionEntry + real APIs
// ============================================================
const AdvProductionEntry = () => {
  const {
    formData, handleChange, handleHallChange, handleShiftChange,
    shiftATimes, shiftBTimes,
    filteredMachines, currentMachine, machineEntries,
    currentMachineIndex, setCurrentMachineIndex,
    progress, efficiency,
    totalRejectQty, totalMouldRejectQty, totalLossMinutes,
    rejectReasons, mouldRejectReasons, lossReasons, lossTimeReasonOptions,
    addCustomRejectReason, removeCustomRejectReason, updateRejectReason,
    addCustomMouldRejectReason, removeCustomMouldRejectReason, updateMouldRejectReason,
    addLossReason, removeLossReason, updateLossReason,
    showMouldSection, handleMouldToggle,
    saveCurrentMachine, loadMachineData,
    previousMachine, nextMachine, finalSubmit,
    loadingMaster, masterError, submitting, submitError,
    plan, planLoading, planError,
  } = useProductionEntry();

  const [operatorDetails, setOperatorDetails] = useState(null);
  const [operatorNotFound, setOperatorNotFound] = useState(false);
  const [addingOperator, setAddingOperator] = useState(false);
  const [operatorSuggestions, setOperatorSuggestions] = useState([]);
  const [noOperatorResults, setNoOperatorResults] = useState(false);

  const [partSuggestions, setPartSuggestions] = useState([]);
  const [noPartResults, setNoPartResults] = useState(false);
  const [addingPart, setAddingPart] = useState(false);

  const [mouldPartSuggestions, setMouldPartSuggestions] = useState([]);
  const [noMouldPartResults, setNoMouldPartResults] = useState(false);
  const [addingMouldPart, setAddingMouldPart] = useState(false);

  const [submitResult, setSubmitResult] = useState(null);
  const [activeTab, setActiveTab] = useState("entry");
  const [machineSearch, setMachineSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddOperator, setShowAddOperator] = useState(false);
  const [newOperator, setNewOperator] = useState({ operator_name: "", shift: "", hall: "" });
  const [addOperatorError, setAddOperatorError] = useState(null);
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPart, setNewPart] = useState({ part_name: "", actual_cycle_time: "" });
  const [addPartError, setAddPartError] = useState(null);

  // Mould-tab "add new part" quick-create UI state (previously lived
  // inside the now-removed MouldChangeSection component).
  const [showAddMouldPart, setShowAddMouldPart] = useState(false);
  const [newMouldPart, setNewMouldPart] = useState({ part_name: "", standard_cycle_time: "" });
  const [addMouldPartError, setAddMouldPartError] = useState(null);

  // Reason-name pools for the dropdown breakups — derived from the
  // hook's already-loaded master reason rows (rejectReasons/lossReasons
  // are pre-seeded with every master reason as a row on mount).
  const rejectReasonNames = [...new Set(rejectReasons.filter((r) => !r.custom).map((r) => r.reason))];
  const lossReasonNames = lossTimeReasonOptions;

  // BUG FIX: rows added via "Add Reason" start out with an empty
  // `reason` (the user hasn't picked one from the dropdown yet). The old
  // filter was `r.reason && (...)`, which requires a reason to already be
  // selected — so a freshly-added blank row failed the check and was
  // filtered out immediately, making the "Add Reason" button appear to do
  // nothing. Custom rows (`r.custom`) are now always shown so the user can
  // actually fill them in; only the pre-seeded master rows still require a
  // reason + qty before they take up space.
  const activeRejectRows = rejectReasons
    .map((r, i) => ({ ...r, __idx: i }))
    .filter((r) => r.custom || (r.reason && Number(r.qty) > 0));
  const activeLossRows = lossReasons
    .map((r, i) => ({ ...r, __idx: i }))
    .filter((r) => r.custom || r.reason);

  const addRejectRow = () => addCustomRejectReason();
  const removeRejectRow = (visibleIdx) => {
    const realIdx = activeRejectRows[visibleIdx].__idx;
    removeCustomRejectReason(realIdx);
  };
  const updateRejectRow = (visibleIdx, field, value) => {
    const realIdx = activeRejectRows[visibleIdx].__idx;
    updateRejectReason(realIdx, field, value);
  };

  const addLossRow = () => addLossReason();
  const removeLossRow = (visibleIdx) => {
    const realIdx = activeLossRows[visibleIdx].__idx;
    removeLossReason(realIdx);
  };
  const updateLossRow = (visibleIdx, field, value) => {
    const realIdx = activeLossRows[visibleIdx].__idx;
    updateLossReason(realIdx, field, value);
  };

  // Same bug + same fix for the mould-reject breakup rows.
  const activeMouldRejectRows = mouldRejectReasons
    .map((r, i) => ({ ...r, __idx: i }))
    .filter((r) => r.custom || (r.reason && Number(r.qty) > 0));

  // ================= OPERATOR =================
  const fetchOperator = async (operatorCode) => {
    if (!operatorCode) {
      setOperatorDetails(null);
      setOperatorNotFound(false);
      handleChange({ target: { name: "operator_id", value: null } });
      return;
    }
    try {
      const res = await getOperatorByCode(operatorCode);
      if (res.success) {
        setOperatorDetails(res.data);
        setOperatorNotFound(false);
        handleChange({ target: { name: "operator_id", value: res.data.id } });
      } else {
        setOperatorDetails(null);
        setOperatorNotFound(true);
        handleChange({ target: { name: "operator_id", value: null } });
      }
    } catch (error) {
      setOperatorDetails(null);
      setOperatorNotFound(true);
      handleChange({ target: { name: "operator_id", value: null } });
    }
  };

  useEffect(() => {
    if (formData.operatorId && !formData.operator_id) fetchOperator(formData.operatorId);
    setShowAddOperator(false);
    setAddOperatorError(null);
    setNewOperator({ operator_name: "", shift: "", hall: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMachine?.id]);

  const fetchOperatorSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setOperatorSuggestions([]);
      setNoOperatorResults(false);
      return;
    }
    try {
      const res = await searchOperators(keyword);
      if (res.success && res.data.length) {
        setOperatorSuggestions(res.data);
        setNoOperatorResults(false);
      } else {
        setOperatorSuggestions([]);
        setNoOperatorResults(true);
      }
    } catch {
      setOperatorSuggestions([]);
      setNoOperatorResults(true);
    }
  };

  const selectOperator = (op) => {
    setOperatorDetails(op);
    setOperatorNotFound(false);
    setNoOperatorResults(false);
    handleChange({ target: { name: "operatorId", value: op.operator_code } });
    handleChange({ target: { name: "operator_id", value: op.id } });
    setOperatorSuggestions([]);
  };

  const handleOperatorChange = (e) => {
    handleChange(e);
    handleChange({ target: { name: "operator_id", value: null } });
    if (formData.plan_detail_id) handleChange({ target: { name: "plan_detail_id", value: null } });
    const value = e.target.value;
    if (!value || value.trim().length < 2) {
      setOperatorSuggestions([]);
      return;
    }
    fetchOperatorSuggestions(value);
  };

  const handleAddOperator = async () => {
    if (!newOperator.operator_name.trim() || !newOperator.shift || !newOperator.hall) {
      setAddOperatorError("Name, shift and hall are required.");
      return;
    }
    setAddOperatorError(null);
    setAddingOperator(true);
    try {
      const res = await createOperator({
        operator_name: newOperator.operator_name.trim(),
        operator_code: formData.operatorId,
        shift: newOperator.shift,
        hall: newOperator.hall,
      });
      if (res.success) {
        setOperatorDetails({ id: res.insertId, operator_name: newOperator.operator_name.trim(), shift: newOperator.shift, hall: newOperator.hall });
        setOperatorNotFound(false);
        handleChange({ target: { name: "operator_id", value: res.insertId } });
        setShowAddOperator(false);
      } else {
        setAddOperatorError(res.message || "Failed to add operator.");
      }
    } catch (error) {
      setAddOperatorError(error?.response?.data?.message || error.message || "Failed to add operator.");
    } finally {
      setAddingOperator(false);
    }
  };

  // ================= PART (main entry) =================
  const fetchPartSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setPartSuggestions([]);
      setNoPartResults(false);
      return;
    }
    try {
      const res = await searchParts(keyword);
      if (res.success && res.data.length) {
        setPartSuggestions(res.data);
        setNoPartResults(false);
      } else {
        setPartSuggestions([]);
        setNoPartResults(true);
      }
    } catch {
      setPartSuggestions([]);
      setNoPartResults(true);
    }
  };

  const handlePartChange = (e) => {
    handleChange(e);
    handleChange({ target: { name: "part_id", value: null } });
    handleChange({ target: { name: "standardCycleTime", value: "" } });
    handleChange({ target: { name: "partNumber", value: "" } });
    if (formData.plan_detail_id) handleChange({ target: { name: "plan_detail_id", value: null } });
    const value = e.target.value;
    if (value.length < 2) {
      setPartSuggestions([]);
      setShowAddPart(false);
      return;
    }
    fetchPartSuggestions(value);
    setShowAddPart(false);
  };

  const selectPart = (part) => {
    handleChange({ target: { name: "part", value: part.part_name } });
    handleChange({ target: { name: "part_id", value: part.id } });
    handleChange({ target: { name: "partNumber", value: part.part_number || "" } });
    handleChange({ target: { name: "standardCycleTime", value: part.standard_cycle_time } });
    handleChange({ target: { name: "actualCycleTime", value: part.actual_cycle_time || part.standard_cycle_time || "" } });
    setPartSuggestions([]);
    setShowAddPart(false);
  };

  const handleAddPart = async () => {
    if (!newPart.part_name.trim() || !Number(newPart.actual_cycle_time)) {
      setAddPartError("Part name and actual cycle time are required.");
      return;
    }
    setAddPartError(null);
    setAddingPart(true);
    try {
      const partPayload = {
        part_name: newPart.part_name,
        actual_cycle_time: newPart.actual_cycle_time,
        part_number: generatePartNumber(newPart.part_name),
      };
      const res = await addPartQuick(partPayload);
      if (res.success) {
        handleChange({ target: { name: "part", value: partPayload.part_name } });
        handleChange({ target: { name: "part_id", value: res.insertId } });
        handleChange({ target: { name: "partNumber", value: partPayload.part_number } });
        handleChange({ target: { name: "standardCycleTime", value: res.data?.standard_cycle_time ?? partPayload.actual_cycle_time } });
        setPartSuggestions([]);
        setShowAddPart(false);
      } else {
        setAddPartError(res.message || "Failed to add part.");
      }
    } catch (error) {
      setAddPartError(error?.response?.data?.message || error.message || "Failed to add part.");
    } finally {
      setAddingPart(false);
    }
  };

  // ================= PART (mould new part) =================
  const fetchMouldPartSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setMouldPartSuggestions([]);
      setNoMouldPartResults(false);
      return;
    }
    try {
      const res = await searchParts(keyword);
      if (res.success && res.data.length) {
        setMouldPartSuggestions(res.data);
        setNoMouldPartResults(false);
      } else {
        setMouldPartSuggestions([]);
        setNoMouldPartResults(true);
      }
    } catch {
      setMouldPartSuggestions([]);
      setNoMouldPartResults(true);
    }
  };

  const handleAddMouldPart = async (newP) => {
    setAddingMouldPart(true);
    try {
      const partPayload = {
        part_name: newP.part_name,
        part_number: newP.part_number || generatePartNumber(newP.part_name),
        actual_cycle_time: newP.standard_cycle_time,
      };
      const res = await addPartQuick(partPayload);
      if (res.success) {
        handleChange({ target: { name: "mouldPart", value: partPayload.part_name } });
        handleChange({ target: { name: "mouldStandardCycleTime", value: res.data?.standard_cycle_time ?? newP.standard_cycle_time } });
        handleChange({ target: { name: "new_part_id", value: res.insertId } });
        handleChange({ target: { name: "new_part_number", value: partPayload.part_number } });
        setMouldPartSuggestions([]);
        return { success: true };
      }
      return { success: false, message: res.message || "Failed to add part." };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || error.message || "Failed to add part." };
    } finally {
      setAddingMouldPart(false);
    }
  };

  // Mould "new part" search input + selection + quick-add submit — the
  // same pattern as the main Part field above, now inlined here since
  // MouldChangeSection was removed.
  const handleMouldPartChange = (e) => {
    handleChange(e); // name="mouldPart"
    handleChange({ target: { name: "new_part_id", value: null } });
    handleChange({ target: { name: "new_part_number", value: "" } });
    handleChange({ target: { name: "mouldStandardCycleTime", value: "" } });
    const value = e.target.value;
    if (value.length < 2) {
      setMouldPartSuggestions([]);
      setShowAddMouldPart(false);
      return;
    }
    fetchMouldPartSuggestions(value);
    setShowAddMouldPart(false);
  };

  const selectMouldPart = (part) => {
    handleChange({ target: { name: "mouldPart", value: part.part_name } });
    handleChange({ target: { name: "new_part_id", value: part.id } });
    handleChange({ target: { name: "new_part_number", value: part.part_number || "" } });
    handleChange({ target: { name: "mouldStandardCycleTime", value: part.standard_cycle_time } });
    setMouldPartSuggestions([]);
    setShowAddMouldPart(false);
  };

  const submitAddMouldPart = async () => {
    if (!newMouldPart.part_name.trim() || !Number(newMouldPart.standard_cycle_time)) {
      setAddMouldPartError("Part name and standard cycle time are required.");
      return;
    }
    setAddMouldPartError(null);
    const result = await handleAddMouldPart({
      part_name: newMouldPart.part_name,
      standard_cycle_time: newMouldPart.standard_cycle_time,
    });
    if (result.success) {
      setShowAddMouldPart(false);
      setNewMouldPart({ part_name: "", standard_cycle_time: "" });
    } else {
      setAddMouldPartError(result.message);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitResult(null);
    const results = await finalSubmit();
    if (results && results.length) {
      const failed = results.filter((r) => !r.success);
      setSubmitResult(
        !failed.length
          ? { type: "success", message: "Entry saved successfully." }
          : { type: "error", message: `Failed to save: ${failed.map((f) => f.error).join(", ")}` }
      );
    } else {
      setSubmitResult({ type: "error", message: "Could not save this entry. Please check the fields above." });
    }
  };

  const timeSlotOptions = (formData.shift === "A" ? shiftATimes : shiftBTimes).map((t) => ({ value: t, label: t }));
  const isFromPlan = !!formData.plan_detail_id;
  const isFirstMachine = currentMachineIndex === 0;
  const isLastMachine = currentMachineIndex === filteredMachines.length - 1;
  const isDone = !!machineEntries[currentMachine?.id];

  const filteredSidebarMachines = filteredMachines.filter((m) =>
    (m.name || "").toLowerCase().includes(machineSearch.toLowerCase()) ||
    String(m.machine_code || "").toLowerCase().includes(machineSearch.toLowerCase())
  );

  const goToMachine = (idx) => {
    if (idx < 0 || idx >= filteredMachines.length) return;
    saveCurrentMachine();
    setCurrentMachineIndex(idx);
    loadMachineData(filteredMachines[idx]);
  };

  const handleBack = () => window.history.back();

  // ================= OEE (Availability / Performance / Quality) =================
  // Standard three-factor OEE, computed from what this form already
  // collects. Formulas used (also shown under each card below):
  //
  //   Downtime          = Total Loss Time Breakup minutes (capped at the slot length)
  //   Run Time          = Planned Time − Downtime
  //   Availability   %  = Run Time / Planned Time
  //   Performance    %  = (Ideal Cycle Time × Total Count) / Run Time   [capped at 100%]
  //   Good Count        = Total Count − Reject Qty
  //   Quality        %  = Good Count / Total Count
  //   OEE            %  = Availability × Performance × Quality
  //
  // "Planned Time" is assumed to be PLANNED_MINUTES_PER_SLOT (see constant
  // above) since the form doesn't currently expose a real planned-runtime
  // field per entry. "Ideal Cycle Time" uses the Standard Cycle Time field
  // (seconds); "Total Count" uses the Actual quantity field.
  const oee = useMemo(() => {
    const plannedMinutes = PLANNED_MINUTES_PER_SLOT;
    const downtimeMinutes = Math.min(Number(totalLossMinutes) || 0, plannedMinutes);
    const runTimeMinutes = Math.max(plannedMinutes - downtimeMinutes, 0);
    const runTimeSeconds = runTimeMinutes * 60;

    const availability = plannedMinutes > 0 ? (runTimeMinutes / plannedMinutes) * 100 : 0;

    const idealCycleTimeSec = Number(formData.standardCycleTime) || 0;
    const totalCount = Number(formData.actual) || 0;
    const performanceRaw = runTimeSeconds > 0 && idealCycleTimeSec > 0
      ? ((idealCycleTimeSec * totalCount) / runTimeSeconds) * 100
      : 0;
    const performance = Math.min(performanceRaw, 100);

    const rejectQty = Number(formData.reject) || 0;
    const goodCount = Math.max(totalCount - rejectQty, 0);
    const quality = totalCount > 0 ? (goodCount / totalCount) * 100 : 0;

    const oeeValue = (availability / 100) * (performance / 100) * (quality / 100) * 100;

    return {
      plannedMinutes,
      downtimeMinutes,
      runTimeMinutes,
      availability: Number(availability.toFixed(1)),
      performance: Number(performance.toFixed(1)),
      quality: Number(quality.toFixed(1)),
      value: Number(oeeValue.toFixed(1)),
    };
  }, [totalLossMinutes, formData.standardCycleTime, formData.actual, formData.reject]);

  if (loadingMaster) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#EFEFEF]">
        <div className="flex flex-col items-center gap-3 text-[#0F1D24]">
          <div className="flex h-12 w-12 items-center justify-center border border-[#0F1D24] bg-[#0F1D24]">
            <FaIndustry className="text-lg text-[#FDC94D]" />
          </div>
          <p className="text-sm font-medium text-[#9B9B9B]">Loading machines and reasons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EFEFEF]">
      {/* ================= TOP BAR ================= */}
      <div className="w-full flex-shrink-0 border-b border-[#C6C6C6] bg-white">
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${BORDER} 50%, ${GOLD} 100%)` }} />
        <div className="flex h-[40px] items-center gap-2.5 px-3">
          <button onClick={handleBack} title="Back" className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]">
            <FaArrowLeft className="text-[11px]" />
          </button>
          <button onClick={() => setSidebarOpen((o) => !o)} className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D] md:hidden" title="Toggle machine list">
            <FaIndustry className="text-[11px]" />
          </button>
          <div className="flex items-center gap-2 border-l border-[#C6C6C6] pl-2.5">
            <div className="hidden h-6 w-6 flex-shrink-0 items-center justify-center border border-[#0F1D24] bg-[#0F1D24] sm:flex">
              <FaClipboardList className="text-[11px] text-[#FDC94D]" />
            </div>
            <h1 className="text-[12.5px] font-bold leading-tight text-[#0F1D24]">Production Entry</h1>
          </div>

          {/* Inline banners moved into the top bar row to reclaim vertical space */}
          {(masterError || submitError || submitResult || planError) && (
            <div className="ml-2 min-w-0 flex-1 truncate text-[11px] font-semibold">
              {masterError && <span className="text-red-700">{masterError}</span>}
              {submitError && <span className="text-red-700">{submitError}</span>}
              {submitResult && <span className={submitResult.type === "success" ? "text-emerald-700" : "text-red-700"}>{submitResult.message}</span>}
              {planError && <span className="text-amber-700">{planError}</span>}
            </div>
          )}
          {plan?.header && (
            <span className="ml-auto hidden flex-shrink-0 items-center gap-1 border border-[#FDC94D] bg-[#FDC94D]/10 px-2 py-1 text-[10.5px] font-bold text-[#0F1D24] sm:flex">
              <FaClipboardCheck className="text-[10px]" />
              Plan {plan.header.plan_number} loaded
            </span>
          )}
        </div>
      </div>

      {/* ================= BODY — fills remaining screen height ================= */}
      <div className="flex min-h-0 flex-1 gap-2 p-2 md:flex-row flex-col">
        {/* ---------- SIDEBAR: machine list (only this scrolls independently) ---------- */}
        <aside className={`${sidebarOpen ? "flex" : "hidden"} min-h-0 w-full flex-shrink-0 flex-col border border-[#C6C6C6] bg-white md:flex md:w-[250px] lg:w-[270px]`}>
          <div className="flex-shrink-0 border-b border-[#C6C6C6] bg-[#FAFAFA] px-2.5 py-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11.5px] font-bold text-[#0F1D24]">Machines {formData.hall ? `· ${formData.hall}` : ""}</h2>
              <span className="border border-[#C6C6C6] bg-white px-1.5 py-0.5 text-[9.5px] font-bold text-[#0F1D24]">
                {filteredMachines.length}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 border-b border-[#C6C6C6] p-1.5">
            <div className="relative">
              <FaSearch className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9B9B9B]" />
              <input
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                placeholder="Search machine..."
                className="h-8 w-full border border-[#C6C6C6] bg-white pl-6 pr-2 text-[11.5px] outline-none transition-colors duration-100 focus:border-[#0F1D24]"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredSidebarMachines.map((m) => {
              const idx = filteredMachines.indexOf(m);
              const done = !!machineEntries[m.id];
              const isSelected = idx === currentMachineIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => goToMachine(idx)}
                  className={`group flex w-full items-center justify-between gap-2 border-b border-[#C6C6C6] px-2.5 py-2 text-left transition-colors duration-100 ${
                    isSelected ? "border-l-[3px] border-l-[#0F1D24] bg-[#0F1D24]/[0.04]" : "hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-[#0F1D24]">{m.name}</span>
                    <p className="truncate text-[10px] text-[#9B9B9B]">ID: {m.id}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    {done && <FaCheckCircle className="text-[11px] text-emerald-500" />}
                    <FaChevronRight className="text-[9px] text-[#C6C6C6] group-hover:text-[#0F1D24]" />
                  </div>
                </button>
              );
            })}
            {filteredSidebarMachines.length === 0 && (
              <p className="p-4 text-center text-[11px] text-[#9B9B9B]">No machines match "{machineSearch}".</p>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-[#C6C6C6] bg-[#FAFAFA] px-2.5 py-1.5">
            <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-[#0F1D24]">
              <span>Entry Progress</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden border border-[#C6C6C6] bg-white">
              <div className="h-full bg-[#0F1D24] transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>

        {/* ---------- MAIN PANEL — its own internal scroll ---------- */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto">
          {/* Selected-machine header strip */}
          <div className="flex-shrink-0 border border-[#C6C6C6] bg-white">
            <div className="grid grid-cols-2 gap-2 border-b border-[#C6C6C6] p-2 sm:grid-cols-5">
              <div>
                <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Date</label>
                <CustomDatePicker value={formData.date} onChange={(v) => handleChange({ target: { name: "date", value: v } })} />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Shift</label>
                <ThemedSelect value={formData.shift} onChange={(v) => handleShiftChange({ target: { name: "shift", value: v } })} options={SHIFTS} />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Hall</label>
                <ThemedSelect value={formData.hall} onChange={(v) => handleHallChange({ target: { name: "hall", value: v } })} icon={FaIndustry} options={HALLS.map((h) => ({ value: h, label: h }))} />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Time Slot</label>
                <ThemedSelect value={formData.timeSlot} onChange={(v) => handleChange({ target: { name: "timeSlot", value: v } })} icon={FaClock} options={timeSlotOptions} placeholder="Select Time Slot" />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Unit Identifier</label>
                <input
                  type="text"
                  name="unitIdentifier"
                  value={formData.unitIdentifier || ""}
                  onChange={handleChange}
                  placeholder="Batch / Lot / Unit ID"
                  className={textInputClass}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 px-2.5 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-[#FAFAFA] text-[#0F1D24]">
                  <FaIndustry className="text-[15px]" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[#9B9B9B]">Selected Machine</p>
                  <h2 className="text-[14.5px] font-extrabold leading-tight text-[#0F1D24]">
                    {currentMachine?.name || "—"}
                    {isDone && <span className="ml-1.5 text-[10px] font-bold text-emerald-600">· Saved</span>}
                  </h2>
                </div>
              </div>

              <div className="hidden h-8 w-px bg-[#C6C6C6] md:block" />

              <div className="flex flex-1 flex-wrap items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <FaUser className="text-[12px] text-[#9B9B9B]" />
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold uppercase text-[#9B9B9B]">Operator</p>
                    <p className="text-[11px] font-bold text-[#0F1D24]">
                      {operatorDetails?.operator_name || formData.operatorId || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCube className="text-[12px] text-[#9B9B9B]" />
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold uppercase text-[#9B9B9B]">Part</p>
                    <p className="text-[11px] font-bold text-[#0F1D24]">{formData.part || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaBarcode className="text-[12px] text-[#9B9B9B]" />
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold uppercase text-[#9B9B9B]">Part No.</p>
                    <p className="font-mono text-[11px] font-bold text-[#0F1D24]">{formData.partNumber || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaClock className="text-[12px] text-[#9B9B9B]" />
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold uppercase text-[#9B9B9B]">Std. Cycle Time</p>
                    <p className="font-mono text-[11px] font-bold text-[#0F1D24]">{formData.standardCycleTime || "—"} sec</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaClipboardList className="text-[12px] text-[#9B9B9B]" />
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold uppercase text-[#9B9B9B]">Target / Actual</p>
                    <p className="font-mono text-[11px] font-bold text-[#0F1D24]">{formData.target || 0} / {formData.actual || 0}</p>
                  </div>
                </div>
                {isFromPlan && (
                  <span className="border border-[#FDC94D] bg-[#FDC94D]/20 px-2 py-0.5 text-[9.5px] font-bold text-[#0F1D24]">Pre-filled from Plan</span>
                )}
              </div>

              <span className="text-[10.5px] font-semibold text-[#9B9B9B]">
                Machine <span className="font-bold text-[#0F1D24]">{currentMachineIndex + 1}</span>/<span className="font-bold text-[#0F1D24]">{filteredMachines.length}</span>
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 border border-[#C6C6C6] bg-white">
            <div className="flex items-center gap-2 border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
                <FaTachometerAlt className="text-[11px]" />
              </div>
              <h2 className="text-[12.5px] font-bold text-[#0F1D24]">OEE — this entry</h2>
              <span className="ml-1 text-[10px] text-[#9B9B9B]">
                Planned {oee.plannedMinutes} min · Downtime {oee.downtimeMinutes} min · Run {oee.runTimeMinutes} min
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#C6C6C6] p-px sm:grid-cols-4">
              <OeeCard label="Availability" value={oee.availability} tone="#0F1D24" formula="Run Time ÷ Planned Time" />
              <OeeCard label="Performance" value={oee.performance} tone="#FDC94D" formula="(Ideal Cycle Time × Total Count) ÷ Run Time" />
              <OeeCard label="Quality" value={oee.quality} tone="#10b981" formula="(Total Count − Reject) ÷ Total Count" />
              <OeeCard label="OEE" value={oee.value} tone="#ef4444" formula="Availability × Performance × Quality" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-shrink-0 overflow-x-auto border border-[#C6C6C6] bg-white">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex flex-shrink-0 items-center gap-1.5 border-r border-[#C6C6C6] px-3 py-1.5 text-[11.5px] font-bold transition-colors duration-100 last:border-r-0 ${
                    isActive ? "border-b-2 border-b-[#0F1D24] bg-[#0F1D24]/[0.04] text-[#0F1D24]" : "text-[#9B9B9B] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <Icon className="text-[11px]" style={{ color: isActive ? NAVY : undefined }} />
                  {t.label}
                  {t.key === "mould" && showMouldSection && (
                    <span className="ml-0.5 border border-[#0F1D24] bg-[#0F1D24] px-1 text-[9px] font-bold text-[#FDC94D]">ON</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ============ Tab: Production Entry ============ */}
          {activeTab === "entry" && (
            <>
              <div className="flex-shrink-0 border border-[#C6C6C6] bg-white p-2.5">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-10">
                  {/* OPERATOR */}
                  <div className="relative col-span-2">
                    <label className="mb-1 block text-[10.5px] font-semibold text-[#0F1D24]">Operator ID / Name</label>
                    <div className="flex gap-1.5">
                      <input type="text" name="operatorId" value={formData.operatorId} onChange={handleOperatorChange} autoComplete="off" placeholder="Search..." className={`${textInputClass} flex-1`} />
                      <button type="button" onClick={() => fetchOperator(formData.operatorId)} className="flex h-9 flex-shrink-0 items-center border border-[#0F1D24] bg-[#0F1D24] px-2.5 text-[11px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]">
                        Find
                      </button>
                    </div>

                    {operatorSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
                        {operatorSuggestions.map((op) => (
                          <button key={op.id} type="button" onClick={() => selectOperator(op)} className="block w-full border-b border-[#C6C6C6] px-2.5 py-1.5 text-left last:border-b-0 hover:bg-[#FDC94D]/20">
                            <div className="text-[11.5px] font-bold text-[#0F1D24]">{op.operator_name}</div>
                            <div className="text-[9.5px] text-[#9B9B9B]">Code: {op.operator_code} · {op.shift} · {op.hall}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {(operatorNotFound || noOperatorResults) && !operatorDetails && operatorSuggestions.length === 0 && (
                      <div className="mt-1.5 border border-[#FDC94D] bg-[#FDC94D]/10 p-1.5">
                        {!showAddOperator ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-semibold text-[#0F1D24]">Not found.</span>
                            <button type="button" onClick={() => setShowAddOperator(true)} className="h-6 flex-shrink-0 border border-[#0F1D24] bg-[#0F1D24] px-2 text-[9.5px] font-bold text-[#FDC94D]">+ Add</button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <input type="text" placeholder="Operator Name" value={newOperator.operator_name} onChange={(e) => setNewOperator((p) => ({ ...p, operator_name: e.target.value }))} className={textInputClass} />
                            <div className="grid grid-cols-2 gap-1.5">
                              <select value={newOperator.shift} onChange={(e) => setNewOperator((p) => ({ ...p, shift: e.target.value }))} className={`${textInputClass} px-2`}>
                                <option value="">Shift</option><option value="A">A</option><option value="B">B</option><option value="G">G</option>
                              </select>
                              <select value={newOperator.hall} onChange={(e) => setNewOperator((p) => ({ ...p, hall: e.target.value }))} className={`${textInputClass} px-2`}>
                                <option value="">Hall</option>
                                {HALLS.map((h) => <option key={h} value={h}>{h}</option>)}
                              </select>
                            </div>
                            {addOperatorError && <p className="text-[9.5px] font-semibold text-red-600">{addOperatorError}</p>}
                            <div className="flex gap-1.5">
                              <button type="button" onClick={handleAddOperator} disabled={addingOperator} className="h-7 flex-1 bg-emerald-600 text-[10.5px] font-bold text-white disabled:opacity-50">
                                {addingOperator ? "Saving..." : "Save & Use"}
                              </button>
                              <button type="button" onClick={() => setShowAddOperator(false)} className="h-7 border border-[#C6C6C6] bg-white px-2 text-[10.5px] font-semibold text-[#0F1D24]">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PART SEARCH */}
                  <div className="relative col-span-2">
                    <label className="mb-1 block text-[10.5px] font-semibold text-[#0F1D24]">Part Name / Number</label>
                    <input type="text" name="part" value={formData.part} onChange={handlePartChange} autoComplete="off" placeholder="Search part..." className={textInputClass} />

                    {partSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
                        {partSuggestions.map((part) => (
                          <button key={part.id} type="button" onClick={() => selectPart(part)} className="block w-full border-b border-[#C6C6C6] px-2.5 py-1.5 text-left last:border-b-0 hover:bg-[#FDC94D]/20">
                            <div className="text-[11.5px] font-bold text-[#0F1D24]">{part.part_name}</div>
                            <div className="text-[9.5px] text-[#9B9B9B]">{part.part_number} · {part.product_category}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {noPartResults && !formData.part_id && (
                      <div className="absolute left-0 right-0 z-30 mt-1 border border-[#FDC94D] bg-white p-1.5 shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
                        {!showAddPart ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-semibold text-[#0F1D24]">Not found.</span>
                            <button type="button" onClick={() => { setNewPart((p) => ({ ...p, part_name: formData.part })); setShowAddPart(true); }} className="h-6 flex-shrink-0 border border-[#0F1D24] bg-[#0F1D24] px-2 text-[9.5px] font-bold text-[#FDC94D]">+ Add</button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <input type="text" placeholder="Part Name" value={newPart.part_name} onChange={(e) => setNewPart((p) => ({ ...p, part_name: e.target.value }))} className={textInputClass} />
                            <input type="number" placeholder="Actual Cycle Time (sec)" value={newPart.actual_cycle_time} onChange={(e) => setNewPart((p) => ({ ...p, actual_cycle_time: e.target.value }))} className={plainInputClass} />
                            {addPartError && <p className="text-[9.5px] font-semibold text-red-600">{addPartError}</p>}
                            <div className="flex gap-1.5">
                              <button type="button" onClick={handleAddPart} disabled={addingPart} className="h-7 flex-1 bg-emerald-600 text-[10.5px] font-bold text-white disabled:opacity-50">
                                {addingPart ? "Saving..." : "Save & Use"}
                              </button>
                              <button type="button" onClick={() => setShowAddPart(false)} className="h-7 border border-[#C6C6C6] bg-white px-2 text-[10.5px] font-semibold text-[#0F1D24]">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Field label="Std. Cycle Time" suffix="Sec">
                    <div className="flex h-9 items-center bg-[#FAFAFA] px-2.5 font-mono text-[12.5px] font-bold text-[#0F1D24]">
                      {formData.standardCycleTime || "-"}
                    </div>
                  </Field>
                  <Field label="Actual Cycle Time" suffix="Sec">
                    <input type="number" name="actualCycleTime" value={formData.actualCycleTime} onChange={handleChange} className={numInputClass} />
                  </Field>
                  <Field label="Target Qty" suffix="Nos">
                    <input type="number" name="target" value={formData.target} onChange={handleChange} className={numInputClass} />
                  </Field>
                  <Field label="Actual Qty" suffix="Nos">
                    <input type="number" name="actual" value={formData.actual} onChange={handleChange} className={numInputClass} />
                  </Field>
                  <Field label="Reject Qty" suffix="Nos">
                    <input type="number" name="reject" value={formData.reject} onChange={handleChange} className={`${numInputClass} text-red-600`} />
                  </Field>
                  <Field label="Efficiency" suffix="%">
                    <div className="flex h-9 items-center bg-[#FAFAFA] px-2.5 font-mono text-[12.5px] font-bold text-orange-600">
                      {efficiency}
                    </div>
                  </Field>
                </div>
              </div>

              {/* Reject Breakup, Loss Time Breakup, and Remarks — one row */}
              <div className="grid flex-shrink-0 grid-cols-1 gap-2 lg:grid-cols-3">
                <ReasonBreakup
                  title={`Reject Breakup (${totalRejectQty})`}
                  rows={activeRejectRows}
                  reasonOptions={rejectReasonNames}
                  updateRow={updateRejectRow}
                  addRow={addRejectRow}
                  removeRow={removeRejectRow}
                  unitLabel="Qty"
                  totalLabel="Total Reject"
                  valueField="qty"
                  matchMode="equal"
                  matchAgainst={formData.reject}
                />
                {/* BUG FIX: this used to pass matchAgainst={0}, which made the
                    mismatch check permanently inert (see the ReasonBreakup
                    comment above). It now cap-checks the breakup total
                    against the planned slot length instead. */}
                <ReasonBreakup
                  title={`Loss Time Breakup (${totalLossMinutes})`}
                  rows={activeLossRows}
                  reasonOptions={lossReasonNames}
                  updateRow={updateLossRow}
                  addRow={addLossRow}
                  removeRow={removeLossRow}
                  unitLabel="Min"
                  totalLabel="Total Loss"
                  valueField="minutes"
                  matchMode="max"
                  matchAgainst={PLANNED_MINUTES_PER_SLOT}
                />

                <div className="flex flex-col border border-[#C6C6C6] bg-white">
                  <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 py-2">
                    <h3 className="text-[12.5px] font-bold text-[#0F1D24]">Remarks</h3>
                  </div>
                  <div className="flex flex-1 flex-col p-2.5">
                    <textarea
                      rows={6}
                      name="remarks"
                      aria-label="Remarks"
                      placeholder="Add any additional notes here..."
                      value={formData.remarks}
                      onChange={handleChange}
                      className="h-full min-h-[120px] w-full flex-1 resize-none border border-[#C6C6C6] bg-white px-2.5 py-1.5 text-[11.5px] text-[#0F1D24] outline-none transition-colors duration-100 placeholder:text-[#9B9B9B] focus:border-[#0F1D24]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============ Tab: Mould Change ============ */}
          {activeTab === "mould" && (
            <div className="flex-shrink-0 border border-[#C6C6C6] bg-white p-2.5">
              <label className="mb-2 flex cursor-pointer select-none items-center gap-2">
                <input type="checkbox" checked={showMouldSection} onChange={handleMouldToggle} className="h-4 w-4 accent-[#FDC94D]" />
                <span className="text-[12px] font-bold text-[#0F1D24]">Enable Mould Change Entry</span>
              </label>

              {showMouldSection ? (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {/* NEW PART search (mould) */}
                    <div className="relative sm:col-span-2">
                      <label className="mb-1 block text-[10.5px] font-semibold text-[#0F1D24]">New Part Name / Number</label>
                      <input
                        type="text"
                        name="mouldPart"
                        value={formData.mouldPart || ""}
                        onChange={handleMouldPartChange}
                        autoComplete="off"
                        placeholder="Search part for the new mould..."
                        className={textInputClass}
                      />

                      {mouldPartSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
                          {mouldPartSuggestions.map((part) => (
                            <button key={part.id} type="button" onClick={() => selectMouldPart(part)} className="block w-full border-b border-[#C6C6C6] px-2.5 py-1.5 text-left last:border-b-0 hover:bg-[#FDC94D]/20">
                              <div className="text-[11.5px] font-bold text-[#0F1D24]">{part.part_name}</div>
                              <div className="text-[9.5px] text-[#9B9B9B]">{part.part_number} · {part.product_category}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {noMouldPartResults && !formData.new_part_id && (
                        <div className="absolute left-0 right-0 z-30 mt-1 border border-[#FDC94D] bg-white p-1.5 shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
                          {!showAddMouldPart ? (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10.5px] font-semibold text-[#0F1D24]">Not found.</span>
                              <button
                                type="button"
                                onClick={() => { setNewMouldPart((p) => ({ ...p, part_name: formData.mouldPart || "" })); setShowAddMouldPart(true); }}
                                className="h-6 flex-shrink-0 border border-[#0F1D24] bg-[#0F1D24] px-2 text-[9.5px] font-bold text-[#FDC94D]"
                              >
                                + Add
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <input type="text" placeholder="Part Name" value={newMouldPart.part_name} onChange={(e) => setNewMouldPart((p) => ({ ...p, part_name: e.target.value }))} className={textInputClass} />
                              <input type="number" placeholder="Standard Cycle Time (sec)" value={newMouldPart.standard_cycle_time} onChange={(e) => setNewMouldPart((p) => ({ ...p, standard_cycle_time: e.target.value }))} className={plainInputClass} />
                              {addMouldPartError && <p className="text-[9.5px] font-semibold text-red-600">{addMouldPartError}</p>}
                              <div className="flex gap-1.5">
                                <button type="button" onClick={submitAddMouldPart} disabled={addingMouldPart} className="h-7 flex-1 bg-emerald-600 text-[10.5px] font-bold text-white disabled:opacity-50">
                                  {addingMouldPart ? "Saving..." : "Save & Use"}
                                </button>
                                <button type="button" onClick={() => setShowAddMouldPart(false)} className="h-7 border border-[#C6C6C6] bg-white px-2 text-[10.5px] font-semibold text-[#0F1D24]">Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Field label="Mould Std. Cycle Time" suffix="Sec">
                      <div className="flex h-9 items-center bg-[#FAFAFA] px-2.5 font-mono text-[12.5px] font-bold text-[#0F1D24]">
                        {formData.mouldStandardCycleTime || "-"}
                      </div>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Field label="Mould Reject Qty" suffix="Nos">
                      <input type="number" name="mouldReject" value={formData.mouldReject || ""} onChange={handleChange} className={numInputClass} />
                    </Field>
                  </div>

                  <ReasonBreakup
                    title={`Mould Reject Breakup (${totalMouldRejectQty})`}
                    rows={activeMouldRejectRows}
                    reasonOptions={[...new Set(mouldRejectReasons.filter((r) => !r.custom).map((r) => r.reason))]}
                    updateRow={(visIdx, field, val) => updateMouldRejectReason(activeMouldRejectRows[visIdx].__idx, field, val)}
                    addRow={addCustomMouldRejectReason}
                    removeRow={(visIdx) => removeCustomMouldRejectReason(activeMouldRejectRows[visIdx].__idx)}
                    unitLabel="Qty"
                    totalLabel="Total Mould Reject"
                    valueField="qty"
                    matchMode="equal"
                    matchAgainst={formData.mouldReject}
                  />
                </div>
              ) : (
                <p className="border border-dashed border-[#C6C6C6] bg-[#FAFAFA] py-5 text-center text-[11.5px] text-[#9B9B9B]">
                  Mould change is off for this machine. Toggle the checkbox above to record a mould change.
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer — stays fixed at the bottom of the screen, outside the scroll areas */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-[#C6C6C6] bg-white px-3 py-2">
        <button
          onClick={previousMachine}
          disabled={isFirstMachine || submitting}
          className="flex h-8 items-center gap-1.5 border border-[#C6C6C6] bg-white px-3 text-[11.5px] font-bold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaChevronLeft className="text-[9px]" />
          Previous
        </button>

        {!isLastMachine ? (
          <button
            onClick={nextMachine}
            disabled={submitting}
            className="flex h-8 items-center gap-1.5 border border-[#0F1D24] bg-[#0F1D24] px-3.5 text-[11.5px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save & Next
            <FaChevronRight className="text-[9px]" />
          </button>
        ) : (
          <button
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="flex h-8 items-center gap-1.5 border border-emerald-700 bg-emerald-600 px-3.5 text-[11.5px] font-bold text-white transition-colors duration-100 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSave className="text-[10px]" />
            {submitting ? "Saving..." : "Save Entry"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdvProductionEntry; 