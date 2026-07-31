// HallDashboard.jsx — matches ProductionDashboard.jsx theme:
// neutral slate enterprise light theme, navy control header, rounded-[2px]
// flat cards, shadow-sm, ACCENT_BLUE #2563EB / NAVY #0F1D24 / GOLD #FDC94D.
// Layout: KPI row (5 cards incl. OEE) -> Shift Summary (L) + Machine-Breakdown (R) -> Hourly chart (full width)
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
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineCalendarDateRange,
  HiOutlineFunnel,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineArrowLeft,
  HiOutlineSquares2X2,
  HiOutlineExclamationTriangle,
  HiOutlineCube,
  HiOutlineRectangleStack,
  HiOutlineArrowsPointingOut,
} from "react-icons/hi2";
// import { IoGaugeOutline } from 'react-icons/io5';

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

// ============================================================
// THEME TOKENS — matches ProductionDashboard.jsx exactly
// ============================================================
const PAGE_BG = "#F8FAFC";
const ACCENT_BLUE = "#2563EB";
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const SUCCESS = "#16A34A";
const WARNING = "#D97706";
const DANGER = "#DC2626";
const SHIFT_A_BG = "#FFFBEB";
const SHIFT_B_BG = "#F1F5F9";

const CARD = "rounded-[2px] border border-[#E2E8F0] bg-white shadow-sm";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];
const isShiftA = (h) => SHIFT_A_HOURS.includes(h);

// ==========================================================
// Array-safety + date helpers
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
const formatDisplayDate = (key) =>
  !key
    ? "—"
    : parseDateKey(key).toLocaleDateString("en-GB", {
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
const fmt = (n) => (n ?? 0).toLocaleString("en-IN");
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);
const effColor = (eff) => (eff >= 90 ? SUCCESS : eff >= 60 ? WARNING : DANGER);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// ==========================================================
// Custom date picker
// ==========================================================
const CustomDatePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDateKey(value));
  const [coords, setCoords] = useState(null);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => setViewDate(parseDateKey(value)), [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCoords = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const panelWidth = 232;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    setCoords({ top: rect.bottom + 4, left });
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
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) cells.push(new Date(year, month, day));
    return cells;
  }, [viewDate]);

  const changeMonth = (delta) =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  const handleSelect = (date) => {
    onChange(toDateKey(date));
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
      >
        <HiOutlineCalendarDays className="h-3.5 w-3.5" />
        {formatDisplayDate(selectedKey)}
      </button>

      {open && coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left }}
            className="z-[9999] w-58 overflow-hidden rounded-[2px] border border-[#E2E8F0] bg-white shadow-lg"
          >
            <div className="flex items-center justify-between bg-[#0F1D24] px-2.5 py-2">
              <button type="button" onClick={() => changeMonth(-1)} className="flex h-5 w-5 items-center justify-center text-[#FDC94D] hover:bg-white/10">
                <HiOutlineChevronLeft className="h-3 w-3" />
              </button>
              <span className="text-[11px] font-bold text-white">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button type="button" onClick={() => changeMonth(1)} className="flex h-5 w-5 items-center justify-center text-[#FDC94D] hover:bg-white/10">
                <HiOutlineChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-[#E2E8F0] p-px">
              {WEEKDAYS.map((w, i) => (
                <div key={`${w}-${i}`} className="flex h-5 items-center justify-center bg-[#F8FAFC] text-[9px] font-bold uppercase text-[#94A3B8]">
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
                    ${isSelected ? "bg-[#0F1D24] text-[#FDC94D] hover:bg-[#0F1D24]" : "text-[#0F172A]"}
                    ${isToday && !isSelected ? "font-bold underline decoration-[#FDC94D] decoration-2 underline-offset-2" : ""}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E8F0] px-2.5 py-1.5">
              <button type="button" onClick={() => handleSelect(new Date())} className="text-[10px] font-bold text-[#0F1D24] hover:underline">
                Today
              </button>
              <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-semibold text-[#94A3B8] hover:text-[#0F1D24]">
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
// Custom select
// ==========================================================
const CustomSelect = ({ value, onChange, options = [], maxWidth = 190 }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCoords = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const panelWidth = 224;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    setCoords({ top: rect.bottom + 4, left, minWidth: rect.width });
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
  const displayLabel = selected ? selected.label : safeOptions[0]?.label || "Select";
  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ maxWidth }}
        className="flex h-7 min-w-[100px] items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
      >
        <span className="min-w-0 flex-1 truncate text-left">{displayLabel}</span>
        <HiOutlineChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left, minWidth: coords.minWidth }}
            className="z-[9999] max-h-56 w-56 overflow-y-auto rounded-[2px] border border-[#E2E8F0] bg-white py-1 shadow-lg"
          >
            {safeOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] font-semibold transition-colors duration-100
                ${value === opt.value ? "bg-[#FDC94D]/20 text-[#0F172A]" : "text-[#334155] hover:bg-[#F8FAFC]"}`}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <HiOutlineCheck className="h-3 w-3 shrink-0 text-[#0F172A]" />}
              </button>
            ))}
            {safeOptions.length === 0 && (
              <p className="px-3 py-1.5 text-[10px] text-[#94A3B8]">No options available</p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

// ==========================================================
// Control header
// ==========================================================
function ControlBox({
  hallCode, onBack, draft, setDraft, onApply, onRefresh, onReset,
  onHeatmap, onExport, loading, machineList, dirty, message,
}) {
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
    <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto">
        <div className="flex flex-shrink-0 items-center gap-2.5">
          <button
            onClick={onBack}
            title="Back"
            className="flex h-7 w-7 items-center justify-center border border-white/15 text-white transition-colors duration-100 hover:border-white/30 hover:bg-white/5"
          >
            <HiOutlineArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div className="min-w-0">
            <h1 className="whitespace-nowrap text-[16px] font-extrabold uppercase leading-none tracking-wide text-white">
              {hallCode} Dashboard
            </h1>
            <p className="mt-1 whitespace-nowrap font-mono text-[9px] leading-none text-white/50">
              {formatDisplayDate(draft.date)}
            </p>
          </div>
        </div>

        <div className="h-6 w-px flex-shrink-0 bg-white/10" />

        <div className="flex flex-shrink-0 items-center gap-2">
          <CustomDatePicker value={draft.date} onChange={(date) => setDraft((p) => ({ ...p, date }))} />
          <CustomSelect value={draft.machine} onChange={(machine) => setDraft((p) => ({ ...p, machine }))} options={machineOptions} maxWidth={190} />
          <CustomSelect value={draft.shift} onChange={(shift) => setDraft((p) => ({ ...p, shift }))} options={shiftOptions} />
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={onApply}
            className="flex h-7 items-center gap-1.5 bg-[#FDC94D] px-3 text-[10.5px] font-extrabold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/90"
          >
            <HiOutlineCheck className="h-3.5 w-3.5" /> Apply
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30 disabled:opacity-50"
          >
            <HiOutlineArrowPath className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>

          <button
            onClick={onReset}
            className="flex h-7 items-center gap-1.5 border border-red-400/40 bg-red-500/10 px-2.5 text-[10.5px] font-semibold text-red-300 transition-colors duration-100 hover:bg-red-500/20"
          >
            <HiOutlineXMark className="h-3.5 w-3.5" /> Reset
          </button>

          {dirty && (
            <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-[#FDC94D]">
              Unapplied changes
            </span>
          )}
        </div>

        {/* message shows inline, same row — grows to fill remaining space */}
        {message ? (
          <div className="flex h-7 min-w-0 flex-1 shrink items-center gap-1.5 border border-amber-400/30 bg-amber-500/10 px-2.5 text-[10.5px] font-semibold text-amber-300">
            <HiOutlineExclamationTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{message}</span>
          </div>
        ) : (
          <div className="min-w-[8px] flex-1" />
        )}

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={onHeatmap}
            className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineSquares2X2 className="h-3.5 w-3.5" /> Heatmap
          </button>

          <button
            onClick={onExport}
            className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>
    </header>
  );
}

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
      setDisplay(`${isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString()}${suffix}`);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      else prevRef.current = targetNum;
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => frameRef.current && cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return display;
};

// ==========================================================
// KPI cards row — 5 cards (Actual / Target / Rejects / Achievement / OEE)
// Styled to match SummaryCard from ProductionDashboard.jsx: flat rounded-[2px]
// card, icon badge top-right, big mono number, two-stat footer, efficiency bar.
// ==========================================================
const KpiCard = ({
  title,
  subtitle,
  icon: Icon,
  value,
  badgeColor,
  footerLeftLabel,
  footerLeftValue,
  footerRightLabel,
  footerRightValue,
  barValue,
  barColor,
}) => {
  const display = useCountUp(value);
  const resolvedBarColor = barColor || effColor(barValue ?? 0);

  return (
    <div className="group flex min-w-[168px] flex-1 flex-col rounded-[2px] border border-[#E2E8F0] bg-white p-2 text-left shadow-sm transition-all duration-150 hover:-translate-y-[2px] hover:shadow-md">
      <div className="mb-1 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-bold leading-tight text-[#0F172A]">
            {title}
          </h3>
          <p className="mt-0.5 truncate text-[8.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
            {subtitle}
          </p>
        </div>
        {Icon && (
          <div
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[2px]"
            style={{ background: `${badgeColor}1A`, color: badgeColor }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <p className="mt-1 font-mono text-[26px] font-extrabold leading-none text-[#0F172A]">
        {display}
      </p>

      {(footerLeftLabel || footerRightLabel) && (
        <div className="mt-2.5 flex items-center gap-4 border-t border-[#EEF2F6] pt-2">
          {footerLeftLabel && (
            <div className="leading-none">
              <p className="text-[7.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
                {footerLeftLabel}
              </p>
              <p className="mt-0.5 font-mono text-[12px] font-bold text-[#0F172A]">
                {footerLeftValue}
              </p>
            </div>
          )}
          {footerRightLabel && (
            <div className="leading-none">
              <p className="text-[7.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
                {footerRightLabel}
              </p>
              <p className="mt-0.5 font-mono text-[12px] font-bold text-[#0F172A]">
                {footerRightValue}
              </p>
            </div>
          )}
        </div>
      )}

      {barValue !== undefined && barValue !== null && (
        <>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#475569]">Efficiency</span>
            <span
              className="font-mono text-[13px] font-extrabold"
              style={{ color: resolvedBarColor }}
            >
              {barValue}%
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-[2px] bg-[#EEF2F6]">
            <div
              className="h-full rounded-[2px] transition-[width] duration-500 ease-out"
              style={{
                width: `${Math.min(Math.max(barValue, 0), 100)}%`,
                background: resolvedBarColor,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

const KpiCardsRow = ({ stats, hallCode, loading }) => {
  const target = Number(stats?.target) || 0;
  const actual = Number(stats?.actual) || 0;
  const reject = Number(stats?.reject) || 0;
  const achievement = stats?.achievement ?? pct(actual, target);
  const oee = stats?.oee ?? 0;
  const rejectPct = pct(reject, actual);
  const rejectColor = rejectPct <= 5 ? SUCCESS : rejectPct <= 15 ? WARNING : DANGER;

  if (loading && !stats) {
    return (
      <div className="flex flex-shrink-0 gap-2 overflow-x-auto p-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[150px] min-w-[168px] flex-1 animate-pulse rounded-[2px] border border-[#E2E8F0] bg-white shadow-sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-shrink-0 gap-2 overflow-x-auto p-1">
      <KpiCard
        title="Total Actual"
        subtitle="Production Output"
        icon={HiOutlineArrowsPointingOut}
        value={actual}
        badgeColor={ACCENT_BLUE}
        footerLeftLabel="Target"
        footerLeftValue={fmt(target)}
        footerRightLabel="Reject"
        footerRightValue={fmt(reject)}
        barValue={achievement}
      />
      <KpiCard
        title="Target"
        subtitle={`Hall ${hallCode}`}
        icon={HiOutlineSquares2X2}
        value={target}
        badgeColor="#B08A2E"
        footerLeftLabel="Actual"
        footerLeftValue={fmt(actual)}
        footerRightLabel="Achv %"
        footerRightValue={`${achievement}%`}
        barValue={achievement}
      />
      <KpiCard
        title="Rejects"
        subtitle="Quality Loss"
        icon={HiOutlineExclamationTriangle}
        value={reject}
        badgeColor={DANGER}
        footerLeftLabel="Actual"
        footerLeftValue={fmt(actual)}
        footerRightLabel="Reject %"
        footerRightValue={`${rejectPct}%`}
        barValue={rejectPct}
        barColor={rejectColor}
      />
      <KpiCard
        title="Achievement"
        subtitle="Target vs Actual"
        icon={HiOutlineCube}
        value={`${achievement}%`}
        badgeColor={SUCCESS}
        footerLeftLabel="Target"
        footerLeftValue={fmt(target)}
        footerRightLabel="Actual"
        footerRightValue={fmt(actual)}
        barValue={achievement}
      />
      <KpiCard
        title="OEE"
        subtitle="Equipment Effectiveness"
        icon={HiOutlineRectangleStack}
        value={`${oee}%`}
        badgeColor="#7C3AED"
        footerLeftLabel="Target"
        footerLeftValue={fmt(target)}
        footerRightLabel="Actual"
        footerRightValue={fmt(actual)}
        barValue={oee}
      />
    </div>
  );
};

// ==========================================================
// OEE helpers
// ==========================================================
const resolveOee = (row) => {
  const bd = row?.oeeBreakdown;
  if (bd && typeof bd === "object") {
    const availability = Number(bd.availability) || 0;
    const performance = Number(bd.performance) || 0;
    const quality = Number(bd.quality) || 0;
    const computed = Math.round((availability / 100) * (performance / 100) * (quality / 100) * 100);
    if (computed > 0) return { oee: computed, availability, performance, quality };
    const reported = Number(bd.oee) || Number(row.oee) || 0;
    return { oee: reported, availability, performance, quality };
  }
  return { oee: Number(row?.oee) || 0, availability: null, performance: null, quality: null };
};

// ==========================================================
// Machine-wise table
// ==========================================================
const MachineWiseTable = ({ rows, loading }) => {
  const safeRows = toArray(rows);
  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col overflow-hidden ${CARD}`}>
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#EEF2F6] px-4 py-2.5">
        <HiOutlineCube className="h-4 w-4 text-[#0F172A]" />
        <h2 className="text-[13px] font-extrabold text-[#0F172A]">Machine-wise Breakdown</h2>
        <span className="rounded-[2px] bg-[#F1F5F9] px-1.5 py-[1px] text-[10px] font-bold text-[#475569]">
          {safeRows.length}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-[11.5px]">
          <thead className="sticky top-0 z-10 bg-[#F8FAFC] text-[#475569]">
            <tr>
              <th className="px-3 py-2 font-bold">Machine</th>
              <th className="px-3 py-2 text-right font-bold font-mono">Target</th>
              <th className="px-3 py-2 text-right font-bold font-mono">Actual</th>
              <th className="px-3 py-2 text-right font-bold font-mono">Good</th>
              <th className="px-3 py-2 text-right font-bold font-mono">Reject</th>
              <th className="px-3 py-2 text-right font-bold font-mono">Achv %</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-[#94A3B8]">Loading…</td></tr>
            ) : safeRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border-2 border-[#E2E8F0] text-[#94A3B8]">
                      <HiOutlineCalendarDateRange className="h-4.5 w-4.5" />
                    </div>
                    <p className="text-[11.5px] font-semibold text-[#94A3B8]">No machine data for this selection.</p>
                  </div>
                </td>
              </tr>
            ) : (
              safeRows.map((row, idx) => {
                const machineLabel = row.machine || row.machine_name || row.machine_code || "—";
                const target = Number(row.target) || 0;
                const actual = Number(row.actual) || 0;
                const good = Number(row.good ?? actual - (Number(row.rejection ?? row.reject) || 0)) || 0;
                const reject = Number(row.rejection ?? row.reject) || 0;
                const achievement = row.achievement ?? pct(actual, target);
                return (
                  <tr
                    key={row.machine_code || row.machine || row.id || idx}
                    className={`border-t border-[#EEF2F6] transition-colors duration-100 hover:bg-[#F8FAFC] ${idx % 2 === 1 ? "bg-[#FAFBFC]" : "bg-white"}`}
                  >
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1">
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-[2px]" style={{ background: GOLD }} />
                        <span className="font-mono text-[11px] font-extrabold tracking-wide text-[#0F172A]">{machineLabel}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[#94A3B8]">{target.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-[#0F172A]">{actual.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono text-[#16A34A]">{good.toLocaleString()}</td>
                    <td className={`px-3 py-2 text-right font-mono ${reject > 0 ? "font-semibold text-red-600" : "text-[#94A3B8]"}`}>
                      {reject.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-[#0F172A]">{achievement}%</td>
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

// Progress ring
const ProgressRing = ({ value, size = 50, stroke = 6, color }) => {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#EEF2F6" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 600ms ease-out" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="800" fill="#0F172A" fontFamily="ui-monospace, monospace">
        {safeValue}%
      </text>
    </svg>
  );
};

const normalizeShiftKey = (val, idx) => {
  const s = String(val ?? "").trim().toUpperCase();
  if (s === "A" || s === "B") return s;
  if (s === "1" || s === "SHIFT A" || s === "DAY") return "A";
  if (s === "2" || s === "SHIFT B" || s === "NIGHT") return "B";
  return idx === 1 ? "B" : "A";
};

const SHIFT_SWATCH = { A: GOLD, B: NAVY };

// ==========================================================
// Shift A / B summary panel
// ==========================================================
const ShiftSummaryPanel = ({ rows, loading }) => {
  const safeRows = toArray(rows);
  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${CARD}`}>
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#EEF2F6] px-4 py-2.5">
        <HiOutlineRectangleStack className="h-4 w-4 text-[#0F172A]" />
        <h2 className="text-[13px] font-extrabold text-[#0F172A]">Shift Summary</h2>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px overflow-auto bg-[#EEF2F6] sm:grid-cols-2">
        {loading ? (
          <div className="col-span-2 bg-white px-3.5 py-6 text-center text-[11.5px] text-[#94A3B8]">Loading…</div>
        ) : safeRows.length === 0 ? (
          <div className="col-span-2 bg-white px-3.5 py-6 text-center text-[11.5px] text-[#94A3B8]">No shift data for this selection.</div>
        ) : (
          safeRows.map((row, idx) => {
            const target = Number(row.target) || 0;
            const actual = Number(row.actual) || 0;
            const reject = Number(row.rejection ?? row.reject) || 0;
            const achievement = row.achievement ?? pct(actual, target);
            const shiftKey = normalizeShiftKey(row.shift, idx);
            const swatch = SHIFT_SWATCH[shiftKey];
            return (
              <div key={row.shift ?? idx} className="flex items-center gap-3 bg-white p-3">
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-[10.5px] font-bold"
                  style={{ background: swatch, color: shiftKey === "A" ? NAVY : GOLD }}
                >
                  {shiftKey}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F172A]">Shift {shiftKey}</p>
                  <p className="mt-1 text-[8.5px] font-bold uppercase text-[#94A3B8]">Target / Actual</p>
                  <p className="font-mono text-[13px] font-bold text-[#0F172A]">
                    {target.toLocaleString()} / {actual.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[8.5px] font-bold uppercase text-[#94A3B8]">Reject</p>
                  <p className={`font-mono text-[12px] font-bold ${reject > 0 ? "text-red-600" : "text-[#0F172A]"}`}>
                    {reject.toLocaleString()}
                  </p>
                </div>
                <ProgressRing value={achievement} color={swatch === NAVY ? ACCENT_BLUE : swatch} />
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
      shift: isShiftA(hour) ? "A" : "B",
    };
  });
};

function LegendBadge({ label, swatch, filled, active = true, onClick }) {
  const clickable = typeof onClick === "function";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`flex items-center gap-1.5 rounded-[2px] border px-2 py-0.5 text-[10px] font-bold transition-colors duration-100 ${
        active ? "border-[#E2E8F0] text-[#0F172A]" : "border-[#EEF2F6] text-[#B0B7C3]"
      } ${clickable ? "cursor-pointer hover:border-[#CBD5E1]" : "cursor-default"}`}
      style={{ background: active && filled ? `${swatch}22` : "#fff" }}
    >
      <span className="h-2 w-2 rounded-[2px]" style={{ background: active ? swatch : "#CBD5E1" }} />
      {label}
    </button>
  );
}

const Chart = ({ chartData }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [showTarget, setShowTarget] = useState(true);
  const [showActual, setShowActual] = useState(true);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 1100, height: 320 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries)
        setSize({ width: entry.contentRect.width, height: Math.max(entry.contentRect.height, 120) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const pad = { top: 34, right: 16, bottom: 26, left: 40 };
  const chartW = Math.max(width - pad.left - pad.right, 10);
  const chartH = Math.max(height - pad.top - pad.bottom, 10);

  const n = chartData.length;
  const slot = chartW / n;
  const barGroupW = slot * 0.62;
  const barW = barGroupW / 2 - 1.5;

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.target, d.actual)), 1);
  const niceMax = Math.ceil(maxVal * 1.2) || 1;
  const yFor = (v) => pad.top + chartH - (v / niceMax) * chartH;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => niceMax * f);

  const shiftSegments = [];
  chartData.forEach((d, i) => {
    const last = shiftSegments[shiftSegments.length - 1];
    if (last && last.shift === d.shift) last.count += 1;
    else shiftSegments.push({ shift: d.shift, startIdx: i, count: 1 });
  });

  const hovered = hoverIdx !== null ? chartData[hoverIdx] : null;
  const hoveredEff = hovered && hovered.target > 0 ? Math.round((hovered.actual / hovered.target) * 1000) / 10 : 0;

  return (
    <div className="flex h-full flex-col">
      <div ref={containerRef} className="relative min-h-0 flex-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
          {chartData.map((d, i) => (
            <rect
              key={`bg-${i}`}
              x={pad.left + i * slot}
              y={pad.top}
              width={slot}
              height={chartH}
              fill={d.shift === "A" ? SHIFT_A_BG : SHIFT_B_BG}
              stroke="#D8E0E8"
              strokeWidth={1}
            />
          ))}

          <rect
            x={pad.left}
            y={pad.top}
            width={chartW}
            height={chartH}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth={1.5}
          />

          {yTicks.map((tick, i) => (
            <g key={i}>
              <line x1={pad.left} x2={width - pad.right} y1={yFor(tick)} y2={yFor(tick)} stroke="#EEF2F6" strokeWidth={1} />
              <text x={pad.left - 8} y={yFor(tick) + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontFamily="ui-monospace, monospace">
                {Math.round(tick).toLocaleString()}
              </text>
            </g>
          ))}

          {shiftSegments.map((seg, i) => {
            const segX = pad.left + seg.startIdx * slot;
            const segW = seg.count * slot;
            const cx = segX + segW / 2;
            const pillW = 64, pillH = 18;
            return (
              <g key={`seg-${i}`}>
                <rect x={cx - pillW / 2} y={pad.top - 30} width={pillW} height={pillH}
                  fill={seg.shift === "A" ? GOLD : "#94A3B8"} />
                <text x={cx} y={pad.top - 30 + pillH / 2 + 3} textAnchor="middle" fontSize="10" fontWeight="800"
                  fill={seg.shift === "A" ? NAVY : "#fff"}>
                  Shift {seg.shift}
                </text>
              </g>
            );
          })}

          {chartData.map((d, i) => {
            const gx = pad.left + i * slot + (slot - barGroupW) / 2;
            const isHover = hoverIdx === i;
            return (
              <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} style={{ cursor: "pointer" }}>
                <rect x={pad.left + i * slot} y={pad.top} width={slot} height={chartH} fill="transparent" />
                {showTarget && (
                  <rect x={gx} y={yFor(d.target)} width={barW} height={Math.max(chartH - (yFor(d.target) - pad.top), 0)}
                    fill={isHover ? "#94A3B8" : "#CBD5E1"} rx={2} />
                )}
                {showActual && (
                  <rect x={gx + barW + 3} y={yFor(d.actual)} width={barW} height={Math.max(chartH - (yFor(d.actual) - pad.top), 0)}
                    fill={isHover ? ACCENT_BLUE : NAVY} rx={2} />
                )}
                {isHover && (
                  <line x1={pad.left + i * slot + slot / 2} x2={pad.left + i * slot + slot / 2} y1={pad.top} y2={pad.top + chartH}
                    stroke="#0F172A" strokeOpacity="0.12" strokeWidth={1} />
                )}
              </g>
            );
          })}

          {shiftSegments.length > 1 && (
            <line
              x1={pad.left + shiftSegments[1].startIdx * slot}
              x2={pad.left + shiftSegments[1].startIdx * slot}
              y1={pad.top} y2={pad.top + chartH}
              stroke="#CBD5E1" strokeWidth={1.5}
            />
          )}

          {chartData.map((d, i) => (
            <text key={`lbl-${i}`} x={pad.left + i * slot + slot / 2} y={height - 8} textAnchor="middle"
              fontSize="8.5" fontWeight={hoverIdx === i ? 800 : 500} fill={hoverIdx === i ? NAVY : "#94A3B8"}>
              {String(d.hour).padStart(2, "0")}
            </text>
          ))}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 rounded-[2px] border border-[#E2E8F0] bg-white px-2.5 py-2 text-[10px] shadow-lg"
            style={{
              left: `${Math.min(Math.max((hoverIdx / (n - 1 || 1)) * 100, 8), 92)}%`,
              top: 4,
              transform: "translateX(-50%)",
            }}
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="font-semibold text-[#0F172A]">{hovered.label}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#94A3B8]">Target</span>
              <span className="font-mono font-semibold text-[#0F172A]">{fmt(hovered.target)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#94A3B8]">Actual</span>
              <span className="font-mono font-semibold text-[#0F172A]">{fmt(hovered.actual)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#94A3B8]">Efficiency</span>
              <span className="font-mono font-semibold" style={{ color: effColor(hoveredEff) }}>{hoveredEff}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HourlyChartCard = ({ chartData, loading }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const safeChartData = toArray(chartData);
  const totalTarget = useMemo(() => safeChartData.reduce((s, d) => s + d.target, 0), [safeChartData]);
  const totalActual = useMemo(() => safeChartData.reduce((s, d) => s + d.actual, 0), [safeChartData]);
  const hasData = totalTarget + totalActual > 0;

  const peak = useMemo(() => {
    let best = { hour: "-", value: 0 };
    safeChartData.forEach((d) => { if (d.actual > best.value) best = { hour: d.hour, value: d.actual }; });
    return best;
  }, [safeChartData]);

  return (
    <>
      <div className={`flex min-h-0 h-full flex-1 flex-col ${CARD}`}>
        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#EEF2F6] px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <HiOutlineRectangleStack className="h-4 w-4 text-[#0F172A]" />
            <div>
              <h2 className="text-[13px] font-extrabold text-[#0F172A]">Hourly Target vs Actual</h2>
              <p className="text-[9.5px] font-semibold text-[#94A3B8]">Shift A (08:00–20:00) · Shift B (20:00–08:00)</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <LegendBadge label="Target" swatch="#9CA3AF" active />
              <LegendBadge label="Actual" swatch={NAVY} filled active />
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">Peak Hour</p>
              <p className="text-xs font-extrabold text-[#0F172A]">
                {peak.hour !== "-" ? `${String(peak.hour).padStart(2, "0")}:00` : "-"}
                <span className="ml-1 text-[9px] font-semibold text-[#94A3B8]">({peak.value})</span>
              </p>
            </div>
            <button
              onClick={() => setIsZoomed(true)}
              className="flex h-7 items-center gap-1 rounded-[2px] bg-[#0F1D24] px-2.5 text-[9px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90"
            >
              <HiOutlineArrowsPointingOut className="h-3 w-3" /> Zoom
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 p-3">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[11px] text-[#94A3B8]">Loading hourly data...</div>
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              {!hasData && (
                <div className="mb-2 flex-shrink-0 rounded-[2px] border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold text-amber-700">
                  No production recorded for this date — showing 0 for every hour.
                </div>
              )}
              <div className="min-h-0 flex-1"><Chart chartData={safeChartData} /></div>
              <div className="mt-2 flex flex-shrink-0 items-center justify-between border-t border-[#EEF2F6] pt-2">
                <span className="text-[9px] font-semibold text-[#94A3B8]">Data starts <span className="text-[#0F172A]">08:00</span></span>
                <span className="text-[9px] font-semibold text-[#94A3B8]">
                  Target: <span className="text-[#0F172A]">{totalTarget}</span> · Actual: <span className="text-[#0F172A]">{totalActual}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex flex-shrink-0 items-center justify-between bg-[#0F1D24] px-6 py-3.5">
            <div>
              <h2 className="text-sm font-extrabold text-white">Hourly Target vs Actual · Expanded View</h2>
              <p className="text-[10px] text-white/60">Shift A (08:00–20:00) · Shift B (20:00–08:00)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-white/50">Peak Hour</p>
                <p className="text-lg font-extrabold text-white">
                  {peak.hour !== "-" ? `${String(peak.hour).padStart(2, "0")}:00` : "-"}
                  <span className="ml-1 text-[10px] font-semibold text-white/50">({peak.value})</span>
                </p>
              </div>
              <button onClick={() => setIsZoomed(false)} className="flex h-9 w-9 items-center justify-center text-white/70 hover:bg-white/10 hover:text-white">
                <HiOutlineXMark className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!hasData && (
            <div className="flex-shrink-0 border-b border-amber-100 bg-amber-50 px-6 py-2 text-[10px] font-medium text-amber-700">
              No production recorded for this date — showing 0 for every hour.
            </div>
          )}

          <div className="min-h-0 flex-1 px-6 py-4"><Chart chartData={safeChartData} /></div>

          <div className="flex flex-shrink-0 items-center justify-between border-t border-[#EEF2F6] bg-[#F8FAFC] px-6 py-2.5">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-[#94A3B8]"><span className="h-2 w-2 rounded-[2px] bg-[#CBD5E1]" /> Target</span>
              <span className="flex items-center gap-1 text-[#94A3B8]"><span className="h-2 w-2 rounded-[2px]" style={{ background: NAVY }} /> Actual</span>
            </div>
            <span className="text-[10px] font-semibold text-[#94A3B8]">
              Target: <span className="text-[#0F172A]">{totalTarget}</span> · Actual: <span className="text-[#0F172A]">{totalActual}</span>
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
  const dirty = JSON.stringify(draftFilters) !== JSON.stringify(filters);

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
      hall: hallCode, from: filters.date, to: filters.date,
      machine: filters.machine, shift: filters.shift,
    };

    const results = await Promise.allSettled([
      getHallStats(commonParams),
      getHallMachineWise(commonParams),
      getHallHourlyTrend({ hall: hallCode, date: filters.date, machine: filters.machine, shift: filters.shift }),
      getHallShiftSummary(commonParams),
      getHallMachines({ hall: hallCode }),
    ]);

    const [statsRes, machineWiseRes, hourlyRes, shiftSummaryRes, machinesRes] = results;
    const failures = [];

    if (statsRes.status === "fulfilled" && statsRes.value?.success && statsRes.value.data && typeof statsRes.value.data === "object") {
      setStats(statsRes.value.data);
    } else failures.push("stats");

    if (machineWiseRes.status === "fulfilled" && machineWiseRes.value?.success) {
      setMachineWise(toArray(machineWiseRes.value.data));
    } else failures.push("machine-wise");

    if (hourlyRes.status === "fulfilled" && hourlyRes.value?.success) {
      setHourlyTrend(toArray(hourlyRes.value.data?.trend));
    } else failures.push("hourly-trend");

    if (shiftSummaryRes.status === "fulfilled" && shiftSummaryRes.value?.success) {
      setShiftSummary(toArray(shiftSummaryRes.value.data));
    } else failures.push("shift-summary");

    if (machinesRes.status === "fulfilled" && machinesRes.value?.success) {
      setMachines(toArray(machinesRes.value.data));
    } else failures.push("machines");

    if (failures.length) setError(`Some sections failed to load: ${failures.join(", ")}`);
    setLoading(false);
  }, [hallCode, filters.date, filters.machine, filters.shift]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApplyFilters = () => setFilters(draftFilters);
  const handleReset = () => {
    const fresh = defaultFilters();
    setDraftFilters(fresh);
    setFilters(fresh);
  };
  const handleExport = () => exportHallDashboardToExcel({ hallCode, filters, stats, machineWise });
  const handleBack = () => navigate(-1);
  const handleHeatmap = () => navigate(`/management/halls/${hallId}/heatmap`);

  const chartData = useMemo(() => buildHourlyChartData(hourlyTrend), [hourlyTrend]);

  const hasStatsData =
    !!stats &&
    (Number(stats.actual) || 0) + (Number(stats.target) || 0) + (Number(stats.reject) || 0) > 0;
  const showNoDataWarning = !loading && stats && !hasStatsData;

  if (!hallCode) return <Navigate to="/production/dashboard" replace />;

  return (
    <div className="flex h-screen max-h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((c) => !c)} activePath={location.pathname} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="h-[2px] w-full flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, #0F1D24 0%, #FDC94D 50%, #0F1D24 100%)",
            backgroundSize: "200% 100%",
            animation: "hdShimmer 3s linear infinite",
          }}
        />
        <style>{`@keyframes hdShimmer { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }`}</style>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 border border-[#FDC94D]/40">
            <ControlBox
              hallCode={hallCode}
              onBack={handleBack}
              draft={draftFilters}
              setDraft={setDraftFilters}
              onApply={handleApplyFilters}
              onRefresh={fetchAll}
              onReset={handleReset}
              onHeatmap={handleHeatmap}
              onExport={handleExport}
              loading={loading}
              machineList={machines}
              dirty={dirty}
              message={
                error ? error : showNoDataWarning
                  ? "No data available for the selected date/filters. Please try another selection."
                  : null
              }
            />

            <div className="flex min-h-0 flex-1 flex-col gap-2 p-1">
              {/* Row 1: 5 KPI cards (Actual / Target / Rejects / Achievement / OEE) */}
              <KpiCardsRow stats={stats} hallCode={hallCode} loading={loading} />

              {/* Row 2: Shift Summary (left) + Machine-wise Breakdown (right) */}
              {/* <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:h-[38%] lg:grid-cols-[1fr_1fr]">
                <ShiftSummaryPanel rows={shiftSummary} loading={loading} />
                <MachineWiseTable rows={machineWise} loading={loading} />
              </div> */}

              {/* Row 3: Hourly chart, full width */}
              <div className="flex min-h-0 flex-1 flex-col">
                <HourlyChartCard chartData={chartData} loading={loading} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagementHallDashboard;