import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import {
  HiOutlineCalendarDays,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFunnel,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlinePrinter,
} from "react-icons/hi2";
import {
  FaIndustry,
  FaExclamationTriangle,
  FaClock,
  FaBoxes,
  FaTools,
  FaChartLine,
} from "react-icons/fa";

import Header, { HEADER_HEIGHT } from "../compenents/dashboard/Header";
import {
  getProductionReport,
  getRejectionReasonsList,
  getLossReasonsList,
} from "../api/reportApi";

const HALLS = ["Hall-1", "Hall-2", "Hall-3", "Hall-4", "C8"];
const SHIFTS = ["A", "B"];
const MOULD_CHANGE_OPTIONS = [
  { value: "All", label: "All Entries" },
  { value: "yes", label: "Mould Change Only" },
  { value: "no", label: "No Mould Change" },
];

// ============================================================
// Date helpers — always resolve to local "YYYY-MM-DD" so the
// custom picker and the API filters never drift across timezones.
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
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const DEFAULT_FILTERS = {
  fromDate: todayKey(),
  toDate: todayKey(),
  hall: "All",
  shift: "All",
  rejectReasonId: "",
  lossReasonId: "",
  mouldChange: "All",
};

// ============================================================
// Themed dropdown — flat bordered, matches the app's desktop tokens
// ============================================================
function ThemedSelect({ value, onChange, options, placeholder = "-- select --", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-full items-center justify-between border px-2.5 text-[11.5px] font-medium outline-none transition-colors duration-100 border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24] ${open ? "border-[#0F1D24]" : ""}`}
      >
        <span className={selected ? "truncate text-[#0F1D24]" : "truncate text-[#9B9B9B]"}>
          {selected ? selected.label : placeholder}
        </span>
        <HiOutlineChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#9B9B9B] transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`cursor-pointer border-b border-[#C6C6C6] px-2.5 py-1.5 text-[11.5px] font-medium last:border-b-0 transition-colors duration-100 ${String(opt.value) === String(value) ? "bg-[#0F1D24] text-[#FDC94D]" : "text-[#0F1D24] hover:bg-[#FDC94D]/20"}`}
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
// Themed date picker — desktop calendar dropdown, replaces the
// native OS-rendered <input type="date">.
// ============================================================
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function ThemedDatePicker({ value, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(`${value}T00:00:00`) : new Date()));
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  useEffect(() => { if (value) setViewDate(new Date(`${value}T00:00:00`)); }, [value]);

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
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: toDateKey(new Date(year, month, d)), inMonth: true });
  let extra = 1;
  while (cells.length < 42) { cells.push({ day: extra, key: toDateKey(new Date(year, month + 1, extra)), inMonth: false }); extra++; }

  const handlePick = (key) => { onChange(key); setOpen(false); };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-full items-center justify-between border px-2.5 text-[11.5px] font-medium outline-none transition-colors duration-100 border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24] ${open ? "border-[#0F1D24]" : ""}`}
      >
        <span className={value ? "truncate text-[#0F1D24]" : "truncate text-[#9B9B9B]"}>
          {value ? formatDateLabel(value) : "-- select date --"}
        </span>
        <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0 text-[#9B9B9B]" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-64 border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
          <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-[#FAFAFA] px-2 py-1.5">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="flex h-6 w-6 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100">
              <HiOutlineChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11.5px] font-bold text-[#0F1D24]">{monthLabel}</span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="flex h-6 w-6 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100">
              <HiOutlineChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-[#C6C6C6] bg-white">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w} className="py-1 text-center text-[9.5px] font-bold uppercase text-[#9B9B9B]">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-[#C6C6C6] p-px">
            {cells.map((cell, i) => {
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
          <button type="button" onClick={() => handlePick(todayKey())}
            className="w-full border-t border-[#C6C6C6] bg-[#FAFAFA] py-1.5 text-[11px] font-semibold text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100">
            Today
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Summary tile — flat bordered, left accent rail
// ============================================================
const TONE = {
  slate: { text: "text-[#0F1D24]", accent: "bg-[#0F1D24]" },
  blue: { text: "text-blue-700", accent: "bg-blue-600" },
  green: { text: "text-emerald-700", accent: "bg-emerald-600" },
  red: { text: "text-red-700", accent: "bg-red-600" },
  orange: { text: "text-orange-700", accent: "bg-orange-500" },
  purple: { text: "text-purple-700", accent: "bg-purple-600" },
  gold: { text: "text-[#0F1D24]", accent: "bg-[#FDC94D]" },
};

const SummaryTile = ({ label, value, icon, tone = "slate" }) => {
  const t = TONE[tone] || TONE.slate;
  return (
    <div className="flex border border-[#C6C6C6] bg-white">
      {/* <div className={`w-[3px] flex-shrink-0 ${t.accent}`} /> */}
      <div className="flex flex-1 items-center justify-between px-2.5 py-2">
        <div className="min-w-0">
          <p className="truncate text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
          <p className={`mt-0.5 font-mono text-base font-extrabold leading-none ${t.text}`}>{value}</p>
        </div>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center border border-[#C6C6C6] ${t.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Breakdown panel — flat bar chart, bordered
// ============================================================
const BreakdownPanel = ({ title, rows, labelKey, valueKey, valueSuffix = "", accent = "bg-[#0F1D24]" }) => {
  const maxValue = Math.max(...rows.map((r) => Number(r[valueKey]) || 0), 1);
  return (
    <div className="border border-[#C6C6C6] bg-white">
      <div className="border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 py-1.5">
        <h3 className="text-[11.5px] font-bold text-[#0F1D24]">{title}</h3>
      </div>
      <div className="p-3">
        {rows.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-[#9B9B9B]">No data available.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row[labelKey]}>
                <div className="mb-0.5 flex justify-between text-[10.5px] text-[#9B9B9B]">
                  <span className="font-semibold text-[#0F1D24]">{row[labelKey]}</span>
                  <span className="font-mono font-bold text-[#0F1D24]">{row[valueKey]}{valueSuffix}</span>
                </div>
                <div className="h-1.5 overflow-hidden border border-[#C6C6C6] bg-[#F5F5F5]">
                  <div className={`h-full ${accent}`} style={{ width: `${(Number(row[valueKey]) / maxValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductionHistoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [hallBreakdown, setHallBreakdown] = useState([]);
  const [rejectionBreakdown, setRejectionBreakdown] = useState([]);
  const [lossBreakdown, setLossBreakdown] = useState([]);
  const [mouldChangeStats, setMouldChangeStats] = useState(null);

  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [lossReasons, setLossReasons] = useState([]);

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    (async () => {
      const [rejRes, lossRes] = await Promise.all([getRejectionReasonsList(), getLossReasonsList()]);
      if (rejRes.success) setRejectionReasons(rejRes.data || []);
      if (lossRes.success) setLossReasons(lossRes.data || []);
    })();
  }, []);

  const fetchReport = useCallback(async (filters) => {
    try {
      setLoading(true);
      setError("");
      const res = await getProductionReport(filters);
      if (res.success) {
        const d = res.data;
        setEntries(d.entries || []);
        setSummary(d.summary || null);
        setHallBreakdown(d.hallBreakdown || []);
        setRejectionBreakdown(d.rejectionBreakdown || []);
        setLossBreakdown(d.lossBreakdown || []);
        setMouldChangeStats(d.mouldChangeStats || null);
      } else {
        setError(res.message || "Failed to load report data.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(appliedFilters); }, [appliedFilters, fetchReport]);

  const updateDraft = (key, value) => setDraftFilters((prev) => ({ ...prev, [key]: value }));
  const applyFilters = () => setAppliedFilters(draftFilters);
  const resetFilters = () => { setDraftFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS); };

  const hallRows = useMemo(() => hallBreakdown.map((r) => ({ hallName: r.hallName, actual: r.actual })), [hallBreakdown]);
  const rejectionRows = useMemo(() => rejectionBreakdown.map((r) => ({ reasonName: r.reasonName, totalQty: r.totalQty })), [rejectionBreakdown]);
  const lossRows = useMemo(() => lossBreakdown.map((r) => ({ reasonName: r.reasonName, totalMinutes: r.totalMinutes })), [lossBreakdown]);

  // ---- Excel export ----
  const exportToExcel = () => {
    if (!entries.length && !hallBreakdown.length) return;
    const wb = XLSX.utils.book_new();

    const wsEntries = XLSX.utils.json_to_sheet(entries.map((e) => ({
      Date: String(e.entry_date).slice(0, 10),
      Hall: e.hall, Shift: e.shift, "Time Slot": e.time_slot,
      Machine: e.machine_name || e.machine_code, Operator: e.operator_name, Part: e.part_name,
      "Standard CT": e.standard_cycle_time, "Actual CT": e.actual_cycle_time,
      Target: e.target_qty, Actual: e.actual_qty, Good: e.good_qty, Reject: e.reject_qty,
      "Loss (min)": e.loss_minutes, "Efficiency (%)": e.efficiency, Remarks: e.remarks || "",
    })));
    wsEntries["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, wsEntries, "Entries");

    if (summary) {
      const wsSummary = XLSX.utils.json_to_sheet([
        { Metric: "Machines Reported", Value: summary.totalMachines },
        { Metric: "Distinct Machines", Value: summary.distinctMachines },
        { Metric: "Total Target Qty", Value: summary.totalTarget },
        { Metric: "Total Actual Qty", Value: summary.totalActual },
        { Metric: "Total Good Qty", Value: summary.totalGood },
        { Metric: "Total Reject Qty", Value: summary.totalReject },
        { Metric: "Total Loss (min)", Value: summary.totalLossMinutes },
        { Metric: "Avg Efficiency (%)", Value: summary.avgEfficiency },
        { Metric: "Total Mould Changes", Value: mouldChangeStats?.totalChanges ?? 0 },
        { Metric: "Total Mould Change Time (min)", Value: mouldChangeStats?.totalDurationMinutes ?? 0 },
        { Metric: "Avg Mould Change Time (min)", Value: mouldChangeStats?.avgDurationMinutes ?? 0 },
        { Metric: "", Value: "" },
        { Metric: "From Date", Value: appliedFilters.fromDate },
        { Metric: "To Date", Value: appliedFilters.toDate },
        { Metric: "Hall", Value: appliedFilters.hall },
        { Metric: "Shift", Value: appliedFilters.shift },
      ]);
      wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    }
    if (hallBreakdown.length) {
      const ws = XLSX.utils.json_to_sheet(hallBreakdown.map((r) => ({ Hall: r.hallName, "Target Qty": r.target, "Actual Qty": r.actual, "Reject Qty": r.reject })));
      ws["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, "Hall-wise");
    }
    if (rejectionBreakdown.length) {
      const ws = XLSX.utils.json_to_sheet(rejectionBreakdown.map((r) => ({ "Reason Code": r.reasonCode, "Reason Name": r.reasonName, "Total Reject Qty": r.totalQty, "Entries Count": r.entriesCount })));
      ws["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, "Rejection Reasons");
    }
    if (lossBreakdown.length) {
      const ws = XLSX.utils.json_to_sheet(lossBreakdown.map((r) => ({ "Reason Code": r.reasonCode, "Reason Name": r.reasonName, "Total Loss (min)": r.totalMinutes, "Entries Count": r.entriesCount })));
      ws["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, "Loss Reasons");
    }

    XLSX.writeFile(wb, `Production_Report_${appliedFilters.fromDate}_to_${appliedFilters.toDate}.xlsx`);
  };

  // ---- Print ----
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#EFEFEF]">

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-print-area, #report-print-area * { visibility: visible; }
          #report-print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div>
        {/* Toolbar strip */}
        <div className="w-full border-b border-[#C6C6C6] bg-white no-print">
          <div className="flex h-[38px] w-full flex-wrap items-center justify-between gap-2 px-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1D24]/60">Reports</span>
              <h1 className="text-[13px] font-bold tracking-tight text-[#0F1D24] leading-tight">Daily Production Reports</h1>
            </div>
            <div className="flex items-stretch h-6 gap-px bg-[#C6C6C6]">
              <button onClick={applyFilters}
                className="flex items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]">
                <HiOutlineFunnel className="h-3 w-3" /> Apply
              </button>
              <button onClick={resetFilters}
                className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]">
                <HiOutlineArrowPath className="h-3 w-3" /> Reset
              </button>
              <button onClick={handlePrint} disabled={loading}
                className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-40">
                <HiOutlinePrinter className="h-3 w-3" /> Print
              </button>
              <button onClick={exportToExcel} disabled={loading || (!entries.length && !hallBreakdown.length)}
                className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-emerald-700 transition-colors duration-100 hover:bg-emerald-700 hover:text-white disabled:opacity-40">
                <HiOutlineArrowDownTray className="h-3 w-3" /> Export Excel
              </button>
            </div>
          </div>
        </div>

        <main className="w-full">
          {/* ================= FILTERS ================= */}
          <div className="border border-[#C6C6C6] bg-white no-print">
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
              <div className="relative z-20">
                <label className="mb-1 block text-[9.5px] font-mono uppercase tracking-wide text-[#9B9B9B]">From</label>
                <ThemedDatePicker value={draftFilters.fromDate} onChange={(v) => updateDraft("fromDate", v)} />
              </div>
              <div className="relative z-20">
                <label className="mb-1 block text-[9.5px] font-mono uppercase tracking-wide text-[#9B9B9B]">To</label>
                <ThemedDatePicker value={draftFilters.toDate} onChange={(v) => updateDraft("toDate", v)} />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-mono uppercase tracking-wide text-[#9B9B9B]">Hall</label>
                <ThemedSelect value={draftFilters.hall} onChange={(v) => updateDraft("hall", v)}
                  options={[{ value: "All", label: "All Halls" }, ...HALLS.map((h) => ({ value: h, label: h }))]} />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-mono uppercase tracking-wide text-[#9B9B9B]">Shift</label>
                <ThemedSelect value={draftFilters.shift} onChange={(v) => updateDraft("shift", v)}
                  options={[{ value: "All", label: "All Shifts" }, ...SHIFTS.map((s) => ({ value: s, label: `Shift ${s}` }))]} />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-mono uppercase tracking-wide text-[#9B9B9B]">Rejection Reason</label>
                <ThemedSelect value={draftFilters.rejectReasonId} onChange={(v) => updateDraft("rejectReasonId", v)}
                  options={[{ value: "", label: "All Reject Reasons" }, ...rejectionReasons.map((r) => ({ value: r.id, label: r.reason_name }))]} />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-mono uppercase tracking-wide text-[#9B9B9B]">Loss Time Reason</label>
                <ThemedSelect value={draftFilters.lossReasonId} onChange={(v) => updateDraft("lossReasonId", v)}
                  options={[{ value: "", label: "All Loss Reasons" }, ...lossReasons.map((r) => ({ value: r.id, label: r.reason_name }))]} />
              </div>
              <div>
                <label className="mb-1 block text-[9.5px] font-mono uppercase tracking-wide text-[#9B9B9B]">Mould Change</label>
                <ThemedSelect value={draftFilters.mouldChange} onChange={(v) => updateDraft("mouldChange", v)} options={MOULD_CHANGE_OPTIONS} />
              </div>
            </div>
          </div>

          {error && (
            <div className="border border-red-300 bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-700 no-print">
              {error}
            </div>
          )}

          {loading ? (
            <div className="border border-[#C6C6C6] bg-white py-14 text-center text-[11.5px] text-[#9B9B9B] no-print">
              Loading report data...
            </div>
          ) : (
            <div id="report-print-area">
              {/* Print-only header */}
              <div className="hidden print:block">
                <h2 className="text-lg font-bold text-[#0F1D24]">Dixon MPM — Production Report</h2>
                <p className="text-xs text-[#9B9B9B]">
                  {formatDateLabel(appliedFilters.fromDate)} to {formatDateLabel(appliedFilters.toDate)} · {appliedFilters.hall} · Shift {appliedFilters.shift}
                </p>
              </div>

              {/* ================= SUMMARY ================= */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
                <SummaryTile label="Machines Reported" value={summary?.totalMachines ?? 0} icon={<FaIndustry className="text-[13px]" />} tone="slate" />
                <SummaryTile label="Target" value={summary?.totalTarget ?? 0} icon={<FaBoxes className="text-[13px]" />} tone="blue" />
                <SummaryTile label="Actual" value={summary?.totalActual ?? 0} icon={<FaBoxes className="text-[13px]" />} tone="green" />
                <SummaryTile label="Good Qty" value={summary?.totalGood ?? 0} icon={<FaBoxes className="text-[13px]" />} tone="green" />
                <SummaryTile label="Reject" value={summary?.totalReject ?? 0} icon={<FaExclamationTriangle className="text-[13px]" />} tone="red" />
                <SummaryTile label="Loss (min)" value={summary?.totalLossMinutes ?? 0} icon={<FaClock className="text-[13px]" />} tone="orange" />
                <SummaryTile label="Avg Efficiency" value={`${summary?.avgEfficiency ?? 0}%`} icon={<FaChartLine className="text-[13px]" />} tone="gold" />
              </div>

              {/* ================= MOULD CHANGE STATS ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-3">
                <SummaryTile label="Mould Changes" value={mouldChangeStats?.totalChanges ?? 0} icon={<FaTools className="text-[13px]" />} tone="purple" />
                <SummaryTile label="Mould Change Time (min)" value={mouldChangeStats?.totalDurationMinutes ?? 0} icon={<FaClock className="text-[13px]" />} tone="purple" />
                <SummaryTile label="Avg Change Time (min)" value={mouldChangeStats?.avgDurationMinutes ?? 0} icon={<FaClock className="text-[13px]" />} tone="purple" />
              </div>

              {/* ================= BREAKDOWNS ================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <BreakdownPanel title="Hall-wise Actual Production" rows={hallRows} labelKey="hallName" valueKey="actual" accent="bg-[#0F1D24]" />
                <BreakdownPanel title="Rejection Reason-wise Qty" rows={rejectionRows} labelKey="reasonName" valueKey="totalQty" accent="bg-red-600" />
                <BreakdownPanel title="Loss Time Reason-wise (min)" rows={lossRows} labelKey="reasonName" valueKey="totalMinutes" accent="bg-orange-500" />
              </div>

              {/* ================= ENTRIES TABLE ================= */}
              <div className="overflow-hidden border border-[#C6C6C6] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-[12px]">
                    <thead className="bg-[#0F1D24] text-white">
                      <tr>
                        <th className="px-2.5 py-2 text-left font-semibold">Date</th>
                        <th className="px-2.5 py-2 text-left font-semibold">Hall</th>
                        <th className="px-2.5 py-2 text-left font-semibold">Machine</th>
                        <th className="px-2.5 py-2 text-left font-semibold">Operator</th>
                        <th className="px-2.5 py-2 text-left font-semibold">Part</th>
                        <th className="px-2.5 py-2 text-left font-semibold">Shift</th>
                        <th className="px-2.5 py-2 text-right font-semibold font-mono">Target</th>
                        <th className="px-2.5 py-2 text-right font-semibold font-mono">Actual</th>
                        <th className="px-2.5 py-2 text-right font-semibold font-mono">Good</th>
                        <th className="px-2.5 py-2 text-right font-semibold font-mono">Reject</th>
                        <th className="px-2.5 py-2 text-right font-semibold font-mono">Loss (min)</th>
                        <th className="px-2.5 py-2 text-right font-semibold font-mono">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="px-3 py-8 text-center text-[11.5px] text-[#9B9B9B]">
                            No production entries found for the selected filters.
                          </td>
                        </tr>
                      ) : (
                        entries.map((entry) => (
                          <tr key={entry.id} className="border-t border-[#C6C6C6] hover:bg-[#FAFAFA]">
                            <td className="px-2.5 py-1.5 font-mono text-[#0F1D24]">{String(entry.entry_date).slice(0, 10)}</td>
                            <td className="px-2.5 py-1.5 text-[#0F1D24]">{entry.hall}</td>
                            <td className="px-2.5 py-1.5 font-mono font-semibold text-[#0F1D24]">{entry.machine_name || entry.machine_code}</td>
                            <td className="px-2.5 py-1.5 text-[#9B9B9B]">{entry.operator_name}</td>
                            <td className="px-2.5 py-1.5 text-[#9B9B9B]">{entry.part_name}</td>
                            <td className="px-2.5 py-1.5 text-[#9B9B9B]">{entry.shift} · {entry.time_slot}</td>
                            <td className="px-2.5 py-1.5 text-right font-mono text-blue-700">{entry.target_qty}</td>
                            <td className="px-2.5 py-1.5 text-right font-mono text-emerald-700">{entry.actual_qty}</td>
                            <td className="px-2.5 py-1.5 text-right font-mono text-teal-700">{entry.good_qty}</td>
                            <td className="px-2.5 py-1.5 text-right font-mono text-red-700">{entry.reject_qty}</td>
                            <td className="px-2.5 py-1.5 text-right font-mono text-orange-700">{entry.loss_minutes}</td>
                            <td className="px-2.5 py-1.5 text-right font-mono font-bold text-[#0F1D24]">{entry.efficiency}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductionHistoryPage;