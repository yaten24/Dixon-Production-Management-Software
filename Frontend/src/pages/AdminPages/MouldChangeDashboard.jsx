// MouldChangeDashboard.jsx — same visual language as RejectionDashboard.jsx
// (dark navy header, flat white bordered cards, sharp corners, hall-wise
// bar chart, reason donut, top-machines ranked list, hourly trend with
// shift toggling) re-purposed for mould_changes data. Backed by
// routes/mouldChangeRoutes.js.
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineWrenchScrewdriver,
  HiOutlineExclamationTriangle,
  HiOutlineTag,
  HiOutlineBuildingOffice2,
  HiOutlineCog6Tooth,
  HiOutlineChartBar,
  HiOutlineChartPie,
} from "react-icons/hi2";

import Sidebar from "./Sidebar";

// ==========================================================
// THEME TOKENS — matches ProductionDashboard.jsx / RejectionDashboard.jsx
// ==========================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const DANGER = "#DC2626";
const DANGER_SOFT = "#FCA5A5";
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];
const isShiftA = (h) => SHIFT_A_HOURS.includes(h);

const fmt = (n) => (n ?? 0).toLocaleString("en-IN");
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);
const toArray = (value) =>
  Array.isArray(value) ? value : value ? Object.values(value) : [];

const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseDateKey = (key) => {
  if (!key) return new Date();
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const formatDisplayDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const getToday = () => new Date().toISOString().split("T")[0];

// API base — adjust to match your Express server / proxy setup
const API_BASE = "/api/mould-changes";

const DEFAULT_DATA = {
  totalChanges: 0,
  topReason: null,
  topHall: null,
  topMachine: null,
  hallWise: [],
  hallsMissing: [],
  reasonDistribution: [],
  reasonsTracked: 0,
  topMachines: [],
  hourlyTrend: [],
};

// ==========================================================
// CUSTOM DATE PICKER (unchanged from reference — portal positioned)
// ==========================================================
function CustomDatePicker({ value, onChange }) {
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
    const panelWidth = 240;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    setCoords({ top: rect.bottom + 6, left });
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
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [viewDate]);

  const changeMonth = (delta) =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  const handleSelect = (date) => { onChange(toDateKey(date)); setOpen(false); };

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-7 items-center gap-1.5 border px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 ${
          open ? "border-[#FDC94D]" : "border-white/15 hover:border-white/30"
        } bg-white/5`}
      >
        <HiOutlineCalendarDays className="h-3.5 w-3.5 text-white/60" />
        {formatDisplayDate(selectedKey)}
        <HiOutlineChevronDown className={`h-2.5 w-2.5 text-white/50 transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          style={{ position: "fixed", top: coords.top, left: coords.left }}
          className="z-[9999] w-60 overflow-hidden border border-[#C6C6C6] bg-white shadow-[0_10px_24px_rgba(15,29,36,0.2)]"
        >
          <div className="flex items-center justify-between bg-[#0F1D24] px-2.5 py-2">
            <button type="button" onClick={() => changeMonth(-1)} className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10">
              <HiOutlineChevronLeft className="h-3 w-3" />
            </button>
            <span className="text-[11px] font-bold text-white">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button type="button" onClick={() => changeMonth(1)} className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10">
              <HiOutlineChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-[#E5E5E5] p-px">
            {WEEKDAYS.map((w, i) => (
              <div key={`${w}-${i}`} className="flex h-5 items-center justify-center bg-[#FAFAFB] text-[9px] font-bold uppercase text-[#9B9B9B]">
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

          <div className="flex items-center justify-between border-t border-[#C6C6C6] px-2.5 py-2">
            <button type="button" onClick={() => handleSelect(new Date())} className="text-[10.5px] font-semibold text-[#0F1D24] hover:underline">
              Today
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-[10.5px] font-medium text-[#9B9B9B] hover:text-[#0F1D24]">
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ==========================================================
// CUSTOM SELECT (unchanged from reference)
// ==========================================================
function CustomSelect({ value, onChange, options }) {
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
    const panelWidth = 208;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    setCoords({ top: rect.bottom + 6, left, minWidth: rect.width });
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

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-7 min-w-[120px] items-center gap-1.5 border px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 ${
          open ? "border-[#FDC94D]" : "border-white/15 hover:border-white/30"
        } bg-white/5`}
      >
        <span className="min-w-0 flex-1 truncate text-left">{value}</span>
        <HiOutlineChevronDown className={`h-2.5 w-2.5 text-white/50 transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          style={{ position: "fixed", top: coords.top, left: coords.left, minWidth: coords.minWidth }}
          className="z-[9999] max-h-56 w-52 overflow-y-auto border border-[#C6C6C6] bg-white py-1 shadow-[0_10px_24px_rgba(15,29,36,0.2)]"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[10.5px] font-medium transition-colors duration-100 ${
                value === opt ? "bg-[#FDC94D]/20 text-[#0F1D24]" : "text-[#0F1D24] hover:bg-[#FAFAFB]"
              }`}
            >
              <span className="truncate">{opt}</span>
              {value === opt && <HiOutlineCheck className="h-3 w-3 flex-shrink-0 text-[#0F1D24]" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ==========================================================
// HEADER
// ==========================================================
function MouldChangeHeader({
  draftDate, setDraftDate,
  changeType, setChangeType, changeTypeOptions,
  status, setStatus, statusOptions,
  onApply, onRefresh, onReset, onRecent, onExport,
  loading, dirty,
}) {
  return (
    <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        <h1 className="text-[18px] font-extrabold uppercase tracking-wide text-white whitespace-nowrap">
          Mould Change Dashboard
        </h1>

        <div className="flex items-center gap-2 flex-wrap">
          <CustomDatePicker value={draftDate} onChange={setDraftDate} />
          <CustomSelect value={changeType} onChange={setChangeType} options={changeTypeOptions} />
          <CustomSelect value={status} onChange={setStatus} options={statusOptions} />

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

          <button
            onClick={onRecent}
            className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineClock className="h-3.5 w-3.5" /> Recent
          </button>

          <button
            onClick={onExport}
            className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" /> Export
          </button>

          {dirty && (
            <span className="text-[9px] font-semibold uppercase tracking-wide text-[#FDC94D] whitespace-nowrap">
              Unapplied changes
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

// ==========================================================
// KPI TILE PRIMITIVES (unchanged from reference)
// ==========================================================
function KpiSparkline({ color = GOLD }) {
  const points = "0,20 10,16 20,18 30,10 40,14 50,6 60,10 70,4 80,8 90,2 100,5";
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-5 w-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function KpiProgressBar({ value = 0, color = GOLD }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(Math.max(value, 4), 100)}%`, background: color }} />
    </div>
  );
}
function KpiDots({ colors = [GOLD, "#9CA3AF", "#6B7280", "#4B5563", "#374151"] }) {
  return (
    <div className="flex items-center gap-1">
      {colors.map((c, i) => <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />)}
    </div>
  );
}
function KpiStatus({ label = "Active", color = "#22C55E" }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: color }} />
      <span className="truncate text-[8.5px] font-semibold text-white/50">{label}</span>
    </div>
  );
}
function KpiTile({ label, value, subtitle, footer }) {
  return (
    <div className="flex flex-col justify-between rounded-[2px] border border-white/10 bg-[#0F1D24] p-2">
      <div className="mt-2">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-white/50">{label}</p>
        <p className="mt-0.5 truncate text-[16px] font-extrabold leading-tight text-white">{value}</p>
        <p className="truncate text-[9px] font-semibold text-white/40">{subtitle}</p>
      </div>
      {footer && <div className="mt-2.5">{footer}</div>}
    </div>
  );
}

function KpiGrid({ data }) {
  const plannedPct = pct(data.plannedCount, (data.plannedCount || 0) + (data.unplannedCount || 0));
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <KpiTile
        label="Total Mould Changes"
        value={fmt(data.totalChanges)}
        subtitle={`Avg downtime ${fmt(data.avgDowntime)} min`}
        footer={<KpiSparkline color={GOLD} />}
      />
      <KpiTile
        label="Top Reason"
        value={data.topReason?.label ?? "—"}
        subtitle={`${fmt(data.topReason?.qty)} changes`}
        footer={<KpiProgressBar value={pct(data.topReason?.qty, data.totalChanges)} color={GOLD} />}
      />
      <KpiTile
        label="Top Hall"
        value={data.topHall?.label ?? "—"}
        subtitle={`${fmt(data.topHall?.qty)} changes`}
        footer={<KpiDots />}
      />
      <KpiTile
        label="Top Machine"
        value={data.topMachine?.label ?? "—"}
        subtitle={`${fmt(data.topMachine?.qty)} min downtime`}
        footer={<KpiStatus label={`${plannedPct}% of changes were Planned`} color={plannedPct >= 70 ? "#22C55E" : "#F59E0B"} />}
      />
    </div>
  );
}

// ==========================================================
// HALL-WISE MOULD CHANGES — vertical bar comparison across halls
// ==========================================================
function HallWiseMouldChangePanel({ rows, missingHalls, totalChanges }) {
  const safeRows = toArray(rows);
  const maxQty = Math.max(...safeRows.map((r) => r.qty || 0), 1);
  const highest = safeRows.reduce((a, b) => ((b.qty || 0) > (a?.qty || 0) ? b : a), safeRows[0]);
  const lowest = safeRows.reduce((a, b) => ((b.qty || 0) < (a?.qty || 0) ? b : a), safeRows[0]);
  const avgPerHall = safeRows.length ? Math.round((totalChanges / safeRows.length) * 10) / 10 : 0;

  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 rounded-[2px] items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
            <HiOutlineChartBar className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">Hall Wise Mould Changes</h2>
            <p className="text-[9px] font-medium text-[#9B9B9B]">Change count comparison across halls</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Total Changes</p>
          <p className="font-mono text-[15px] font-extrabold text-[#0F1D24]">{fmt(totalChanges)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-b border-[#C6C6C6] bg-[#E5E5E5] text-center">
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Highest Hall</p>
          <p className="text-[12px] font-extrabold text-[#0F1D24]">{highest?.hall ?? "—"}</p>
        </div>
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Avg / Hall</p>
          <p className="text-[12px] font-extrabold text-[#0F1D24]">{avgPerHall}</p>
        </div>
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Peak</p>
          <p className="text-[12px] font-extrabold text-[#0F1D24]">{fmt(highest?.qty)}</p>
        </div>
      </div>

      {missingHalls?.length > 0 && (
        <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[9.5px] font-semibold text-amber-700">
          <HiOutlineExclamationTriangle className="h-3 w-3 flex-shrink-0" />
          No mould changes for {missingHalls.join(", ")} — showing all {safeRows.length} halls ({missingHalls.length} at 0).
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-end justify-around gap-2 px-4 pb-2 pt-4">
        {safeRows.map((row) => {
          const h = Math.max((row.qty / maxQty) * 100, row.qty > 0 ? 6 : 1.5);
          const isHighest = row.hall === highest?.hall && row.qty > 0;
          return (
            <div key={row.hall} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="font-mono text-[10.5px] font-extrabold text-[#0F1D24]">{fmt(row.qty)}</span>
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-3/5"
                  style={{
                    height: `${h}%`,
                    background: row.qty === 0 ? "#E5E5E5" : isHighest ? DANGER : "#F59E0B",
                    minHeight: 2,
                  }}
                />
              </div>
              <span className="max-w-full truncate text-[9.5px] font-bold text-[#0F1D24]">{row.hall}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-[#C6C6C6] bg-[#E5E5E5]">
        <div className="flex items-center justify-between gap-2 bg-red-50 px-3 py-1.5">
          <span className="text-[9.5px] font-bold text-red-700">Highest</span>
          <span className="font-mono text-[10.5px] font-extrabold text-red-700">{highest?.hall} · {fmt(highest?.qty)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-emerald-50 px-3 py-1.5">
          <span className="text-[9.5px] font-bold text-emerald-700">Lowest</span>
          <span className="font-mono text-[10.5px] font-extrabold text-emerald-700">{lowest?.hall} · {fmt(lowest?.qty)}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// REASON DISTRIBUTION — donut chart + reason legend
// ==========================================================
function ReasonDistributionPanel({ rows, reasonsTracked, totalChanges }) {
  const safeRows = toArray(rows);
  const size = 128, stroke = 22, radius = (size - stroke) / 2, circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;
  const topReason = safeRows[0];

  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 rounded-[2px] items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
            <HiOutlineChartPie className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">Reason Distribution</h2>
            <p className="text-[9px] font-medium text-[#9B9B9B]">Mould changes by reason</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Total Changes</p>
          <p className="font-mono text-[15px] font-extrabold text-[#0F1D24]">{fmt(totalChanges)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-[#C6C6C6] bg-[#E5E5E5] text-center">
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Top Reason</p>
          <p className="truncate text-[12px] font-extrabold text-[#0F1D24]">{topReason?.reason ?? "—"}</p>
        </div>
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Peak Value</p>
          <p className="text-[12px] font-extrabold text-[#0F1D24]">{fmt(topReason?.qty)}</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-3 px-3 py-3">
        <svg width={size} height={size} className="flex-shrink-0">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {safeRows.map((r) => {
              const share = totalChanges > 0 ? r.qty / totalChanges : 0;
              const dash = share * circumference;
              const el = (
                <circle
                  key={r.reason}
                  cx={size / 2} cy={size / 2} r={radius}
                  fill="none" stroke={r.color} strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offsetAcc}
                />
              );
              offsetAcc += dash;
              return el;
            })}
          </g>
          <text x="50%" y="47%" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0F1D24" fontFamily="ui-monospace, monospace">
            {fmt(totalChanges)}
          </text>
          <text x="50%" y="60%" textAnchor="middle" fontSize="8" fontWeight="700" fill="#9B9B9B">TOTAL</text>
        </svg>

        <div className="min-w-0 flex-1 divide-y divide-[#F0F0F0]">
          {safeRows.map((r) => (
            <div key={r.reason} className="flex items-center justify-between gap-2 py-1">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="h-2 w-2 flex-shrink-0" style={{ background: r.color }} />
                <span className="truncate text-[10.5px] font-semibold text-[#0F1D24]">{r.reason}</span>
              </span>
              <span className="flex flex-shrink-0 items-center gap-1.5 font-mono text-[10.5px]">
                <span className="font-extrabold text-[#0F1D24]">{fmt(r.qty)}</span>
                <span className="text-[#9B9B9B]">{pct(r.qty, totalChanges)}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1.5 text-[9.5px] font-semibold text-[#9B9B9B]">
        {reasonsTracked} reasons tracked
      </div>
    </div>
  );
}

// ==========================================================
// TOP MACHINES — ranked by total downtime minutes
// ==========================================================
function TopMachinesPanel({ rows }) {
  const safeRows = toArray(rows);
  const maxQty = Math.max(...safeRows.map((r) => r.qty || 0), 1);

  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex h-6 w-6 rounded-[2px] items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
          <HiOutlineCog6Tooth className="h-3.5 w-3.5" />
        </div>
        <div>
          <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">Top Machines</h2>
          <p className="text-[9px] font-medium text-[#9B9B9B]">Highest total downtime (minutes)</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-[#F0F0F0] overflow-auto">
        {safeRows.length === 0 ? (
          <p className="px-3 py-6 text-center text-[11px] text-[#9B9B9B]">No mould changes for this selection.</p>
        ) : (
          safeRows.map((row, idx) => {
            const width = Math.max((row.qty / maxQty) * 100, row.qty > 0 ? 4 : 0);
            return (
              <div key={row.machine} className="flex items-center gap-2.5 px-3 py-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center bg-[#0F1D24] font-mono text-[9.5px] font-extrabold text-[#FDC94D]">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-bold text-[#0F1D24]">{row.machine}</span>
                    <span className="flex-shrink-0 font-mono text-[11px] font-extrabold text-red-600">{fmt(row.qty)} min</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden bg-[#F0F0F0]">
                    <div className="h-full bg-red-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex-shrink-0 border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1.5 text-[9.5px] font-semibold text-[#9B9B9B]">
        {safeRows.length} machines with mould changes
      </div>
    </div>
  );
}

// ==========================================================
// HOURLY DOWNTIME TREND — bar chart with Shift A / Shift B toggle
// ==========================================================
function HourlyDowntimeTrendPanel({ points }) {
  const [activeShift, setActiveShift] = useState("both");

  const series = useMemo(() => {
    const byHour = new Map();
    toArray(points).forEach((p) => byHour.set(p.hour, p.qty));
    return ORDERED_HOURS.map((hour) => ({
      hour, qty: byHour.get(hour) || 0, shift: isShiftA(hour) ? "A" : "B",
    }));
  }, [points]);

  const maxQty = Math.max(...series.map((p) => p.qty), 1);
  const niceMax = Math.ceil((maxQty * 1.3) / 4) * 4 || 4;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));
  const peak = series.reduce((a, b) => (b.qty > (a?.qty ?? -1) ? b : a), series[0]);

  const width = 900, height = 220, pad = { top: 10, right: 10, bottom: 26, left: 30 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const slot = chartW / series.length;
  const barW = Math.max(slot * 0.5, 4);
  const yFor = (v) => pad.top + chartH - (v / niceMax) * chartH;

  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div>
          <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">Hourly Downtime Trend</h2>
          <p className="text-[9px] font-medium text-[#9B9B9B]">Shift A (08:00–20:00) · Shift B (20:00–08:00)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-stretch overflow-hidden border border-[#C6C6C6]">
            <button
              onClick={() => setActiveShift(activeShift === "A" ? "both" : "A")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] font-bold transition-colors duration-100 ${
                activeShift === "A" ? "bg-[#FDC94D] text-[#0F1D24]" : "bg-white text-[#0F1D24] hover:bg-[#FFF9EA]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-[2px]" style={{ background: GOLD }} /> Shift A · 08:00–20:00
            </button>
            <button
              onClick={() => setActiveShift(activeShift === "B" ? "both" : "B")}
              className={`flex items-center gap-1.5 border-l border-[#C6C6C6] px-2.5 py-1 text-[9.5px] font-bold transition-colors duration-100 ${
                activeShift === "B" ? "bg-[#0F1D24] text-[#FDC94D]" : "bg-white text-[#0F1D24] hover:bg-[#F4F4F5]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-[2px]" style={{ background: NAVY }} /> Shift B · 20:00–08:00
            </button>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Peak Hour</p>
            <p className="font-mono text-[12px] font-extrabold text-[#0F1D24]">
              {peak ? `${String(peak.hour).padStart(2, "0")}:00` : "-"}
              <span className="ml-1 text-[9px] font-semibold text-[#9B9B9B]">({fmt(peak?.qty)} min)</span>
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
          {series.map((p, i) => (
            <rect key={`bg-${p.hour}`} x={pad.left + i * slot} y={pad.top} width={slot} height={chartH} fill={p.shift === "A" ? "#FFF9EA" : "#F4F4F5"} />
          ))}

          {yTicks.map((tick, i) => (
            <g key={i}>
              <line x1={pad.left} x2={width - pad.right} y1={yFor(tick)} y2={yFor(tick)} stroke="#E5E5E5" strokeWidth={1} />
              <text x={pad.left - 6} y={yFor(tick) + 3} textAnchor="end" fontSize="8.5" fill="#9B9B9B" fontFamily="ui-monospace, monospace">
                {tick}
              </text>
            </g>
          ))}

          <line x1={pad.left + 12 * slot} x2={pad.left + 12 * slot} y1={pad.top} y2={pad.top + chartH} stroke="#0F1D24" strokeWidth={1.5} />

          {series.map((p, i) => {
            const dimmed = activeShift !== "both" && p.shift !== activeShift;
            const isPeak = peak && p.hour === peak.hour && p.qty > 0;
            const h = (p.qty / niceMax) * chartH;
            const barX = pad.left + i * slot + (slot - barW) / 2;
            const barY = pad.top + chartH - h;
            return (
              <g key={`bar-${p.hour}`}>
                <rect x={barX} y={barY} width={barW} height={h} fill={dimmed ? "#F3B4B4" : isPeak ? DANGER : DANGER_SOFT} opacity={dimmed ? 0.35 : 1} />
                {p.qty > 0 && (
                  <text x={barX + barW / 2} y={Math.max(barY - 4, pad.top + 8)} textAnchor="middle" fontSize="8" fontWeight="700" fill={dimmed ? "#C9C9C9" : "#0F1D24"} fontFamily="ui-monospace, monospace">
                    {p.qty}
                  </text>
                )}
              </g>
            );
          })}

          {series.map((p, i) => (
            <text key={`lbl-${p.hour}`} x={pad.left + i * slot + slot / 2} y={height - 8} textAnchor="middle" fontSize="8" fontWeight="600" fill="#9B9B9B">
              {String(p.hour).padStart(2, "0")}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6] px-3 py-1.5">
        <div className="flex items-center gap-3 text-[9.5px] font-bold text-[#9B9B9B]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px]" style={{ background: GOLD }} /> Shift A</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px]" style={{ background: NAVY }} /> Shift B</span>
        </div>
        <span className="text-[9.5px] font-semibold text-[#9B9B9B]">
          Total Downtime: <span className="font-mono font-extrabold text-[#0F1D24]">{fmt(series.reduce((s, p) => s + p.qty, 0))} min</span>
        </span>
      </div>
    </div>
  );
}

// ==========================================================
// DATA FETCHING HOOK — pulls all five endpoints for a given filter set
// ==========================================================

// fetch() only rejects on network failure — a 404/500 still resolves
// "successfully" and would otherwise get JSON.parse'd as if it were
// real data. This wrapper turns non-2xx responses into a real error.
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error || ""; } catch { /* ignore */ }
    throw new Error(`${res.status} ${res.statusText} — ${url}${detail ? ` (${detail})` : ""}`);
  }
  return res.json();
}

function useMouldChangeData(filters) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Tracks the in-flight request so a slow/late response from a
  // superseded filter set can never overwrite fresher data.
  const abortRef = useRef(null);
  // Defense-in-depth: if something outside this hook (a remounting
  // parent, an unstable `key`, StrictMode, etc.) keeps invoking fetchAll
  // with filters that haven't actually changed, skip the redundant call
  // instead of re-firing 5 requests every time. If you see the console
  // warning below firing repeatedly, the bug is upstream of this file —
  // check the Network tab's Initiator stack for the real trigger.
  const lastKeyRef = useRef(null);

  const fetchAll = useCallback(async (force = false) => {
    const key = JSON.stringify(filters);
    if (!force && lastKeyRef.current === key) {
      console.warn(
        "[MouldChangeDashboard] fetchAll called again with identical filters — " +
        "skipping. This usually means the component is being remounted or " +
        "re-invoked from outside (check the Network tab's Initiator stack)."
      );
      return;
    }
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== "All"))
    ).toString();

    try {
      const [summary, hallWise, distribution, topMachines, hourly] = await Promise.all([
        fetchJson(`${API_BASE}/summary?${qs}`, { signal: controller.signal }),
        fetchJson(`${API_BASE}/hall-wise?${qs}`, { signal: controller.signal }),
        fetchJson(`${API_BASE}/reason-distribution?${qs}`, { signal: controller.signal }),
        fetchJson(`${API_BASE}/top-machines?${qs}`, { signal: controller.signal }),
        fetchJson(`${API_BASE}/hourly-trend?${qs}`, { signal: controller.signal }),
      ]);

      // Guard against the (rare) case where this request was aborted
      // just after Promise.all resolved but before state updates.
      if (controller.signal.aborted) return;

      setData({
        ...summary,
        hallWise: hallWise.hallWise ?? [],
        hallsMissing: hallWise.hallsMissing ?? [],
        reasonDistribution: distribution.reasonDistribution ?? [],
        reasonsTracked: distribution.reasonsTracked ?? 0,
        topMachines: topMachines.topMachines ?? [],
        hourlyTrend: hourly.hourlyTrend ?? [],
      });
    } catch (err) {
      if (err.name === "AbortError") return; // superseded by a newer fetch — not a real error
      console.error("Failed to load mould change dashboard data", err);
      setError(err);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
    return () => abortRef.current?.abort();
  }, [fetchAll]);

  return { data, loading, error, refetch: () => fetchAll(true) };
}

// ==========================================================
// PAGE
// ==========================================================
const CHANGE_TYPE_OPTIONS = ["All", "Planned", "Unplanned"];
const STATUS_OPTIONS = ["All", "Planned", "In Progress", "Completed", "Cancelled"];

const AdminMouldChangeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [date, setDate] = useState(getToday());
  const [draftDate, setDraftDate] = useState(getToday());
  const [changeType, setChangeType] = useState("All");
  const [status, setStatus] = useState("All");
  const dirty = draftDate !== date;

  // Memoized: without this, `{ date, changeType, status }` is a brand-new
  // object on every render, which — since it's a dependency of the fetch
  // hook's useCallback/useEffect chain — would re-trigger all five API
  // calls on every render (including the ones fetchAll's own setState
  // causes), i.e. an infinite fetch loop.
  const filters = useMemo(() => ({ date, changeType, status }), [date, changeType, status]);
  const { data, loading, refetch } = useMouldChangeData(filters);

  const handleApply = useCallback(() => setDate(draftDate), [draftDate]);
  const handleReset = useCallback(() => {
    const today = getToday();
    setDraftDate(today);
    setDate(today);
    setChangeType("All");
    setStatus("All");
  }, []);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <style>{`
        @keyframes mcShimmer { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }
        @keyframes mcGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(253,201,77,0.25), 0 0 10px rgba(253,201,77,0.12); }
          50% { box-shadow: 0 0 0 1px rgba(253,201,77,0.6), 0 0 18px rgba(253,201,77,0.3); }
        }
      `}</style>

      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((c) => !c)} activePath={location.pathname} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="h-[2px] w-full flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, #0F1D24 0%, #FDC94D 50%, #0F1D24 100%)",
            backgroundSize: "200% 100%",
            animation: "mcShimmer 3s linear infinite",
          }}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 border border-[#FDC94D]/40" style={{ animation: "mcGlow 3s ease-in-out infinite" }}>
            <MouldChangeHeader
              draftDate={draftDate} setDraftDate={setDraftDate}
              changeType={changeType} setChangeType={setChangeType} changeTypeOptions={CHANGE_TYPE_OPTIONS}
              status={status} setStatus={setStatus} statusOptions={STATUS_OPTIONS}
              onApply={handleApply}
              onRefresh={refetch}
              onReset={handleReset}
              onRecent={() => {}}
              onExport={() => {}}
              loading={loading}
              dirty={dirty}
            />
            <div className="grid min-h-0 flex-[2] grid-cols-1 gap-2 lg:grid-cols-[360px_1fr_1fr] p-1">
              <KpiGrid data={data} />
              <HallWiseMouldChangePanel rows={data.hallWise} missingHalls={data.hallsMissing} totalChanges={data.totalChanges} />
              <ReasonDistributionPanel rows={data.reasonDistribution} reasonsTracked={data.reasonsTracked} totalChanges={data.totalChanges} />
            </div>

            <div className="grid min-h-0 flex-[3] grid-cols-1 gap-2 lg:grid-cols-[450px_1fr] p-1">
              <TopMachinesPanel rows={data.topMachines} />
              <HourlyDowntimeTrendPanel points={data.hourlyTrend} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMouldChangeDashboard;