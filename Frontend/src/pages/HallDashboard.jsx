// HallDashboard.jsx — fully self-contained, no sub-components, no framer-motion
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
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
} from "lucide-react";

import {
  getHallStats,
  getHallMachineWise,
  getHallHourlyTrend,
  getHallShiftSummary,
  getHallTopRejects,
  getHallMachines,
} from "../api/hallDashboardApi";
import { getHallCodeFromId } from "../data/dashboardData";
import { exportHallDashboardToExcel } from "../utils/exportHallDashboard";

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
const MIN_CHART_HEIGHT = 160;

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

// ==========================================================
// Inline icons (KPI cards)
// ==========================================================
const IconTarget = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...p}
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </svg>
);
const IconTrendUp = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);
const IconAlert = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M12 9v4M12 17h.01" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const IconGauge = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M12 14l4-4M4 15a8 8 0 1 1 16 0" />
  </svg>
);
const IconAward = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
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
// Animated starfield background — pure CSS, no library
// ==========================================================
const StarsBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.6 + 0.6,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes hdStarTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }
      `}</style>
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "9999px",
            background: "#0F1D24",
            animation: `hdStarTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

// ==========================================================
// Custom themed date picker (single date, no native input)
// ==========================================================
const CustomDatePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDateKey(value));
  const wrapperRef = useRef(null);

  useEffect(() => {
    setViewDate(parseDateKey(value));
  }, [value]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        className="flex h-7 flex-shrink-0 items-center gap-1.5 rounded-sm border border-[#C6C6C6] bg-white px-2 text-xs font-medium text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
      >
        <Calendar size={13} className="text-[#9B9B9B]" />
        <span className="whitespace-nowrap">{formatDisplay(selectedKey)}</span>
      </button>

      <div
        className={`absolute left-0 top-9 z-50 w-60 origin-top overflow-hidden rounded-sm border border-[#C6C6C6]/60 bg-white shadow-xl transition-all duration-150 ease-out ${open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
      >
        <div className="flex items-center justify-between bg-[#0F1D24] px-2 py-1.5">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-5 w-5 items-center justify-center rounded-sm text-[#FDC94D] transition hover:bg-white/10"
          >
            <ChevronLeft size={12} />
          </button>
          <span className="text-[11px] font-bold text-white">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex h-5 w-5 items-center justify-center rounded-sm text-[#FDC94D] transition hover:bg-white/10"
          >
            <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 px-1.5 pt-1.5">
          {WEEKDAYS.map((w, i) => (
            <div
              key={`${w}-${i}`}
              className="flex h-5 items-center justify-center text-[9px] font-semibold text-[#9B9B9B]"
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 px-1.5 pb-1.5">
          {calendarDays.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="h-6 w-6" />;
            const key = toDateKey(date);
            const isSelected = key === selectedKey,
              isToday = key === todayKey;
            return (
              <button
                type="button"
                key={key}
                onClick={() => handleSelect(date)}
                className={`flex h-6 w-6 items-center justify-center rounded-sm text-[10px] font-semibold transition-colors ${isSelected ? "bg-[#FDC94D] text-[#0F1D24]" : isToday ? "border border-[#0F1D24]/40 text-[#0F1D24]" : "text-[#0F1D24] hover:bg-[#F5F5F5]"}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2 py-1">
          <button
            type="button"
            onClick={() => handleSelect(new Date())}
            className="text-[10px] font-semibold text-[#0F1D24] hover:text-[#FDC94D]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[10px] font-medium text-[#9B9B9B] hover:text-[#0F1D24]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomSelect = ({
  value,
  onChange,
  options = [],
  icon: Icon,
  maxWidth = 190,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected
    ? selected.label
    : options[0]?.label || "Select";
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
        className="flex h-7 min-w-[110px] flex-shrink-0 items-center gap-1.5 rounded-sm border border-[#C6C6C6] bg-white px-2 text-xs font-medium text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
      >
        {Icon && <Icon size={12} className="shrink-0 text-[#9B9B9B]" />}
        <span className="min-w-0 flex-1 truncate text-left">
          {displayLabel}
        </span>
        <ChevronDown
          size={10}
          className={`shrink-0 text-[#9B9B9B] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute left-0 top-9 z-50 max-h-56 w-64 origin-top overflow-y-auto rounded-sm border border-[#C6C6C6]/60 bg-white py-1 shadow-xl transition-all duration-150 ease-out ${open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
      >
        {options.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => handleSelect(opt)}
            className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[11px] font-medium transition-colors ${value === opt.value ? "bg-[#FDC94D]/20 text-[#0F1D24]" : "text-[#0F1D24] hover:bg-[#F5F5F5]"}`}
          >
            <span className="truncate">{opt.label}</span>
            {value === opt.value && (
              <Check size={9} className="shrink-0 text-[#0F1D24]" />
            )}
          </button>
        ))}
        {options.length === 0 && (
          <p className="px-2.5 py-1.5 text-[10px] text-[#9B9B9B]">
            No options available
          </p>
        )}
      </div>
    </div>
  );
};

// ==========================================================
// Filter bar — back button + date/machine/shift + actions
// ==========================================================
const FilterBar = ({
  draft,
  setDraft,
  onApply,
  onRefresh,
  onReset,
  onExport,
  onHeatmap,
  onBack,
  loading,
  machineList,
}) => {
  const machineOptions = useMemo(
    () => [
      { value: "All", label: "All Machines" },
      ...machineList.map((m) => ({
        value: m.machine_code,
        label: m.machine_name || m.machine_code,
      })),
    ],
    [machineList],
  );
  const shiftOptions = [
    { value: "All", label: "All Shifts" },
    { value: "A", label: "Shift A" },
    { value: "B", label: "Shift B" },
  ];

  return (
    <div className="flex min-h-10 flex-shrink-0 flex-wrap items-center gap-2 rounded-sm border border-[#C6C6C6]/50 bg-white px-2 py-1.5 shadow-sm">
      <button
        onClick={onBack}
        title="Back"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-[#C6C6C6] bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24] hover:bg-[#F5F5F5]"
      >
        <ArrowLeft size={14} />
      </button>

      <div className="mx-0.5 h-5 w-px flex-shrink-0 bg-[#C6C6C6]" />

      <CustomDatePicker
        value={draft.date}
        onChange={(date) => setDraft((p) => ({ ...p, date }))}
      />
      <CustomSelect
        value={draft.machine}
        onChange={(machine) => setDraft((p) => ({ ...p, machine }))}
        options={machineOptions}
        maxWidth={210}
      />
      <CustomSelect
        value={draft.shift}
        onChange={(shift) => setDraft((p) => ({ ...p, shift }))}
        options={shiftOptions}
      />

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          onClick={onApply}
          title="Apply selected filters"
          className="flex h-7 items-center gap-1.5 rounded-sm bg-[#0F1D24] px-2 text-[11px] font-semibold text-[#FDC94D] transition-colors hover:bg-[#0F1D24]/90"
        >
          <Filter size={13} />
          <span className="hidden md:inline">Apply</span>
        </button>
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh data"
          className="flex h-7 items-center gap-1.5 rounded-sm border border-[#C6C6C6] bg-white px-2 text-[11px] font-semibold text-[#0F1D24] transition-colors hover:bg-[#F5F5F5] disabled:opacity-60"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span className="hidden md:inline">Refresh</span>
        </button>
        <button
          onClick={onReset}
          title="Reset filters"
          className="flex h-7 items-center gap-1.5 rounded-sm border border-red-200 bg-red-50 px-2 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          <RotateCcw size={13} />
          <span className="hidden md:inline">Reset</span>
        </button>
      </div>

      <div className="mx-0.5 hidden h-5 w-px flex-shrink-0 bg-[#C6C6C6] lg:block" />

      <div className="flex flex-shrink-0 items-center gap-1.5 lg:ml-auto">
        <button
          onClick={onHeatmap}
          title="View hall achievement heatmap"
          className="flex h-7 items-center gap-1.5 rounded-sm border border-[#FDC94D]/60 bg-[#FDC94D]/10 px-2 text-[11px] font-semibold text-[#0F1D24] transition-colors hover:bg-[#FDC94D]/20"
        >
          <LayoutGrid size={13} />
          <span className="hidden sm:inline">Heatmap</span>
        </button>
        <button
          onClick={onExport}
          title="Export data to Excel"
          className="flex h-7 items-center gap-1.5 rounded-sm border border-[#C6C6C6] bg-white px-2 text-[11px] font-semibold text-[#0F1D24] transition-colors hover:bg-[#F5F5F5]"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================================
// No-data warning banner
// ==========================================================
const NoDataWarning = ({ message }) => (
  <div className="flex flex-shrink-0 items-center gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
    <AlertTriangle size={14} className="flex-shrink-0" />
    {message}
  </div>
);

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
// KPI card — instrument-panel style: gradient icon badge,
// faded watermark icon, tabular value, animated reveal rail.
// ==========================================================
const KPI_TONE = {
  green: {
    value: "text-emerald-600",
    badge: "linear-gradient(135deg, #10b981, #059669)",
    iconText: "text-white",
    glow: "rgba(16,185,129,0.14)",
    rail: "#10b981",
    watermark: "text-emerald-600",
  },
  blue: {
    value: "text-[#0F1D24]",
    badge: "linear-gradient(135deg, #1c3644, #0F1D24)",
    iconText: "text-[#FDC94D]",
    glow: "rgba(15,29,36,0.10)",
    rail: "#0F1D24",
    watermark: "text-[#0F1D24]",
  },
  red: {
    value: "text-red-600",
    badge: "linear-gradient(135deg, #ef4444, #dc2626)",
    iconText: "text-white",
    glow: "rgba(239,68,68,0.14)",
    rail: "#ef4444",
    watermark: "text-red-600",
  },
  amber: {
    value: "text-[#0F1D24]",
    badge: "linear-gradient(135deg, #FDC94D, #f0b62e)",
    iconText: "text-[#0F1D24]",
    glow: "rgba(253,201,77,0.22)",
    rail: "#FDC94D",
    watermark: "text-[#FDC94D]",
  },
};

const KpiCard = ({ item, index }) => {
  const tone = KPI_TONE[item.tone] || KPI_TONE.blue;
  const isAlert = item.tone === "red";
  const Icon = item.icon;
  const display = useCountUp(item.value);

  return (
    <div
      style={{ animation: `hdCardIn 0.3s ease-out ${index * 0.04}s both` }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,29,36,0.05)] transition-all duration-300 hover:-translate-y-[3px] hover:border-transparent hover:shadow-[0_16px_30px_-12px_rgba(15,29,36,0.25)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: tone.glow }}
      />

      <Icon
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 opacity-[0.06] transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.09] ${tone.watermark}`}
      />

      <div className="relative flex items-center justify-between">
        <div
          style={{
            background: tone.badge,
            ...(isAlert
              ? { animation: "hdAlertPulse 0.8s ease-in-out infinite" }
              : {}),
          }}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded shadow-[0_4px_10px_-2px_rgba(15,29,36,0.35)] transition-transform duration-300 group-hover:scale-105 ${tone.iconText}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        {isAlert && (
          <span
            className="flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500"
            style={{ animation: "hdAlertPulse 1.8s ease-in-out infinite" }}
          />
        )}
      </div>

      <div className="relative mt-2">
        <p className="flex items-center gap-1 truncate text-[9px] font-bold uppercase leading-none tracking-wider text-[#9B9B9B]">
          <span
            className="h-1 w-1 flex-shrink-0 rounded-full"
            style={{ background: tone.rail }}
          />
          {item.title}
        </p>
        <h2
          style={{
            animation: `hdValuePop 0.35s ease-out ${index * 0.04 + 0.05}s both`,
          }}
          className={`mt-1 font-mono text-[26px] font-extrabold leading-none tracking-tight tabular-nums ${tone.value}`}
        >
          {display}
        </h2>
        <p className="mt-1 truncate text-[9.5px] font-semibold leading-none text-[#9B9B9B]">
          {item.subtitle}
        </p>
      </div>

      <div
        className="relative mt-2.5 h-[3px] w-full origin-left scale-x-0 overflow-hidden rounded-full bg-[#F5F5F5]"
        style={{
          animation: `hdRailReveal 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.05 + 0.15}s both`,
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{ background: tone.rail }}
        />
      </div>
    </div>
  );
};

// ==========================================================
// Hourly Target vs Actual chart
// ==========================================================
const buildHourlyChartData = (trend) => {
  const byHour = new Map();
  (trend || []).forEach((d) => byHour.set(d.hour, d));
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
                rx={pillH / 2}
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
              rx={2}
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
              rx={2}
              fill={BAR_COLORS.actual}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.55}
              style={{
                transformOrigin: `${g.barX2 + g.barW / 2}px ${PADDING.top + chartH}px`,
                animation: `hdGrowBar 450ms ease-out ${i * 16 + 40}ms both`,
              }}
            />
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
          className="pointer-events-none absolute z-10 rounded-sm border border-[#C6C6C6]/60 bg-white px-2 py-1.5 text-[10px] shadow-md"
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
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
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
                className="h-1.5 w-1.5 rounded-sm"
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
                className="h-1.5 w-1.5 rounded-sm"
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
  const totalTarget = useMemo(
    () => chartData.reduce((s, d) => s + d.target, 0),
    [chartData],
  );
  const totalActual = useMemo(
    () => chartData.reduce((s, d) => s + d.actual, 0),
    [chartData],
  );
  const hasData = totalTarget + totalActual > 0;

  const peak = useMemo(() => {
    let best = { hour: "-", value: 0 };
    chartData.forEach((d) => {
      if (d.actual > best.value) best = { hour: d.hour, value: d.actual };
    });
    return best;
  }, [chartData]);

  return (
    <>
      <style>{`
        @keyframes hdGrowBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      `}</style>

      <div className="flex min-h-0 flex-1 flex-col rounded-sm border border-[#C6C6C6]/60 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,29,36,0.04)]">
        <div className="mb-1 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 pr-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0F1D24]">
              <IconBarChart className="h-3 w-3 text-[#FDC94D]" />
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
              <div className="flex items-center gap-1.5 rounded-full border border-[#0F1D24]/20 bg-[#0F1D24]/5 px-2 py-0.5">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ background: BAR_COLORS.target }}
                />
                <span className="text-[10px] font-semibold text-[#0F1D24]">
                  Target
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#FDC94D]/50 bg-[#FDC94D]/10 px-2 py-0.5">
                <span
                  className="h-2 w-2 rounded-sm"
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
              className="flex h-6 items-center gap-1 rounded-sm bg-[#0F1D24] px-2 text-[9px] font-semibold text-[#FDC94D] transition hover:bg-[#1a2e38]"
            >
              <Expand size={11} /> Zoom
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-full min-h-[160px] items-center justify-center text-[11px] text-[#9B9B9B]">
            Loading hourly data...
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            {!hasData && (
              <div className="mb-1 flex-shrink-0 rounded-sm border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
                No production recorded for this date — showing 0 for every hour.
              </div>
            )}
            <div className="min-h-0 flex-1">
              <Chart chartData={chartData} />
            </div>
            <div className="mt-1 flex flex-shrink-0 items-center justify-end border-t border-[#C6C6C6]/40 pt-1">
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
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6]/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#0F1D24]">
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
                className="flex h-8 w-8 items-center justify-center rounded-sm text-[#9B9B9B] transition hover:bg-[#0F1D24]/5"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!hasData && (
            <div className="flex-shrink-0 border-b border-amber-100 bg-amber-50 px-5 py-1.5 text-[10px] font-medium text-amber-700">
              No production recorded for this date — showing 0 for every hour.
            </div>
          )}

          <div className="min-h-0 flex-1 px-6 py-4">
            <Chart chartData={chartData} />
          </div>

          <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/40 bg-[#0F1D24]/[0.02] px-5 py-2">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-[#9B9B9B]">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ background: BAR_COLORS.target }}
                />{" "}
                Target
              </span>
              <span className="flex items-center gap-1 text-[#9B9B9B]">
                <span
                  className="h-2 w-2 rounded-sm"
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
const HallDashboard = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const hallCode = getHallCodeFromId(hallId);

  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);

  const [stats, setStats] = useState(null);
  const [machineWise, setMachineWise] = useState([]);
  const [hourlyTrend, setHourlyTrend] = useState([]);
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
      getHallTopRejects({ ...commonParams, limit: 5 }),
      getHallMachines({ hall: hallCode }),
    ]);

    const [statsRes, machineWiseRes, hourlyRes, , , machinesRes] = results;
    const failures = [];

    if (statsRes.status === "fulfilled" && statsRes.value.success)
      setStats(statsRes.value.data);
    else failures.push("stats");
    if (machineWiseRes.status === "fulfilled" && machineWiseRes.value.success)
      setMachineWise(machineWiseRes.value.data);
    else failures.push("machine-wise");
    if (hourlyRes.status === "fulfilled" && hourlyRes.value.success)
      setHourlyTrend(hourlyRes.value.data.trend);
    else failures.push("hourly-trend");
    if (machinesRes.status === "fulfilled" && machinesRes.value.success)
      setMachines(machinesRes.value.data);
    else failures.push("machines");

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
  const handleHeatmap = () => navigate(`/production/halls/${hallId}/heatmap`);

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
        tone: "green",
      },
      {
        id: "target",
        title: "Target",
        value: stats.target?.toLocaleString?.() ?? stats.target,
        subtitle: `Hall ${hallCode}`,
        icon: IconTarget,
        tone: "blue",
      },
      {
        id: "reject",
        title: "Rejects",
        value: stats.reject?.toLocaleString?.() ?? stats.reject,
        subtitle: "Total rejected qty",
        icon: IconAlert,
        tone: "red",
      },
      {
        id: "achievement",
        title: "Achievement",
        value: `${stats.achievement}%`,
        subtitle: "Target vs Actual",
        icon: IconAward,
        tone: "amber",
      },
      {
        id: "oee",
        title: "OEE",
        value: `${stats.oee}%`,
        subtitle: "Overall equipment eff.",
        icon: IconGauge,
        tone: "blue",
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

  // Was `<Navigate to="/" replace />` — landed on the public Home page for
  // an invalid/unknown hallId. Sending to the production dashboard instead
  // keeps the person inside the app they were already using.
  if (!hallCode) return <Navigate to="/production/dashboard" replace />;

  return (
    <div className="relative h-screen overflow-hidden bg-[#F5F5F5]">
      <style>{`
        @keyframes hdCardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hdValuePop { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes hdAlertPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes hdSectionIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hdRailReveal { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      <StarsBackground />

      <div className="relative z-10 mx-auto flex h-full max-w-[1800px] flex-col gap-2 px-1 py-2 sm:px-2 lg:px-2">
        {error && (
          <div className="flex-shrink-0 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {error}
          </div>
        )}

        <div className="flex-shrink-0">
          <FilterBar
            draft={draftFilters}
            setDraft={setDraftFilters}
            onApply={handleApplyFilters}
            onRefresh={fetchAll}
            onReset={handleReset}
            onExport={handleExport}
            onHeatmap={handleHeatmap}
            onBack={handleBack}
            loading={loading}
            machineList={machines}
          />
        </div>

        {showNoDataWarning && (
          <NoDataWarning message="No data available for the selected date/filters. Try a different date, machine, or shift." />
        )}

        {loading && !stats ? (
          <div className="flex-shrink-0 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[104px] animate-pulse rounded-lg border border-[#C6C6C6]/50 bg-[#C6C6C6]/20"
              />
            ))}
          </div>
        ) : (
          <div className="flex-shrink-0 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
            {kpiCards.map((item, i) => (
              <KpiCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}

        <HourlyChartCard chartData={chartData} loading={loading} />
      </div>
    </div>
  );
};

export default HallDashboard;