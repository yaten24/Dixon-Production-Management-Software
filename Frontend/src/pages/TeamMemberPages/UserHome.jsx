// UserHome.jsx — full dashboard page, single file, single screen (no page scroll)
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import {
  HiOutlineArrowPath,
  HiOutlineFlag,
  HiOutlineExclamationCircle,
  HiOutlineCog,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineArrowRight,
  HiOutlineSquares2X2,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi2";
import {
  HiOfficeBuilding,
  HiCalendar,
  HiUserGroup,
  HiDocumentAdd,
  HiClipboardList,
  HiDocumentReport,
  HiOutlineTrendingUp,
} from "react-icons/hi";

import { getDashboardOverview, getHallWiseOverview } from "../../api/dashboardApi";
import Sidebar, { QUICK_ACCESS_ITEMS, NAVY, GOLD, BORDER } from "./Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// ============================================================
// HOOKS
// ============================================================

const useDashboardOverview = ({ hall } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardOverview(hall ? { hall } : {});
      if (res.success) setData(res.data);
      else setError(res.message || "Failed to load dashboard data.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [hall]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  return { data, loading, error, refresh: fetchOverview };
};

const useHallList = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getHallWiseOverview();
        if (!cancelled && res.success) {
          setHalls((res.data?.halls || []).map((h) => h.hall));
        }
      } catch {
        // silent — filter falls back to "All Halls" only
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { halls, loading };
};

// Expected backend: GET /dashboard/trend?date&hall -> { success, data: { points: [{hour,target,actual}] } }
const useProductionTrend = ({ date, hall }) => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrend = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard/trend", { params: { date, hall: hall === "All" ? undefined : hall } });
      if (res.data?.success) setPoints(res.data.data?.points || []);
      else setError(res.data?.message || "Failed to load trend.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load production trend.");
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [date, hall]);

  useEffect(() => { fetchTrend(); }, [fetchTrend]);

  return { points, loading, error, refresh: fetchTrend };
};

// Expected backend: GET /dashboard/machine-status -> { success, data: { total, running, idle, down, maintenance } }
const useMachineStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard/machine-status");
      if (res.data?.success) setStatus(res.data.data);
      else setError(res.data?.message || "Failed to load machine status.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load machine status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  return { status, loading, error, refresh: fetchStatus };
};

// Expected backend: GET /dashboard/activity?limit=6 -> { success, data: [{ id, type, title, meta, time }] }
const useRecentActivity = (limit = 6) => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/activity", { params: { limit } });
      if (res.data?.success) setActivity(res.data.data || []);
    } catch {
      setActivity([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  return { activity, loading, refresh: fetchActivity };
};

// Expected backend: GET /dashboard/alerts?limit=3 -> { success, data: [{ id, severity, title, detail, time }] }
const useAlerts = (limit = 3) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/alerts", { params: { limit } });
      if (res.data?.success) setAlerts(res.data.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  return { alerts, loading, refresh: fetchAlerts };
};

// Sidebar navigation — "Dashboard" (this page) plus every Quick Access
// destination, so the sidebar is a complete, persistent map of the app
// rather than a subset. Order matches QUICK_ACCESS_ITEMS intentionally,
// so the sidebar and the Quick Access tiles below always agree.
const NAV_ITEMS = [
  { id: "dashboard", title: "Dashboard", icon: HiOutlineSquares2X2, color: NAVY, path: "/employee/home" },
  ...QUICK_ACCESS_ITEMS,
];

const TODAY_KEY = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ============================================================
// KPI CARD — compact single-row bento tile
// ============================================================
const KPI_TONE = {
  green: { text: "text-emerald-700", iconBg: "bg-emerald-50", iconText: "text-emerald-600", bar: "bg-emerald-600" },
  blue: { text: "text-[#0F1D24]", iconBg: "bg-blue-50", iconText: "text-blue-600", bar: "bg-blue-600" },
  red: { text: "text-red-700", iconBg: "bg-red-50", iconText: "text-red-600", bar: "bg-red-600" },
  amber: { text: "text-[#0F1D24]", iconBg: "bg-[#FDC94D]/20", iconText: "text-[#0F1D24]", bar: "bg-[#FDC94D]" },
};

function KpiCard({ title, value, subtitle, icon: Icon, tone = "blue", progress }) {
  const t = KPI_TONE[tone] || KPI_TONE.blue;
  return (
    <div className="flex min-w-0 flex-1 flex-col border border-[#C6C6C6] bg-white p-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="truncate text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{title}</p>
        <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#C6C6C6] ${t.iconBg} ${t.iconText}`}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
      <h3 className={`font-mono text-[21px] font-extrabold leading-none ${t.text}`}>{value}</h3>
      <p className="mt-1 truncate text-[10px] font-medium text-[#9B9B9B]">{subtitle}</p>
      {typeof progress === "number" && (
        <div className="mt-1.5 h-1 w-full overflow-hidden border border-[#C6C6C6] bg-[#F0F0F0]">
          <div className={`h-full ${t.bar}`} style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// TODAY'S OVERVIEW
// ============================================================
function OverviewRow() {
  const { data, loading, error, refresh } = useDashboardOverview();

  return (
    <section className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#C6C6C6] px-2.5 py-1.5">
        <div className="min-w-0">
          <h2 className="text-[12.5px] font-extrabold leading-tight text-[#0F1D24]">Today's Overview</h2>
          <p className="truncate text-[10px] font-medium text-[#9B9B9B]">
            {data ? `Live stats for ${data.date} · All Halls` : "Live production statistics"}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex h-7 flex-shrink-0 items-center gap-1.5 border border-[#C6C6C6] bg-white px-2.5 text-[10.5px] font-bold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-60"
        >
          <HiOutlineArrowPath className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && !loading && (
        <div className="mx-2.5 mt-1.5 flex-shrink-0 border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10.5px] font-semibold text-red-700">{error}</div>
      )}

      <div className="grid flex-1 grid-cols-2 gap-1.5 p-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {loading && !data ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse border border-[#C6C6C6] bg-[#F0F0F0]" />
          ))
        ) : (
          <>
            <KpiCard
              title="Total Production" icon={HiOutlineTrendingUp} tone="green"
              value={(data?.totalActual ?? 0).toLocaleString()}
              subtitle={`Efficiency: ${data?.efficiency ?? 0}%`}
              progress={data?.efficiency}
            />
            <KpiCard
              title="Total Target" icon={HiOutlineFlag} tone="blue"
              value={(data?.totalTarget ?? 0).toLocaleString()}
              subtitle={`A: ${(data?.shiftBreakdown?.A?.target ?? 0).toLocaleString()} · B: ${(data?.shiftBreakdown?.B?.target ?? 0).toLocaleString()}`}
            />
            <KpiCard
              title="Total Rejection" icon={HiOutlineExclamationCircle} tone="red"
              value={(data?.totalReject ?? 0).toLocaleString()}
              subtitle={`Rate: ${data?.rejectionRate ?? 0}%`}
            />
            <KpiCard
              title="Running Machines" icon={HiOutlineCog} tone="amber"
              value={`${data?.machinesRunning ?? 0}/${data?.machinesTotal ?? 0}`}
              subtitle={`${data?.machinesIdle ?? 0} idle · Shift ${data?.currentShift ?? "-"}`}
            />
            <KpiCard
              title="Loss Time" icon={HiOutlineClock} tone="red"
              value={`${data?.totalLossMinutes ?? 0} min`}
              subtitle={`${data?.totalEntries ?? 0} entries today`}
            />
          </>
        )}
      </div>
    </section>
  );
}

// ============================================================
// QUICK ACCESS
// ============================================================
function QuickAccessSection() {
  const navigate = useNavigate();
  return (
    <section className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex-shrink-0 border-b border-[#C6C6C6] px-2.5 py-1.5">
        <h2 className="text-[12.5px] font-extrabold leading-tight text-[#0F1D24]">Quick Access</h2>
        <p className="text-[10px] font-medium text-[#9B9B9B]">Select a module to continue your work</p>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-px bg-[#C6C6C6] p-px sm:grid-cols-4 lg:grid-cols-7">
        {QUICK_ACCESS_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="group flex flex-col items-center justify-center gap-1.5 border border-[#C6C6C6] bg-white px-2 py-2 transition-colors duration-100 hover:bg-[#0F1D24]"
            >
              <div className="flex h-7 w-7 items-center justify-center border border-[#C6C6C6]" style={{ color: item.color }}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-center text-[10.5px] font-bold leading-tight text-[#0F1D24] group-hover:text-white">{item.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================
// PRODUCTION TREND — flat SVG line chart
// ============================================================
function ProductionTrendChart() {
  const { halls } = useHallList();
  const [hallFilter, setHallFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const { points, loading, error } = useProductionTrend({ date: TODAY_KEY(), hall: hallFilter });

  useEffect(() => {
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const width = 560, height = 200, pad = { top: 12, right: 12, bottom: 22, left: 34 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const maxVal = Math.max(...points.map((p) => Math.max(p.target || 0, p.actual || 0)), 1);
  const niceMax = Math.ceil(maxVal / 250) * 250 || 250;

  const xFor = (i) => pad.left + (points.length > 1 ? (chartW * i) / (points.length - 1) : 0);
  const yFor = (v) => pad.top + chartH - (v / niceMax) * chartH;

  const linePath = (key) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p[key] || 0)}`).join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath("target")} L ${xFor(points.length - 1)} ${pad.top + chartH} L ${xFor(0)} ${pad.top + chartH} Z`
      : "";

  const yTicks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax];

  return (
    <div className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6] px-2.5 py-1.5">
        <h3 className="text-[11.5px] font-bold text-[#0F1D24]">Production Trend (Today)</h3>
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="flex h-6 items-center gap-1 border border-[#C6C6C6] bg-white px-1.5 text-[10px] font-semibold text-[#0F1D24] hover:border-[#0F1D24]"
          >
            {hallFilter === "All" ? "All Halls" : hallFilter}
            <HiOutlineChevronDown className={`h-2.5 w-2.5 text-[#9B9B9B] transition-transform ${filterOpen ? "rotate-180" : ""}`} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-32 border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
              {["All", ...halls].map((h) => (
                <button
                  key={h}
                  onClick={() => { setHallFilter(h); setFilterOpen(false); }}
                  className={`block w-full border-b border-[#C6C6C6] px-2 py-1 text-left text-[10px] font-medium last:border-b-0 ${
                    h === hallFilter ? "bg-[#0F1D24] text-[#FDC94D]" : "text-[#0F1D24] hover:bg-[#FDC94D]/20"
                  }`}
                >
                  {h === "All" ? "All Halls" : h}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#C6C6C6] px-2.5 py-1">
        <div className="flex items-center gap-1">
          <span className="h-0 w-2.5 border-t-2 border-dashed border-blue-500" />
          <span className="text-[9.5px] font-semibold text-[#9B9B9B]">Target</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-0.5 w-2.5 bg-emerald-600" />
          <span className="text-[9.5px] font-semibold text-[#9B9B9B]">Actual</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-1.5">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[10.5px] text-[#9B9B9B]">Loading trend...</div>
        ) : error || points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[10.5px] text-[#9B9B9B]">
            {error || "No trend data available."}
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line x1={pad.left} x2={width - pad.right} y1={yFor(tick)} y2={yFor(tick)} stroke="#F0F0F0" strokeWidth={1} />
                <text x={pad.left - 6} y={yFor(tick) + 3} textAnchor="end" fontSize="8.5" fill="#9B9B9B" fontFamily="ui-monospace, monospace">
                  {Math.round(tick).toLocaleString()}
                </text>
              </g>
            ))}
            <path d={areaPath} fill="#2563EB" opacity="0.06" />
            <path d={linePath("target")} fill="none" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 3" />
            <path d={linePath("actual")} fill="none" stroke="#16A34A" strokeWidth={2} />
            {points.map((p, i) => (
              <text key={i} x={xFor(i)} y={height - 4} textAnchor="middle" fontSize="8" fill="#9B9B9B">
                {p.hour}
              </text>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MACHINE STATUS — flat SVG donut
// ============================================================
function MachineStatusPanel() {
  const { status, loading, error } = useMachineStatus();

  const total = status?.total ?? 0;
  const segments = [
    { key: "running", label: "Running", value: status?.running ?? 0, color: "#16A34A" },
    { key: "idle", label: "Idle", value: status?.idle ?? 0, color: "#2563EB" },
    { key: "down", label: "Down", value: status?.down ?? 0, color: "#DC2626" },
    { key: "maintenance", label: "Maintenance", value: status?.maintenance ?? 0, color: "#F59E0B" },
  ];

  const r = 40, c = 2 * Math.PI * r;
  let offsetAcc = 0;

  return (
    <div className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex-shrink-0 border-b border-[#C6C6C6] px-2.5 py-1.5">
        <h3 className="text-[11.5px] font-bold text-[#0F1D24]">Machine Status</h3>
      </div>

      <div className="flex flex-1 items-center gap-3 p-2.5">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center text-[10.5px] text-[#9B9B9B]">Loading...</div>
        ) : error || !status ? (
          <div className="flex h-full w-full items-center justify-center text-[10.5px] text-[#9B9B9B]">{error || "No machine status data."}</div>
        ) : (
          <>
            <div className="relative h-[92px] w-[92px] flex-shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#F0F0F0" strokeWidth="10" />
                {segments.map((seg) => {
                  const frac = total > 0 ? seg.value / total : 0;
                  const dash = frac * c;
                  const el = (
                    <circle
                      key={seg.key}
                      cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="10"
                      strokeDasharray={`${dash} ${c - dash}`}
                      strokeDashoffset={-offsetAcc}
                    />
                  );
                  offsetAcc += dash;
                  return el;
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
                <span className="text-[9px] font-semibold text-[#9B9B9B]">Total</span>
                <span className="font-mono text-[18px] font-extrabold text-[#0F1D24]">{total}</span>
                <span className="text-[8px] font-semibold text-[#9B9B9B]">Machines</span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              {segments.map((seg) => (
                <div key={seg.key} className="flex items-center justify-between gap-2 text-[10.5px]">
                  <span className="flex items-center gap-1.5 font-semibold text-[#0F1D24]">
                    <span className="h-2 w-2 flex-shrink-0" style={{ background: seg.color }} />
                    {seg.label}
                  </span>
                  <span className="font-mono font-bold text-[#0F1D24]">
                    {seg.value} ({total > 0 ? Math.round((seg.value / total) * 1000) / 10 : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TODAY'S SUMMARY
// ============================================================
function TodaysSummaryPanel() {
  const { data, loading } = useDashboardOverview();
  const navigate = useNavigate();

  const rows = [
    { label: "Total Production", value: data?.totalActual ?? 0, icon: HiOutlineTrendingUp, tone: "text-emerald-600" },
    { label: "Total Target", value: data?.totalTarget ?? 0, icon: HiOutlineFlag, tone: "text-blue-600" },
    { label: "Total Rejection", value: data?.totalReject ?? 0, icon: HiOutlineExclamationCircle, tone: "text-red-600" },
    { label: "Loss Time", value: `${data?.totalLossMinutes ?? 0} min`, icon: HiOutlineClock, tone: "text-[#0F1D24]" },
  ];

  return (
    <div className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex-shrink-0 border-b border-[#C6C6C6] px-2.5 py-1.5">
        <h3 className="text-[11.5px] font-bold text-[#0F1D24]">Today's Summary</h3>
      </div>

      <div className="flex-1 divide-y divide-[#C6C6C6] overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[10.5px] text-[#9B9B9B]">Loading...</div>
        ) : (
          rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center justify-between gap-2 px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0F1D24]">
                  <Icon className={`h-3.5 w-3.5 ${row.tone}`} />
                  {row.label}
                </span>
                <span className="font-mono text-[11.5px] font-bold text-[#0F1D24]">{row.value}</span>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navigate("/employee/reports")}
        className="flex flex-shrink-0 items-center justify-center gap-1.5 border-t border-[#C6C6C6] bg-[#FAFAFA] py-1.5 text-[10.5px] font-bold text-blue-700 transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
      >
        View Full Report
        <HiOutlineArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

// ============================================================
// RECENT ACTIVITY
// ============================================================
const ACTIVITY_DOT = { production: "bg-emerald-500", plan: "bg-blue-500", loss: "bg-amber-500", reject: "bg-red-500" };

function RecentActivityPanel() {
  const { activity, loading } = useRecentActivity(6);
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex-shrink-0 border-b border-[#C6C6C6] px-2.5 py-1.5">
        <h3 className="text-[11.5px] font-bold text-[#0F1D24]">Recent Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[10.5px] text-[#9B9B9B]">Loading activity...</div>
        ) : activity.length === 0 ? (
          <div className="flex h-full items-center justify-center px-2.5 text-center text-[10.5px] text-[#9B9B9B]">
            No recent activity to show.
          </div>
        ) : (
          <ul className="divide-y divide-[#C6C6C6]">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start gap-2 px-2.5 py-2">
                <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${ACTIVITY_DOT[item.type] || "bg-[#9B9B9B]"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-semibold text-[#0F1D24]">{item.title}</p>
                  <p className="text-[9.5px] text-[#9B9B9B]">{item.meta}</p>
                </div>
                <span className="flex-shrink-0 whitespace-nowrap text-[9px] font-semibold text-[#9B9B9B]">{item.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => navigate("/employee/production/history")}
        className="flex flex-shrink-0 items-center justify-center gap-1.5 border-t border-[#C6C6C6] bg-[#FAFAFA] py-1.5 text-[10.5px] font-bold text-blue-700 transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
      >
        View All Activity
        <HiOutlineArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

// ============================================================
// ALERTS & NOTIFICATIONS
// ============================================================
const ALERT_STYLE = {
  critical: { icon: HiOutlineExclamationTriangle, bg: "bg-red-50", border: "border-red-200", text: "text-red-700", iconColor: "text-red-600" },
  warning: { icon: HiOutlineExclamationTriangle, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconColor: "text-amber-600" },
  info: { icon: HiOutlineInformationCircle, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconColor: "text-blue-600" },
};

function AlertsPanel() {
  const { alerts, loading } = useAlerts(3);
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex-shrink-0 border-b border-[#C6C6C6] px-2.5 py-1.5">
        <h3 className="text-[11.5px] font-bold text-[#0F1D24]">Alerts &amp; Notifications</h3>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-1.5">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[10.5px] text-[#9B9B9B]">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="flex h-full items-center justify-center px-2.5 text-center text-[10.5px] text-[#9B9B9B]">
            No active alerts.
          </div>
        ) : (
          alerts.map((a) => {
            const s = ALERT_STYLE[a.severity] || ALERT_STYLE.info;
            const Icon = s.icon;
            return (
              <div key={a.id} className={`flex items-start gap-2 border ${s.border} ${s.bg} px-2 py-1.5`}>
                <Icon className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${s.iconColor}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-[10.5px] font-bold ${s.text}`}>{a.title}</p>
                  <p className="text-[9.5px] text-[#0F1D24]/70">{a.detail}</p>
                </div>
                <span className="flex-shrink-0 whitespace-nowrap text-[9px] font-semibold text-[#9B9B9B]">{a.time}</span>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navigate("/employee/alerts")}
        className="flex flex-shrink-0 items-center justify-center gap-1.5 border-t border-[#C6C6C6] bg-[#FAFAFA] py-1.5 text-[10.5px] font-bold text-blue-700 transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
      >
        View All Alerts
        <HiOutlineArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}


const UserHome = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5">
        <div className="flex-shrink-0" style={{ flexBasis: "26%" }}>
          <OverviewRow />
        </div>

        <div className="flex-shrink-0" style={{ flexBasis: "16%" }}>
          <QuickAccessSection />
        </div>
      </main>
    </div>
  );
};

export default UserHome;