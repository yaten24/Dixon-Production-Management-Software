import React, { useState, useRef, useEffect } from "react";
import {
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBuildingOffice2,
  HiOutlineFlag,
  HiOutlineUsers,
  HiOutlinePlay,
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import Sidebar from "./Sidebar";
import useProductionDashboard from "../../hooks/usePartsProductionDashboard";
import { exportProductionReportCSV } from "../../utils/exportProductionReport";

// ==========================================================
// THEME TOKENS — matches ReportsPage.jsx
// ==========================================================
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

const statusStyles = {
  "On Target": "bg-emerald-50 text-emerald-700 before:bg-emerald-500",
  "Slightly Low": "bg-amber-50 text-amber-700 before:bg-amber-500",
  Low: "bg-rose-50 text-rose-700 before:bg-rose-500",
};

const pctColor = (v) => (v >= 85 ? "text-emerald-600" : "text-rose-600");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function statusFor(achievement) {
  if (achievement >= 95) return "On Target";
  if (achievement >= 85) return "Slightly Low";
  return "Low";
}

function num(v) {
  return Number(v || 0);
}

function pct(numerator, denominator) {
  const n = num(numerator);
  const d = num(denominator);
  if (!d) return 0;
  return (n / d) * 100;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatPeriodLabel(periodType, periodValue) {
  if (!periodValue) return "";
  if (periodType === "day") {
    const d = new Date(`${periodValue}T00:00:00`);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (periodType === "year") return periodValue;
  const [yyyy, mm] = periodValue.split("-");
  const d = new Date(`${yyyy}-${mm}-01T00:00:00`);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

// ==========================================================
// Shared outside-click hook for closing popovers
// ==========================================================
function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

// ==========================================================
// CUSTOM DAY PICKER — calendar grid
// ==========================================================
function DayPickerPanel({ value, onSelect, onClose }) {
  const initial = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startWeekday = firstWeekday(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <div className="w-64 p-2">
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          onClick={goPrevMonth}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#6B6B6B] hover:bg-[#FAFAFB]"
        >
          <HiOutlineChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[12px] font-extrabold text-[#0F1D24]">
          {MONTH_NAMES_FULL[viewMonth]} {viewYear}
        </span>
        <button
          onClick={goNextMonth}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#6B6B6B] hover:bg-[#FAFAFB]"
        >
          <HiOutlineChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 px-1 pb-1">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w} className="flex h-6 items-center justify-center text-[9.5px] font-bold text-[#9B9B9B]">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 px-1 pb-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`empty-${i}`} />;
          const iso = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(d)}`;
          const isSelected = iso === value;
          return (
            <button
              key={iso}
              onClick={() => {
                onSelect(iso);
                onClose();
              }}
              className={`flex h-6 w-6 items-center justify-center rounded-[2px] text-[11px] font-semibold transition-colors duration-100 ${
                isSelected ? "bg-[#FDC94D] font-extrabold text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================
// CUSTOM MONTH PICKER — year nav + 12-month grid
// ==========================================================
function MonthPickerPanel({ value, onSelect, onClose }) {
  const [yy] = value ? value.split("-") : [String(new Date().getFullYear())];
  const [viewYear, setViewYear] = useState(Number(yy));

  return (
    <div className="w-52 p-2">
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          onClick={() => setViewYear((y) => y - 1)}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#6B6B6B] hover:bg-[#FAFAFB]"
        >
          <HiOutlineChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[12px] font-extrabold text-[#0F1D24]">{viewYear}</span>
        <button
          onClick={() => setViewYear((y) => y + 1)}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#6B6B6B] hover:bg-[#FAFAFB]"
        >
          <HiOutlineChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1 px-1 pb-1">
        {MONTH_NAMES.map((m, idx) => {
          const monthValue = `${viewYear}-${pad2(idx + 1)}`;
          const isSelected = monthValue === value;
          return (
            <button
              key={m}
              onClick={() => {
                onSelect(monthValue);
                onClose();
              }}
              className={`rounded-[2px] px-2 py-1.5 text-[11px] font-semibold transition-colors duration-100 ${
                isSelected ? "bg-[#FDC94D] font-extrabold text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================
// CUSTOM YEAR PICKER — paged 12-year grid
// ==========================================================
function YearPickerPanel({ value, onSelect, onClose }) {
  const selectedYear = Number(value) || new Date().getFullYear();
  const [pageStart, setPageStart] = useState(Math.floor(selectedYear / 12) * 12);
  const years = Array.from({ length: 12 }, (_, i) => pageStart + i);

  return (
    <div className="w-44 p-2">
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          onClick={() => setPageStart((p) => p - 12)}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#6B6B6B] hover:bg-[#FAFAFB]"
        >
          <HiOutlineChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[12px] font-extrabold text-[#0F1D24]">
          {years[0]}&ndash;{years[years.length - 1]}
        </span>
        <button
          onClick={() => setPageStart((p) => p + 12)}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#6B6B6B] hover:bg-[#FAFAFB]"
        >
          <HiOutlineChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1 px-1 pb-1">
        {years.map((y) => {
          const isSelected = y === selectedYear;
          return (
            <button
              key={y}
              onClick={() => {
                onSelect(String(y));
                onClose();
              }}
              className={`rounded-[2px] px-2 py-1.5 text-[11px] font-semibold transition-colors duration-100 ${
                isSelected ? "bg-[#FDC94D] font-extrabold text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
              }`}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================
// PERIOD CONTROL — Day / Month / Year toggle + custom picker popover
// ==========================================================
function PeriodControl({ periodType, periodValue, onTypeChange, onValueChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const modes = [
    { key: "day", label: "Day" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
  ];

  const displayLabel = formatPeriodLabel(periodType, periodValue);

  return (
    <div ref={ref} className="relative">
      <div className="flex h-7 items-stretch overflow-hidden rounded-[2px] border border-white/15">
        <div className="flex items-center bg-white/5">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                onTypeChange(m.key);
                setOpen(true);
              }}
              className={`h-7 px-2.5 text-[10.5px] font-bold transition-colors duration-100 ${
                periodType === m.key ? "bg-[#FDC94D] text-[#0F1D24]" : "text-white/60 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 border-l border-white/15 bg-white/5 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
        >
          <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0 text-white/60" />
          <span className="whitespace-nowrap">{displayLabel}</span>
          <HiOutlineChevronDown
            className={`h-3 w-3 shrink-0 text-white/40 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-30 rounded-[2px] border border-[#C6C6C6] bg-white shadow-lg">
          {periodType === "day" && <DayPickerPanel value={periodValue} onSelect={onValueChange} onClose={() => setOpen(false)} />}
          {periodType === "month" && <MonthPickerPanel value={periodValue} onSelect={onValueChange} onClose={() => setOpen(false)} />}
          {periodType === "year" && <YearPickerPanel value={periodValue} onSelect={onValueChange} onClose={() => setOpen(false)} />}
        </div>
      )}
    </div>
  );
}

// ==========================================================
// CUSTOM DROPDOWN — replaces native <select> for Category / Customer
// ==========================================================
function CustomDropdown({ icon: Icon, label, value, onChange, options, placeholder = "All" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const selectedLabel = value || placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/5 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-white/60" />
        <span className="text-white/50">{label}:</span>
        <span className="max-w-[100px] truncate">{selectedLabel}</span>
        <HiOutlineChevronDown
          className={`h-3 w-3 shrink-0 text-white/40 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 max-h-56 w-40 overflow-auto rounded-[2px] border border-[#C6C6C6] bg-white py-1 shadow-lg">
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`flex w-full items-center px-2.5 py-1.5 text-left text-[11.5px] font-semibold ${
              !value ? "bg-[#FDC94D]/15 text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
            }`}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`flex w-full items-center truncate px-2.5 py-1.5 text-left text-[11.5px] font-semibold ${
                value === opt ? "bg-[#FDC94D]/15 text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
              }`}
            >
              {opt}
            </button>
          ))}
          {options.length === 0 && <div className="px-2.5 py-1.5 text-[11px] text-[#9B9B9B]">No options</div>}
        </div>
      )}
    </div>
  );
}

// ==========================================================
// HEADER — title + filters + actions in one row
// ==========================================================
function DashboardHeader({
  refreshing,
  onRefresh,
  onExport,
  periodType,
  periodValue,
  onPeriodTypeChange,
  onPeriodValueChange,
  category,
  onCategoryChange,
  customer,
  onCustomerChange,
  filterOptions,
}) {
  return (
    <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <h1 className="text-[18px] font-extrabold uppercase tracking-wide text-white">
            Part Production
          </h1>
          <span className="hidden text-[10.5px] font-medium text-white/40 sm:inline">
            Target vs actual &amp; rejection analysis
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PeriodControl
            periodType={periodType}
            periodValue={periodValue}
            onTypeChange={onPeriodTypeChange}
            onValueChange={onPeriodValueChange}
          />

          <CustomDropdown
            icon={HiOutlineClipboardDocumentList}
            label="Category"
            value={category}
            onChange={onCategoryChange}
            options={filterOptions.categories}
          />

          <CustomDropdown
            icon={HiOutlineUsers}
            label="Customer"
            value={customer}
            onChange={onCustomerChange}
            options={filterOptions.customers}
          />

          <button
            onClick={onRefresh}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineArrowPath className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>

          <button
            onClick={onExport}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================================
// STAT CARD — dark navy surface
// ==========================================================
function StatCard({ icon: Icon, label, value, unit, sub, trend }) {
  return (
    <div className="rounded-[2px] border border-white/10 bg-[#0F1D24] p-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-[#FDC94D]/15 text-[#FDC94D]">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-white/40">{label}</p>
          <p className="text-[18px] font-extrabold leading-tight tracking-tight text-white">
            {value}
            {unit && <span className="ml-1 text-[10.5px] font-semibold text-white/40">{unit}</span>}
          </p>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
        <span className="truncate text-white/40">{sub}</span>
        {trend && (
          <span className={`shrink-0 font-bold ${trend.up ? "text-emerald-400" : "text-rose-400"}`}>
            {trend.up ? "\u2191" : "\u2193"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// MINI STAT — dark strip
// ==========================================================
function MiniStat({ icon: Icon, label, value, unit }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] bg-white/5 text-[#FDC94D]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[13px] font-extrabold text-white">
          {value} <span className="text-[9.5px] font-medium text-white/40">{unit}</span>
        </p>
        <p className="truncate text-[9.5px] font-semibold uppercase tracking-wide text-white/40">{label}</p>
      </div>
    </div>
  );
}

// ==========================================================
// PARTS TABLE — built from live API rows
// ==========================================================
function PartsTable({ periodLabel, rows, totals }) {
  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-1.5">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#0F1D24]">Part Production</h2>
          <p className="text-[11.5px] font-medium text-[#9B9B9B]">Target vs actual by part number &middot; {periodLabel}</p>
        </div>
        <span className="rounded-[2px] border border-[#C6C6C6] px-2 py-0.5 text-[10.5px] font-bold text-[#0F1D24]">
          {rows.length} parts
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[980px] border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#FAFAFB]">
              {["#", "Part No.", "Part Name", "Category", "Customer", "Target", "Produced", "Good", "Reject", "Reject %", "Achv %", "Yield %", "Status"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9B9B9B] ${
                      i === 0 ? "text-left" : i >= 5 && i <= 11 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={13} className="border border-[#C6C6C6] px-2.5 py-6 text-center text-[#9B9B9B]">
                  No production entries found for this period.
                </td>
              </tr>
            )}
            {rows.map((row, idx) => {
              const rejectPct = pct(row.reject_qty, row.actual_qty);
              const achievement = pct(row.actual_qty, row.target_qty);
              const yieldPct = pct(row.good_qty, row.actual_qty);
              const status = statusFor(achievement);
              return (
                <tr key={row.part_id} className="hover:bg-[#FAFAFB]">
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#9B9B9B]">{idx + 1}</td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 font-bold text-[#0F1D24]">{row.part_number}</td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#0F1D24]">{row.part_name}</td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#6B6B6B]">{row.product_category}</td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#6B6B6B]">{row.customer}</td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-right text-[#0F1D24]">{num(row.target_qty).toLocaleString()}</td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-right text-[#0F1D24]">{num(row.actual_qty).toLocaleString()}</td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-right text-[#0F1D24]">{num(row.good_qty).toLocaleString()}</td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-right text-[#0F1D24]">{num(row.reject_qty).toLocaleString()}</td>
                  <td className={`border border-[#C6C6C6] px-2.5 py-1.5 text-right font-bold ${rejectPct > 2 ? "text-rose-600" : "text-[#0F1D24]"}`}>
                    {rejectPct.toFixed(2)}%
                  </td>
                  <td className={`border border-[#C6C6C6] px-2.5 py-1.5 text-right font-bold ${pctColor(achievement)}`}>
                    {achievement.toFixed(2)}%
                  </td>
                  <td className={`border border-[#C6C6C6] px-2.5 py-1.5 text-right font-bold ${pctColor(yieldPct)}`}>
                    {yieldPct.toFixed(2)}%
                  </td>
                  <td className="border border-[#C6C6C6] px-2.5 py-1.5">
                    <span
                      className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] px-2 py-0.5 text-[10px] font-bold before:h-1.5 before:w-1.5 before:rounded-full ${statusStyles[status]}`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#FAFAFB] font-extrabold text-[#0F1D24]">
              <td className="border border-[#C6C6C6] px-2.5 py-2" colSpan={5}>
                Total
              </td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right">{num(totals.target_qty).toLocaleString()}</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right">{num(totals.actual_qty).toLocaleString()}</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right">{num(totals.good_qty).toLocaleString()}</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right text-rose-600">{num(totals.reject_qty).toLocaleString()}</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right text-rose-600">
                {pct(totals.reject_qty, totals.actual_qty).toFixed(2)}%
              </td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right text-emerald-600">
                {pct(totals.actual_qty, totals.target_qty).toFixed(2)}%
              </td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right text-emerald-600">
                {pct(totals.good_qty, totals.actual_qty).toFixed(2)}%
              </td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-center text-[#9B9B9B]">&ndash;</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex-shrink-0 border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1 text-[8.5px] font-semibold text-[#9B9B9B]">
        {periodLabel}
      </div>
    </div>
  );
}

// ==========================================================
// PAGE
// ==========================================================
export default function PartProductionDashboard() {
  const {
    periodType,
    periodValue,
    category,
    customer,
    filterOptions,
    data,
    loading,
    error,
    setPeriodType,
    setPeriodValue,
    setCategory,
    setCustomer,
    refresh,
  } = useProductionDashboard();

  const summary = data?.summary || {
    target_qty: 0,
    actual_qty: 0,
    good_qty: 0,
    reject_qty: 0,
    loss_minutes: 0,
    parts_running: 0,
    machines_running: 0,
  };
  const parts = data?.parts || [];
  const periodLabel = formatPeriodLabel(periodType, periodValue);
  const achievement = pct(summary.actual_qty, summary.target_qty);
  const yieldPct = pct(summary.good_qty, summary.actual_qty);
  const rejectPct = pct(summary.reject_qty, summary.actual_qty);

  const handleExport = () => {
    exportProductionReportCSV({
      periodLabel,
      category,
      customer,
      rows: parts,
      totals: summary,
    });
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-[2px] border border-[#C6C6C6]">
            <DashboardHeader
              refreshing={loading}
              onRefresh={refresh}
              onExport={handleExport}
              periodType={periodType}
              periodValue={periodValue}
              onPeriodTypeChange={setPeriodType}
              onPeriodValueChange={setPeriodValue}
              category={category}
              onCategoryChange={setCategory}
              customer={customer}
              onCustomerChange={setCustomer}
              filterOptions={filterOptions}
            />

            {error && (
              <div className="mx-2 mt-1 flex-shrink-0 rounded-[2px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-hidden p-1">
              <div className="flex h-full min-h-0 flex-col gap-2">
                {/* Stat cards — dark */}
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  <StatCard icon={HiOutlineFlag} label="Target Qty" value={num(summary.target_qty).toLocaleString()} unit="PCS" sub={periodLabel} />
                  <StatCard
                    icon={HiOutlineBuildingOffice2}
                    label="Produced Qty"
                    value={num(summary.actual_qty).toLocaleString()}
                    unit="PCS"
                    sub={`${achievement.toFixed(2)}% Achievement`}
                  />
                  <StatCard
                    icon={HiOutlineCheckCircle}
                    label="Good Qty"
                    value={num(summary.good_qty).toLocaleString()}
                    unit="PCS"
                    sub={`${yieldPct.toFixed(2)}% Yield`}
                  />
                  <StatCard
                    icon={HiOutlineXCircle}
                    label="Reject Qty"
                    value={num(summary.reject_qty).toLocaleString()}
                    unit="PCS"
                    sub={`${rejectPct.toFixed(2)}% Reject Rate`}
                  />
                  <StatCard icon={HiOutlineClock} label="Loss Time" value={num(summary.loss_minutes).toLocaleString()} unit="Min" sub={periodLabel} />
                </div>

                {/* Mini stat strip — dark */}
                <div className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-2.5 rounded-[2px] border border-white/10 bg-[#0F1D24] p-3 sm:grid-cols-4 lg:grid-cols-6">
                  <MiniStat icon={HiOutlineUsers} label="Parts Running" value={summary.parts_running} unit="Parts" />
                  <MiniStat icon={HiOutlinePlay} label="Machines Involved" value={summary.machines_running} unit="Mc" />
                  <MiniStat icon={HiOutlineArrowTrendingUp} label="Achievement" value={`${achievement.toFixed(2)}%`} unit="" />
                  <MiniStat icon={HiOutlineCheckCircle} label="Overall Yield" value={`${yieldPct.toFixed(2)}%`} unit="" />
                  <MiniStat icon={HiOutlineXCircle} label="Reject Rate" value={`${rejectPct.toFixed(2)}%`} unit="" />
                  <MiniStat icon={HiOutlineClock} label="Loss Time" value={num(summary.loss_minutes).toLocaleString()} unit="Min" />
                </div>

                {/* Table */}
                <div className="min-h-0 flex-1">
                  <PartsTable periodLabel={periodLabel} rows={parts} totals={summary} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}