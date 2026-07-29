// HallDashboard.jsx — advanced compact desktop redesign, self-contained
//
// Spacing/surface system matches ProductionDashboard.jsx: one shared
// outer gutter (p-4) + vertical rhythm (gap-4), and every panel uses the
// same SURFACE token (flat border + soft shadow) instead of rounded
// corners, so both pages read as one consistent, dense desktop app.
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  useParams,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Calendar,
  RefreshCw,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Filter,
  Expand,
  X,
  ArrowLeft,
  LayoutGrid,
  AlertTriangle,
  Boxes,
  Layers,
  Gauge,
} from "lucide-react";

import {
  getHallStats,
  getHallMachineWise,
  getHallHourlyTrend,
  getHallShiftSummary,
  getHallMachines,
} from "../../api/hallDashboardApi";
import { getHallCodeFromId } from "../../data/dashboardData";
import { exportHallDashboardToExcel } from "../../utils/exportHallDashboard";
import Sidebar from "./Sidebar";

// ==========================================================
// Constants
// ==========================================================
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];
const SHIFT_COLORS = {
  A: { band: "#FDC94D22", swatch: "#FDC94D", border: "#FDC94D" },
  B: { band: "#0F1D2414", swatch: "#0F1D24", border: "#0F1D24" },
};
const BAR_COLORS = { target: "#0F1D24", actual: "#FDC94D" };
const MIN_CHART_HEIGHT = 120;

// shared surface tokens — flat, sharp corners, subtle shadow for depth
const BORDER = "border border-[#E1E4E9]";
const SURFACE = `bg-white ${BORDER} shadow-[0_1px_2px_rgba(15,29,36,0.06)]`;
// panel header — highlighted (amber-on-navy) instead of flat gray, used
// consistently across every panel header (Machine-wise / Shift Summary /
// Chart card) so headings read as one uniform, highlighted theme.
const PANEL_HEADER = "bg-[#0F1D24]";
const PANEL_HEADER_ICON = "flex h-6 w-6 items-center justify-center bg-[#FDC94D] text-[#0F1D24]";
const PANEL_HEADER_TITLE = "text-[12.5px] font-bold text-white";

// ==========================================================
// Array-safety helper
// ==========================================================
const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, v]) =>
      v && typeof v === "object" ? { ...v } : { value: v },
    );
  }
  return [];
};

const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseDateKey = (key) => {
  if (!key) return new Date();
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const formatDisplay = (key) =>
  !key
    ? "Select date"
    : parseDateKey(key).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

const getBusinessDateDefault = () => {
  const now = new Date();
  if (now.getHours() < 8) now.setDate(now.getDate() - 1);
  return toDateKey(now);
};
const defaultFilters = () => ({
  date: getBusinessDateDefault(),
  machine: "All",
  shift: "All",
});
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

// ==========================================================
// Inline icons (KPI cards)
// ==========================================================
const IconTarget = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </svg>
);
const IconTrendUp = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);
const IconAlert = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 9v4M12 17h.01" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const IconGauge = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 14l4-4M4 15a8 8 0 1 1 16 0" />
  </svg>
);
const IconAward = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="8" r="5" />
    <path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5" />
  </svg>
);
const IconBarChart = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
    <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" />
    <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
  </svg>
);

// ==========================================================
// Themed date picker — flat, sharp corners.
// ==========================================================
const CustomDatePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDateKey(value));
  const [coords, setCoords] = useState(null);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    setViewDate(parseDateKey(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        panelRef.current &&
        !panelRef.current.contains(e.target)
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
    if (left + panelWidth > window.innerWidth - 8)
      left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    setCoords({ top: rect.bottom + 6, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateCoords();
    const handleReposition = () => updateCoords();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updateCoords]);

  const selectedKey = value || "";
  const todayKey = toDateKey(new Date());

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear(),
      month = viewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++)
      cells.push(new Date(year, month, day));
    return cells;
  }, [viewDate]);

  const changeMonth = (delta) =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  const handleSelect = (date) => {
    onChange(toDateKey(date));
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 flex-shrink-0 items-center gap-1.5 border px-2.5 text-[11px] font-medium outline-none transition-colors duration-100
          ${open ? "border-[#0F1D24]" : "border-[#E1E4E9] bg-white hover:border-[#0F1D24]"} bg-white text-[#0F1D24]`}
      >
        <Calendar size={12} className="text-[#9B9B9B]" />
        <span className="whitespace-nowrap">{formatDisplay(selectedKey)}</span>
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left }}
            className="z-[9999] w-60 overflow-hidden border border-[#E1E4E9] bg-white shadow-[0_10px_24px_rgba(15,29,36,0.16)]"
          >
            <div className="flex items-center justify-between bg-[#0F1D24] px-2.5 py-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10"
              >
                <ChevronLeft size={12} />
              </button>
              <span className="text-[11px] font-bold text-white">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10"
              >
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-[#E1E4E9] p-px">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={`${w}-${i}`}
                  className="flex h-5 items-center justify-center bg-[#FAFAFB] text-[9px] font-bold uppercase text-[#9B9B9B]"
                >
                  {w}
                </div>
              ))}
              {calendarDays.map((date, i) => {
                if (!date)
                  return <div key={`empty-${i}`} className="h-6 bg-white" />;
                const key = toDateKey(date);
                const isSelected = key === selectedKey,
                  isToday = key === todayKey;
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

            <div className="flex items-center justify-between border-t border-[#E1E4E9] px-2.5 py-2">
              <button
                type="button"
                onClick={() => handleSelect(new Date())}
                className="text-[10.5px] font-semibold text-[#0F1D24] hover:underline"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[10.5px] font-medium text-[#9B9B9B] hover:text-[#0F1D24]"
              >
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

// ==========================================================
// Themed select — flat, sharp corners.
// ==========================================================
const CustomSelect = ({
  value,
  onChange,
  options = [],
  icon: Icon,
  maxWidth = 190,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        panelRef.current &&
        !panelRef.current.contains(e.target)
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
    const panelWidth = 256; // w-64
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8)
      left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    setCoords({ top: rect.bottom + 6, left, minWidth: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateCoords();
    const handleReposition = () => updateCoords();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updateCoords]);

  const safeOptions = toArray(options);
  const selected = safeOptions.find((o) => o.value === value);
  const displayLabel = selected
    ? selected.label
    : safeOptions[0]?.label || "Select";
  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ maxWidth }}
        className={`flex h-8 min-w-[100px] flex-shrink-0 items-center gap-1.5 border px-2.5 text-[11px] font-medium outline-none transition-colors duration-100
          ${open ? "border-[#0F1D24]" : "border-[#E1E4E9] hover:border-[#0F1D24]"} bg-white text-[#0F1D24]`}
      >
        {Icon && <Icon size={12} className="shrink-0 text-[#9B9B9B]" />}
        <span className="min-w-0 flex-1 truncate text-left">
          {displayLabel}
        </span>
        <ChevronDown
          size={10}
          className={`shrink-0 text-[#9B9B9B] transition-transform duration-100 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              minWidth: coords.minWidth,
            }}
            className="z-[9999] max-h-56 w-64 overflow-y-auto border border-[#E1E4E9] bg-white py-1 shadow-[0_10px_24px_rgba(15,29,36,0.16)]"
          >
            {safeOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] font-medium transition-colors duration-100
                ${value === opt.value ? "bg-[#FDC94D]/20 text-[#0F1D24]" : "text-[#0F1D24] hover:bg-[#FAFAFB]"}`}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && (
                  <Check size={9} className="shrink-0 text-[#0F1D24]" />
                )}
              </button>
            ))}
            {safeOptions.length === 0 && (
              <p className="px-3 py-1.5 text-[10px] text-[#9B9B9B]">
                No options available
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

const DashboardHeader = ({
  hallCode,
  dateLabel,
  onBack,
  onHeatmap,
  onExport,
  draft,
  setDraft,
  onApply,
  onRefresh,
  onReset,
  loading,
  machineList,
  message,
}) => {
  const safeMachineList = toArray(machineList);
  const machineOptions = useMemo(
    () => [
      { value: "All", label: "All Machines" },
      ...safeMachineList.map((m) => ({
        value: m.machine_code || m.machine,
        label: m.machine_name || m.machine || m.machine_code,
      })),
    ],
    [safeMachineList],
  );
  const shiftOptions = [
    { value: "All", label: "All Shifts" },
    { value: "A", label: "Shift A" },
    { value: "B", label: "Shift B" },
  ];

  return (
    <header className={`w-full flex-shrink-0 overflow-hidden ${SURFACE}`}>
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)",
        }}
      />
      <div className="flex h-11 w-full flex-nowrap items-center gap-2 overflow-x-auto px-3 py-1.5">
        <button
          onClick={onBack}
          title="Back"
          className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#E1E4E9] bg-white text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
        >
          <ArrowLeft size={13} />
        </button>

        <div className="flex min-w-0 shrink-0 flex-col justify-center border-l border-[#E1E4E9] pl-2.5 pr-1">
          <span className="shrink-0 text-[11px] font-extrabold uppercase leading-none tracking-wide text-[#2F6FED]">
            {hallCode} Dashboard
          </span>
          <p className="truncate font-mono text-[9px] leading-none text-[#9B9B9B]">
            {dateLabel}
          </p>
        </div>

        <div className="h-6 w-px shrink-0 bg-[#E1E4E9]" />

        <CustomDatePicker
          value={draft.date}
          onChange={(date) => setDraft((p) => ({ ...p, date }))}
        />
        <CustomSelect
          value={draft.machine}
          onChange={(machine) => setDraft((p) => ({ ...p, machine }))}
          options={machineOptions}
          maxWidth={190}
        />
        <CustomSelect
          value={draft.shift}
          onChange={(shift) => setDraft((p) => ({ ...p, shift }))}
          options={shiftOptions}
        />

        <div className="flex shrink-0 items-center gap-px overflow-hidden border border-[#E1E4E9]">
          <button
            onClick={onApply}
            title="Apply selected filters"
            className="flex h-8 items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[10.5px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90"
          >
            <Filter size={12} />
            <span className="hidden md:inline">Apply</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh data"
            className="flex h-8 items-center gap-1.5 bg-white px-2.5 text-[10.5px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FAFAFB] disabled:opacity-60"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            <span className="hidden md:inline">Refresh</span>
          </button>
          <button
            onClick={onReset}
            title="Reset filters"
            className="flex h-8 items-center gap-1.5 bg-white px-2.5 text-[10.5px] font-semibold text-red-600 transition-colors duration-100 hover:bg-red-50"
          >
            <RotateCcw size={12} />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>

        {message ? (
          <div className="flex h-8 min-w-0 flex-1 shrink items-center gap-1.5 border border-amber-200 bg-amber-50 px-2.5 text-[10px] font-semibold text-amber-700">
            <AlertTriangle size={11} className="shrink-0" />
            <span className="truncate">{message}</span>
          </div>
        ) : (
          <div className="min-w-[8px] flex-1" />
        )}

        <div className="flex h-8 shrink-0 items-stretch gap-px overflow-hidden border border-[#E1E4E9] [&>*]:flex [&>*]:items-center [&>*]:whitespace-nowrap">
          <button
            onClick={onHeatmap}
            className="flex items-center gap-1.5 bg-white px-3 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/20"
          >
            <LayoutGrid size={13} />
            <span className="hidden sm:inline">Heatmap</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 bg-[#0F1D24] px-3 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// ==========================================================
// Count-up hook
// ==========================================================
const useCountUp = (value, duration = 700) => {
  const [display, setDisplay] = useState(String(value ?? "-"));
  const prevRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const str = String(value ?? "-");
    const match = str.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) {
      setDisplay(str);
      return;
    }
    const targetNum = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2] || "";
    const isDecimal = match[1].includes(".");
    const startNum = prevRef.current;
    const startTime = performance.now();
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(progress);
      const current = startNum + (targetNum - startNum) * eased;
      setDisplay(
        `${isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString()}${suffix}`,
      );
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      else prevRef.current = targetNum;
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => frameRef.current && cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return display;
};

// ==========================================================
// KPI card — flat white surface with border (matches SURFACE token used
// everywhere else). One consistent navy/amber palette across all cards,
// except the Rejects card which gets a red accent so the negative metric
// is immediately readable at a glance without hunting through the table.
// ==========================================================
const KpiCard = ({ item }) => {
  const Icon = item.icon;
  const display = useCountUp(item.value);
  const isNegative = item.tone === "negative";

  return (
    <div
      className={`relative flex flex-col justify-between ${SURFACE} p-3 ${isNegative ? "border-red-200" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[9px] font-bold uppercase leading-none tracking-wider text-[#9B9B9B]">
          {item.title}
        </p>
        {Icon && (
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center ${isNegative ? "bg-red-500" : "bg-[#0F1D24]"}`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${isNegative ? "text-white" : "text-[#FDC94D]"}`}
            />
          </div>
        )}
      </div>
      <h2
        className={`mt-2 font-mono text-[22px] font-extrabold leading-none tabular-nums ${isNegative ? "text-red-600" : "text-[#0F1D24]"}`}
      >
        {display}
      </h2>
      <p className="mt-1.5 truncate text-[9.5px] font-semibold leading-none text-[#9B9B9B]">
        {item.subtitle}
      </p>
    </div>
  );
};

// ==========================================================
// OEE helpers — machine-wise rows can arrive either with a flat `oee`
// field, or with an `oeeBreakdown` object ({availability, performance,
// quality, oee}). Some backends send oeeBreakdown.oee as 0 even when the
// sub-metrics are healthy, so we recompute from the sub-metrics whenever
// they're present and non-zero, and only fall back to the reported value.
const resolveOee = (row) => {
  const bd = row?.oeeBreakdown;
  if (bd && typeof bd === "object") {
    const availability = Number(bd.availability) || 0;
    const performance = Number(bd.performance) || 0;
    const quality = Number(bd.quality) || 0;
    const computed = Math.round(
      (availability / 100) * (performance / 100) * (quality / 100) * 100,
    );
    if (computed > 0) return { oee: computed, availability, performance, quality };
    const reported = Number(bd.oee) || Number(row.oee) || 0;
    return { oee: reported, availability, performance, quality };
  }
  return {
    oee: Number(row?.oee) || 0,
    availability: null,
    performance: null,
    quality: null,
  };
};

const oeeTone = (value) => {
  if (value >= 85)
    return { text: "text-emerald-600", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "#10b981" };
  if (value >= 60)
    return { text: "text-[#0F1D24]", chip: "bg-[#FDC94D]/20 text-[#7a5b00] border-[#FDC94D]/60", bar: "#FDC94D" };
  return { text: "text-red-600", chip: "bg-red-50 text-red-600 border-red-200", bar: "#ef4444" };
};

// ==========================================================
// Machine-wise breakdown table
// ==========================================================
const MachineWiseTable = ({ rows, loading }) => {
  const safeRows = toArray(rows);
  return (
    <div
      className={`flex min-h-0 h-full flex-1 flex-col overflow-hidden ${SURFACE}`}
    >
      <div className={`flex flex-shrink-0 items-center gap-2 border-b border-[#E1E4E9] ${PANEL_HEADER} px-3.5 py-2.5`}>
        <div className={PANEL_HEADER_ICON}>
          <Boxes className="h-3.5 w-3.5" />
        </div>
        <h2 className={PANEL_HEADER_TITLE}>
          Machine-wise Breakdown
        </h2>
        <span className="border border-[#FDC94D]/40 bg-white/10 px-1.5 py-[1px] text-[10px] font-bold text-[#FDC94D]">
          {safeRows.length}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-[11.5px]">
          <thead className="sticky top-0 z-10 bg-[#0F1D24] text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">Machine</th>
              <th className="px-3 py-2 text-right font-semibold font-mono">
                Target
              </th>
              <th className="px-3 py-2 text-right font-semibold font-mono">
                Actual
              </th>
              <th className="px-3 py-2 text-right font-semibold font-mono">
                Good
              </th>
              <th className="px-3 py-2 text-right font-semibold font-mono">
                Reject
              </th>
              <th className="px-3 py-2 text-right font-semibold font-mono">
                Achv %
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-[#9B9B9B]"
                >
                  Loading…
                </td>
              </tr>
            ) : safeRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-[#9B9B9B]"
                >
                  No machine data for this selection.
                </td>
              </tr>
            ) : (
              safeRows.map((row, idx) => {
                const machineLabel =
                  row.machine || row.machine_name || row.machine_code || "—";
                const target = Number(row.target) || 0;
                const actual = Number(row.actual) || 0;
                const good = Number(row.good ?? actual - (Number(row.rejection ?? row.reject) || 0)) || 0;
                const reject = Number(row.rejection ?? row.reject) || 0;
                const achievement = row.achievement ?? pct(actual, target);
                const { oee } = resolveOee(row);
                const tone = oeeTone(oee);
                return (
                  <tr
                    key={row.machine_code || row.machine || row.id || idx}
                    className={`border-t border-[#E1E4E9] transition-colors duration-100 hover:bg-[#FDC94D]/10 ${idx % 2 === 1 ? "bg-[#FAFAFB]/60" : "bg-white"}`}
                  >
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 border border-[#0F1D24]/15 bg-[#0F1D24]/[0.04] px-2 py-1">
                        <span className="h-1.5 w-1.5 flex-shrink-0 bg-[#FDC94D]" />
                        <span className="font-mono text-[11.5px] font-extrabold tracking-wide text-[#0F1D24]">
                          {machineLabel}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[#9B9B9B]">
                      {target.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-[#0F1D24]">
                      {actual.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-600">
                      {good.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono ${reject > 0 ? "text-red-600 font-semibold" : "text-[#9B9B9B]"}`}
                    >
                      {reject.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-[#0F1D24]">
                      {achievement}%
                    </td>
                    {/* <td className="px-3 py-2 text-right">
                      <span
                        className={`inline-flex min-w-[54px] items-center justify-center gap-1 border px-1.5 py-0.5 font-mono text-[11px] font-extrabold ${tone.chip}`}
                      >
                        {oee}%
                      </span>
                    </td> */}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Donut progress indicator — square (non-rounded) line caps to stay
// consistent with the "zero rounded" flat design language.
const ProgressRing = ({ value, size = 52, stroke = 6, color }) => {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E1E4E9"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 600ms ease-out" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="800"
        fill="#0F1D24"
        fontFamily="ui-monospace, monospace"
      >
        {safeValue}%
      </text>
    </svg>
  );
};

// Some backends send an ambiguous or missing `shift` flag instead of a
// clean "A"/"B" string, which was causing both shift cards to render as
// "Shift A". Recognise common variants and, failing that, fall back to
// the row's position in the list (first row = A, second = B) instead of
// defaulting everything to "A".
const normalizeShiftKey = (val, idx) => {
  const s = String(val ?? "").trim().toUpperCase();
  if (s === "A" || s === "B") return s;
  if (s === "1" || s === "SHIFT A" || s === "DAY") return "A";
  if (s === "2" || s === "SHIFT B" || s === "NIGHT") return "B";
  return idx === 1 ? "B" : "A";
};

// ==========================================================
// Shift A / B summary cards — header now matches the highlighted
// amber-on-navy style used by every other panel so headings read as one
// consistent theme across the page.
// ==========================================================
const ShiftSummaryPanel = ({ rows, loading }) => {
  const safeRows = toArray(rows);
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${SURFACE}`}
    >
      <div className={`flex flex-shrink-0 items-center gap-2 border-b border-[#E1E4E9] ${PANEL_HEADER} px-3.5 py-2.5`}>
        <div className={PANEL_HEADER_ICON}>
          <Layers className="h-3.5 w-3.5" />
        </div>
        <h2 className={PANEL_HEADER_TITLE}>Shift Summary</h2>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px overflow-auto bg-[#E1E4E9] sm:grid-cols-2">
        {loading ? (
          <div className="col-span-2 bg-white px-3.5 py-6 text-center text-[11.5px] text-[#9B9B9B]">
            Loading…
          </div>
        ) : safeRows.length === 0 ? (
          <div className="col-span-2 bg-white px-3.5 py-6 text-center text-[11.5px] text-[#9B9B9B]">
            No shift data for this selection.
          </div>
        ) : (
          safeRows.map((row, idx) => {
            const target = Number(row.target) || 0;
            const actual = Number(row.actual) || 0;
            const reject = Number(row.rejection ?? row.reject) || 0;
            const achievement = row.achievement ?? pct(actual, target);
            const shiftKey = normalizeShiftKey(row.shift, idx);
            const colors = SHIFT_COLORS[shiftKey];
            return (
              <div key={row.shift ?? idx} className="flex items-center gap-3 bg-white p-3">
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-[10.5px] font-bold"
                  style={{
                    background: colors.swatch,
                    color: shiftKey === "A" ? "#0F1D24" : "#FDC94D",
                  }}
                >
                  {shiftKey}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
                    Shift {shiftKey}
                  </p>
                  <p className="mt-1 text-[8.5px] font-bold uppercase text-[#9B9B9B]">
                    Target / Actual
                  </p>
                  <p className="font-mono text-[13px] font-bold text-[#0F1D24]">
                    {target.toLocaleString()} / {actual.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[8.5px] font-bold uppercase text-[#9B9B9B]">
                    Reject
                  </p>
                  <p
                    className={`font-mono text-[12px] font-bold ${reject > 0 ? "text-red-600" : "text-[#0F1D24]"}`}
                  >
                    {reject.toLocaleString()}
                  </p>
                </div>
                <ProgressRing value={achievement} color={colors.swatch} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ==========================================================
// Hourly Target vs Actual chart
// ==========================================================
const buildHourlyChartData = (trend) => {
  const safeTrend = toArray(trend);
  const byHour = new Map();
  safeTrend.forEach((d) => byHour.set(d.hour, d));
  return ORDERED_HOURS.map((hour) => {
    const d = byHour.get(hour) || { target: 0, actual: 0 };
    return {
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      target: d.target || 0,
      actual: d.actual || 0,
      shift: SHIFT_A_HOURS.includes(hour) ? "A" : "B",
    };
  });
};

const Chart = ({ chartData }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 700, height: 260 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries)
        setSize({
          width: entry.contentRect.width,
          height: Math.max(entry.contentRect.height, MIN_CHART_HEIGHT),
        });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const compact = height < 280;
  const PADDING = compact
    ? { top: 46, right: 10, bottom: 32, left: 30 }
    : { top: 58, right: 12, bottom: 40, left: 36 };
  const chartW = Math.max(width - PADDING.left - PADDING.right, 10);
  const chartH = Math.max(height - PADDING.top - PADDING.bottom, 10);

  const { groups, maxVal, yTicks, shiftSegments } = useMemo(() => {
    if (width === 0)
      return { groups: [], maxVal: 0, yTicks: [], shiftSegments: [] };
    const max = Math.max(
      ...chartData.map((d) => Math.max(d.target, d.actual)),
      1,
    );
    const niceMax = Math.ceil(max * 1.3);
    const groupW = chartW / chartData.length;
    const groupGap = compact ? 4 : 6;
    const innerW = Math.max(groupW - groupGap, 4);
    const barW = Math.max((innerW - 2) / 2, 2);

    const computed = chartData.map((d, i) => {
      const groupX = PADDING.left + groupW * i;
      const barX1 = groupX + groupGap / 2;
      const barX2 = barX1 + barW + 2;
      const h1 = (Math.max(d.target, 0) / niceMax) * chartH;
      const h2 = (Math.max(d.actual, 0) / niceMax) * chartH;
      return {
        ...d,
        groupX,
        groupW,
        barX1,
        barX2,
        barW,
        h1,
        h2,
        y1: PADDING.top + chartH - h1,
        y2: PADDING.top + chartH - h2,
      };
    });

    const tickCount = compact ? 3 : 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
      Math.round((niceMax / tickCount) * i),
    );
    const segments = [];
    computed.forEach((b) => {
      const last = segments[segments.length - 1];
      if (last && last.shift === b.shift) last.endX = b.groupX + b.groupW;
      else
        segments.push({
          shift: b.shift,
          startX: b.groupX,
          endX: b.groupX + b.groupW,
        });
    });

    return {
      groups: computed,
      maxVal: niceMax,
      yTicks: ticks,
      shiftSegments: segments,
    };
  }, [chartData, chartW, chartH, width, compact, PADDING.left, PADDING.top]);

  const hovered = hoverIdx !== null ? groups[hoverIdx] : null;
  // Value labels are only legible once a bar is wide enough — below that
  // they'd overlap each other, so we fall back to hover-only tooltips.
  const showValueLabels = groups.length > 0 && groups[0].barW >= 9;

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        className="block"
        preserveAspectRatio="none"
      >
        {shiftSegments.map((seg, i) => (
          <rect
            key={`seg-${i}`}
            x={seg.startX}
            y={PADDING.top}
            width={seg.endX - seg.startX}
            height={chartH}
            fill={SHIFT_COLORS[seg.shift].band}
            opacity={0.7}
            stroke={SHIFT_COLORS[seg.shift].border}
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        ))}
        {shiftSegments.length > 1 && (
          <line
            x1={shiftSegments[1].startX}
            x2={shiftSegments[1].startX}
            y1={PADDING.top - (compact ? 16 : 26)}
            y2={PADDING.top + chartH}
            stroke="#0F1D24"
            strokeWidth={1.5}
          />
        )}
        {shiftSegments.map((seg, i) => {
          const cx = (seg.startX + seg.endX) / 2;
          const pillW = compact ? 52 : 66,
            pillH = compact ? 14 : 18;
          return (
            <g key={`seg-label-${i}`}>
              <rect
                x={cx - pillW / 2}
                y={PADDING.top - (compact ? 30 : 44)}
                width={pillW}
                height={pillH}
                fill={SHIFT_COLORS[seg.shift].swatch}
              />
              <text
                x={cx}
                y={PADDING.top - (compact ? 30 : 44) + pillH / 2 + 3}
                textAnchor="middle"
                fontSize={compact ? "8.5" : "10"}
                fontWeight="700"
                fill={seg.shift === "A" ? "#0F1D24" : "#FDC94D"}
              >
                Shift {seg.shift}
              </text>
            </g>
          );
        })}
        {yTicks.map((tick, i) => {
          const y = PADDING.top + chartH - (tick / maxVal) * chartH;
          return (
            <g key={i}>
              <line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={y}
                y2={y}
                stroke="#F5F5F5"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#9B9B9B"
                fontFamily="ui-monospace, monospace"
              >
                {tick}
              </text>
            </g>
          );
        })}
        {groups.map((g, i) => (
          <g key={i}>
            <rect
              x={g.barX1}
              y={g.y1}
              width={g.barW}
              height={g.h1}
              fill={BAR_COLORS.target}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.55}
              style={{
                transformOrigin: `${g.barX1 + g.barW / 2}px ${PADDING.top + chartH}px`,
                animation: `hdGrowBar 450ms ease-out ${i * 16}ms both`,
              }}
            />
            <rect
              x={g.barX2}
              y={g.y2}
              width={g.barW}
              height={g.h2}
              fill={BAR_COLORS.actual}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.55}
              style={{
                transformOrigin: `${g.barX2 + g.barW / 2}px ${PADDING.top + chartH}px`,
                animation: `hdGrowBar 450ms ease-out ${i * 16 + 40}ms both`,
              }}
            />
            {showValueLabels && g.target > 0 && (
              <text
                x={g.barX1 + g.barW / 2}
                y={g.y1 - 3}
                textAnchor="middle"
                fontSize={compact ? "7" : "8"}
                fontWeight="700"
                fontFamily="ui-monospace, monospace"
                fill={BAR_COLORS.target}
              >
                {g.target}
              </text>
            )}
            {showValueLabels && g.actual > 0 && (
              <text
                x={g.barX2 + g.barW / 2}
                y={g.y2 - 3}
                textAnchor="middle"
                fontSize={compact ? "7" : "8"}
                fontWeight="700"
                fontFamily="ui-monospace, monospace"
                fill="#0F1D24"
              >
                {g.actual}
              </text>
            )}
          </g>
        ))}
        {groups.map((g, i) => (
          <text
            key={`label-${i}`}
            x={g.groupX + g.groupW / 2}
            y={height - PADDING.bottom + (compact ? 12 : 14)}
            textAnchor="middle"
            fontSize={compact ? "7.5" : "8.5"}
            fontWeight="600"
            fill="#9B9B9B"
          >
            {String(g.hour).padStart(2, "0")}
          </text>
        ))}
        <text
          x={PADDING.left + chartW / 2}
          y={height - (compact ? 4 : 6)}
          textAnchor="middle"
          fontSize={compact ? "9" : "10"}
          fontWeight="700"
          fill="#0F1D24"
        >
          Hour of Day (Shift A starts 08:00)
        </text>
        {!compact && (
          <text
            x={12}
            y={PADDING.top + chartH / 2}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#0F1D24"
            transform={`rotate(-90, 12, ${PADDING.top + chartH / 2})`}
          >
            Qty
          </text>
        )}
        {groups.map((g, i) => (
          <rect
            key={`hover-${i}`}
            x={g.groupX}
            y={PADDING.top}
            width={g.groupW}
            height={chartH}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 border border-[#E1E4E9] bg-white px-2.5 py-2 text-[10px] shadow-[0_10px_24px_rgba(15,29,36,0.16)]"
          style={{
            left: `${Math.min(Math.max(((hovered.groupX + hovered.groupW / 2) / width) * 100, 10), 90)}%`,
            top: 4,
            transform: "translateX(-50%)",
          }}
        >
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="font-semibold text-[#0F1D24]">
              {hovered.label}
            </span>
            <span
              className="px-1.5 py-0.5 text-[9px] font-semibold"
              style={{
                background: SHIFT_COLORS[hovered.shift].swatch,
                color: hovered.shift === "A" ? "#0F1D24" : "#FDC94D",
              }}
            >
              Shift {hovered.shift}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1 text-[#9B9B9B]">
              <span
                className="h-1.5 w-1.5"
                style={{ background: BAR_COLORS.target }}
              />{" "}
              Target
            </span>
            <span className="font-mono font-semibold text-[#0F1D24]">
              {hovered.target}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1 text-[#9B9B9B]">
              <span
                className="h-1.5 w-1.5"
                style={{ background: BAR_COLORS.actual }}
              />{" "}
              Actual
            </span>
            <span className="font-mono font-semibold text-[#0F1D24]">
              {hovered.actual}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const HourlyChartCard = ({ chartData, loading }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const safeChartData = toArray(chartData);
  const totalTarget = useMemo(
    () => safeChartData.reduce((s, d) => s + d.target, 0),
    [safeChartData],
  );
  const totalActual = useMemo(
    () => safeChartData.reduce((s, d) => s + d.actual, 0),
    [safeChartData],
  );
  const hasData = totalTarget + totalActual > 0;

  const peak = useMemo(() => {
    let best = { hour: "-", value: 0 };
    safeChartData.forEach((d) => {
      if (d.actual > best.value) best = { hour: d.hour, value: d.actual };
    });
    return best;
  }, [safeChartData]);

  return (
    <>
      <style>{`@keyframes hdGrowBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }`}</style>

      <div className={`flex min-h-0 h-full flex-1 flex-col ${SURFACE} p-3.5`}>
        <div className="mb-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 pr-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center bg-[#0F1D24]">
              <IconBarChart className="h-3.5 w-3.5 text-[#FDC94D]" />
            </div>
            <div>
              <h2 className="text-[12.5px] font-bold text-[#0F1D24]">
                Hourly Target vs Actual
              </h2>
              <p className="text-[10px] text-[#9B9B9B]">
                Shift A (08:00–20:00) · Shift B (20:00–08:00)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 border border-[#0F1D24]/20 bg-[#0F1D24]/5 px-2 py-1">
                <span
                  className="h-2 w-2"
                  style={{ background: BAR_COLORS.target }}
                />
                <span className="text-[10px] font-semibold text-[#0F1D24]">
                  Target
                </span>
              </div>
              <div className="flex items-center gap-1.5 border border-[#FDC94D]/50 bg-[#FDC94D]/10 px-2 py-1">
                <span
                  className="h-2 w-2"
                  style={{ background: BAR_COLORS.actual }}
                />
                <span className="text-[10px] font-semibold text-[#0F1D24]">
                  Actual
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
                Peak Hour
              </p>
              <p className="text-xs font-extrabold text-[#0F1D24]">
                {peak.hour !== "-"
                  ? `${String(peak.hour).padStart(2, "0")}:00`
                  : "-"}
                <span className="ml-1 text-[9px] font-semibold text-[#9B9B9B]">
                  ({peak.value})
                </span>
              </p>
            </div>
            <button
              onClick={() => setIsZoomed(true)}
              className="flex h-7 items-center gap-1 bg-[#0F1D24] px-2.5 text-[9px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-[#1a2e38]"
            >
              <Expand size={11} /> Zoom
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-full min-h-0 items-center justify-center text-[11px] text-[#9B9B9B]">
            Loading hourly data...
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            {!hasData && (
              <div className="mb-2 flex-shrink-0 border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700">
                No production recorded for this date — showing 0 for every hour.
              </div>
            )}
            <div className="min-h-0 flex-1">
              <Chart chartData={safeChartData} />
            </div>
            <div className="mt-2 flex flex-shrink-0 items-center justify-end border-t border-[#E1E4E9] pt-2">
              <span className="text-[9px] font-semibold text-[#9B9B9B]">
                Target: <span className="text-[#0F1D24]">{totalTarget}</span> ·
                Actual: <span className="text-[#0F1D24]">{totalActual}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E1E4E9] px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center bg-[#0F1D24]">
                <IconBarChart className="h-3.5 w-3.5 text-[#FDC94D]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F1D24]">
                  Hourly Target vs Actual · Expanded View
                </h2>
                <p className="text-[10px] text-[#9B9B9B]">
                  Shift A (08:00–20:00) · Shift B (20:00–08:00)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
                  Peak Hour
                </p>
                <p className="text-lg font-extrabold text-[#0F1D24]">
                  {peak.hour !== "-"
                    ? `${String(peak.hour).padStart(2, "0")}:00`
                    : "-"}
                  <span className="ml-1 text-[10px] font-semibold text-[#9B9B9B]">
                    ({peak.value})
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="flex h-9 w-9 items-center justify-center text-[#9B9B9B] transition-colors duration-100 hover:bg-[#0F1D24]/5"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!hasData && (
            <div className="flex-shrink-0 border-b border-amber-100 bg-amber-50 px-6 py-2 text-[10px] font-medium text-amber-700">
              No production recorded for this date — showing 0 for every hour.
            </div>
          )}

          <div className="min-h-0 flex-1 px-6 py-4">
            <Chart chartData={safeChartData} />
          </div>

          <div className="flex flex-shrink-0 items-center justify-between border-t border-[#E1E4E9] bg-[#0F1D24]/[0.02] px-6 py-2.5">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-[#9B9B9B]">
                <span
                  className="h-2 w-2"
                  style={{ background: BAR_COLORS.target }}
                />{" "}
                Target
              </span>
              <span className="flex items-center gap-1 text-[#9B9B9B]">
                <span
                  className="h-2 w-2"
                  style={{ background: BAR_COLORS.actual }}
                />{" "}
                Actual
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#9B9B9B]">
              Target: <span className="text-[#0F1D24]">{totalTarget}</span> ·
              Actual: <span className="text-[#0F1D24]">{totalActual}</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================================
// Main page
// ==========================================================
const ManagementHallDashboard = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hallCode = getHallCodeFromId(hallId);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);

  const [stats, setStats] = useState(null);
  const [machineWise, setMachineWise] = useState([]);
  const [hourlyTrend, setHourlyTrend] = useState([]);
  const [shiftSummary, setShiftSummary] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fresh = defaultFilters();
    setFilters(fresh);
    setDraftFilters(fresh);
  }, [hallCode]);

  const fetchAll = useCallback(async () => {
    if (!hallCode) return;
    setLoading(true);
    setError(null);

    const commonParams = {
      hall: hallCode,
      from: filters.date,
      to: filters.date,
      machine: filters.machine,
      shift: filters.shift,
    };

    const results = await Promise.allSettled([
      getHallStats(commonParams),
      getHallMachineWise(commonParams),
      getHallHourlyTrend({
        hall: hallCode,
        date: filters.date,
        machine: filters.machine,
        shift: filters.shift,
      }),
      getHallShiftSummary(commonParams),
      getHallMachines({ hall: hallCode }),
    ]);

    const [
      statsRes,
      machineWiseRes,
      hourlyRes,
      shiftSummaryRes,
      machinesRes,
    ] = results;
    const failures = [];

    if (
      statsRes.status === "fulfilled" &&
      statsRes.value?.success &&
      statsRes.value.data &&
      typeof statsRes.value.data === "object"
    ) {
      setStats(statsRes.value.data);
    } else {
      failures.push("stats");
    }

    if (
      machineWiseRes.status === "fulfilled" &&
      machineWiseRes.value?.success
    ) {
      setMachineWise(toArray(machineWiseRes.value.data));
    } else {
      failures.push("machine-wise");
    }

    if (hourlyRes.status === "fulfilled" && hourlyRes.value?.success) {
      setHourlyTrend(toArray(hourlyRes.value.data?.trend));
    } else {
      failures.push("hourly-trend");
    }

    if (
      shiftSummaryRes.status === "fulfilled" &&
      shiftSummaryRes.value?.success
    ) {
      setShiftSummary(toArray(shiftSummaryRes.value.data));
    } else {
      failures.push("shift-summary");
    }

    if (machinesRes.status === "fulfilled" && machinesRes.value?.success) {
      setMachines(toArray(machinesRes.value.data));
    } else {
      failures.push("machines");
    }

    if (failures.length)
      setError(`Some sections failed to load: ${failures.join(", ")}`);
    setLoading(false);
  }, [hallCode, filters.date, filters.machine, filters.shift]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleApplyFilters = () => setFilters(draftFilters);
  const handleReset = () => {
    const fresh = defaultFilters();
    setDraftFilters(fresh);
    setFilters(fresh);
  };
  const handleExport = () =>
    exportHallDashboardToExcel({ hallCode, filters, stats, machineWise });
  const handleBack = () => navigate(-1);
  const handleHeatmap = () => navigate(`/management/halls/${hallId}/heatmap`);

  const chartData = useMemo(
    () => buildHourlyChartData(hourlyTrend),
    [hourlyTrend],
  );

  const kpiCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        id: "actual",
        title: "Total Actual",
        value: stats.actual?.toLocaleString?.() ?? stats.actual,
        subtitle: `Target: ${stats.target?.toLocaleString?.() ?? stats.target}`,
        icon: IconTrendUp,
      },
      {
        id: "target",
        title: "Target",
        value: stats.target?.toLocaleString?.() ?? stats.target,
        subtitle: `Hall ${hallCode}`,
        icon: IconTarget,
      },
      {
        id: "reject",
        title: "Rejects",
        value: stats.reject?.toLocaleString?.() ?? stats.reject,
        subtitle: `${pct(Number(stats.reject) || 0, Number(stats.actual) || 0)}% of actual output`,
        icon: IconAlert,
        tone: "negative",
      },
      {
        id: "achievement",
        title: "Achievement",
        value: `${stats.achievement}%`,
        subtitle: "Target vs Actual",
        icon: IconAward,
      },
      {
        id: "oee",
        title: "OEE",
        value: `${stats.oee}%`,
        subtitle: "Overall equipment eff.",
        icon: IconGauge,
      },
    ];
  }, [stats, hallCode]);

  const hasStatsData =
    !!stats &&
    (Number(stats.actual) || 0) +
      (Number(stats.target) || 0) +
      (Number(stats.reject) || 0) >
      0;
  const showNoDataWarning = !loading && stats && !hasStatsData;

  if (!hallCode) return <Navigate to="/production/dashboard" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F2F4]">
      <style>{`
        @keyframes hdCardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hdValuePop { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2.5 py-1.5">
          <DashboardHeader
            hallCode={hallCode}
            dateLabel={formatDisplay(filters.date)}
            onBack={handleBack}
            onHeatmap={handleHeatmap}
            onExport={handleExport}
            draft={draftFilters}
            setDraft={setDraftFilters}
            onApply={handleApplyFilters}
            onRefresh={fetchAll}
            onReset={handleReset}
            loading={loading}
            machineList={machines}
            message={
              error
                ? error
                : showNoDataWarning
                  ? "No data available for the selected date/filters. Try a different date, machine, or shift."
                  : null
            }
          />

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            {/* Row 1: KPI cards + Shift summary (left) / Machine-wise breakdown (right). */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:flex-[0_0_44%] lg:grid-cols-2">
              <div className="flex min-h-0 flex-col gap-3 overflow-hidden lg:h-full">
                {loading && !stats ? (
                  <div className="flex-shrink-0 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[92px] animate-pulse border border-[#E1E4E9] bg-[#E1E4E9]/30"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex-shrink-0 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {kpiCards.map((item) => (
                      <KpiCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                  <ShiftSummaryPanel rows={shiftSummary} loading={loading} />
                </div>
              </div>

              <div className="min-h-0 lg:h-full">
                <MachineWiseTable rows={machineWise} loading={loading} />
              </div>
            </div>

            {/* Row 2: Hourly chart fills all remaining space. */}
            <div className="flex min-h-0 flex-1 flex-col">
              <HourlyChartCard chartData={chartData} loading={loading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagementHallDashboard;