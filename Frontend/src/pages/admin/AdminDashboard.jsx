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
} from "react-icons/hi2";
import Sidebar from "./Sidebar";

// ============================================================
// THEME TOKENS — kept consistent with Sidebar.jsx / other pages
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";

/* ==========================================================
   MOCK DATA — admin resource counts only, no production data
========================================================== */
const USERS_BY_ROLE = [
  { label: "Admin", count: 4 },
  { label: "Supervisor", count: 12 },
  { label: "Employee", count: 96 },
];

const MACHINES_BY_HALL = [
  { label: "Hall 1", count: 18 },
  { label: "Hall 2", count: 22 },
  { label: "Hall 3", count: 16 },
  { label: "Hall 4", count: 20 },
  { label: "C-8", count: 12 },
];

const PARTS_BY_CATEGORY = [
  { label: "Cabinet Components", count: 64 },
  { label: "Bezel & Frame", count: 38 },
  { label: "Internal Fittings", count: 51 },
  { label: "Miscellaneous", count: 27 },
];

const OPERATORS_BY_SHIFT = [
  { label: "Shift A", count: 58 },
  { label: "Shift B", count: 52 },
];

const RECENT_ADDITIONS = [
  { time: "10:42 AM", text: "New operator added — K. Bisht (Hall 1)" },
  { time: "09:55 AM", text: "Machine M-041 registered under Hall 4" },
  { time: "09:20 AM", text: 'Part "Speaker Grill v2" added to catalog' },
  { time: "08:47 AM", text: "New supervisor account created for Hall 3" },
  { time: "08:10 AM", text: "Operator transferred: P. Negi → C-8" },
];

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
--------------------------------------------------------- */
const ResourcePanel = ({ icon: Icon, title, total, accent, rows }) => (
  <div className="flex flex-col border border-[#C6C6C6] bg-white">
    <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#C6C6C6]" style={{ color: accent }}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">{title}</p>
      </div>
      <p className="font-mono text-[13px] font-extrabold text-[#0F1D24]">{total}</p>
    </div>

    <div className="flex flex-col">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={`flex items-center justify-between px-3 py-1.5 ${i !== rows.length - 1 ? "border-b border-[#C6C6C6]/60" : ""}`}
        >
          <span className="text-[10.5px] font-medium text-[#0F1D24]/75">{r.label}</span>
          <span className="font-mono text-[10.5px] font-bold text-[#0F1D24]">{r.count}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ==========================================================
   PAGE — desktop-app layout: persistent sidebar + control-box
   header + quick-stat strip + flat resource panels
========================================================== */
export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedDate = useMemo(
    () => now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }),
    [now]
  );
  const formattedTime = useMemo(() => now.toLocaleTimeString("en-IN", { hour12: true }), [now]);

  const totalUsers = USERS_BY_ROLE.reduce((s, r) => s + r.count, 0);
  const totalMachines = MACHINES_BY_HALL.reduce((s, h) => s + h.count, 0);
  const totalParts = PARTS_BY_CATEGORY.reduce((s, p) => s + p.count, 0);
  const totalOperators = OPERATORS_BY_SHIFT.reduce((s, o) => s + o.count, 0);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pb-3">
          {/* control box header */}
          <div className="mx-3 mt-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
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
            </div>
          </div>

          {/* quick stats */}
          <div className="mx-3 flex flex-shrink-0 flex-wrap gap-1.5">
            <QuickStat label="Total Users" value={totalUsers} icon={HiOutlineUsers} accent="#2563EB" />
            <QuickStat label="Total Machines" value={totalMachines} icon={HiOutlineBuildingOffice2} accent="#16A34A" />
            <QuickStat label="Total Parts" value={totalParts} icon={HiOutlineWrenchScrewdriver} accent="#EA580C" />
            <QuickStat label="Total Operators" value={totalOperators} icon={HiOutlineCog6Tooth} accent="#9333EA" />
          </div>

          {/* resource breakdown panels */}
          <div className="mx-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
            <ResourcePanel icon={HiOutlineUsers} title="Users" total={totalUsers} accent="#2563EB" rows={USERS_BY_ROLE} />
            <ResourcePanel icon={HiOutlineBuildingOffice2} title="Machines" total={totalMachines} accent="#16A34A" rows={MACHINES_BY_HALL} />
            <ResourcePanel icon={HiOutlineWrenchScrewdriver} title="Parts" total={totalParts} accent="#EA580C" rows={PARTS_BY_CATEGORY} />
            <ResourcePanel icon={HiOutlineCog6Tooth} title="Operators" total={totalOperators} accent="#9333EA" rows={OPERATORS_BY_SHIFT} />
          </div>

          {/* recent additions — flat list */}
          <div className="mx-3 flex flex-col border border-[#C6C6C6] bg-white">
            <div className="flex items-center gap-1.5 border-b border-[#C6C6C6] px-3 py-2">
              <HiOutlineUserPlus className="h-3.5 w-3.5 text-[#9B9B9B]" />
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">Recent Additions</p>
            </div>

            <div className="flex flex-col">
              {RECENT_ADDITIONS.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-3 py-2 ${i !== RECENT_ADDITIONS.length - 1 ? "border-b border-[#C6C6C6]/60" : ""}`}
                >
                  <span className="h-1.5 w-1.5 flex-shrink-0" style={{ background: GOLD }} />
                  <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#0F1D24]/80">{a.text}</p>
                  <span className="flex-shrink-0 font-mono text-[9.5px] font-semibold text-[#9B9B9B]">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}