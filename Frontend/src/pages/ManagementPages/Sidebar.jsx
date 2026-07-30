import React, { useEffect, useMemo, useRef, useState } from "react";
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
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronDown,
} from "react-icons/hi2";

import { useAuth } from "../../context/AuthContext";

const EXPANDED_WIDTH = 200;
const COLLAPSED_WIDTH = 64;

// Combined into a flat menu without section headers
const menuItems = [
  {
    id: 1,
    title: "Overall Dashboard",
    path: "/management/overall/dashboard",
    icon: <FaTachometerAlt size={14} />,
  },
  {
    id: 6,
    title: "Monthly Production",
    path: "/management/monthly/production/dashboard",
    icon: <MdOutlineProductionQuantityLimits size={14} />,
  },
  {
    id: 7,
    title: "Machines Production",
    path: "/management/monthly/machines/production/dashboard",
    icon: <MdOutlineProductionQuantityLimits size={14} />,
  },
  {
    id: 2,
    title: "Daily Production",
    path: "/management/dashboard",
    icon: <MdOutlineProductionQuantityLimits size={15} />,
  },
  {
    id: 3,
    title: "Daily Rejection",
    path: "/management/rejection",
    icon: <MdOutlineReportProblem size={15} />,
  },
  {
    id: 4,
    title: "Daily Loss Time",
    path: "/management/loss-time",
    icon: <FaClock size={14} />,
  },
  {
    id: 5,
    title: "Daily Mold Change",
    path: "/management/mold-change",
    icon: <FaExchangeAlt size={14} />,
  },
  {
    id: 9,
    title: "Reports",
    path: "/management/reports",
    icon: <FaChartBar size={14} />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  /* Live Clock */
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [currentTime],
  );

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    [currentTime],
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
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 hidden flex-shrink-0 flex-col h-screen overflow-hidden border-r-2 border-slate-300 bg-slate-100 shadow-sm lg:flex select-none z-30"
    >
      {/* Accent Header Line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#0F1D24] via-[#9B9B9B] to-[#FDC94D] shrink-0" />

      {/* Logo Header */}
      <div className="flex flex-shrink-0 items-center justify-center gap-2 border-b-2 border-slate-300 bg-slate-100 px-2 py-1.5">
        {!collapsed ? (
          <div className="min-w-0 flex-1 bg-[#0F1D24] p-2 rounded-[2px] leading-none">
            <p className="truncate text-[16px] font-bold tracking-tight text-[#FDC94D]">
              PMS Dixon Dehradun
            </p>
          </div>
        ) : (
          <div className="flex h-11 w-11 flex-shrink-0 items-center rounded-[2px] justify-center bg-[#0F1D24]">
            <span className="font-mono text-[15px] font-extrabold text-[#FDC94D]">
              PMS
            </span>
          </div>
        )}
      </div>

      {/* Highlighted Live Date & Time Section */}
      <div className="shrink-0 p-2 border-b-2 border-slate-300 bg-slate-100">
        <motion.div
          layout
          className="relative overflow-hidden rounded-[2px] bg-[#0F1D24] p-2 text-white shadow-sm border-2 border-slate-800"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-[#FDC94D]/10 blur-xl pointer-events-none" />

          {!collapsed ? (
            <div className="space-y-1">
              {/* Date */}
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-[#FDC94D] text-[11px]" />
                  <span>{formattedDate}</span>
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FDC94D] pt-0.5 border-t border-slate-800">
                <FaClock className="text-[11px] shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={formattedTime}
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15 }}
                    className="font-mono tracking-wider"
                  >
                    {formattedTime}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-1 gap-1"
              title={`${formattedDate} · ${formattedTime}`}
            >
              <FaClock className="text-[14px] text-[#FDC94D] animate-pulse" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar bg-slate-100">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-1"
        >
          {menuItems.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <NavLink
                to={item.path}
                end
                title={collapsed ? item.title : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center h-8 rounded-[2px] border-1 transition-all duration-150 ${
                    collapsed ? "justify-center px-0" : "px-2"
                  } ${
                    isActive
                      ? "border-[#0F1D24] bg-[#0F1D24] text-white shadow-sm"
                      : "border-slate-300 bg-white text-slate-600 hover:border-[#0F1D24] hover:bg-slate-50 hover:text-[#0F1D24]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Left Active Line Marker */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActiveIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#FDC94D]"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Icon */}
                    <span
                      className={`flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "text-[#FDC94D]"
                          : "text-slate-500 group-hover:text-[#0F1D24]"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    {!collapsed && (
                      <span
                        className={`ml-2.5 truncate text-[12px] font-semibold tracking-wide flex-1 ${
                          isActive
                            ? "text-white"
                            : "text-slate-700 group-hover:text-[#0F1D24]"
                        }`}
                      >
                        {item.title}
                      </span>
                    )}

                    {/* Active Dot indicator when expanded */}
                    {isActive && !collapsed && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FDC94D] shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* User Profile & Logout Section */}
      <div
        ref={profileRef}
        className="relative flex-shrink-0 border-t-2 border-slate-300 bg-slate-100 px-1.5 py-1.5"
      >
        {profileOpen && (
          <div
            className={`absolute bottom-full z-30 mb-1.5 w-44 rounded-md border-2 border-slate-300 bg-white shadow-[0_-4px_10px_rgba(15,29,36,0.12)] ${
              collapsed ? "left-full ml-1.5" : "left-1.5"
            }`}
          >
            <div className="rounded-t-md border-b-2 border-slate-300 bg-[#FAFAFA] px-2.5 py-1.5">
              <p className="text-[10px] font-bold leading-none text-[#0F1D24]">
                {user?.name || "—"}
              </p>
              <p className="mt-0.5 text-[8.5px] leading-none text-[#9B9B9B]">
                {user?.employee_id || ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-1.5 rounded-b-md px-2.5 py-1.5 text-[10px] font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50"
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
          className={`flex w-full items-center gap-2 rounded-md border-2 border-slate-300 bg-white px-2 py-1 text-left transition-colors duration-150 hover:border-[#0F1D24] hover:bg-slate-50 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F1D24] text-[9px] font-bold text-[#FDC94D]">
            {initials || <FaUserCircle className="text-sm" />}
          </span>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 leading-none">
                <p className="truncate text-[10px] font-bold leading-none text-[#0F1D24]">
                  {user?.name || "—"}
                </p>
                <p className="mt-0.5 truncate text-[8.5px] font-semibold leading-none text-[#FDC94D]">
                  {user?.role || ""}
                </p>
              </div>
              <HiOutlineChevronDown
                className={`h-3 w-3 flex-shrink-0 text-[#9B9B9B] transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>
      </div>
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex h-8 shrink-0 items-center justify-center gap-1.5 border-t-2 border-slate-300 bg-slate-200 text-[10px] font-bold text-slate-700 hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-all duration-150"
      >
        {collapsed ? (
          <HiOutlineChevronDoubleRight className="h-4 w-4" />
        ) : (
          <>
            <HiOutlineChevronDoubleLeft className="h-4 w-4" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
