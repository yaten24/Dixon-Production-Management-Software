import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaIndustry,
  FaChartBar,
  FaClock,
  FaExchangeAlt,
  FaCalendarAlt,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import {
  MdOutlineProductionQuantityLimits,
  MdOutlineReportProblem,
} from "react-icons/md";

import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi2";

import { useAuth } from "../../context/AuthContext";
import dixonLogo from "../../../public/Dixon_Technologies_Logo.png";

/* ==========================================================
                        THEME
   Brand palette (client's color reference):
     highlight #0F1D24  (deep navy)   — icons, titles, active states
     gray      #9B9B9B                — secondary text
     accent    #FDC94D  (warm gold)   — sparing highlight
     darken    #C6C6C6                — borders, dividers, neutral surfaces
========================================================== */

const THEME = {
  highlight: "#0F1D24",
  gray: "#9B9B9B",
  accent: "#FDC94D",
  darken: "#C6C6C6",
};

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');
`;

const EXPANDED_WIDTH = 172;
const COLLAPSED_WIDTH = 52;

const menuSections = [
  {
    label: "Overview",
    items: [
      { id: 1, title: "Dashboard", path: "/production/overall/dashboard", icon: <FaTachometerAlt size={13} /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: 2, title: "Production", path: "/production/dashboard", icon: <MdOutlineProductionQuantityLimits size={13} /> },
      { id: 3, title: "Rejection", path: "/production/rejection", icon: <MdOutlineReportProblem size={13} /> },
      { id: 4, title: "Loss Time", path: "/production/loss-time", icon: <FaClock size={13} /> },
      { id: 5, title: "Mould Change", path: "/production/mould-change", icon: <FaExchangeAlt size={13} /> },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: 9, title: "Reports", path: "/production/reports", icon: <FaChartBar size={13} /> },
    ],
  },
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

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  /* ---------------- LIVE CLOCK ---------------- */
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(
    () => currentTime.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    [currentTime],
  );
  const formattedTime = useMemo(
    () => currentTime.toLocaleTimeString("en-IN", { hour12: true }),
    [currentTime],
  );

  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: `0 0 auto`,
        height: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
      className="sticky top-0 hidden flex-shrink-0 flex-col overflow-hidden border-r border-[#C6C6C6]/50 bg-white shadow-sm lg:flex"
    >
      <style>{FONT_IMPORT}</style>

      {/* TOP GRADIENT LINE */}
      <div
        style={{
          background: `linear-gradient(90deg, ${THEME.highlight} 0%, ${THEME.darken} 45%, ${THEME.accent} 100%)`,
        }}
        className="h-[2px] w-full flex-shrink-0"
      />

      {/* LOGO */}
      <div className="flex flex-shrink-0 items-center justify-center border-b border-[#C6C6C6]/50 px-2 py-1.5">
        {collapsed ? (
          <div className="flex h-7 w-7 items-center justify-center bg-[#0F1D24]">
            <span className="font-mono text-[9px] font-extrabold text-[#FDC94D]">DT</span>
          </div>
        ) : (
          <img src={dixonLogo} alt="Dixon" className="h-7 w-auto object-contain" />
        )}
      </div>

      {/* DATE & TIME */}
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

      {/* MENU SECTIONS */}
      <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-1.5 py-2">
        {menuSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-1 px-1.5 text-[8.5px] font-semibold uppercase tracking-[1.5px] text-[#9B9B9B]">
                {section.label}
              </p>
            )}

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-0.5">
              {section.items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <NavLink
                    to={item.path}
                    end
                    title={collapsed ? item.title : undefined}
                    className={({ isActive }) =>
                      `block relative overflow-hidden rounded transition-colors duration-150 ${
                        isActive ? "bg-[#0F1D24]/[0.06]" : "hover:bg-[#F5F5F5]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div
                        className={`relative flex cursor-pointer select-none items-center gap-2 px-2 py-1.5 ${
                          collapsed ? "justify-center px-0" : ""
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebarIndicator"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="absolute left-0 top-0 h-full w-[2px] rounded"
                            style={{ background: THEME.accent }}
                          />
                        )}

                        <span
                          className={`relative z-10 flex min-w-[14px] items-center justify-center transition-colors duration-150 ${
                            isActive ? "text-[#0F1D24]" : "text-[#9B9B9B]"
                          }`}
                        >
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <span
                            className={`relative z-10 flex-1 truncate text-[11px] font-medium tracking-wide transition-colors duration-150 ${
                              isActive ? "text-[#0F1D24]" : "text-[#0F1D24]/70"
                            }`}
                          >
                            {item.title}
                          </span>
                        )}

                        {isActive && !collapsed && (
                          <span className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: THEME.accent }} />
                        )}
                      </div>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>

      {/* USER PROFILE + LOGOUT */}
      <div className="flex-shrink-0 space-y-1 border-t border-[#C6C6C6]/50 px-1.5 py-1.5">
        <div
          className={`flex items-center gap-2 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-2 py-1 ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title={collapsed ? user?.name || "Account" : undefined}
        >
          {initials ? (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F1D24] text-[9px] font-bold text-[#FDC94D]">
              {initials}
            </span>
          ) : (
            <FaUserCircle className="shrink-0 text-lg text-[#9B9B9B]" />
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold leading-none text-[#0F1D24]">
                {user?.name || "—"}
              </p>
              <p className="mt-0.5 truncate text-[8.5px] font-semibold leading-none text-[#FDC94D]">
                {user?.role || ""}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex h-7 w-full items-center justify-center gap-1.5 rounded border border-red-200 bg-red-50 text-[10px] font-semibold text-red-600 transition-colors hover:bg-red-500 hover:text-white ${
            collapsed ? "px-0" : ""
          }`}
        >
          <FaSignOutAlt size={10} />
          {!collapsed && "Logout"}
        </button>
      </div>

      {/* FOOTER */}
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

      {/* HIDE / COLLAPSE TOGGLE */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
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
};

export default Sidebar;