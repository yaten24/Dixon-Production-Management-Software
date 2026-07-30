// src/pages/DateWiseProduction.jsx
//
// Monthly Data Wise Performance — day-by-day production breakdown for a
// selected month. Ships with DEMO DATA so the page is fully reviewable
// before backend wiring; swap `buildDemoData()` for a real fetch when
// the /dashboard/... endpoint for this view is ready (same filter
// contract as the Overall Production Dashboard: hall / shift / month).
//
// Locked to the viewport like Dashboard.jsx: h-screen + overflow-hidden
// on the outer shell, flex-1/min-h-0 on the middle band, and the ONLY
// internal scroll is inside the detail table — the page itself never
// scrolls. Header + KPI cards use the same dark navy/amber theme as the
// rest of the app instead of the lighter reference mock.

import React, { useMemo, useState } from "react";
import {
  Target,
  TrendingUp,
  XCircle,
  Gauge,
  CalendarDays,
  Filter,
  Download,
  Printer,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Sidebar from "./Sidebar";

const NAVY = "#0F1D24";
const AMBER = "#FDC94D";
const GREEN = "#10B981";
const RED = "#EF4444";
const PURPLE = "#A78BFA";
const BLUE = "#60A5FA";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = ["2024", "2025", "2026"];
const HALLS = ["All Halls", "Hall 1", "Hall 2", "Hall 3", "Hall 4", "C8"];
const SHIFTS = ["All Shifts", "A", "B"];

/* ==========================================================
   DEMO DATA — day-wise rows for one month, Sundays as non-working
========================================================== */
function isSunday(year, month, day) {
  return new Date(year, month - 1, day).getDay() === 0;
}

function buildDemoData(year = 2026, month = 5) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const baseTarget = 40274;
  let cumTarget = 0, cumActual = 0, cumReject = 0;

  const rows = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const sunday = isSunday(year, month, day);
    const dateObj = new Date(year, month - 1, day);
    const label = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const weekday = dateObj.toLocaleDateString("en-IN", { weekday: "short" });

    if (sunday) {
      rows.push({ day, label, weekday, sunday: true });
      continue;
    }

    // Deterministic pseudo-random wobble so demo data is stable on reload
    const seed = Math.sin(day * 12.9898) * 43758.5453;
    const wobble = seed - Math.floor(seed);
    const achievement = 0.83 + wobble * 0.16; // 83% - 99%
    const target = baseTarget;
    const actual = Math.round(target * achievement);
    const rejectPct = 0.012 + (1 - achievement) * 0.06;
    const reject = Math.round(actual * rejectPct);
    const dailyOee = Math.round((achievement * (1 - rejectPct) * 100 + 5) * 10) / 10;

    cumTarget += target;
    cumActual += actual;
    cumReject += reject;

    rows.push({
      day, label, weekday, sunday: false,
      target, cumTarget,
      actual, cumActual, achievement: Math.round((actual / target) * 1000) / 10,
      reject, rejectPct: Math.round((reject / actual) * 1000) / 10,
      cumReject, cumRejectPct: Math.round((cumReject / cumActual) * 1000) / 10,
      dailyOee, cumOee: Math.round((cumActual / cumTarget) * (1 - cumReject / cumActual) * 1000) / 10,
    });
  }
  return rows;
}

/* ==========================================================
   SHARED PRIMITIVES
========================================================== */
const CardShell = ({ className = "", children }) => (
  <div className={`rounded-[2px] border border-[#E2E8F0] bg-white p-2.5 shadow-sm ${className}`}>
    {children}
  </div>
);

const DarkSelect = ({ label, value, options, onChange }) => (
  <div className="flex flex-col gap-1">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 rounded-[2px] border border-white/15 bg-transparent px-2 text-[10.5px] font-semibold text-white outline-none focus:border-white/40 [&>option]:text-[#0F1D24]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

// Dark KPI card — same visual family as Dashboard.jsx's KpiCard
const KpiCard = ({ icon: Icon, accent, label, value, sub, stat1, stat2 }) => (
  <div className="flex min-h-0 flex-col gap-1.5 rounded-[2px] border border-white/10 bg-[#0F1D24] p-2.5 shadow-sm [container-type:inline-size]">
    <div className="flex items-center gap-2">
      <span
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[2px]"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        <Icon size={12} />
      </span>
      <span className="truncate text-[9.5px] font-bold uppercase tracking-wide text-white/70">{label}</span>
    </div>
    <div>
      <div className="text-[clamp(16px,6cqw,21px)] font-extrabold leading-none text-white">{value}</div>
      <div className="mt-1 text-[9.5px] font-semibold text-white/40">{sub}</div>
    </div>
    <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-[9.5px] font-bold">
      <div>
        <div className="font-semibold text-white/40">{stat1.label}</div>
        <div className={stat1.tone || "text-white"}>{stat1.value}</div>
      </div>
      {stat2 && (
        <div className="text-right">
          <div className="font-semibold text-white/40">{stat2.label}</div>
          <div className={stat2.tone || "text-white"}>{stat2.value}</div>
        </div>
      )}
    </div>
  </div>
);

const fmt = (n) => (n == null ? "-" : n.toLocaleString("en-IN"));

/* ==========================================================
   PAGE
========================================================== */
const DateWiseProduction = () => {
  const [year, setYear] = useState("2026");
  const [hall, setHall] = useState("All Halls");
  const [shift, setShift] = useState("All Shifts");
  const [month] = useState("May");
  const [refreshing, setRefreshing] = useState(false);

  const monthIdx = MONTHS.indexOf(month) + 1;
  const rows = useMemo(() => buildDemoData(Number(year), monthIdx), [year, monthIdx]);
  const workingRows = rows.filter((r) => !r.sunday);

  const totals = useMemo(() => {
    const last = workingRows[workingRows.length - 1];
    const target = last?.cumTarget || 0;
    const actual = last?.cumActual || 0;
    const reject = last?.cumReject || 0;
    const oeeVals = workingRows.map((r) => r.dailyOee);
    const avgOee = Math.round((oeeVals.reduce((a, b) => a + b, 0) / oeeVals.length) * 100) / 100;
    const bestDay = workingRows.reduce((a, b) => (b.dailyOee > a.dailyOee ? b : a), workingRows[0]);
    const worstDay = workingRows.reduce((a, b) => (b.dailyOee < a.dailyOee ? b : a), workingRows[0]);
    return {
      target, actual, reject,
      dailyAvgTarget: Math.round(target / workingRows.length),
      dailyAvgActual: Math.round(actual / workingRows.length),
      achievement: Math.round((actual / target) * 1000) / 10,
      rejectPct: Math.round((reject / actual) * 1000) / 10,
      dailyAvgReject: Math.round(reject / workingRows.length),
      avgOee,
      bestDay, worstDay,
    };
  }, [workingRows]);

  const chartData = workingRows.map((r) => ({
    label: r.label, target: r.target, actual: r.actual,
    reject: r.reject, rejectPct: r.rejectPct, oee: r.dailyOee,
  }));

  const donutData = [
    { name: "Achieved", value: totals.actual, color: GREEN },
    { name: "Remaining", value: Math.max(totals.target - totals.actual, 0), color: BLUE },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[2px] border border-[#FDC94D]/40 bg-white">
          {/* HEADER — dark, matches Dashboard.jsx */}
          <header className="flex-shrink-0 rounded-t-[2px] bg-[#0F1D24] px-4 py-2.5">
            <div className="flex flex-wrap items-end justify-between gap-y-2 gap-x-3">
              <div className="flex items-center gap-2.5">
                {/* <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[2px] bg-white/10">
                  <CalendarDays size={15} className="text-[#FDC94D]" />
                </span> */}
                <div>
                  <h1 className="whitespace-nowrap text-[14px] font-extrabold uppercase tracking-wide text-white">
                    Monthly Data Wise Performance
                  </h1>
                  <p className="text-[9.5px] font-semibold text-white/40">Monthly Production Summary — Date Wise (Demo Data)</p>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <DarkSelect label="Year" value={year} options={YEARS} onChange={setYear} />
                <DarkSelect label="Hall" value={hall} options={HALLS} onChange={setHall} />
                <DarkSelect label="Shift" value={shift} options={SHIFTS} onChange={setShift} />

                <button
                  onClick={handleRefresh}
                  className="flex h-7 items-center gap-1.5 rounded-[2px] px-2.5 text-[10.5px] font-extrabold text-[#0F1D24]"
                  style={{ backgroundColor: AMBER }}
                >
                  <Filter size={11} className={refreshing ? "animate-spin" : ""} />
                  Apply Filter
                </button>
                <button className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white hover:border-white/30">
                  <Download size={11} /> Export Excel
                </button>
                <button className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white hover:border-white/30">
                  <Printer size={11} /> Print
                </button>
              </div>
            </div>
          </header>

          {/* MAIN — fixed to viewport, everything below adjusts to fit */}
          <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
            <div className="grid flex-shrink-0 grid-cols-2 gap-1.5 lg:grid-cols-4">
              <KpiCard
                icon={Target} accent={BLUE}
                label="Target (Units)" value={fmt(totals.target)} sub="Total Monthly Target"
                stat1={{ label: "Daily Avg Target", value: fmt(totals.dailyAvgTarget) }}
              />
              <KpiCard
                icon={TrendingUp} accent={GREEN}
                label="Actual (Units)" value={fmt(totals.actual)} sub="Total Monthly Actual"
                stat1={{ label: "Daily Avg Actual", value: fmt(totals.dailyAvgActual) }}
                stat2={{ label: "Achievement", value: `${totals.achievement}%`, tone: "text-emerald-400" }}
              />
              <KpiCard
                icon={XCircle} accent={RED}
                label="Reject (Units)" value={fmt(totals.reject)} sub="Total Monthly Reject"
                stat1={{ label: "Reject %", value: `${totals.rejectPct}%`, tone: "text-red-400" }}
                stat2={{ label: "Daily Avg Reject", value: fmt(totals.dailyAvgReject) }}
              />
              <KpiCard
                icon={Gauge} accent={PURPLE}
                label="OEE (%)" value={`${totals.avgOee}%`} sub="Monthly Average OEE"
                stat1={{ label: "Best Day", value: `${totals.bestDay?.dailyOee}%`, tone: "text-emerald-400" }}
                stat2={{ label: "Lowest Day", value: `${totals.worstDay?.dailyOee}%`, tone: "text-red-400" }}
              />
            </div>

            {/* REMAINING SPACE: table (flexible) + charts (fixed) — no page scroll */}
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              {/* DETAIL TABLE — only internally-scrolling element on the page */}
              <CardShell className="flex min-h-0 flex-1 basis-0 flex-col">
                <div className="mb-1.5 flex flex-shrink-0 items-center justify-between">
                  <h2 className="text-[11.5px] font-extrabold text-[#0F1D24]">
                    Monthly Data Wise Details — {month} {year}
                  </h2>
                  <div className="flex items-center gap-3 text-[9px] font-bold">
                    <Legend swatch={BLUE} label="Target" />
                    <Legend swatch={GREEN} label="Actual" />
                    <Legend swatch={RED} label="Reject" />
                    <Legend swatch={PURPLE} label="OEE (%)" />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto">
                  <table className="w-full min-w-[1100px] border-collapse text-left">
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr className="text-[8.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
                        <th className="border-b border-[#EEF2F6] px-2 py-1.5" rowSpan={2}>Date</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1 text-center text-blue-600" colSpan={2}>Target (Units)</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1 text-center text-emerald-600" colSpan={3}>Actual (Units)</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1 text-center text-red-500" colSpan={4}>Reject (Units)</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1 text-center text-purple-600" colSpan={2}>OEE (%)</th>
                      </tr>
                      <tr className="text-[8.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Day</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Cumulative</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Day</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Cumulative</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Achv %</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Day</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">%</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Cumulative</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Cum %</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Daily</th>
                        <th className="border-b border-[#EEF2F6] px-2 py-1">Cumulative</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.day} className="border-b border-[#EEF2F6] text-[10px] font-semibold text-[#0F1D24] hover:bg-[#F8FAFC]">
                          <td className="px-2 py-1 font-bold">
                            {r.label} <span className={r.sunday ? "text-red-400" : "text-[#94A3B8]"}>{r.weekday}</span>
                          </td>
                          {r.sunday ? (
                            <td colSpan={10} className="px-2 py-1 text-center text-[#CBD5E1]">— Non-working day —</td>
                          ) : (
                            <>
                              <td className="px-2 py-1">{fmt(r.target)}</td>
                              <td className="px-2 py-1">{fmt(r.cumTarget)}</td>
                              <td className="px-2 py-1">{fmt(r.actual)}</td>
                              <td className="px-2 py-1">{fmt(r.cumActual)}</td>
                              <td className={`px-2 py-1 ${r.achievement >= 90 ? "text-emerald-600" : "text-amber-600"}`}>{r.achievement}%</td>
                              <td className="px-2 py-1">{fmt(r.reject)}</td>
                              <td className="px-2 py-1 text-red-500">{r.rejectPct}%</td>
                              <td className="px-2 py-1">{fmt(r.cumReject)}</td>
                              <td className="px-2 py-1 text-red-500">{r.cumRejectPct}%</td>
                              <td className={`px-2 py-1 ${r.dailyOee >= 90 ? "text-emerald-600" : "text-amber-600"}`}>{r.dailyOee}%</td>
                              <td className="px-2 py-1">{r.cumOee}%</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="text-[10px] font-extrabold text-[#0F1D24]">
                        <td className="px-2 py-1.5">TOTAL / AVG</td>
                        <td className="px-2 py-1.5">{fmt(totals.target)}</td>
                        <td className="px-2 py-1.5">{fmt(totals.target)}</td>
                        <td className="px-2 py-1.5">{fmt(totals.actual)}</td>
                        <td className="px-2 py-1.5">{fmt(totals.actual)}</td>
                        <td className="px-2 py-1.5 text-emerald-600">{totals.achievement}%</td>
                        <td className="px-2 py-1.5">{fmt(totals.reject)}</td>
                        <td className="px-2 py-1.5 text-red-500">{totals.rejectPct}%</td>
                        <td className="px-2 py-1.5">{fmt(totals.reject)}</td>
                        <td className="px-2 py-1.5 text-red-500">{totals.rejectPct}%</td>
                        <td className="px-2 py-1.5 text-emerald-600">{totals.avgOee}%</td>
                        <td className="px-2 py-1.5 text-emerald-600">{totals.avgOee}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardShell>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const Legend = ({ swatch, label }) => (
  <span className="flex items-center gap-1 text-[#475569]">
    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: swatch }} />
    {label}
  </span>
);

export default DateWiseProduction;