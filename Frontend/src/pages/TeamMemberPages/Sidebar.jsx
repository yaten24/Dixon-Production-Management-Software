import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const EXPANDED_WIDTH = 172;
const COLLAPSED_WIDTH = 52;

// ============================================================
// STATIC NAV DATA — export QUICK_ACCESS_ITEMS too, so pages that render
// a "Quick Access" grid (like the dashboard) can reuse the same list
// and stay in sync with the sidebar automatically.
// ============================================================
export const QUICK_ACCESS_ITEMS = [
  { id: "hall-dashboard", title: "Hall Dashboard", icon: HiOfficeBuilding, color: "#2563EB", path: "/production/dashboard" },
  { id: "daily-plan", title: "Daily Plan", icon: HiCalendar, color: "#2563EB", path: "/production/plans/daily" },
  { id: "monthly-plan", title: "Monthly Plan", icon: HiCalendar, color: "#2563EB", path: "/production/plans/monthly" },
  { id: "machine-allocation", title: "Machine Allocation", icon: HiUserGroup, color: "#9333EA", path: "/production/plans/daily/operator/allocation" },
  { id: "production-entry", title: "Production Entry", icon: HiDocumentAdd, color: "#16A34A", path: "/production/entry" },
  { id: "production-history", title: "Production History", icon: HiClipboardList, color: "#EA580C", path: "/production/history" },
  { id: "reports", title: "Reports", icon: HiDocumentReport, color: "#16A34A", path: "/production/reports" },
];

const NAV_ITEMS = [
  { id: "dashboard", title: "Dashboard", icon: HiOutlineSquares2X2, color: NAVY, path: "/production/home" },
  ...QUICK_ACCESS_ITEMS,
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025, delayChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10, filter: "blur(2px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
};

// ============================================================
// SIDEBAR
// ============================================================
export default function Sidebar({ collapsed, onToggleCollapse, activePath }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedDate = useMemo(
    () => now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
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
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ flex: "0 0 auto", fontFamily: "'Inter', sans-serif" }}
      className="flex h-full flex-shrink-0 flex-col overflow-hidden border-r border-[#C6C6C6]/50 bg-white shadow-sm"
    >
      {/* TOP GRADIENT LINE */}
      <div
        className="h-[2px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${BORDER} 45%, ${GOLD} 100%)` }}
      />

      {/* brand block */}
      <div className="flex flex-shrink-0 items-center justify-center gap-2 border-b border-[#C6C6C6]/50 px-2 py-1.5">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center bg-[#0F1D24]">
          <span className="font-mono text-[9px] font-extrabold text-[#FDC94D]">DT</span>
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-none">
            <p className="truncate text-[11px] font-bold tracking-tight text-[#0F1D24]">PMS-Dehradun</p>
            <p className="truncate text-[8px] font-medium text-[#9B9B9B]">Production Management System</p>
          </div>
        )}
      </div>

      {/* live date / time */}
      {!collapsed ? (
        <div className="flex flex-shrink-0 items-center justify-center gap-1.5 border-b border-[#C6C6C6]/50 bg-[#FAFAFA] px-2 py-1">
          <FaCalendarAlt className="text-[9px] text-[#FDC94D]" />
          <span className="text-[9px] font-medium text-[#0F1D24]">{formattedDate}</span>
          <span className="h-2.5 w-px bg-[#C6C6C6]" />
          <FaClock className="text-[9px] text-[#FDC94D]" />
          <AnimatePresence mode="wait">
            <motion.span
              key={formattedTime}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.12 }}
              className="font-mono text-[9px] font-semibold tabular-nums text-[#0F1D24]"
            >
              {formattedTime}
            </motion.span>
          </AnimatePresence>
        </div>
      ) : (
        <div
          className="flex flex-shrink-0 items-center justify-center border-b border-[#C6C6C6]/50 bg-[#FAFAFA] py-1"
          title={`${formattedDate} · ${formattedTime}`}
        >
          <FaClock className="text-[10px] text-[#FDC94D]" />
        </div>
      )}

      {/* nav list */}
      <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-1.5 py-2">
        {!collapsed && (
          <p className="mb-1 px-1.5 text-[8.5px] font-semibold uppercase tracking-[1.5px] text-[#9B9B9B]">Navigation</p>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div key={item.id} variants={itemVariants}>
                <button
                  type="button"
                  title={collapsed ? item.title : undefined}
                  onClick={() => navigate(item.path)}
                  className={`block relative w-full overflow-hidden rounded transition-colors duration-150 ${
                    active ? "bg-[#0F1D24]/[0.06]" : "hover:bg-[#F5F5F5]"
                  }`}
                >
                  <div
                    className={`relative flex cursor-pointer select-none items-center gap-2 px-2 py-1.5 ${
                      collapsed ? "justify-center px-0" : ""
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="employeeSidebarIndicator"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute left-0 top-0 h-full w-[2px] rounded"
                        style={{ background: GOLD }}
                      />
                    )}

                    <span
                      className="relative z-10 flex min-w-[14px] items-center justify-center transition-colors duration-150"
                      style={{ color: item.color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>

                    {!collapsed && (
                      <span
                        className={`relative z-10 flex-1 truncate text-left text-[11px] font-medium tracking-wide transition-colors duration-150 ${
                          active ? "text-[#0F1D24]" : "text-[#0F1D24]/70"
                        }`}
                      >
                        {item.title}
                      </span>
                    )}

                    {active && !collapsed && (
                      <span className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* user account panel */}
      <div ref={profileRef} className="relative flex-shrink-0 border-t border-[#C6C6C6]/50 px-1.5 py-1.5">
        {profileOpen && (
          <div
            className={`absolute bottom-full z-30 mb-1.5 w-44 rounded border border-[#C6C6C6]/60 bg-white shadow-[0_-4px_10px_rgba(15,29,36,0.12)] ${
              collapsed ? "left-full ml-1.5" : "left-1.5"
            }`}
          >
            <div className="rounded-t border-b border-[#C6C6C6]/60 bg-[#FAFAFA] px-2.5 py-1.5">
              <p className="text-[10px] font-bold leading-none text-[#0F1D24]">{user?.name || "—"}</p>
              <p className="mt-0.5 text-[8.5px] leading-none text-[#9B9B9B]">{user?.employee_id || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-1.5 rounded-b px-2.5 py-1.5 text-[10px] font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50"
            >
              <FaSignOutAlt size={9} />
              Sign out
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          title={collapsed ? user?.name || "Account" : undefined}
          className={`flex w-full items-center gap-2 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-2 py-1 text-left transition-colors duration-150 hover:bg-[#F0F0F0] ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F1D24] text-[9px] font-bold text-[#FDC94D]">
            {initials || <FaUserCircle className="text-sm" />}
          </span>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 leading-none">
                <p className="truncate text-[10px] font-bold leading-none text-[#0F1D24]">{user?.name || "—"}</p>
                <p className="mt-0.5 truncate text-[8.5px] font-semibold leading-none text-[#FDC94D]">{user?.role || ""}</p>
              </div>
              <HiOutlineChevronDown className={`h-3 w-3 flex-shrink-0 text-[#9B9B9B] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>
      </div>

      {/* footer */}
      {!collapsed && (
        <div className="flex-shrink-0 border-t border-[#C6C6C6]/50 bg-white px-2.5 py-1.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold leading-none text-[#0F1D24]">PMS-Dehradun</p>
              <p className="mt-0.5 font-mono text-[8px] leading-none text-[#9B9B9B]">v1.0.0</p>
            </div>
            <span className="flex items-center gap-1 rounded-sm border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[7px] font-semibold tracking-widest text-emerald-600">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
              LIVE
            </span>
          </div>
        </div>
      )}

      {/* collapse toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex h-7 flex-shrink-0 items-center justify-center gap-1.5 border-t border-[#C6C6C6]/50 bg-[#FAFAFA] text-[9px] font-bold text-[#0F1D24] transition-colors duration-150 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
      >
        {collapsed ? (
          <HiOutlineChevronDoubleRight className="h-3.5 w-3.5" />
        ) : (
          <>
            <HiOutlineChevronDoubleLeft className="h-3.5 w-3.5" />
            Hide
          </>
        )}
      </button>
    </motion.aside>
  );
}