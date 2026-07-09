import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaIndustry,
  FaChartBar,
  FaClock,
  FaExchangeAlt,
  FaWrench,
} from "react-icons/fa";

import {
  MdOutlineProductionQuantityLimits,
  MdOutlineReportProblem,
} from "react-icons/md";

import { LuUsers } from "react-icons/lu";
import { RiFileList3Line } from "react-icons/ri";
import { FaScrewdriverWrench } from "react-icons/fa6";

/* ---------- design tokens (white theme, richer accent + gradient) ----------
  base       #FFFFFF  page / outer bg
  panel      #FFFFFF  card / panel surface
  hairline   #E2E4E9  borders
  blue       #2563EB  primary accent
  blue-2     #7C3AED  secondary accent (gradient partner)
  ink        #1F2430  primary text
  ink-dim    #6B7280  secondary text

  NOTE: HEADER_HEIGHT below must match the current Header's total rendered height
  (2px gradient line + 46px content row = 48px). If Header's height changes again,
  update HEADER_HEIGHT here too so the sidebar sits flush beneath it.
--------------------------------------------------------------------------------- */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');
`;

const SIDEBAR_WIDTH = 160;
const HEADER_HEIGHT = 52;

const menuSections = [
  {
    label: "Overview",
    items: [
      {
        id: 1,
        title: "Dashboard",
        path: "/dashboard",
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
        path: "/production",
        icon: <MdOutlineProductionQuantityLimits size={15} />,
      },
      {
        id: 3,
        title: "Rejection",
        path: "/rejection",
        icon: <MdOutlineReportProblem size={15} />,
      },
      {
        id: 4,
        title: "Loss Time",
        path: "/loss-time",
        icon: <FaClock size={15} />,
      },
      {
        id: 5,
        title: "Mould Change",
        path: "/mould-change",
        icon: <FaExchangeAlt size={15} />,
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        id: 6,
        title: "Employees",
        path: "/employees",
        icon: <FaUsers size={15} />,
      },
      {
        id: 7,
        title: "Machines",
        path: "/machines",
        icon: <FaIndustry size={15} />,
      },
      { id: 8, title: "Users", path: "/users", icon: <LuUsers size={15} /> },
      {
        id: 13,
        title: "Parts",
        path: "/parts",
        icon: <FaScrewdriverWrench size={15} />,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        id: 9,
        title: "Reports",
        path: "/reports",
        icon: <FaChartBar size={15} />,
      },
      {
        id: 10,
        title: "Logs",
        path: "/logs",
        icon: <RiFileList3Line size={15} />,
      },
    ],
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
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
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: `0 0 ${SIDEBAR_WIDTH}px`,
        width: SIDEBAR_WIDTH,
        top: HEADER_HEIGHT,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        fontFamily: "'Inter', sans-serif",
      }}
      className="hidden lg:flex sticky flex-col bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex-shrink-0"
    >
      <style>{FONT_IMPORT}</style>

      {/* ========================= MENU SECTIONS ========================= */}

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="px-2 mb-1.5 text-[9px] uppercase tracking-[2px] font-semibold text-gray-400">
              {section.label}
            </p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-0.5"
            >
              {section.items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `block relative overflow-hidden rounded-md transition-colors duration-200 ${
                        isActive ? "bg-blue-50" : "hover:bg-gray-50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <motion.div
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="relative flex items-center gap-2 px-2.5 py-1.5 cursor-pointer select-none"
                      >
                        {/* Hover glow sweep */}
                        {!isActive && (
                          <motion.span
                            className="pointer-events-none absolute inset-0 rounded-md opacity-0"
                            style={{
                              background:
                                "linear-gradient(90deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))",
                            }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}

                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebarIndicator"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                            className="absolute left-0 top-0 h-full w-[2.5px] rounded"
                            style={{
                              background:
                                "linear-gradient(180deg, #2563EB, #7C3AED)",
                            }}
                          />
                        )}

                        {/* Icon */}
                        <motion.span
                          whileHover={{ scale: 1.15, rotate: -5 }}
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 12,
                          }}
                          className={`relative z-10 flex items-center justify-center min-w-[16px] transition-colors duration-200 ${
                            isActive ? "text-[#2563EB]" : "text-gray-500"
                          }`}
                        >
                          {item.icon}
                        </motion.span>

                        {/* Menu Title */}
                        <span
                          className={`relative z-10 flex-1 text-[12px] font-medium tracking-wide truncate transition-colors duration-200 ${
                            isActive ? "text-[#1D4FD1]" : "text-gray-700"
                          }`}
                        >
                          {item.title}
                        </span>

                        {/* Active Dot */}
                        {isActive && (
                          <motion.span
                            layoutId="sidebarDot"
                            className="relative z-10 h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ background: "#2563EB" }}
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

      {/* ========================= FOOTER ========================= */}

      <div className="shrink-0 border-t border-gray-100 bg-white px-3.5 py-2 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-700 leading-none">
              Dixon MPM
            </p>
            <p className="text-[9px] font-mono text-gray-500 mt-0.5 leading-none">
              v1.0.0
            </p>
          </div>

          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1 text-[8px] font-semibold tracking-widest px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-sm"
          >
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </motion.span>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
