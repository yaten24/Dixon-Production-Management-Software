// RejectionDashboard.jsx — matches the reference screenshot: dark navy
// header, flat white bordered cards with sharp corners, hall-wise bar
// chart, reason donut, top-machines ranked list, and an hourly rejection
// trend chart with shift toggling. Visual language (borders, spacing,
// NAVY/GOLD tokens) mirrors ProductionDashboard.jsx so the two pages read
// as one consistent app.
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
  HiOutlineSquares2X2,
  HiOutlineExclamationTriangle,
  HiOutlineTag,
  HiOutlineBuildingOffice2,
  HiOutlineCog6Tooth,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineMagnifyingGlassPlus,
} from "react-icons/hi2";

import Sidebar from "./Sidebar";

// ==========================================================
// THEME TOKENS — matches ProductionDashboard.jsx
// ==========================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const DANGER = "#DC2626";
const DANGER_SOFT = "#FCA5A5";
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

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
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const getToday = () => new Date().toISOString().split("T")[0];

// ==========================================================
// MOCK DATA — mirrors the numbers in the reference screenshot so the
// page renders meaningfully out of the box. Swap for real API data by
// passing a `data` prop shaped the same way.
// ==========================================================
const DEFAULT_DATA = {
  totalRejection: 35,
  topReason: { label: "Short Moulding", qty: 14 },
  topHall: { label: "Hall 4", qty: 31 },
  topMachine: { label: "IM-55 - 450 T - 9 HY", qty: 15 },
  hallWise: [
    { hall: "Hall 4", qty: 31 },
    { hall: "Hall 1", qty: 2 },
    { hall: "Hall 2", qty: 2 },
    { hall: "Hall 3", qty: 0 },
    { hall: "C8", qty: 0 },
  ],
  hallsMissing: ["Hall 2", "Hall 3", "C8"],
  reasonDistribution: [
    { reason: "Short Moulding", qty: 14, color: DANGER },
    { reason: "Other", qty: 14, color: "#F59E0B" },
    { reason: "Burn Mark", qty: 3, color: "#0F1D24" },
    { reason: "Silver Mark", qty: 2, color: "#9CA3AF" },
  ],
  reasonsTracked: 21,
  topMachines: [
    { machine: "IM-55 - 450 T - 9 HY", qty: 15 },
    { machine: "IM-50 - 450 T - 4 HY", qty: 10 },
    { machine: "IM-45 - 650 T - 3 HY", qty: 4 },
    { machine: "IM-18 - 668 T - 3 SM", qty: 4 },
    { machine: "IM-44 - 450 T - 1 HY", qty: 2 },
  ],
  hourlyTrend: [
    { hour: 11, qty: 14 },
    { hour: 15, qty: 12 },
  ],
};

// ==========================================================
// CUSTOM DATE PICKER — full calendar grid, portal-positioned so it can
// never be clipped by an ancestor's overflow-hidden (that clipping was
// the reason the old native <input type="date"> popup felt "broken").
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
    const panelWidth = 240;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8)
      left = window.innerWidth - panelWidth - 8;
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
    const year = viewDate.getFullYear(),
      month = viewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
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
        className={`flex h-7 items-center gap-1.5 border px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 ${
          open ? "border-[#FDC94D]" : "border-white/15 hover:border-white/30"
        } bg-white/5`}
      >
        <HiOutlineCalendarDays className="h-3.5 w-3.5 text-white/60" />
        {formatDisplayDate(selectedKey)}
        <HiOutlineChevronDown
          className={`h-2.5 w-2.5 text-white/50 transition-transform duration-100 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left }}
            className="z-[9999] w-60 overflow-hidden border border-[#C6C6C6] bg-white shadow-[0_10px_24px_rgba(15,29,36,0.2)]"
          >
            <div className="flex items-center justify-between bg-[#0F1D24] px-2.5 py-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10"
              >
                <HiOutlineChevronLeft className="h-3 w-3" />
              </button>
              <span className="text-[11px] font-bold text-white">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10"
              >
                <HiOutlineChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-[#E5E5E5] p-px">
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

            <div className="flex items-center justify-between border-t border-[#C6C6C6] px-2.5 py-2">
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
}

// ==========================================================
// CUSTOM SELECT — same portal treatment as the date picker, used for the
// reason filter so both filters share one consistent, on-theme look.
// ==========================================================
function CustomSelect({ value, onChange, options }) {
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
    const panelWidth = 208;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8)
      left = window.innerWidth - panelWidth - 8;
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
        <HiOutlineChevronDown
          className={`h-2.5 w-2.5 text-white/50 transition-transform duration-100 ${open ? "rotate-180" : ""}`}
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
            className="z-[9999] max-h-56 w-52 overflow-y-auto border border-[#C6C6C6] bg-white py-1 shadow-[0_10px_24px_rgba(15,29,36,0.2)]"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[10.5px] font-medium transition-colors duration-100 ${
                  value === opt
                    ? "bg-[#FDC94D]/20 text-[#0F1D24]"
                    : "text-[#0F1D24] hover:bg-[#FAFAFB]"
                }`}
              >
                <span className="truncate">{opt}</span>
                {value === opt && (
                  <HiOutlineCheck className="h-3 w-3 flex-shrink-0 text-[#0F1D24]" />
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

// ==========================================================
// HEADER — full dark navy bar: title + filter row, matches screenshot.
// ==========================================================
function RejectionHeader({
  draftDate,
  setDraftDate,
  reason,
  setReason,
  reasonOptions,
  onApply,
  onRefresh,
  onReset,
  onRecent,
  onExport,
  onHeatmap,
  loading,
  dirty,
}) {
  return (
    <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        {/* Left Side - Title */}
        <h1 className="text-[18px] font-extrabold uppercase tracking-wide text-white whitespace-nowrap">
          Rejection Dashboard
        </h1>

        {/* Right Side - Filters + All Buttons together */}
        <div className="flex items-center gap-2 flex-wrap">
          <CustomDatePicker value={draftDate} onChange={setDraftDate} />
          <CustomSelect
            value={reason}
            onChange={setReason}
            options={reasonOptions}
          />

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
            <HiOutlineArrowPath
              className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
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

          <button
            onClick={onHeatmap}
            className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineSquares2X2 className="h-3.5 w-3.5" /> Heatmap
          </button>

          {/* Dirty State Indicator */}
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
// KPI CARD — small, 2x2 grid, dark icon square top-left.
// ==========================================================
// ==========================================================
// KPI CARD — dark navy, gold icon square, per-card accent footer.
// ==========================================================
function KpiSparkline({ color = GOLD }) {
  const points = "0,20 10,16 20,18 30,10 40,14 50,6 60,10 70,4 80,8 90,2 100,5";
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-5 w-full">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiProgressBar({ value = 0, color = GOLD }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(Math.max(value, 4), 100)}%`,
          background: color,
        }}
      />
    </div>
  );
}

function KpiDots({
  colors = [GOLD, "#9CA3AF", "#6B7280", "#4B5563", "#374151"],
}) {
  return (
    <div className="flex items-center gap-1">
      {colors.map((c, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function KpiStatus({ label = "Active", color = "#22C55E" }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ background: color }}
      />
      <span className="truncate text-[8.5px] font-semibold text-white/50">
        {label}
      </span>
    </div>
  );
}

function KpiTile({ label, value, subtitle, icon: Icon, footer }) {
  return (
    <div className="flex flex-col justify-between rounded-[2px] border border-white/10 bg-[#0F1D24] p-2">
      <div className="mt-2">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-white/50">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[16px] font-extrabold leading-tight text-white">
          {value}
        </p>
        <p className="truncate text-[9px] font-semibold text-white/40">
          {subtitle}
        </p>
      </div>
      {footer && <div className="mt-2.5">{footer}</div>}
    </div>
  );
}

function KpiGrid({ data }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <KpiTile
        label="Total Rejection"
        value={fmt(data.totalRejection)}
        subtitle="Across selected filters"
        icon={HiOutlineExclamationTriangle}
        footer={<KpiSparkline color={GOLD} />}
      />
      <KpiTile
        label="Top Reason"
        value={data.topReason?.label ?? "—"}
        subtitle={`${fmt(data.topReason?.qty)} qty`}
        icon={HiOutlineTag}
        footer={
          <KpiProgressBar
            value={pct(data.topReason?.qty, data.totalRejection)}
            color={GOLD}
          />
        }
      />
      <KpiTile
        label="Top Hall"
        value={data.topHall?.label ?? "—"}
        subtitle={`${fmt(data.topHall?.qty)} qty`}
        icon={HiOutlineBuildingOffice2}
        footer={<KpiDots />}
      />
      <KpiTile
        label="Top Machine"
        value={data.topMachine?.label ?? "—"}
        subtitle={`${fmt(data.topMachine?.qty)} qty`}
        icon={HiOutlineCog6Tooth}
        footer={
          <KpiStatus
            label="Operational but for higher rejection"
            color="#22C55E"
          />
        }
      />
    </div>
  );
}

// ==========================================================
// HALL-WISE REJECTION — vertical bar comparison across halls.
// ==========================================================
function HallWiseRejectionPanel({ rows, missingHalls, totalReject }) {
  const safeRows = toArray(rows);
  const maxQty = Math.max(...safeRows.map((r) => r.qty || 0), 1);
  const highest = safeRows.reduce(
    (a, b) => ((b.qty || 0) > (a?.qty || 0) ? b : a),
    safeRows[0],
  );
  const lowest = safeRows.reduce(
    (a, b) => ((b.qty || 0) < (a?.qty || 0) ? b : a),
    safeRows[0],
  );
  const avgPerHall = safeRows.length
    ? Math.round((totalReject / safeRows.length) * 10) / 10
    : 0;

  return (
    <div
      className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}
    >
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 rounded-[2px] items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
            <HiOutlineChartBar className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">
              Hall Wise Rejection
            </h2>
            <p className="text-[9px] font-medium text-[#9B9B9B]">
              Rejection comparison across halls
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            Total Reject
          </p>
          <p className="font-mono text-[15px] font-extrabold text-[#0F1D24]">
            {fmt(totalReject)} qty
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-b border-[#C6C6C6] bg-[#E5E5E5] text-center">
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            Highest Hall
          </p>
          <p className="text-[12px] font-extrabold text-[#0F1D24]">
            {highest?.hall ?? "—"}
          </p>
        </div>
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            Avg / Hall
          </p>
          <p className="text-[12px] font-extrabold text-[#0F1D24]">
            {avgPerHall}
          </p>
        </div>
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            Peak
          </p>
          <p className="text-[12px] font-extrabold text-[#0F1D24]">
            {fmt(highest?.qty)}
          </p>
        </div>
      </div>

      {missingHalls?.length > 0 && (
        <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[9.5px] font-semibold text-amber-700">
          <HiOutlineExclamationTriangle className="h-3 w-3 flex-shrink-0" />
          No data for {missingHalls.join(", ")} — showing all {safeRows.length}{" "}
          halls ({missingHalls.length} at 0).
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-end justify-around gap-2 px-4 pb-2 pt-4">
        {safeRows.map((row) => {
          const h = Math.max((row.qty / maxQty) * 100, row.qty > 0 ? 6 : 1.5);
          const isHighest = row.hall === highest?.hall && row.qty > 0;
          return (
            <div
              key={row.hall}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <span className="font-mono text-[10.5px] font-extrabold text-[#0F1D24]">
                {fmt(row.qty)}
              </span>
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-3/5"
                  style={{
                    height: `${h}%`,
                    background:
                      row.qty === 0
                        ? "#E5E5E5"
                        : isHighest
                          ? DANGER
                          : "#F59E0B",
                    minHeight: 2,
                  }}
                />
              </div>
              <span className="max-w-full truncate text-[9.5px] font-bold text-[#0F1D24]">
                {row.hall}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-[#C6C6C6] bg-[#E5E5E5]">
        <div className="flex items-center justify-between gap-2 bg-red-50 px-3 py-1.5">
          <span className="text-[9.5px] font-bold text-red-700">Highest</span>
          <span className="font-mono text-[10.5px] font-extrabold text-red-700">
            {highest?.hall} · {fmt(highest?.qty)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-emerald-50 px-3 py-1.5">
          <span className="text-[9.5px] font-bold text-emerald-700">
            Lowest
          </span>
          <span className="font-mono text-[10.5px] font-extrabold text-emerald-700">
            {lowest?.hall} · {fmt(lowest?.qty)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// REJECTION DISTRIBUTION — donut chart + reason legend.
// ==========================================================
function RejectionDistributionPanel({ rows, reasonsTracked, totalReject }) {
  const safeRows = toArray(rows);
  const size = 128,
    stroke = 22,
    radius = (size - stroke) / 2,
    circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;
  const topReason = safeRows[0];

  return (
    <div
      className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}
    >
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 rounded-[2px] items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
            <HiOutlineChartPie className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">
              Rejection Distribution
            </h2>
            <p className="text-[9px] font-medium text-[#9B9B9B]">
              Reject quantity by reason
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            Total Reject
          </p>
          <p className="font-mono text-[15px] font-extrabold text-[#0F1D24]">
            {fmt(totalReject)} qty
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-[#C6C6C6] bg-[#E5E5E5] text-center">
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            Top Reason
          </p>
          <p className="truncate text-[12px] font-extrabold text-[#0F1D24]">
            {topReason?.reason ?? "—"}
          </p>
        </div>
        <div className="bg-white px-2 py-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            Peak Value
          </p>
          <p className="text-[12px] font-extrabold text-[#0F1D24]">
            {fmt(topReason?.qty)} qty
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-3 px-3 py-3">
        <svg width={size} height={size} className="flex-shrink-0">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {safeRows.map((r) => {
              const share = totalReject > 0 ? r.qty / totalReject : 0;
              const dash = share * circumference;
              const el = (
                <circle
                  key={r.reason}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offsetAcc}
                />
              );
              offsetAcc += dash;
              return el;
            })}
          </g>
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            fontSize="18"
            fontWeight="800"
            fill="#0F1D24"
            fontFamily="ui-monospace, monospace"
          >
            {fmt(totalReject)}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            fill="#9B9B9B"
          >
            TOTAL
          </text>
        </svg>

        <div className="min-w-0 flex-1 divide-y divide-[#F0F0F0]">
          {safeRows.map((r) => (
            <div
              key={r.reason}
              className="flex items-center justify-between gap-2 py-1"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2 w-2 flex-shrink-0"
                  style={{ background: r.color }}
                />
                <span className="truncate text-[10.5px] font-semibold text-[#0F1D24]">
                  {r.reason}
                </span>
              </span>
              <span className="flex flex-shrink-0 items-center gap-1.5 font-mono text-[10.5px]">
                <span className="font-extrabold text-[#0F1D24]">
                  {fmt(r.qty)}
                </span>
                <span className="text-[#9B9B9B]">
                  {pct(r.qty, totalReject)}%
                </span>
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
// TOP MACHINES — ranked horizontal bar list.
// ==========================================================
function TopMachinesPanel({ rows }) {
  const safeRows = toArray(rows);
  const maxQty = Math.max(...safeRows.map((r) => r.qty || 0), 1);

  return (
    <div
      className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}
    >
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex h-6 w-6 rounded-[2px] items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
          <HiOutlineCog6Tooth className="h-3.5 w-3.5" />
        </div>
        <div>
          <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">
            Top Machines
          </h2>
          <p className="text-[9px] font-medium text-[#9B9B9B]">
            Highest rejection quantity
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-[#F0F0F0] overflow-auto">
        {safeRows.length === 0 ? (
          <p className="px-3 py-6 text-center text-[11px] text-[#9B9B9B]">
            No machine rejections for this selection.
          </p>
        ) : (
          safeRows.map((row, idx) => {
            const width = Math.max(
              (row.qty / maxQty) * 100,
              row.qty > 0 ? 4 : 0,
            );
            return (
              <div
                key={row.machine}
                className="flex items-center gap-2.5 px-3 py-2"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center bg-[#0F1D24] font-mono text-[9.5px] font-extrabold text-[#FDC94D]">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-bold text-[#0F1D24]">
                      {row.machine}
                    </span>
                    <span className="flex-shrink-0 font-mono text-[11px] font-extrabold text-red-600">
                      {fmt(row.qty)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden bg-[#F0F0F0]">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex-shrink-0 border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1.5 text-[9.5px] font-semibold text-[#9B9B9B]">
        {safeRows.length} machines with rejections
      </div>
    </div>
  );
}

// ==========================================================
// HOURLY REJECTION TREND — bar chart with a Shift A / Shift B toggle.
// ==========================================================
function HourlyRejectionTrendPanel({ points }) {
  const [activeShift, setActiveShift] = useState("both");

  const series = useMemo(() => {
    const byHour = new Map();
    toArray(points).forEach((p) => byHour.set(p.hour, p.qty));
    return ORDERED_HOURS.map((hour) => ({
      hour,
      qty: byHour.get(hour) || 0,
      shift: isShiftA(hour) ? "A" : "B",
    }));
  }, [points]);

  const maxQty = Math.max(...series.map((p) => p.qty), 1);
  const niceMax = Math.ceil((maxQty * 1.3) / 4) * 4 || 4;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));

  const peak = series.reduce(
    (a, b) => (b.qty > (a?.qty ?? -1) ? b : a),
    series[0],
  );

  const width = 900,
    height = 220,
    pad = { top: 10, right: 10, bottom: 26, left: 30 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const slot = chartW / series.length;
  const barW = Math.max(slot * 0.5, 4);
  const yFor = (v) => pad.top + chartH - (v / niceMax) * chartH;

  return (
    <div
      className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}
    >
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div>
          <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">
            Hourly Rejection Trend
          </h2>
          <p className="text-[9px] font-medium text-[#9B9B9B]">
            Shift A (08:00–20:00) · Shift B (20:00–08:00)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-stretch overflow-hidden border border-[#C6C6C6]">
            <button
              onClick={() => setActiveShift(activeShift === "A" ? "both" : "A")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] font-bold transition-colors duration-100 ${
                activeShift === "A"
                  ? "bg-[#FDC94D] text-[#0F1D24]"
                  : "bg-white text-[#0F1D24] hover:bg-[#FFF9EA]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-[2px]" style={{ background: GOLD }} />{" "}
              Shift A · 08:00–20:00
            </button>
            <button
              onClick={() => setActiveShift(activeShift === "B" ? "both" : "B")}
              className={`flex items-center gap-1.5 border-l border-[#C6C6C6] px-2.5 py-1 text-[9.5px] font-bold transition-colors duration-100 ${
                activeShift === "B"
                  ? "bg-[#0F1D24] text-[#FDC94D]"
                  : "bg-white text-[#0F1D24] hover:bg-[#F4F4F5]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-[2px]" style={{ background: NAVY }} />{" "}
              Shift B · 20:00–08:00
            </button>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">
              Peak Hour
            </p>
            <p className="font-mono text-[12px] font-extrabold text-[#0F1D24]">
              {peak ? `${String(peak.hour).padStart(2, "0")}:00` : "-"}
              <span className="ml-1 text-[9px] font-semibold text-[#9B9B9B]">
                ({fmt(peak?.qty)})
              </span>
            </p>
          </div>
          {/* <button className="flex h-7 items-center gap-1 bg-[#0F1D24] px-2.5 text-[9.5px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90">
            <HiOutlineMagnifyingGlassPlus className="h-3.5 w-3.5" /> Zoom
          </button> */}
        </div>
      </div>

      <div className="min-h-0 flex-1 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          {series.map((p, i) => (
            <rect
              key={`bg-${p.hour}`}
              x={pad.left + i * slot}
              y={pad.top}
              width={slot}
              height={chartH}
              fill={p.shift === "A" ? "#FFF9EA" : "#F4F4F5"}
            />
          ))}

          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                stroke="#E5E5E5"
                strokeWidth={1}
              />
              <text
                x={pad.left - 6}
                y={yFor(tick) + 3}
                textAnchor="end"
                fontSize="8.5"
                fill="#9B9B9B"
                fontFamily="ui-monospace, monospace"
              >
                {tick}
              </text>
            </g>
          ))}

          <line
            x1={pad.left + 12 * slot}
            x2={pad.left + 12 * slot}
            y1={pad.top}
            y2={pad.top + chartH}
            stroke="#0F1D24"
            strokeWidth={1.5}
          />

          {series.map((p, i) => {
            const dimmed = activeShift !== "both" && p.shift !== activeShift;
            const isPeak = peak && p.hour === peak.hour && p.qty > 0;
            const h = (p.qty / niceMax) * chartH;
            const barX = pad.left + i * slot + (slot - barW) / 2;
            const barY = pad.top + chartH - h;
            return (
              <g key={`bar-${p.hour}`}>
                <rect
                  x={barX}
                  y={barY}
                  width={barW}
                  height={h}
                  fill={dimmed ? "#F3B4B4" : isPeak ? DANGER : DANGER_SOFT}
                  opacity={dimmed ? 0.35 : 1}
                />
                {p.qty > 0 && (
                  <text
                    x={barX + barW / 2}
                    y={Math.max(barY - 4, pad.top + 8)}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill={dimmed ? "#C9C9C9" : "#0F1D24"}
                    fontFamily="ui-monospace, monospace"
                  >
                    {p.qty}
                  </text>
                )}
              </g>
            );
          })}

          {series.map((p, i) => (
            <text
              key={`lbl-${p.hour}`}
              x={pad.left + i * slot + slot / 2}
              y={height - 8}
              textAnchor="middle"
              fontSize="8"
              fontWeight="600"
              fill="#9B9B9B"
            >
              {String(p.hour).padStart(2, "0")}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6] px-3 py-1.5">
        <div className="flex items-center gap-3 text-[9.5px] font-bold text-[#9B9B9B]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[2px]" style={{ background: GOLD }} /> Shift A
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[2px]" style={{ background: NAVY }} /> Shift B
          </span>
        </div>
        <span className="text-[9.5px] font-semibold text-[#9B9B9B]">
          Total Reject Qty:{" "}
          <span className="font-mono font-extrabold text-[#0F1D24]">
            {fmt(series.reduce((s, p) => s + p.qty, 0))}
          </span>
        </span>
      </div>
    </div>
  );
}

// ==========================================================
// PAGE
// ==========================================================
const AdminRejectionDashboard = ({
  data = DEFAULT_DATA,
  loading = false,
  reasonOptions = [
    "All Reasons",
    "Short Moulding",
    "Burn Mark",
    "Silver Mark",
    "Other",
  ],
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [date, setDate] = useState(getToday());
  const [draftDate, setDraftDate] = useState(getToday());
  const [reason, setReason] = useState("All Reasons");
  const dirty = draftDate !== date;

  const handleApply = useCallback(() => setDate(draftDate), [draftDate]);
  const handleReset = useCallback(() => {
    const today = getToday();
    setDraftDate(today);
    setDate(today);
    setReason("All Reasons");
  }, []);
  const handleRefresh = useCallback(() => {
    // TODO: wire to real refetch once a rejection-dashboard hook/API exists.
  }, []);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <style>{`
        @keyframes rjShimmer {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes rjGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(253,201,77,0.25), 0 0 10px rgba(253,201,77,0.12); }
          50% { box-shadow: 0 0 0 1px rgba(253,201,77,0.6), 0 0 18px rgba(253,201,77,0.3); }
        }
      `}</style>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* light animated divider between the header and the main content */}
        <div
          className="h-[2px] w-full flex-shrink-0"
          style={{
            background:
              "linear-gradient(90deg, #0F1D24 0%, #FDC94D 50%, #0F1D24 100%)",
            backgroundSize: "200% 100%",
            animation: "rjShimmer 3s linear infinite",
          }}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div
            className="flex min-h-0 flex-1 flex-col gap-2 border border-[#FDC94D]/40"
            style={{ animation: "rjGlow 3s ease-in-out infinite" }}
          >
            <RejectionHeader
              draftDate={draftDate}
              setDraftDate={setDraftDate}
              reason={reason}
              setReason={setReason}
              reasonOptions={reasonOptions}
              onApply={handleApply}
              onRefresh={handleRefresh}
              onReset={handleReset}
              onRecent={() => {}}
              onExport={() => {}}
              onHeatmap={() => navigate(-1)}
              loading={loading}
              dirty={dirty}
            />
            <div className="grid min-h-0 flex-[2] grid-cols-1 gap-2 lg:grid-cols-[360px_1fr_1fr] p-1">
              <KpiGrid data={data} />
              <HallWiseRejectionPanel
                rows={data.hallWise}
                missingHalls={data.hallsMissing}
                totalReject={data.totalRejection}
              />
              <RejectionDistributionPanel
                rows={data.reasonDistribution}
                reasonsTracked={data.reasonsTracked}
                totalReject={data.totalRejection}
              />
            </div>

            <div className="grid min-h-0 flex-[3] grid-cols-1 gap-2 lg:grid-cols-[450px_1fr] p-1">
              <TopMachinesPanel rows={data.topMachines} />
              <HourlyRejectionTrendPanel points={data.hourlyTrend} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRejectionDashboard;
