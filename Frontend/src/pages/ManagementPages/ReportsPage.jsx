import React, { useState } from "react";
import {
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentList,
  HiOutlineEye,
} from "react-icons/hi2";
import Sidebar from "./Sidebar";

// ==========================================================
// THEME TOKENS — matches MoldChangeDashboard.jsx
// ==========================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

const getTodayISO = () => new Date().toISOString().split("T")[0];
const getThisMonthISO = () => new Date().toISOString().slice(0, 7);

// ---- Static data — report catalogue ----

const allReports = [
  { name: "Daily Production Report", category: "Production", desc: "Daily production summary vs target" },
  { name: "Production Summary Report", category: "Production", desc: "Period wise production summary" },
  { name: "Rejection Report By Machine", category: "Rejection", desc: "Machine wise rejection breakdown" },
  { name: "Rejection Summary Report", category: "Rejection", desc: "Rejection summary with reasons" },
  { name: "Loss Report Machine Wise", category: "Loss Time", desc: "Machine wise loss time breakdown" },
  { name: "Loss Summary Report", category: "Loss Time", desc: "Overall loss time summary" },
  { name: "Mold Change Machine Wise", category: "Mould", desc: "Machine wise mold change details" },
  { name: "Mold Change Shift Wise", category: "Mould", desc: "Shift wise mold change details" },
  { name: "Mold Change Summary Report", category: "Mould", desc: "Overall mold change summary" },
  { name: "Machine Performance Report", category: "Machine", desc: "Machine wise performance & utilization" },
  { name: "Operator Performance Report", category: "Operator", desc: "Operator performance and productivity" },
  { name: "Shift A Summary Report", category: "Shift", desc: "Shift A production & efficiency summary" },
  { name: "Shift B Summary Report", category: "Shift", desc: "Shift B production & efficiency summary" },
  { name: "OEE Report", category: "OEE", desc: "Machine wise, shift wise & daily in one report" },
];

// ==========================================================
// PERIOD FILTER — Daily / Monthly toggle with matching picker
// ==========================================================
function PeriodFilter({ mode, setMode, dateValue, setDateValue, monthValue, setMonthValue }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-stretch overflow-hidden border border-white/15">
        <button
          type="button"
          onClick={() => setMode("daily")}
          className={`px-2.5 h-7 text-[10.5px] font-bold transition-colors duration-100 ${
            mode === "daily" ? "bg-[#FDC94D] text-[#0F1D24]" : "bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          Daily
        </button>
        <button
          type="button"
          onClick={() => setMode("monthly")}
          className={`px-2.5 h-7 border-l border-white/15 text-[10.5px] font-bold transition-colors duration-100 ${
            mode === "monthly" ? "bg-[#FDC94D] text-[#0F1D24]" : "bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          Monthly
        </button>
      </div>

      <label className="flex h-7 items-center gap-1.5 border border-white/15 bg-white/5 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30">
        <HiOutlineCalendarDays className="h-3.5 w-3.5 text-white/60" />
        {mode === "daily" ? (
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="h-full bg-transparent text-[10.5px] font-semibold text-white outline-none [color-scheme:dark]"
          />
        ) : (
          <input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className="h-full bg-transparent text-[10.5px] font-semibold text-white outline-none [color-scheme:dark]"
          />
        )}
      </label>
    </div>
  );
}

// ==========================================================
// HEADER
// ==========================================================
function ReportsHeader({ mode, setMode, dateValue, setDateValue, monthValue, setMonthValue }) {
  return (
    <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        <h1 className="text-[18px] font-extrabold uppercase tracking-wide text-white whitespace-nowrap">
          Reports
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter
            mode={mode} setMode={setMode}
            dateValue={dateValue} setDateValue={setDateValue}
            monthValue={monthValue} setMonthValue={setMonthValue}
          />

          <button className="flex h-7 items-center gap-1.5 bg-[#FDC94D] px-3 text-[10.5px] font-extrabold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/90">
            <HiOutlineCheck className="h-3.5 w-3.5" /> Apply
          </button>

          <button className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30">
            <HiOutlineArrowPath className="h-3 w-3" /> Refresh
          </button>

          <button className="flex h-7 items-center gap-1.5 border border-red-400/40 bg-red-500/10 px-2.5 text-[10.5px] font-semibold text-red-300 transition-colors duration-100 hover:bg-red-500/20">
            <HiOutlineXMark className="h-3.5 w-3.5" /> Reset
          </button>

          <button className="flex h-7 items-center gap-1.5 border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30">
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================================
// ALL REPORTS PANEL — full grid-lined table (1px borders on every cell)
// ==========================================================
function AllReportsPanel({ query, setQuery, rows }) {
  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 flex-shrink-0 rounded-[2px] items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
            <HiOutlineClipboardDocumentList className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">All Reports</h2>
            <p className="text-[9px] font-medium text-[#9B9B9B]">Production, quality &amp; operational reports</p>
          </div>
        </div>

        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports..."
            className="h-7 w-48 border border-[#C6C6C6] bg-white pl-2.5 pr-2.5 text-[10.5px] font-medium text-[#0F1D24] placeholder:text-[#9B9B9B] outline-none focus:border-[#0F1D24]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[10.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#FAFAFB]">
              <th className="border border-[#C6C6C6] px-3 py-2 text-left text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Report Name</th>
              <th className="border border-[#C6C6C6] px-2 py-2 text-left text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Category</th>
              <th className="hidden border border-[#C6C6C6] px-2 py-2 text-left text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B] lg:table-cell">Description</th>
              <th className="border border-[#C6C6C6] px-2 py-2 text-left text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Format</th>
              <th className="border border-[#C6C6C6] px-2 py-2 text-left text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Frequency</th>
              <th className="hidden border border-[#C6C6C6] px-2 py-2 text-left text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B] xl:table-cell">Last Generated</th>
              <th className="border border-[#C6C6C6] px-3 py-2 text-right text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-[#FAFAFB]">
                <td className="whitespace-nowrap border border-[#C6C6C6] px-3 py-2 font-bold text-[#0F1D24]">{r.name}</td>
                <td className="border border-[#C6C6C6] px-2 py-2">
                  <span className="inline-block border border-[#C6C6C6] px-1.5 py-0.5 text-[9px] font-bold text-[#0F1D24]">
                    {r.category}
                  </span>
                </td>
                <td className="hidden max-w-[220px] truncate border border-[#C6C6C6] px-2 py-2 text-[#6B6B6B] lg:table-cell">{r.desc}</td>
                <td className="border border-[#C6C6C6] px-2 py-2">
                  <span className="inline-flex items-center gap-1 border border-emerald-600/30 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                    <HiOutlineDocumentText className="h-2.5 w-2.5" />
                    Excel
                  </span>
                </td>
                <td className="border border-[#C6C6C6] px-2 py-2 text-[#6B6B6B]">Daily</td>
                <td className="hidden whitespace-nowrap border border-[#C6C6C6] px-2 py-2 text-[#6B6B6B] xl:table-cell">31 Jul 2026, 08:00 AM</td>
                <td className="border border-[#C6C6C6] px-3 py-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <button className="flex items-center gap-1 border border-[#C6C6C6] px-2 py-1 text-[9.5px] font-bold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FAFAFB]">
                      <HiOutlineEye className="h-3 w-3" />
                      View
                    </button>
                    <button className="flex items-center gap-1 bg-[#0F1D24] px-2 py-1 text-[9.5px] font-bold text-white transition-colors duration-100 hover:bg-[#0F1D24]/90">
                      <HiOutlineArrowDownTray className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex-shrink-0 border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1.5 text-[9.5px] font-semibold text-[#9B9B9B]">
        {rows.length} of {allReports.length} reports
      </div>
    </div>
  );
}

// ==========================================================
// PAGE
// ==========================================================
export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("daily");
  const [dateValue, setDateValue] = useState(getTodayISO());
  const [monthValue, setMonthValue] = useState(getThisMonthISO());

  const filtered = allReports.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 border border-[#C6C6C6]">
            <ReportsHeader
              mode={mode} setMode={setMode}
              dateValue={dateValue} setDateValue={setDateValue}
              monthValue={monthValue} setMonthValue={setMonthValue}
            />

            <div className="min-h-0 flex-1 p-1">
              <AllReportsPanel query={query} setQuery={setQuery} rows={filtered} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}