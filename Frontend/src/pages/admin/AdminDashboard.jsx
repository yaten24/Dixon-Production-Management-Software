import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineUsers,
  HiOutlineWrenchScrewdriver,
  HiOutlineCog6Tooth,
  HiOutlineSquares2X2,
  HiOutlineArrowDownTray,
  HiOutlineUserPlus,
  HiOutlineBuildingOffice2,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import Sidebar from "./Sidebar";
import useAdminDashboard from "../../hooks/useAdminDashboard";

// ============================================================
// THEME TOKENS — kept consistent with Sidebar.jsx / other pages
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";

/* ---------------------------------------------------------
   QUICK STAT — compact stat tile, flat border + left accent
--------------------------------------------------------- */
const QuickStat = ({ label, value, icon: Icon, accent = NAVY }) => (
  <div
    className="flex flex-1 items-center gap-2.5 border border-[#C6C6C6] bg-white px-3 py-2"
    style={{ borderLeft: `3px solid ${accent}` }}
  >
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#C6C6C6]" style={{ color: accent }}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="truncate text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
      <p className="font-mono text-[18px] font-extrabold leading-none text-[#0F1D24]">{value}</p>
    </div>
  </div>
);

/* ---------------------------------------------------------
   RESOURCE PANEL — flat bordered card, header + divider rows
   Rows list scrolls internally if it ever grows too tall —
   the page itself never scrolls.
--------------------------------------------------------- */
const ResourcePanel = ({ icon: Icon, title, total, accent, rows }) => (
  <div className="flex min-h-0 flex-1 flex-col border border-[#C6C6C6] bg-white">
    <div className="flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#C6C6C6]" style={{ color: accent }}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">{title}</p>
      </div>
      <p className="font-mono text-[13px] font-extrabold text-[#0F1D24]">{total}</p>
    </div>

    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {rows.length === 0 ? (
        <div className="px-3 py-2.5 text-center text-[10.5px] font-medium text-[#9B9B9B]">No data</div>
      ) : (
        rows.map((r, i) => (
          <div
            key={r.label ?? i}
            className={`flex flex-shrink-0 items-center justify-between px-3 py-1.5 ${i !== rows.length - 1 ? "border-b border-[#C6C6C6]/60" : ""}`}
          >
            <span className="text-[10.5px] font-medium text-[#0F1D24]/75">{r.label ?? "—"}</span>
            <span className="font-mono text-[10.5px] font-bold text-[#0F1D24]">{r.count}</span>
          </div>
        ))
      )}
    </div>
  </div>
);

/* ---------------------------------------------------------
   Format an ISO / MySQL datetime string into hh:mm AM/PM
--------------------------------------------------------- */
const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

/* ==========================================================
   PAGE — desktop-app layout: persistent sidebar + control-box
   header + quick-stat strip + flat resource panels.
   Whole page fits the viewport height, no page-level scroll —
   only individual content boxes scroll internally if needed.
========================================================== */
export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());

  const { data, loading, error, refetch } = useAdminDashboard();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedDate = useMemo(
    () => now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }),
    [now]
  );
  const formattedTime = useMemo(() => now.toLocaleTimeString("en-IN", { hour12: true }), [now]);

  const totalUsers = data.users.total;
  const totalMachines = data.machines.total;
  const totalParts = data.parts.total;
  const totalOperators = data.operators.total;

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-3 pb-2 pt-2">
          {/* control box header */}
          <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
            <div className="min-w-0 leading-tight">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#9B9B9B]">Administration</p>
              <h1 className="truncate text-[15px] font-extrabold tracking-tight text-[#0F1D24]">Admin Dashboard</h1>
            </div>

            <div className="flex flex-shrink-0 items-stretch gap-1.5">
              <div className="flex items-center gap-1.5 border border-[#C6C6C6] px-2.5 text-[10.5px] font-semibold text-[#0F1D24]">
                <span className="font-mono tabular-nums">{formattedDate}</span>
                <span className="h-3 w-px bg-[#C6C6C6]" />
                <span className="font-mono tabular-nums">{formattedTime}</span>
              </div>
              <button
                onClick={refetch}
                disabled={loading}
                title="Refresh"
                className="flex items-center justify-center border border-[#C6C6C6] px-2 text-[#0F1D24] hover:bg-[#F5F5F5] disabled:opacity-50"
              >
                <HiOutlineArrowPath className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* error banner */}
          {error && (
            <div className="flex flex-shrink-0 items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
              <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="min-w-0 flex-1">{error}</span>
              <button onClick={refetch} className="flex-shrink-0 underline">
                Retry
              </button>
            </div>
          )}

          {/* quick stats */}
          <div className="flex flex-shrink-0 flex-wrap gap-1.5">
            <QuickStat label="Total Users" value={loading ? "—" : totalUsers} icon={HiOutlineUsers} accent="#2563EB" />
            <QuickStat label="Total Machines" value={loading ? "—" : totalMachines} icon={HiOutlineBuildingOffice2} accent="#16A34A" />
            <QuickStat label="Total Parts" value={loading ? "—" : totalParts} icon={HiOutlineWrenchScrewdriver} accent="#EA580C" />
            <QuickStat label="Total Operators" value={loading ? "—" : totalOperators} icon={HiOutlineCog6Tooth} accent="#9333EA" />
          </div>

          {/* remaining space split between resource panels + recent additions */}
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            {/* resource breakdown panels */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
              <ResourcePanel icon={HiOutlineUsers} title="Users" total={totalUsers} accent="#2563EB" rows={data.users.byRole} />
              <ResourcePanel icon={HiOutlineBuildingOffice2} title="Machines" total={totalMachines} accent="#16A34A" rows={data.machines.byHall} />
              <ResourcePanel icon={HiOutlineWrenchScrewdriver} title="Parts" total={totalParts} accent="#EA580C" rows={data.parts.byCategory} />
              <ResourcePanel icon={HiOutlineCog6Tooth} title="Operators" total={totalOperators} accent="#9333EA" rows={data.operators.byShift} />
            </div>

            {/* recent additions — flat list, own internal scroll */}
            <div className="flex min-h-0 flex-[0.9] flex-col border border-[#C6C6C6] bg-white">
              <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-[#C6C6C6] px-3 py-2">
                <HiOutlineUserPlus className="h-3.5 w-3.5 text-[#9B9B9B]" />
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">Recent Additions</p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {loading ? (
                  <div className="px-3 py-3 text-center text-[10.5px] font-medium text-[#9B9B9B]">Loading…</div>
                ) : data.recentAdditions.length === 0 ? (
                  <div className="px-3 py-3 text-center text-[10.5px] font-medium text-[#9B9B9B]">No recent activity</div>
                ) : (
                  data.recentAdditions.map((a, i) => (
                    <div
                      key={i}
                      className={`flex flex-shrink-0 items-center gap-2.5 px-3 py-2 ${i !== data.recentAdditions.length - 1 ? "border-b border-[#C6C6C6]/60" : ""}`}
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0" style={{ background: GOLD }} />
                      <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#0F1D24]/80">{a.text}</p>
                      <span className="flex-shrink-0 font-mono text-[9.5px] font-semibold text-[#9B9B9B]">
                        {formatTime(a.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}