import React, { useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineCalendarDateRange,
  HiOutlineFunnel,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineChevronDown,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";
import { HiOutlineTrendingUp } from "react-icons/hi";

import { halls, HALL_ACCENT } from "../../data/productionData";
import { HALL_CODE_TO_ID } from "../../data/dashboardData";
import useProductionDashboard from "../../hooks/useProductionDashboard";
import Sidebar from "./Sidebar";

// ============================================================
// THEME TOKENS — neutral slate, enterprise light theme
// ============================================================
const PAGE_BG = "#F8FAFC";
const ACCENT_BLUE = "#2563EB";
const NAVY = "#0F1D24";
const SUCCESS = "#16A34A";
const WARNING = "#D97706";
const DANGER = "#DC2626";
const SHIFT_A_BG = "#FFFBEB";
const SHIFT_B_BG = "#F1F5F9";

const FALLBACK_BADGE_COLORS = [
  "#2563EB",
  "#16A34A",
  "#7C3AED",
  "#EA580C",
  "#0891B2",
  "#DB2777",
];

const SHIFT_A_START = 8; // 08:00
const HOURS_24 = Array.from({ length: 24 }, (_, i) => (SHIFT_A_START + i) % 24);
const isShiftA = (h) => h >= 8 && h < 20;

const getToday = () => new Date().toISOString().split("T")[0];
const fmt = (n) => (n ?? 0).toLocaleString("en-IN");

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

const hourLabel = (h) => `${String(h).padStart(2, "0")}:00`;

// Always returns a full 24-slot series (08:00 -> 07:00 next day)
const buildFullDaySeries = (data = []) => {
  const byHour = {};
  data.forEach((p) => {
    const h = parseInt(String(p.hour).split(":")[0], 10);
    byHour[h] = p;
  });
  return HOURS_24.map((h) => ({
    hour: hourLabel(h),
    target: byHour[h]?.target ?? 0,
    actual: byHour[h]?.actual ?? 0,
  }));
};

const effColor = (eff) => (eff >= 90 ? SUCCESS : eff >= 60 ? WARNING : DANGER);

// Placeholder categories shown until real downtime-reason data is wired up.
const DEFAULT_DOWNTIME_REASONS = [
  { label: "No Downtime", percent: 0 },
  { label: "Machine Breakdown", percent: 0 },
  { label: "Material Shortage", percent: 0 },
  { label: "Planned Maintenance", percent: 0 },
];

// ============================================================
// CSV EXPORT HELPER
// ============================================================
const csvEscape = (val) => {
  const s = String(val ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const downloadCsv = (filename, rows) => {
  const csvContent = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const buildExportRows = ({ date, overall, hallSummary, hallList, hourlyData }) => {
  const rows = [];

  rows.push([`Production Dashboard Export — ${formatDisplayDate(date)}`]);
  rows.push([]);

  rows.push(["Summary"]);
  rows.push(["Section", "Actual", "Target", "Rejection", "Efficiency %"]);

  const effOf = (actual, target) =>
    target > 0 ? (Math.round((actual / target) * 1000) / 10).toFixed(1) : "0.0";

  rows.push([
    "Overall Production",
    overall?.actual ?? 0,
    overall?.target ?? 0,
    overall?.rejection ?? 0,
    effOf(overall?.actual ?? 0, overall?.target ?? 0),
  ]);

  hallList.forEach((hall) => {
    const s = hallSummary?.[hall] || {};
    rows.push([
      hall,
      s.actual ?? 0,
      s.target ?? 0,
      s.rejection ?? 0,
      effOf(s.actual ?? 0, s.target ?? 0),
    ]);
  });

  rows.push([]);
  rows.push(["Hourly Data (Shift A 08:00–20:00, Shift B 20:00–08:00)"]);
  rows.push(["Hour", "Target", "Actual", "Efficiency %"]);

  const series = buildFullDaySeries(hourlyData);
  series.forEach((p) => {
    rows.push([p.hour, p.target, p.actual, effOf(p.actual, p.target)]);
  });

  return rows;
};

// ============================================================
// CUSTOM DATE PICKER
// ============================================================
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toIso = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const parseIso = (iso) => {
  const [y, m, d] = (iso || getToday()).split("-").map(Number);
  return { y, m: m - 1, d };
};

function CustomDatePicker({ value, onChange, onClose }) {
  const initial = parseIso(value);
  const [viewYear, setViewYear] = useState(initial.y);
  const [viewMonth, setViewMonth] = useState(initial.m);

  const todayIso = getToday();
  const selected = parseIso(value);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({
      day: daysInPrevMonth - startWeekday + 1 + i,
      inMonth: false,
      iso: null,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, iso: toIso(viewYear, viewMonth, d) });
  }
  while (cells.length % 7 !== 0) {
    const trailing = cells.length - (startWeekday + daysInMonth);
    cells.push({ day: trailing + 1, inMonth: false, iso: null });
  }

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="w-64 select-none border border-[#E2E8F0] bg-white p-2.5 shadow-lg rounded-[2px]">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#475569] hover:bg-[#F1F5F9]"
        >
          <HiOutlineChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[11.5px] font-extrabold text-[#0F172A]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goNextMonth}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#475569] hover:bg-[#F1F5F9]"
        >
          <HiOutlineChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((w) => (
          <div
            key={w}
            className="flex h-6 items-center justify-center text-[9px] font-bold uppercase text-[#94A3B8]"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          const isSelected =
            cell.inMonth &&
            cell.day === selected.d &&
            viewMonth === selected.m &&
            viewYear === selected.y;
          const isToday = cell.inMonth && cell.iso === todayIso;
          return (
            <button
              key={i}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => cell.iso && onChange(cell.iso)}
              className={`flex h-7 w-7 items-center justify-center rounded-[2px] text-[10.5px] font-semibold transition-colors duration-100 ${
                !cell.inMonth
                  ? "text-transparent"
                  : isSelected
                    ? "bg-[#0F1D24] text-[#FDC94D] font-extrabold"
                    : isToday
                      ? "border border-[#0F1D24] text-[#0F172A]"
                      : "text-[#334155] hover:bg-[#F1F5F9]"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5 border-t border-[#EEF2F6] pt-2">
        <button
          type="button"
          onClick={() => {
            const t = getToday();
            const { y, m } = parseIso(t);
            setViewYear(y);
            setViewMonth(m);
            onChange(t);
          }}
          className="flex-1 rounded-[2px] border border-[#E2E8F0] px-2 py-1 text-[10px] font-bold text-[#0F1D24] hover:border-[#0F1D24]"
        >
          Today
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-[2px] bg-[#0F1D24] px-2 py-1 text-[10px] font-bold text-[#FDC94D] hover:bg-[#0F1D24]/90"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ============================================================
// KPI SUMMARY CARD
// ============================================================
function SummaryCard({
  title,
  subtitle,
  icon: Icon,
  actual,
  target,
  rejection,
  badgeColor,
  highlighted,
  dark,
  onClick,
}) {
  const efficiency = target > 0 ? Math.round((actual / target) * 1000) / 10 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-[168px] flex-1 flex-col rounded-[2px] border p-2 text-left shadow-sm transition-all duration-150 hover:-translate-y-[2px] hover:shadow-md ${
        highlighted
          ? "border-[#BFDBFE] bg-[#EFF6FF]"
          : dark
            ? "border-[#1E2E38] bg-[#0F1D24]"
            : "border-[#E2E8F0] bg-white"
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <h3
            className={`truncate text-[13px] font-bold leading-tight ${
              dark ? "text-white" : "text-[#0F172A]"
            }`}
          >
            {title}
          </h3>
          <p
            className={`mt-0.5 truncate text-[8.5px] font-bold uppercase tracking-wide ${
              dark ? "text-[#8A97A3]" : "text-[#94A3B8]"
            }`}
          >
            {subtitle}
          </p>
        </div>
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[2px]"
          style={{
            background: highlighted ? "#DBEAFE" : dark ? `${badgeColor}33` : `${badgeColor}1A`,
            color: highlighted ? ACCENT_BLUE : badgeColor,
          }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <p
        className={`mt-1 font-mono text-[26px] font-extrabold leading-none ${
          dark ? "text-white" : "text-[#0F172A]"
        }`}
      >
        {fmt(actual)}
      </p>

      <div
        className={`mt-2.5 flex items-center gap-4 border-t pt-2 ${
          dark ? "border-white/10" : "border-[#EEF2F6]"
        }`}
      >
        <div className="leading-none">
          <p
            className={`text-[7.5px] font-bold uppercase tracking-wide ${
              dark ? "text-[#8A97A3]" : "text-[#94A3B8]"
            }`}
          >
            Target
          </p>
          <p
            className={`mt-0.5 font-mono text-[12px] font-bold ${
              dark ? "text-white" : "text-[#0F172A]"
            }`}
          >
            {fmt(target)}
          </p>
        </div>
        <div className="leading-none">
          <p
            className={`text-[7.5px] font-bold uppercase tracking-wide ${
              dark ? "text-[#8A97A3]" : "text-[#94A3B8]"
            }`}
          >
            Rejection
          </p>
          <p className="mt-0.5 font-mono text-[12px] font-bold text-red-400">
            {fmt(rejection)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span
          className={`text-[10px] font-bold ${
            dark ? "text-[#CBD5E1]" : "text-[#475569]"
          }`}
        >
          Efficiency
        </span>
        <span
          className="font-mono text-[13px] font-extrabold"
          style={{ color: effColor(efficiency) }}
        >
          {efficiency}%
        </span>
      </div>
      <div
        className={`mt-1 h-1.5 w-full overflow-hidden rounded-[2px] ${
          dark ? "bg-white/10" : "bg-[#EEF2F6]"
        }`}
      >
        <div
          className="h-full rounded-[2px] transition-[width] duration-500 ease-out"
          style={{
            width: `${Math.min(Math.max(efficiency, 0), 100)}%`,
            background: effColor(efficiency),
          }}
        />
      </div>
    </button>
  );
}

function SummaryCardsRow({ overall, hallSummary, halls, onSelectHall }) {
  return (
    <div className="flex flex-shrink-0 gap-2 overflow-x-auto p-1">
      <SummaryCard
        title="Overall Production"
        subtitle="All Halls Combined"
        icon={HiOutlineTrendingUp}
        actual={overall?.actual}
        target={overall?.target}
        rejection={overall?.rejection}
        highlighted
        onClick={() => onSelectHall("All")}
      />
      {halls.map((hall, i) => {
        const s = hallSummary?.[hall] || {};
        const badgeColor =
          HALL_ACCENT?.[hall] ||
          FALLBACK_BADGE_COLORS[i % FALLBACK_BADGE_COLORS.length];
        return (
          <SummaryCard
            key={hall}
            title={hall}
            subtitle="Production Summary"
            icon={HiOutlineTrendingUp}
            actual={s.actual}
            target={s.target}
            rejection={s.rejection}
            badgeColor={badgeColor}
            dark
            onClick={() => onSelectHall(hall)}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// CONTROL HEADER
// ============================================================
function ControlBox({
  draftDate,
  setDraftDate,
  onApply,
  onReset,
  onRefresh,
  onExport,
  loading,
  dirty,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        <h1 className="whitespace-nowrap text-[18px] font-extrabold uppercase tracking-wide text-white">
          Production Dashboard
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* date picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
            >
              <HiOutlineCalendarDays className="h-3.5 w-3.5" />
              {formatDisplayDate(draftDate)}
            </button>
            {pickerOpen && (
              <div className="absolute right-0 top-full z-30 mt-1">
                <CustomDatePicker
                  value={draftDate}
                  onChange={(iso) => setDraftDate(iso)}
                  onClose={() => {
                    onApply();
                    setPickerOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* advanced filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
            >
              <HiOutlineFunnel className="h-3.5 w-3.5" />
              Advanced Filter
              <HiOutlineChevronDown className="h-3 w-3" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-[2px] border border-[#E2E8F0] bg-white p-3 text-[11px] font-semibold text-[#64748B] shadow-lg">
                More filters coming soon.
              </div>
            )}
          </div>

          <button
            onClick={onApply}
            className="flex h-7 items-center gap-1.5 rounded-[2px] bg-[#FDC94D] px-3 text-[10.5px] font-extrabold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/90"
          >
            <HiOutlineCheck className="h-3.5 w-3.5" /> Apply
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30 disabled:opacity-50"
          >
            <HiOutlineArrowPath
              className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </button>

          <button
            onClick={onReset}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-red-400/40 bg-red-500/10 px-2.5 text-[10.5px] font-semibold text-red-300 transition-colors duration-100 hover:bg-red-500/20"
          >
            <HiOutlineXMark className="h-3.5 w-3.5" /> Reset
          </button>

          <button
            onClick={onExport}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" /> Export
          </button>

          {dirty && (
            <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-[#FDC94D]">
              Unapplied changes
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================================
// TOGGLE / LEGEND BADGE — pill-shaped chips used in the chart header
// ============================================================
function LegendBadge({ label, swatch, filled, active = true, onClick }) {
  const clickable = typeof onClick === "function";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`flex items-center gap-1.5 rounded-[2px] border px-2 py-0.5 text-[10px] font-bold transition-colors duration-100 ${
        active
          ? "border-[#E2E8F0] text-[#0F172A]"
          : "border-[#EEF2F6] text-[#B0B7C3]"
      } ${clickable ? "cursor-pointer hover:border-[#CBD5E1]" : "cursor-default"}`}
      style={{ background: active && filled ? `${swatch}22` : "#fff" }}
    >
      <span
        className="h-2 w-2 rounded-[2px]"
        style={{ background: active ? swatch : "#CBD5E1" }}
      />
      {label}
    </button>
  );
}

// ============================================================
// OVERALL PRODUCTION CHART
// ============================================================
function OverallProductionChart({ data = [], onExpand, loading }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [activeTab, setActiveTab] = useState("time");
  const [showTarget, setShowTarget] = useState(true);
  const [showActual, setShowActual] = useState(true);

  const series = useMemo(() => buildFullDaySeries(data), [data]);
  const hasAnyValue = series.some((p) => p.target > 0 || p.actual > 0);

  const width = 1200,
    height = 380,
    pad = { top: 34, right: 16, bottom: 30, left: 46 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const maxVal = Math.max(
    ...series.map((p) => Math.max(p.target || 0, p.actual || 0)),
    1,
  );
  const niceMax = Math.ceil(maxVal / 400) * 400 || 400;
  const yFor = (v) => pad.top + chartH - (v / niceMax) * chartH;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => niceMax * f);

  const n = series.length;
  const slot = chartW / n;
  const barGroupW = slot * 0.62;
  const barW = barGroupW / 2 - 1.5;

  const hovered = hoverIdx !== null ? series[hoverIdx] : null;
  const hoveredEff =
    hovered && hovered.target > 0
      ? Math.round((hovered.actual / hovered.target) * 1000) / 10
      : 0;

  const shiftSegments = [];
  HOURS_24.forEach((h, i) => {
    const shift = isShiftA(h) ? "A" : "B";
    const last = shiftSegments[shiftSegments.length - 1];
    if (last && last.shift === shift) last.count += 1;
    else shiftSegments.push({ shift, startIdx: i, count: 1 });
  });

  return (
    <div className="flex h-full flex-col rounded-[2px] border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#EEF2F6] px-4 py-3">
        <h2 className="text-[14px] font-extrabold text-[#0F172A]">
          Overall Production — All Halls (Combined Hourly Target vs Actual)
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <LegendBadge label="Shift A" swatch="#F5C453" filled />
          <LegendBadge label="Shift B" swatch="#94A3B8" filled />
          <LegendBadge
            label="Target"
            swatch="#9CA3AF"
            active={showTarget}
            onClick={() => setShowTarget((v) => !v)}
          />
          <LegendBadge
            label="Actual"
            swatch={NAVY}
            filled
            active={showActual}
            onClick={() => setShowActual((v) => !v)}
          />
        </div>
      </div>

      {/* sub tabs */}
      <div className="flex flex-shrink-0 items-center gap-4 border-b border-[#EEF2F6] px-4">
        {[
          { key: "time", label: "Production Over Time" },
          { key: "locations", label: "Production Locations" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative py-2 text-[11.5px] font-bold transition-colors duration-100 ${
              activeTab === tab.key
                ? "text-[#0F172A]"
                : "text-[#94A3B8] hover:text-[#475569]"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-[2px] bg-[#2563EB]" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "locations" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[#94A3B8]">
          <HiOutlineCalendarDateRange className="h-8 w-8" />
          <p className="text-[12px] font-bold">
            Production locations view coming soon
          </p>
        </div>
      ) : (
        <>
          {/* hover / empty-state notice strip */}
          <div className="flex h-6 flex-shrink-0 items-center gap-4 border-b border-[#EEF2F6] bg-[#F8FAFC] px-4 text-[10.5px] font-semibold">
            {hovered ? (
              <>
                <span className="font-mono font-extrabold text-[#0F172A]">
                  {hovered.hour}
                </span>
                <span className="text-[#94A3B8]">
                  Target{" "}
                  <b className="font-mono text-[#0F172A]">
                    {fmt(hovered.target)}
                  </b>
                </span>
                <span className="text-[#94A3B8]">
                  Actual{" "}
                  <b className="font-mono text-[#0F172A]">
                    {fmt(hovered.actual)}
                  </b>
                </span>
                <span className="text-[#94A3B8]">
                  Efficiency{" "}
                  <b
                    className="font-mono"
                    style={{ color: effColor(hoveredEff) }}
                  >
                    {hoveredEff}%
                  </b>
                </span>
              </>
            ) : !hasAnyValue ? (
              <span className="font-semibold text-amber-700">
                No production entries logged yet for this date. (Data starts
                08:00, Shift A)
              </span>
            ) : (
              <span className="text-[#B0B7C3]">
                Hover a bar to inspect the hour
              </span>
            )}
          </div>

          <div className="relative min-h-0 flex-1 p-3">
            {loading ? (
              <div className="flex h-full items-center justify-center text-[11px] text-[#94A3B8]">
                Loading chart...
              </div>
            ) : (
              <>
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  {series.map((p, i) => (
                    <rect
                      key={`bg-${i}`}
                      x={pad.left + i * slot}
                      y={pad.top}
                      width={slot}
                      height={chartH}
                      fill={isShiftA(HOURS_24[i]) ? SHIFT_A_BG : SHIFT_B_BG}
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
                      <line
                        x1={pad.left}
                        x2={width - pad.right}
                        y1={yFor(tick)}
                        y2={yFor(tick)}
                        stroke="#EEF2F6"
                        strokeWidth={1}
                      />
                      <text
                        x={pad.left - 8}
                        y={yFor(tick) + 3}
                        textAnchor="end"
                        fontSize="9.5"
                        fill="#94A3B8"
                        fontFamily="ui-monospace, monospace"
                      >
                        {Math.round(tick).toLocaleString()}
                      </text>
                    </g>
                  ))}

                  {shiftSegments.map((seg, i) => {
                    const segX = pad.left + seg.startIdx * slot;
                    const segW = seg.count * slot;
                    const cx = segX + segW / 2;
                    return (
                      <text
                        key={`seg-${i}`}
                        x={cx}
                        y={pad.top - 12}
                        textAnchor="middle"
                        fontSize="11.5"
                        fontWeight="800"
                        fill={seg.shift === "A" ? "#B08A2E" : "#64748B"}
                      >
                        {`Shift ${seg.shift} (${seg.shift === "A" ? "08:00-20:00" : "20:00-08:00"})`}
                      </text>
                    );
                  })}

                  {series.map((p, i) => {
                    const gx = pad.left + i * slot + (slot - barGroupW) / 2;
                    const isHover = hoverIdx === i;
                    return (
                      <g
                        key={i}
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                        style={{ cursor: "pointer" }}
                      >
                        <rect
                          x={pad.left + i * slot}
                          y={pad.top}
                          width={slot}
                          height={chartH}
                          fill="transparent"
                        />
                        {showTarget && (
                          <rect
                            x={gx}
                            y={yFor(p.target || 0)}
                            width={barW}
                            height={Math.max(
                              chartH - (yFor(p.target || 0) - pad.top),
                              0,
                            )}
                            fill={isHover ? "#94A3B8" : "#CBD5E1"}
                            rx={2}
                          />
                        )}
                        {showActual && (
                          <rect
                            x={gx + barW + 3}
                            y={yFor(p.actual || 0)}
                            width={barW}
                            height={Math.max(
                              chartH - (yFor(p.actual || 0) - pad.top),
                              0,
                            )}
                            fill={isHover ? ACCENT_BLUE : NAVY}
                            rx={2}
                          />
                        )}
                        {isHover && (
                          <line
                            x1={pad.left + i * slot + slot / 2}
                            x2={pad.left + i * slot + slot / 2}
                            y1={pad.top}
                            y2={pad.top + chartH}
                            stroke="#0F172A"
                            strokeOpacity="0.12"
                            strokeWidth={1}
                          />
                        )}
                      </g>
                    );
                  })}

                  <line
                    x1={pad.left + 12 * slot}
                    x2={pad.left + 12 * slot}
                    y1={pad.top}
                    y2={pad.top + chartH}
                    stroke="#CBD5E1"
                    strokeWidth={1.5}
                  />

                  {series.map((p, i) => (
                    <text
                      key={`lbl-${i}`}
                      x={pad.left + i * slot + slot / 2}
                      y={height - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight={hoverIdx === i ? 800 : 500}
                      fill={hoverIdx === i ? NAVY : "#94A3B8"}
                    >
                      {p.hour}
                    </text>
                  ))}
                </svg>

                {!hasAnyValue && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[2px] border-2 border-[#E2E8F0] text-[#94A3B8]">
                        <HiOutlineCalendarDateRange className="h-6 w-6" />
                      </div>
                      <p className="text-[12px] font-bold text-[#94A3B8]">
                        Data will appear here once entries are logged
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      <div className="flex flex-shrink-0 justify-end border-t border-[#EEF2F6] px-4 py-2">
        <button
          onClick={onExpand}
          className="flex items-center gap-1 text-[10.5px] font-bold text-[#2563EB] hover:underline"
        >
          Expand to Full Report <HiOutlineChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// RIGHT ANALYTICS SIDEBAR
// ============================================================
function EfficiencyRow({ label, efficiency }) {
  return (
    <div className="mb-1 rounded-[2px] border border-[#E2E8F0] px-2 py-1">
      <div className="mb-0.5 flex items-center justify-between text-[10px] font-semibold text-[#334155]">
        <span>{label}</span>
        <span
          className="font-mono font-bold"
          style={{ color: effColor(efficiency) }}
        >
          {efficiency}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-[2px] border border-[#E2E8F0] bg-[#F8FAFC]">
        <div
          className="h-full rounded-[2px]"
          style={{
            width: `${Math.min(Math.max(efficiency, 0), 100)}%`,
            background: effColor(efficiency),
          }}
        />
      </div>
    </div>
  );
}

function DowntimeRow({ label, percent }) {
  return (
    <div className="mb-1 rounded-[2px] border border-[#E2E8F0] px-2 py-1">
      <div className="mb-0.5 flex items-center justify-between text-[10px] font-semibold text-[#334155]">
        <span>{label}</span>
        <span className="font-mono font-bold text-[#0F172A]">{percent}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-[2px] border border-[#E2E8F0] bg-[#F8FAFC]">
        <div
          className="h-full rounded-[2px] bg-[#0F172A]"
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function AnalyticsSidebar({ halls, hallSummary, downtimeReasons }) {
  const [tab, setTab] = useState("analytics");
  const reasons = downtimeReasons?.length
    ? downtimeReasons
    : DEFAULT_DOWNTIME_REASONS;

  return (
    <div className="flex h-full flex-col rounded-[2px] border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#EEF2F6] px-3">
        {[
          { key: "analytics", label: "Analytics" },
          { key: "results", label: "Results" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative py-1.5 text-[10.5px] font-bold transition-colors duration-100 ${
              tab === t.key
                ? "text-[#0F172A]"
                : "text-[#94A3B8] hover:text-[#475569]"
            }`}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-[2px] bg-[#2563EB]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-2 py-1.5">
        {tab === "results" ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[#94A3B8]">
            <HiOutlineCalendarDateRange className="h-7 w-7" />
            <p className="text-[11.5px] font-bold">
              Detailed results will appear here
            </p>
          </div>
        ) : (
          <>
            <section className="flex min-h-0 flex-1 flex-col rounded-[2px] border border-[#E2E8F0] bg-white">
              <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1">
                <span
                  className="h-2 w-2 rounded-[2px]"
                  style={{ background: ACCENT_BLUE }}
                />
                <h3 className="text-[10px] font-extrabold uppercase tracking-wide text-[#0F172A]">
                  Hall Efficiency Breakdown
                </h3>
              </div>
              <div className="flex-1 p-1.5">
                {halls.map((hall) => {
                  const s = hallSummary?.[hall] || {};
                  const efficiency =
                    s.target > 0
                      ? Math.round(((s.actual || 0) / s.target) * 1000) / 10
                      : 0;
                  return (
                    <EfficiencyRow
                      key={hall}
                      label={hall}
                      efficiency={efficiency}
                    />
                  );
                })}
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col rounded-[2px] border border-[#E2E8F0] bg-white">
              <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1">
                <span
                  className="h-2 w-2 rounded-[2px]"
                  style={{ background: NAVY }}
                />
                <h3 className="text-[10px] font-extrabold uppercase tracking-wide text-[#0F172A]">
                  Top Downtime Reasons
                </h3>
              </div>
              <div className="flex-1 p-1.5">
                {reasons.map((r) => (
                  <DowntimeRow
                    key={r.label}
                    label={r.label}
                    percent={r.percent}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================
const ManagementProductionDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [date, setDate] = useState(getToday());
  const [draftDate, setDraftDate] = useState(getToday());
  const dirty = draftDate !== date;

  const { summary, hourlyData, loading, error, refetch } =
    useProductionDashboard(date);

  const handleViewHallData = useCallback(
    (hall) => {
      if (hall === "All") {
        navigate("/management/dashboard");
        return;
      }
      const hallId = HALL_CODE_TO_ID[hall];
      if (!hallId) {
        console.warn(
          `No route id found for hall "${hall}" — check HALL_CODE_TO_ID / halls list match`,
        );
        return;
      }
      navigate(`/management/halls/${hallId}`);
    },
    [navigate],
  );

  const handleExportExcel = useCallback(() => {
    const rows = buildExportRows({
      date,
      overall: summary?.overall,
      hallSummary: summary?.hallSummary,
      hallList: halls,
      hourlyData,
    });
    downloadCsv(`production-dashboard-${date}.csv`, rows);
  }, [date, summary, hourlyData]);

  const handleApplyFilters = () => setDate(draftDate);
  const handleReset = () => {
    const today = getToday();
    setDraftDate(today);
    setDate(today);
  };
  const handleRefresh = () => {
    if (refetch) refetch();
    else setDate((d) => d);
  };

  return (
    <div
      className="flex h-screen max-h-screen overflow-hidden"
      style={{ background: PAGE_BG }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="h-[2px] w-full flex-shrink-0"
          style={{
            background:
              "linear-gradient(90deg, #0F1D24 0%, #FDC94D 50%, #0F1D24 100%)",
            backgroundSize: "200% 100%",
            animation: "ltShimmer 3s linear infinite",
          }}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div
            className="flex min-h-0 flex-1 flex-col gap-2 border border-[#FDC94D]/40"
            style={{ animation: "ltGlow 3s ease-in-out infinite" }}
          >
            <ControlBox
              draftDate={draftDate}
              setDraftDate={setDraftDate}
              onApply={handleApplyFilters}
              onReset={handleReset}
              onRefresh={handleRefresh}
              onExport={handleExportExcel}
              loading={loading}
              dirty={dirty}
            />

            {error && (
              <div className="mx-4 flex-shrink-0 rounded-[2px] border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700">
                {error}
              </div>
            )}

            <SummaryCardsRow
              overall={summary?.overall}
              hallSummary={summary?.hallSummary}
              halls={halls}
              onSelectHall={handleViewHallData}
            />

            <div className="flex min-h-0 flex-1 gap-1 p-1">
              <div className="min-h-0 flex-[3]">
                <OverallProductionChart
                  data={hourlyData}
                  onExpand={() => handleViewHallData("All")}
                  loading={loading}
                />
              </div>
              <div className="hidden min-h-0 flex-1 lg:block">
                <AnalyticsSidebar
                  halls={halls}
                  hallSummary={summary?.hallSummary}
                  downtimeReasons={summary?.downtimeReasons}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagementProductionDashboard;