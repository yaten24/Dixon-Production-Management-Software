import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
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

import { LuUsers } from "react-icons/lu";
import { RiFileList3Line } from "react-icons/ri";
import { FaScrewdriverWrench } from "react-icons/fa6";

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

// Sidebar now owns the full viewport height (top to bottom) since the
// separate top Header has been folded into it — no more HEADER_HEIGHT
// offset needed anywhere.
const SIDEBAR_WIDTH = 176;

const menuSections = [
  {
    label: "Overview",
    items: [
      { id: 1, title: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt size={15} /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: 2, title: "Production", path: "/production", icon: <MdOutlineProductionQuantityLimits size={15} /> },
      { id: 3, title: "Rejection", path: "/rejection", icon: <MdOutlineReportProblem size={15} /> },
      { id: 4, title: "Loss Time", path: "/loss-time", icon: <FaClock size={15} /> },
      { id: 5, title: "Mould Change", path: "/mould-change", icon: <FaExchangeAlt size={15} /> },
    ],
  },
  {
    label: "Resources",
    items: [
      { id: 6, title: "Employees", path: "/employees", icon: <FaUsers size={15} /> },
      { id: 7, title: "Machines", path: "/machines", icon: <FaIndustry size={15} /> },
      { id: 8, title: "Users", path: "/users", icon: <LuUsers size={15} /> },
      { id: 13, title: "Parts", path: "/parts", icon: <FaScrewdriverWrench size={15} /> },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: 9, title: "Reports", path: "/reports", icon: <FaChartBar size={15} /> },
      { id: 10, title: "Logs", path: "/logs", icon: <RiFileList3Line size={15} /> },
    ],
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -14, filter: "blur(3px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /* ---------------- LIVE CLOCK (moved in from Header) ---------------- */
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
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: `0 0 ${SIDEBAR_WIDTH}px`,
        width: SIDEBAR_WIDTH,
        height: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
      className="sticky top-0 hidden flex-shrink-0 flex-col overflow-hidden border-r border-[#C6C6C6]/50 bg-white shadow-sm lg:flex"
    >
      <style>{FONT_IMPORT}</style>

      {/* ==========================================================
                          TOP GRADIENT LINE (from Header)
      ========================================================== */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformOrigin: "left",
          background: `linear-gradient(90deg, ${THEME.highlight} 0%, ${THEME.darken} 45%, ${THEME.accent} 100%)`,
        }}
        className="h-[2px] w-full flex-shrink-0"
      />

      {/* ==========================================================
                          LOGO
      ========================================================== */}
      <div className="flex flex-shrink-0 items-center justify-center border-b border-[#C6C6C6]/50 px-2 py-2.5">
        <img src={dixonLogo} alt="Dixon" className="h-10 w-auto object-contain" />
      </div>

      {/* ==========================================================
                          DATE & TIME
      ========================================================== */}
      <div className="flex-shrink-0 border-b border-[#C6C6C6]/50 px-2.5 py-2">
        <div className="flex items-center justify-center gap-1.5 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-2 py-1.5">
          <FaCalendarAlt className="text-[10px] text-[#FDC94D]" />
          <span className="text-[10px] font-medium text-[#0F1D24]">{formattedDate}</span>
          <span className="h-3 w-px bg-[#C6C6C6]" />
          <FaClock className="text-[10px] text-[#FDC94D]" />
          <AnimatePresence mode="wait">
            <motion.span
              key={formattedTime}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.15 }}
              className="font-mono text-[10px] font-semibold tabular-nums text-[#0F1D24]"
            >
              {formattedTime}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* ==========================================================
                          MENU SECTIONS
      ========================================================== */}
      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2 py-3">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-2 text-[9px] font-semibold uppercase tracking-[2px] text-[#9B9B9B]">
              {section.label}
            </p>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-0.5">
              {section.items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `block relative overflow-hidden rounded-md transition-colors duration-200 ${
                        isActive ? "bg-[#0F1D24]/[0.06]" : "hover:bg-[#F5F5F5]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <motion.div
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="relative flex cursor-pointer select-none items-center gap-2 px-2.5 py-1.5"
                      >
                        {/* Hover glow sweep */}
                        {!isActive && (
                          <motion.span
                            className="pointer-events-none absolute inset-0 rounded-md opacity-0"
                            style={{ background: "rgba(253,201,77,0.08)" }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}

                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebarIndicator"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="absolute left-0 top-0 h-full w-[2.5px] rounded"
                            style={{ background: THEME.accent }}
                          />
                        )}

                        {/* Icon */}
                        <motion.span
                          whileHover={{ scale: 1.15, rotate: -5 }}
                          transition={{ type: "spring", stiffness: 320, damping: 12 }}
                          className={`relative z-10 flex min-w-[16px] items-center justify-center transition-colors duration-200 ${
                            isActive ? "text-[#0F1D24]" : "text-[#9B9B9B]"
                          }`}
                        >
                          {item.icon}
                        </motion.span>

                        {/* Menu Title */}
                        <span
                          className={`relative z-10 flex-1 truncate text-[12px] font-medium tracking-wide transition-colors duration-200 ${
                            isActive ? "text-[#0F1D24]" : "text-[#0F1D24]/70"
                          }`}
                        >
                          {item.title}
                        </span>

                        {/* Active Dot */}
                        {isActive && (
                          <motion.span
                            layoutId="sidebarDot"
                            className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: THEME.accent }}
                          />
                        )}
                      </motion.div>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>

      {/* ==========================================================
                          USER PROFILE + LOGOUT (from Header)
      ========================================================== */}
      <div className="flex-shrink-0 space-y-1.5 border-t border-[#C6C6C6]/50 px-2.5 py-2.5">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-2.5 py-1.5"
        >
          {initials ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F1D24] text-[10px] font-bold text-[#FDC94D]">
              {initials}
            </span>
          ) : (
            <FaUserCircle className="shrink-0 text-xl text-[#9B9B9B]" />
          )}
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold leading-none text-[#0F1D24]">
              {user?.name || "—"}
            </p>
            <p className="mt-0.5 truncate text-[9px] font-semibold leading-none text-[#FDC94D]">
              {user?.role || ""}
            </p>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(220,38,38,0.22)" }}
          whileTap={{ scale: 0.96 }}
          onClick={handleLogout}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded border border-red-200 bg-red-50 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-500 hover:text-white"
        >
          <FaSignOutAlt size={11} />
          Logout
        </motion.button>
      </div>

      {/* ==========================================================
                          FOOTER
      ========================================================== */}
      <div className="flex-shrink-0 border-t border-[#C6C6C6]/50 bg-white px-3 py-2"> 
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold leading-none text-[#0F1D24]">Dixon PMS</p>
            <p className="mt-0.5 font-mono text-[9px] leading-none text-[#9B9B9B]">v1.0.0</p>
          </div>

          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1 rounded-sm border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-semibold tracking-widest text-emerald-600"
          >
            <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
            LIVE
          </motion.span>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;