// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Cog,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Target,
  Package,
  CheckCircle2,
  XCircle,
  Zap,
  Gauge,
  PlayCircle,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Factory,
  Download,
  ChevronDown,
  Bell,
  Eye,
} from "lucide-react";

import Sidebar from "./Sidebar";
import { pct } from "../../utils/dashboardMath";
import useDashboardOverview from "../../hooks/useMonthelyDashboardOverview";

// ============================================================
// THEME TOKENS (unchanged brand palette)
// ============================================================
const NAVY = "#0F1D24";

const STATUS_COLORS = {
  Running: { dot: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-500", pill: "bg-emerald-500 text-white" },
  Idle: { dot: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-500", pill: "bg-blue-500 text-white" },
  Setup: { dot: "bg-amber-500", text: "text-amber-600", bg: "bg-[#FDC94D]", pill: "bg-[#FDC94D] text-[#0F1D24]" },
  Breakdown: { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-500", pill: "bg-red-500 text-white" },
};

/* ==========================================================
   SHARED PRIMITIVES
========================================================== */
const CardShell = ({ className = "", children }) => (
  <div
    className={`flex min-h-0 flex-col rounded-[2px] border border-[#E2E8F0] bg-white p-2.5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-3 ${className}`}
  >
    {children}
  </div>
);

const CardLabel = ({ icon: Icon, children, tone = "text-[#94A3B8]" }) => (
  <div className={`flex flex-shrink-0 items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide ${tone}`}>
    {Icon && (
      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[2px] bg-[#0F1D24]/[0.06]">
        <Icon size={10} />
      </span>
    )}
    {children}
  </div>
);

const DarkSelect = ({ label, icon: Icon, value, options = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
      >
        {Icon && <Icon size={12} className="flex-shrink-0" />}
        {label && <span className="text-white/50">{label} :</span>}
        <span>{value}</span>
        <ChevronDown size={11} className={`text-white/50 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[130px] overflow-hidden rounded-[2px] border border-[#E2E8F0] bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-1.5 text-left text-[11px] font-semibold transition-colors ${
                opt === value ? "bg-[#FDC94D]/15 text-[#0F1D24]" : "text-[#475569] hover:bg-[#F8FAFC]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==========================================================
   KPI CARD (dark theme)
========================================================== */
const KpiCard = ({ label, value, unit, delta, deltaTone = "up", className }) => {
  const trendColor = deltaTone === "up" ? "text-emerald-400" : deltaTone === "down" ? "text-red-400" : "text-white/50";
  const TrendIcon = deltaTone === "up" ? TrendingUp : deltaTone === "down" ? TrendingDown : null;

  return (
    <div
      className={`flex min-h-0 flex-col gap-1 rounded-[2px] border border-white/10 bg-[#0F1D24] p-2 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-3 [container-type:inline-size] ${className || ""}`}
    >
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <span className="truncate text-[clamp(11px,2.8cqw,10px)] font-bold uppercase tracking-wide text-white/90">{label}</span>
      </div>
      <div className="mt-0.5 flex flex-1 items-baseline gap-1">
        <span className="text-[clamp(18px,7cqw,26px)] font-extrabold leading-none text-white">{value}</span>
        {unit && <span className="text-[clamp(9px,2.5cqw,11px)] font-semibold text-white/40">{unit}</span>}
      </div>
      {delta && (
        <div className={`mt-1 flex flex-shrink-0 items-center gap-1 text-[clamp(9px,2.6cqw,11px)] font-bold ${trendColor}`}>
          {TrendIcon && <TrendIcon size={11} className="flex-shrink-0" />}
          {delta} <span className="font-medium text-white/40">vs Plan</span>
        </div>
      )}
    </div>
  );
};

/* ==========================================================
   MONTHLY TREND CHART (line + dashed target)
========================================================== */
const TrendChart = ({ data = [] }) => {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 600, height: 220 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setSize({ width: entry.contentRect.width, height: Math.max(entry.contentRect.height, 160) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const PADDING = { top: 16, right: 10, bottom: 22, left: 30 };
  const { width, height } = size;
  const chartW = Math.max(width - PADDING.left - PADDING.right, 10);
  const chartH = Math.max(height - PADDING.top - PADDING.bottom, 10);

  const maxVal = useMemo(() => {
    const m = Math.max(...data.map((d) => Math.max(d.target || 0, d.actual || 0)), 10);
    return Math.ceil(m / 1000) * 1000 || 10000;
  }, [data]);

  const points = useMemo(() => {
    if (!data.length) return { actual: "", target: "", areaActual: "", pts: [] };
    const stepX = chartW / (data.length - 1 || 1);
    const toY = (v) => PADDING.top + chartH - (v / maxVal) * chartH;
    const pts = data.map((d, i) => ({
      x: PADDING.left + stepX * i,
      yActual: toY(d.actual || 0),
      yTarget: toY(d.target || 0),
      label: d.day ?? d.hour ?? i + 1,
      actual: d.actual,
      target: d.target,
    }));
    const actualPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.yActual}`).join(" ");
    const targetPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.yTarget}`).join(" ");
    const areaPath = `${actualPath} L${pts[pts.length - 1].x},${PADDING.top + chartH} L${pts[0].x},${PADDING.top + chartH} Z`;
    return { actual: actualPath, target: targetPath, areaActual: areaPath, pts };
  }, [data, chartW, chartH, maxVal]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));
  const labelStep = Math.max(Math.ceil((points.pts?.length || 1) / 8), 1);

  return (
    <div ref={containerRef} className="relative h-full min-h-[120px] w-full">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F1D24" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0F1D24" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, i) => {
          const y = PADDING.top + chartH - (tick / maxVal) * chartH;
          return (
            <g key={i}>
              <line x1={PADDING.left} x2={width - PADDING.right} y1={y} y2={y} stroke="#EFEFEF" strokeWidth={1} />
              <text x={PADDING.left - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#9B9B9B" fontFamily="ui-monospace, monospace">
                {tick >= 1000 ? `${tick / 1000}K` : tick}
              </text>
            </g>
          );
        })}

        {points.areaActual && <path d={points.areaActual} fill="url(#trendFill)" />}
        {points.target && <path d={points.target} fill="none" stroke={NAVY} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.55} />}
        {points.actual && <path d={points.actual} fill="none" stroke={NAVY} strokeWidth={2} />}

        {points.pts?.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.yActual} r={2.5} fill={NAVY} />
        ))}

        {points.pts?.map(
          (p, i) =>
            i % labelStep === 0 && (
              <text key={`h-${i}`} x={p.x} y={height - PADDING.bottom + 14} textAnchor="middle" fontSize="9" fontWeight="600" fill="#9B9B9B">
                {p.label}
              </text>
            )
        )}
      </svg>
      <div className="absolute bottom-0 right-0 flex items-center gap-3 text-[9px] font-semibold text-[#475569]">
        <span className="flex items-center gap-1"><span className="inline-block h-0 w-3 border-t-2 border-dashed border-[#0F1D24]/50" />Target</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 bg-[#0F1D24]" />Actual</span>
      </div>
    </div>
  );
};

/* ==========================================================
   HALL WISE PERFORMANCE TABLE
========================================================== */
const StatusDot = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Idle;
  return <span className={`inline-block h-2 w-2 rounded-full ${c.dot}`} />;
};

const PerformanceTable = ({ rows = [] }) => (
  <div className="h-full overflow-auto">
    <table className="w-full min-w-[820px] border-collapse text-left">
      <thead className="sticky top-0 z-10 bg-white">
        <tr className="border-b border-[#EEF2F6] text-[9.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
          <th className="px-2 py-2">Hall</th>
          <th className="px-2 py-2">Target (Units)</th>
          <th className="px-2 py-2">Actual (Units)</th>
          <th className="px-2 py-2">Good (Units)</th>
          <th className="px-2 py-2">Reject (Units)</th>
          <th className="px-2 py-2">Efficiency (%)</th>
          <th className="px-2 py-2">OEE (%)</th>
          <th className="px-2 py-2">Running</th>
          <th className="px-2 py-2">Breakdown</th>
          <th className="px-2 py-2">Status</th>
          <th className="px-2 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.hall} className="border-b border-[#EEF2F6] text-[11px] font-semibold text-[#0F1D24] hover:bg-[#F8FAFC]">
            <td className="px-2 py-2 font-bold">{r.hall}</td>
            <td className="px-2 py-2">{r.target.toLocaleString("en-IN")}</td>
            <td className="px-2 py-2">{r.actual.toLocaleString("en-IN")}</td>
            <td className="px-2 py-2">{r.good.toLocaleString("en-IN")}</td>
            <td className="px-2 py-2">{r.reject.toLocaleString("en-IN")}</td>
            <td className={`px-2 py-2 ${r.efficiency >= 90 ? "text-emerald-600" : "text-red-500"}`}>{r.efficiency}%</td>
            <td className={`px-2 py-2 ${r.oee >= 90 ? "text-emerald-600" : "text-red-500"}`}>{r.oee}%</td>
            <td className="px-2 py-2">{r.running} / {r.total}</td>
            <td className="px-2 py-2">{r.breakdown}</td>
            <td className="px-2 py-2"><StatusDot status={r.status} /></td>
            <td className="px-2 py-2">
              <button className="flex items-center gap-1 text-[10px] font-bold text-[#2563EB] hover:underline">
                <Eye size={11} /> View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ==========================================================
   LIVE MACHINE PRODUCTION TABLE (now shows totals for the
   selected month, not just today — see backend fix)
========================================================== */
const LiveMachineTable = ({ machines = [] }) => (
  <div className="h-full overflow-auto">
    <table className="w-full min-w-[1000px] border-collapse text-left">
      <thead className="sticky top-0 z-10 bg-white">
        <tr className="border-b border-[#EEF2F6] text-[9.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
          <th className="px-2 py-2">Machine</th>
          <th className="px-2 py-2">Hall</th>
          <th className="px-2 py-2">Operator</th>
          <th className="px-2 py-2">Part</th>
          <th className="px-2 py-2">Latest Cycle Time (Sec)</th>
          <th className="px-2 py-2">Target (Month)</th>
          <th className="px-2 py-2">Actual (Month)</th>
          <th className="px-2 py-2">Good</th>
          <th className="px-2 py-2">Reject</th>
          <th className="px-2 py-2">Efficiency (%)</th>
          <th className="px-2 py-2">OEE (%)</th>
          <th className="px-2 py-2">Status</th>
          <th className="px-2 py-2">Last Update</th>
        </tr>
      </thead>
      <tbody>
        {machines.map((m) => {
          const c = STATUS_COLORS[m.status] || STATUS_COLORS.Idle;
          return (
            <tr key={m.machine} className="border-b border-[#EEF2F6] text-[11px] font-semibold text-[#0F1D24] hover:bg-[#F8FAFC]">
              <td className="px-2 py-2 font-bold">{m.machine}</td>
              <td className="px-2 py-2">{m.hall}</td>
              <td className="px-2 py-2">{m.operator}</td>
              <td className="px-2 py-2">{m.part}</td>
              <td className="px-2 py-2">{m.cycleTime}</td>
              <td className="px-2 py-2">{m.target.toLocaleString("en-IN")}</td>
              <td className="px-2 py-2">{m.actual.toLocaleString("en-IN")}</td>
              <td className="px-2 py-2">{m.good.toLocaleString("en-IN")}</td>
              <td className="px-2 py-2">{m.reject.toLocaleString("en-IN")}</td>
              <td className={`px-2 py-2 ${m.efficiency >= 90 ? "text-emerald-600" : "text-red-500"}`}>{m.efficiency}%</td>
              <td className={`px-2 py-2 ${m.oee >= 90 ? "text-emerald-600" : "text-red-500"}`}>{m.oee}%</td>
              <td className="px-2 py-2">
                <span className={`rounded-[2px] px-2 py-0.5 text-[9.5px] font-bold ${c.pill}`}>{m.status}</span>
              </td>
              <td className="px-2 py-2 text-[#94A3B8]">{m.lastUpdate}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

/* ==========================================================
   DASHBOARD PAGE
========================================================== */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHIFTS = ["All", "A", "B"];
// FIX: these must match the exact strings stored in the DB (hall column
// on machines / production_entries), which are "Hall 1".."Hall 4" and
// "C8" — the old "Hall-1"/"C-8" values never matched any row, so picking
// a hall from this dropdown silently returned zero results.
const HALLS = ["All", "Hall 1", "Hall 2", "Hall 3", "Hall 4", "C8"];

const Dashboard = () => {
  const [shift, setShift] = useState("A");
  const [hall, setHall] = useState("All");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);

  const {
    kpis,
    monthlyTrend,
    hallPerformance,
    liveMachines,
    loading,
    error,
    refresh,
  } = useDashboardOverview(hall, shift, month);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
        {/* ===================== SINGLE BORDERED CONTENT BOX ===================== */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[2px] border border-[#FDC94D]/40 bg-white">
          {/* ===================== HEADER (control-box style) ===================== */}
          <header className="flex-shrink-0 rounded-t-[2px] bg-[#0F1D24] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
              <div className="flex items-center gap-2.5">
                {/* <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[2px] bg-white/10">
                  <Factory size={15} className="text-[#FDC94D]" />
                </span> */}
                <h1 className="whitespace-nowrap text-[15px] font-extrabold uppercase tracking-wide text-white sm:text-[16px]">
                  Overall Production Dashboard
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <DarkSelect icon={CalendarDays} label="Month" value={month} options={MONTHS} onChange={setMonth} />
                <DarkSelect label="Shift" value={shift} options={SHIFTS} onChange={setShift} />
                <DarkSelect label="Hall" value={hall} options={HALLS} onChange={setHall} />
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30 disabled:opacity-50"
                >
                  <RefreshCw size={11} className={`flex-shrink-0 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button className="flex h-7 items-center gap-1.5 rounded-[2px] bg-[#FDC94D] px-3 text-[10.5px] font-extrabold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/90">
                  <Download size={12} /> Export Excel
                </button>
              </div>
            </div>
          </header>

          {error && (
            <div className="mx-3 flex-shrink-0 rounded-[2px] border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-500">
              <AlertCircle size={12} className="mr-1 inline" /> {error}
            </div>
          )}

          {/* ===================== MAIN CONTENT — fixed to viewport, no page scroll ===================== */}
          <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-1 sm:gap-2.5 sm:p-1 lg:gap-3 lg:p-1">
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[13px] font-semibold text-[#94A3B8]">
              <RefreshCw size={18} className="animate-spin text-[#0F1D24]/40" />
              Loading dashboard...
            </div>
          ) : (
            <>
              {/* KPI ROW (dark theme) — fixed height, never shrinks the halves below */}
              <div className="grid flex-shrink-0 grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2 xl:grid-cols-8 lg:gap-1">
                <KpiCard label="Production Target" value={kpis.target.toLocaleString("en-IN")} unit="Units" />
                <KpiCard
                  label="Actual Production"
                  value={kpis.actual.toLocaleString("en-IN")}
                  unit="Units"
                  delta={`${pct(kpis.actual, kpis.target)}%`}
                  deltaTone="up"
                />
                <KpiCard
                  label="Good Quantity"
                  value={kpis.good.toLocaleString("en-IN")}
                  unit="Units"
                  delta={`${pct(kpis.good, kpis.target)}%`}
                  deltaTone="up"
                />
                <KpiCard
                  label="Reject Quantity"
                  value={kpis.reject.toLocaleString("en-IN")}
                  unit="Units"
                  delta={`${pct(kpis.reject, kpis.target)}%`}
                  deltaTone="down"
                />
                <KpiCard label="Efficiency" value={`${kpis.efficiency}%`} delta={`${kpis.efficiency}%`} deltaTone="up" />
                <KpiCard label="OEE" value={`${kpis.oee}%`} delta={`${kpis.oee}%`} deltaTone="up" />
                <KpiCard
                  label="Running Machines"
                  value={`${kpis.runningMachines} / ${kpis.totalMachines}`}
                  delta={`${pct(kpis.runningMachines, kpis.totalMachines)}%`}
                  deltaTone="up"
                />
                <KpiCard
                  label="Breakdown Machines"
                  value={`${kpis.breakdownMachines} / ${kpis.totalMachines}`}
                  delta={`${pct(kpis.breakdownMachines, kpis.totalMachines)}%`}
                  deltaTone="down"
                />
              </div>

              {/* REMAINING SPACE SPLIT EXACTLY 50/50: top = tables+trend, bottom = live machines */}
              <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-2.5 lg:gap-3">
                {/* TOP HALF */}
                <div className="grid min-h-0 flex-1 basis-0 grid-cols-1 gap-2 sm:gap-2.5 lg:grid-cols-3 lg:gap-3">
                  <CardShell className="min-h-0 lg:col-span-2">
                    <CardLabel icon={CalendarDays}><span className="text-[12px]">Hall Wise Performance</span></CardLabel>
                    <div className="mt-2 min-h-0 flex-1">
                      <PerformanceTable rows={hallPerformance} />
                    </div>
                  </CardShell>

                  <CardShell className="min-h-0 lg:col-span-1">
                    <div className="flex flex-shrink-0 items-center justify-between">
                      <CardLabel icon={Bell}><span className="text-[12px]">Production Trend</span></CardLabel>
                      <button className="text-[10px] font-bold text-[#2563EB] hover:underline">View All</button>
                    </div>
                    <div className="mt-2 min-h-0 flex-1">
                      <TrendChart data={monthlyTrend} />
                    </div>
                  </CardShell>
                </div>

                {/* BOTTOM HALF — Live Machine Production Overview, monthly totals */}
                <CardShell className="min-h-0 flex-1 basis-0">
                  <div className="flex flex-shrink-0 items-center justify-between">
                    <CardLabel icon={Cog}><span className="text-[12px]">Live Machine Production Overview — {month}</span></CardLabel>
                    <button className="text-[10px] font-bold text-[#2563EB] hover:underline">View All Machines</button>
                  </div>
                  <div className="mt-2 min-h-0 flex-1">
                    <LiveMachineTable machines={liveMachines} />
                  </div>
                </CardShell>
              </div>
            </>
          )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;