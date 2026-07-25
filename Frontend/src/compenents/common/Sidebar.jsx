import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { HiOutlineChevronDown, HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight, HiOutlineSquares2X2 } from "react-icons/hi2";
import { HiOfficeBuilding, HiCalendar, HiUserGroup, HiDocumentAdd, HiClipboardList, HiDocumentReport } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

// ============================================================
// THEME TOKENS
// ============================================================
export const NAVY = "#0F1D24";
export const GOLD = "#FDC94D";
export const BORDER = "#C6C6C6";

// ============================================================
// STATIC NAV DATA — export QUICK_ACCESS_ITEMS too, so pages that render
// a "Quick Access" grid (like the dashboard) can reuse the same list
// and stay in sync with the sidebar automatically.
// ============================================================
export const QUICK_ACCESS_ITEMS = [
  { id: "hall-dashboard", title: "Hall Dashboard", icon: HiOfficeBuilding, color: "#2563EB", path: "/employee/dashboard" },
  { id: "daily-plan", title: "Daily Plan", icon: HiCalendar, color: "#2563EB", path: "/employee/production/plans/daily" },
  { id: "monthly-plan", title: "Monthly Plan", icon: HiCalendar, color: "#2563EB", path: "/employee/production/plans/monthly" },
  { id: "machine-allocation", title: "Machine Allocation", icon: HiUserGroup, color: "#9333EA", path: "/employee/machine-allocation" },
  { id: "production-entry", title: "Production Entry", icon: HiDocumentAdd, color: "#16A34A", path: "/employee/production/entry" },
  { id: "production-history", title: "Production History", icon: HiClipboardList, color: "#EA580C", path: "/employee/production/history" },
  { id: "reports", title: "Reports", icon: HiDocumentReport, color: "#16A34A", path: "/employee/reports" },
];

const NAV_ITEMS = [
  { id: "dashboard", title: "Dashboard", icon: HiOutlineSquares2X2, color: NAVY, path: "/employee/home" },
  ...QUICK_ACCESS_ITEMS,
];

// ============================================================
// SIDEBAR
// ============================================================
export default function Sidebar({ collapsed, onToggleCollapse, activePath }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const width = collapsed ? 56 : 220;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedDate = useMemo(
    () => now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    [now]
  );
  const formattedTime = useMemo(
    () => now.toLocaleTimeString("en-IN", { hour12: true }),
    [now]
  );

  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => activePath === path || activePath?.startsWith(`${path}/`);

  return (
    <aside
      className="flex h-full flex-shrink-0 flex-col overflow-hidden border-r border-[#C6C6C6] bg-white transition-[width] duration-150 ease-out"
      style={{ width }}
    >
      {/* accent strip */}
      <div
        className="h-[2px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${BORDER} 50%, ${GOLD} 100%)` }}
      />

      {/* brand block */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#C6C6C6] px-2.5 py-2.5">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#0F1D24] bg-[#0F1D24]">
          <span className="font-mono text-[9px] font-extrabold text-[#FDC94D]">DT</span>
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-none">
            <p className="truncate text-[13px] font-bold tracking-tight text-[#0F1D24]">PMS-Dehradun</p>
            <p className="truncate text-[8.5px] font-medium text-[#9B9B9B]">Production Management System</p>
          </div>
        )}
      </div>

      {/* live date / time */}
      {!collapsed ? (
        <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] bg-[#FAFAFA] px-2.5 py-1.5">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#0F1D24]">
            <FaCalendarAlt className="text-[9px] text-[#0F1D24]/70" />
            <span className="font-mono tabular-nums">{formattedDate}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#0F1D24]">
            <FaClock className="text-[9px] text-[#0F1D24]/70" />
            <span className="font-mono tabular-nums">{formattedTime}</span>
          </span>
        </div>
      ) : (
        <div
          className="flex flex-shrink-0 items-center justify-center border-b border-[#C6C6C6] bg-[#FAFAFA] py-1.5"
          title={`${formattedDate} · ${formattedTime}`}
        >
          <FaClock className="text-[10px] text-[#0F1D24]/70" />
        </div>
      )}

      {/* nav list */}
      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto py-1">
        {!collapsed && (
          <p className="px-2.5 pb-1 pt-1.5 text-[9px] font-bold uppercase tracking-wide text-[#9B9B9B]">Navigation</p>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              type="button"
              title={collapsed ? item.title : undefined}
              onClick={() => navigate(item.path)}
              className={`group flex items-center gap-2 border-l-[3px] px-2.5 py-1.5 text-left transition-colors duration-100 ${
                active
                  ? "border-l-[#0F1D24] bg-[#0F1D24]/[0.04]"
                  : "border-l-transparent hover:bg-[#FAFAFA]"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center border ${
                  active ? "border-[#0F1D24]" : "border-[#C6C6C6]"
                }`}
                style={{ color: item.color }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              {!collapsed && (
                <span className={`truncate text-[11px] font-bold ${active ? "text-[#0F1D24]" : "text-[#0F1D24]/80"}`}>
                  {item.title}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* user account panel */}
      <div ref={profileRef} className="relative flex-shrink-0 border-t border-[#C6C6C6]">
        {profileOpen && (
          <div
            className={`absolute bottom-full z-30 mb-0 w-48 border border-[#C6C6C6] bg-white shadow-[0_-4px_10px_rgba(15,29,36,0.12)] ${
              collapsed ? "left-full" : "left-0"
            }`}
          >
            <div className="border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 py-2">
              <p className="text-[11px] font-bold text-[#0F1D24]">{user?.name || "—"}</p>
              <p className="text-[9px] text-[#9B9B9B]">{user?.employee_id || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-semibold text-red-600 transition-colors duration-100 hover:bg-red-50"
            >
              <FaSignOutAlt size={10} />
              Sign out
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          title={collapsed ? user?.name || "Account" : undefined}
          className={`flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors duration-100 hover:bg-[#FAFAFA] ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center bg-[#0F1D24] text-[9px] font-bold text-[#FDC94D]">
            {initials || <FaUserCircle className="text-sm" />}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 leading-none">
                <p className="truncate text-[11px] font-bold text-[#0F1D24]">{user?.name || "—"}</p>
                <p className="truncate text-[9px] font-semibold text-[#9B9B9B]">{user?.role || ""}</p>
              </div>
              <HiOutlineChevronDown className={`h-3 w-3 flex-shrink-0 text-[#9B9B9B] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>
      </div>

      {/* collapse toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex h-8 flex-shrink-0 items-center justify-center gap-1.5 border-t border-[#C6C6C6] bg-[#FAFAFA] text-[10px] font-bold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
      >
        {collapsed ? <HiOutlineChevronDoubleRight className="h-3.5 w-3.5" /> : (
          <>
            <HiOutlineChevronDoubleLeft className="h-3.5 w-3.5" />
            Collapse
          </>
        )}
      </button>
    </aside>
  );
}