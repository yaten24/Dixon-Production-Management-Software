import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
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
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";

import { useAuth } from "../../context/AuthContext";
import dixonLogo from "../../../public/Dixon_Technologies_Logo.png";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const menuSections = [
  {
    label: "Overview",
    items: [
      {
        id: 1,
        title: "Dashboard",
        path: "/management/overall/dashboard",
        icon: <FaTachometerAlt size={15} />,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        id: 2,
        title: "Production",
        path: "/management/dashboard",
        icon: <MdOutlineProductionQuantityLimits size={16} />,
      },
      {
        id: 3,
        title: "Rejection",
        path: "/management/rejection",
        icon: <MdOutlineReportProblem size={16} />,
      },
      {
        id: 4,
        title: "Loss Time",
        path: "/management/loss-time",
        icon: <FaClock size={15} />,
      },
      {
        id: 5,
        title: "Mould Change",
        path: "/management/mould-change",
        icon: <FaExchangeAlt size={15} />,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        id: 9,
        title: "Reports",
        path: "/management/reports",
        icon: <FaChartBar size={15} />,
      },
    ],
  },
];

// Enhanced Tooltip Component for Collapsed State
const Tooltip = ({ children, text, show }) => {
  if (!show) return children;
  return (
    <div className="relative group flex items-center">
      {children}
      <div className="absolute left-full ml-3 px-3 py-1.5 bg-gradient-to-r from-[#0F1D24] to-[#1a2f3f] text-white text-[11px] font-medium rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-xl z-50 border border-white/10">
        {text}
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-[6px] border-transparent border-r-[#0F1D24]" />
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  /* Live Clock */
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    [currentTime]
  );

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    [currentTime]
  );

  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="sticky top-0 hidden flex-shrink-0 flex-col h-screen overflow-hidden border-r-2 border-slate-200/80 bg-gradient-to-b from-white via-slate-50/95 to-white shadow-xl shadow-slate-200/30 lg:flex select-none z-30"
    >
      {/* Top Accent Gradient Line - Enhanced */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#0F1D24] via-[#FDC94D] to-[#0F1D24] shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDC94D]/50 to-transparent blur-sm" />
      </div>

      {/* Header / Brand Logo - Enhanced */}
      <div className="flex shrink-0 items-center justify-center border-b-2 border-slate-200/60 px-3.5 h-16 bg-white/80 backdrop-blur-sm">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 400 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F1D24] to-[#1a2f3f] shadow-lg shadow-[#0F1D24]/20 ring-2 ring-[#FDC94D]/20"
            >
              <span className="font-mono text-xs font-black tracking-widest text-[#FDC94D]">
                DT
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center h-8"
            >
              <img
                src={dixonLogo}
                alt="Dixon"
                className="h-7 w-auto object-contain max-w-[150px] drop-shadow-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Date & Time Widget - Enhanced */}
      <div className="shrink-0 border-b-2 border-slate-200/60 bg-gradient-to-r from-white/80 to-slate-50/80 py-2.5 px-3.5 backdrop-blur-sm">
        <Tooltip text={`${formattedDate} · ${formattedTime}`} show={collapsed}>
          {!collapsed ? (
            <div className="flex items-center justify-between text-[10.5px] font-medium">
              <div className="flex items-center gap-2 text-slate-600">
                <FaCalendarAlt className="text-[#FDC94D] text-[11px] drop-shadow-sm" />
                <span className="bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                  {formattedDate}
                </span>
              </div>
              <span className="h-4 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
              <div className="flex items-center gap-2 font-mono font-semibold">
                <FaClock className="text-[#FDC94D] text-[11px] drop-shadow-sm" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={formattedTime}
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.12 }}
                    className="bg-gradient-to-r from-[#0F1D24] to-[#1a2f3f] bg-clip-text text-transparent"
                  >
                    {formattedTime}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-0.5">
              <FaClock className="text-[14px] text-[#0F1D24] drop-shadow-sm" />
            </div>
          )}
        </Tooltip>
      </div>

      {/* Menu Navigation - Enhanced */}
      <div className="flex-1 space-y-4 overflow-y-auto px-2.5 py-4 custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.label} className="space-y-1.5">
            <AnimatePresence>
              {!collapsed ? (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-2.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent overflow-hidden"
                >
                  {section.label}
                </motion.p>
              ) : (
                <div className="mx-auto w-6 border-t-2 border-slate-200/80 my-2.5" />
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {section.items.map((item) => (
                <Tooltip key={item.id} text={item.title} show={collapsed}>
                  <NavLink
                    to={item.path}
                    end
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={({ isActive }) =>
                      `group relative flex items-center h-10 rounded-2xl transition-all duration-300 ${
                        collapsed ? "justify-center px-0" : "px-3.5"
                      } ${
                        isActive
                          ? "text-white"
                          : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-200/60 hover:to-transparent hover:text-[#0F1D24]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active Item Motion Background - Enhanced */}
                        {isActive && (
                          <motion.div
                            layoutId="activeTabBackground"
                            className="absolute inset-0 bg-gradient-to-r from-[#0F1D24] to-[#1a2f3f] rounded-2xl shadow-lg shadow-[#0F1D24]/20 border border-white/10"
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 30,
                            }}
                          />
                        )}

                        {/* Hover Glow Effect */}
                        {!isActive && hoveredItem === item.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-slate-200/40 to-transparent rounded-2xl"
                          />
                        )}

                        {/* Icon with Enhanced Animation */}
                        <motion.span
                          whileHover={!collapsed ? { scale: 1.05, rotate: 2 } : {}}
                          whileTap={{ scale: 0.95 }}
                          className={`relative z-10 flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isActive
                              ? "text-[#FDC94D] drop-shadow-lg"
                              : "text-slate-500 group-hover:text-[#0F1D24]"
                          }`}
                        >
                          {item.icon}
                        </motion.span>

                        {/* Title Label - Enhanced */}
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              transition={{ duration: 0.2 }}
                              className={`relative z-10 ml-3.5 truncate text-[12.5px] font-medium tracking-wide flex-1 ${
                                isActive
                                  ? "text-white font-semibold"
                                  : "text-slate-700 group-hover:text-[#0F1D24]"
                              }`}
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* Enhanced Gold Dot Indicator */}
                        {isActive && !collapsed && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                            className="relative z-10 h-2 w-2 rounded-full bg-[#FDC94D] shrink-0 ml-auto shadow-lg shadow-[#FDC94D]/30"
                          >
                            <span className="absolute inset-0 rounded-full bg-[#FDC94D] animate-ping opacity-50" />
                          </motion.span>
                        )}
                      </>
                    )}
                  </NavLink>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Section - Enhanced */}
      <div className="shrink-0 border-t-2 border-slate-200/70 p-2.5 bg-gradient-to-b from-white/60 to-slate-50/60 backdrop-blur-sm space-y-1.5">
        <Tooltip text={user?.name || "Account"} show={collapsed}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`flex items-center gap-3 rounded-2xl border-2 border-slate-200/80 bg-white/90 p-2.5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#FDC94D]/30 ${
              collapsed ? "justify-center p-2" : ""
            }`}
          >
            {initials ? (
              <motion.span
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F1D24] to-[#1a2f3f] text-[11px] font-bold text-[#FDC94D] shadow-md shadow-[#0F1D24]/20 ring-2 ring-[#FDC94D]/20"
              >
                {initials}
              </motion.span>
            ) : (
              <FaUserCircle className="h-9 w-9 shrink-0 text-slate-400" />
            )}

            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-[11.5px] font-bold bg-gradient-to-r from-[#0F1D24] to-slate-700 bg-clip-text text-transparent">
                  {user?.name || "Guest User"}
                </p>
                <p className="truncate text-[9.5px] font-semibold text-[#FDC94D] uppercase tracking-wider">
                  {user?.role || "Operator"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </Tooltip>

        <Tooltip text="Logout" show={collapsed}>
          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className={`flex h-9 w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-200/60 bg-gradient-to-r from-red-50/50 to-red-100/50 text-[11px] font-semibold text-red-600 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-red-500/20 ${
              collapsed ? "px-0" : "px-3.5"
            }`}
          >
            <FaSignOutAlt size={12} />
            {!collapsed && <span>Logout</span>}
          </motion.button>
        </Tooltip>
      </div>

      {/* Footer Info - Enhanced */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="shrink-0 border-t-2 border-slate-200/60 bg-white/80 px-3.5 py-2.5 flex items-center justify-between text-[9.5px] backdrop-blur-sm"
        >
          <div>
            <p className="font-bold bg-gradient-to-r from-[#0F1D24] to-slate-600 bg-clip-text text-transparent">
              PMS-Dehradun
            </p>
            <p className="font-mono text-slate-400 text-[8.5px]">v1.0.0</p>
          </div>
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100/70 px-2.5 py-0.5 font-bold text-[8.5px] text-emerald-600 border-2 border-emerald-200/80 shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500">
              <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
            </span>
            LIVE
          </motion.span>
        </motion.div>
      )}

      {/* Collapse Toggle Switch - Enhanced */}
      <motion.button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        whileHover={{ backgroundColor: "#0F1D24", color: "#FDC94D" }}
        className="flex h-10 shrink-0 items-center justify-center gap-2 border-t-2 border-slate-200/80 bg-gradient-to-r from-slate-100/80 to-white text-[11px] font-semibold text-slate-600 transition-all duration-300"
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
        >
          <HiChevronLeft className="h-4 w-4" />
        </motion.div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Collapse
          </motion.span>
        )}
        {collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HiChevronRight className="h-4 w-4" />
          </motion.span>
        )}
      </motion.button>
    </motion.aside>
  );
};

export default Sidebar;