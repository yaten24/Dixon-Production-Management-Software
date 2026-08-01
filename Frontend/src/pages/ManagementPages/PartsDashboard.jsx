import React, { useState } from "react";
import {
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineSquares2X2,
  HiOutlineChartBar,
  HiOutlineWrenchScrewdriver,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBuildingOffice2,
  HiOutlineFlag,
  HiOutlineUsers,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";
import Sidebar from "./Sidebar";

// ==========================================================
// THEME TOKENS — matches ReportsPage.jsx
// ==========================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

// ---------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------
const partRows = [
  { no: "WM1001", name: "Front Box", cat: "Body Parts", target: 2500, produced: 2400, good: 2365, reject: 35, rejectPct: 1.46, achievement: 96.0, yield: 98.54, status: "On Target" },
  { no: "WM1002", name: "Back Box", cat: "Body Parts", target: 3000, produced: 2700, good: 2655, reject: 45, rejectPct: 1.67, achievement: 90.0, yield: 98.33, status: "Slightly Low" },
  { no: "WM1003", name: "Panel", cat: "Top Panel", target: 1800, produced: 1400, good: 1360, reject: 40, rejectPct: 2.86, achievement: 77.78, yield: 97.14, status: "Low" },
  { no: "WM1004", name: "Cover", cat: "Body Parts", target: 2500, produced: 2515, good: 2495, reject: 20, rejectPct: 0.8, achievement: 100.6, yield: 99.2, status: "On Target" },
  { no: "WM1005", name: "Knob", cat: "Control Parts", target: 1500, produced: 1200, good: 1180, reject: 20, rejectPct: 1.67, achievement: 80.0, yield: 98.33, status: "Low" },
  { no: "WM1006", name: "Dispenser", cat: "Functional Parts", target: 1200, produced: 1150, good: 1130, reject: 20, rejectPct: 1.74, achievement: 95.83, yield: 98.26, status: "Slightly Low" },
  { no: "WM1007", name: "Base", cat: "Body Parts", target: 2000, produced: 1980, good: 1960, reject: 20, rejectPct: 1.01, achievement: 99.0, yield: 98.99, status: "On Target" },
  { no: "WM1008", name: "Front Panel", cat: "Top Panel", target: 2000, produced: 1905, good: 1875, reject: 30, rejectPct: 1.57, achievement: 95.25, yield: 98.43, status: "Slightly Low" },
  { no: "WM1009", name: "Side Panel", cat: "Top Panel", target: 1500, produced: 1350, good: 1320, reject: 30, rejectPct: 2.22, achievement: 90.0, yield: 97.78, status: "Slightly Low" },
  { no: "WM1010", name: "Hinge", cat: "Assembly Parts", target: 1000, produced: 980, good: 970, reject: 10, rejectPct: 1.02, achievement: 98.0, yield: 98.98, status: "On Target" },
];

const totals = {
  target: 25000,
  produced: 22850,
  good: 22320,
  reject: 530,
  rejectPct: 2.32,
  achievement: 91.4,
  yield: 97.68,
};

const navItems = [
  { icon: HiOutlineSquares2X2, label: "Dashboard", active: true },
  { icon: HiOutlineChartBar, label: "Production" },
  { icon: HiOutlineWrenchScrewdriver, label: "Machines" },
  { icon: HiOutlineClipboardDocumentList, label: "Reports" },
  { icon: HiOutlineCog6Tooth, label: "Settings" },
];

const statusStyles = {
  "On Target": "bg-emerald-50 text-emerald-700 before:bg-emerald-500",
  "Slightly Low": "bg-amber-50 text-amber-700 before:bg-amber-500",
  Low: "bg-rose-50 text-rose-700 before:bg-rose-500",
};

const pctColor = (v) => (v >= 85 ? "text-emerald-600" : "text-rose-600");

const getTodayISO = () => new Date().toISOString().split("T")[0];


// ==========================================================
// FILTER FIELD — matches PeriodFilter pill styling
// ==========================================================
function FilterField({ icon: Icon, label, value }) {
  return (
    <label className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/5 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30">
      <Icon className="h-3.5 w-3.5 shrink-0 text-white/60" />
      <span className="text-white/50">{label}:</span>
      <span className="max-w-[110px] truncate">{value}</span>
    </label>
  );
}

// ==========================================================
// HEADER — title + filters + actions in one row
// ==========================================================
function DashboardHeader({ refreshing, onRefresh }) {
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
          <FilterField icon={HiOutlineCalendarDays} label="Date" value="31 May 2025" />
          <FilterField icon={HiOutlineClock} label="Shift" value="Shift A (06-14)" />
          <FilterField icon={HiOutlineBuildingOffice2} label="Hall" value="Hall - 1" />
          <FilterField icon={HiOutlineWrenchScrewdriver} label="Machine" value="All" />
          <FilterField icon={HiOutlineClipboardDocumentList} label="Category" value="All" />

          <button className="flex h-7 items-center gap-1.5 rounded-[2px] bg-[#FDC94D] px-3 text-[10.5px] font-extrabold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/90">
            <HiOutlineCheck className="h-3.5 w-3.5" /> Apply
          </button>

          <button
            onClick={onRefresh}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineArrowPath className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>

          <button className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30">
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================================
// STAT CARD — dark navy surface (as requested: "stats ko dark rakho")
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
// PARTS TABLE — same border / header style as AllReportsPanel
// ==========================================================
function PartsTable() {
  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-1.5">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#0F1D24]">Part Production</h2>
          <p className="text-[11.5px] font-medium text-[#9B9B9B]">Target vs actual by part number</p>
        </div>
        <span className="rounded-[2px] border border-[#C6C6C6] px-2 py-0.5 text-[10.5px] font-bold text-[#0F1D24]">
          {partRows.length} parts
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[980px] border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#FAFAFB]">
              {["#", "Part No.", "Part Name", "Category", "Target", "Produced", "Good", "Reject", "Reject %", "Achv %", "Yield %", "Status"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9B9B9B] ${
                      i === 0 ? "text-left" : i >= 4 && i <= 10 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {partRows.map((row, idx) => (
              <tr key={row.no} className="hover:bg-[#FAFAFB]">
                <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#9B9B9B]">{idx + 1}</td>
                <td className="border border-[#C6C6C6] px-2.5 py-1.5 font-bold text-[#0F1D24]">{row.no}</td>
                <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#0F1D24]">{row.name}</td>
                <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#6B6B6B]">{row.cat}</td>
                <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-right text-[#0F1D24]">{row.target.toLocaleString()}</td>
                <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-right text-[#0F1D24]">{row.produced.toLocaleString()}</td>
                <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-right text-[#0F1D24]">{row.good.toLocaleString()}</td>
                <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-right text-[#0F1D24]">{row.reject}</td>
                <td className={`border border-[#C6C6C6] px-2.5 py-1.5 text-right font-bold ${row.rejectPct > 2 ? "text-rose-600" : "text-[#0F1D24]"}`}>
                  {row.rejectPct.toFixed(2)}%
                </td>
                <td className={`border border-[#C6C6C6] px-2.5 py-1.5 text-right font-bold ${pctColor(row.achievement)}`}>
                  {row.achievement.toFixed(2)}%
                </td>
                <td className={`border border-[#C6C6C6] px-2.5 py-1.5 text-right font-bold ${pctColor(row.yield)}`}>
                  {row.yield.toFixed(2)}%
                </td>
                <td className="border border-[#C6C6C6] px-2.5 py-1.5">
                  <span
                    className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] px-2 py-0.5 text-[10px] font-bold before:h-1.5 before:w-1.5 before:rounded-full ${statusStyles[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#FAFAFB] font-extrabold text-[#0F1D24]">
              <td className="border border-[#C6C6C6] px-2.5 py-2" colSpan={4}>
                Total
              </td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right">{totals.target.toLocaleString()}</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right">{totals.produced.toLocaleString()}</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right">{totals.good.toLocaleString()}</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right text-rose-600">{totals.reject}</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right text-rose-600">{totals.rejectPct.toFixed(2)}%</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right text-emerald-600">{totals.achievement.toFixed(2)}%</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-right text-emerald-600">{totals.yield.toFixed(2)}%</td>
              <td className="border border-[#C6C6C6] px-2.5 py-2 text-center text-[#9B9B9B]">&ndash;</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex-shrink-0 border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1 text-[8.5px] font-semibold text-[#9B9B9B]">
        Last updated 31 May 2025, 10:30 AM
      </div>
    </div>
  );
}

// ==========================================================
// PAGE
// ==========================================================
export default function PartProductionDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-[2px] border border-[#C6C6C6]">
            <DashboardHeader refreshing={refreshing} onRefresh={handleRefresh} />

            <div className="min-h-0 flex-1 overflow-hidden p-1">
              <div className="flex h-full min-h-0 flex-col gap-2">
                {/* Stat cards — dark */}
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  <StatCard icon={HiOutlineFlag} label="Target Qty" value="25,000" unit="PCS" sub="Planned for filters" />
                  <StatCard icon={HiOutlineBuildingOffice2} label="Produced Qty" value="22,850" unit="PCS" sub="91.40% Achievement" trend={{ up: true, value: "8.00%" }} />
                  <StatCard icon={HiOutlineCheckCircle} label="Good Qty" value="22,320" unit="PCS" sub="97.68% Yield" trend={{ up: true, value: "5.20%" }} />
                  <StatCard icon={HiOutlineXCircle} label="Reject Qty" value="530" unit="PCS" sub="2.32% Reject Rate" trend={{ up: false, value: "2.80%" }} />
                  <StatCard icon={HiOutlineClock} label="Loss Time" value="135" unit="Min" sub="Today's Loss Time" />
                </div>

                {/* Mini stat strip — dark */}
                <div className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-2.5 rounded-[2px] border border-white/10 bg-[#0F1D24] p-3 sm:grid-cols-4 lg:grid-cols-8">
                  <MiniStat icon={HiOutlineUsers} label="Parts Running" value="18" unit="Parts" />
                  <MiniStat icon={HiOutlinePlay} label="Running Machines" value="16" unit="Mc" />
                  <MiniStat icon={HiOutlinePause} label="Idle Machines" value="2" unit="Mc" />
                  <MiniStat icon={HiOutlineClock} label="Cycle (Actual)" value="52.35" unit="Sec" />
                  <MiniStat icon={HiOutlineClock} label="Cycle (Standard)" value="50.00" unit="Sec" />
                  <MiniStat icon={HiOutlineArrowTrendingUp} label="Achievement" value="91.40%" unit="" />
                  <MiniStat icon={HiOutlineCheckCircle} label="Overall Yield" value="97.68%" unit="" />
                  <MiniStat icon={HiOutlineXCircle} label="Reject Rate" value="2.32%" unit="" />
                </div>

                {/* Table */}
                <div className="min-h-0 flex-1">
                  <PartsTable />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}