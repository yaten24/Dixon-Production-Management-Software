import React, { useEffect, useState, useMemo } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  FaHome,
  FaCalendarAlt,
  FaClock,
  FaSignOutAlt,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

import { HiMenuAlt2 } from "react-icons/hi";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import dixonLogo from "../../../public/Dixon_Technologies_Logo.png";

/* ==========================================================
                        CONSTANTS
   HEADER_HEIGHT = total rendered height of this header
   (2px gradient line + 46px content row). Since this header
   is `fixed`, whatever wraps your page content needs a
   top offset equal to this so content doesn't sit underneath
   it, e.g. on the page wrapper: style={{ paddingTop: HEADER_HEIGHT }}
========================================================== */

const HEADER_HEIGHT = 48;

const Header = ({
  title = "Dashboard",
  subtitle = "Production Management System",
}) => {
  const navigate = useNavigate();

  // FIX: user details were hardcoded as "Admin User" / "System
  // Administrator" — now pulled from AuthContext, which itself comes
  // from the backend's /auth/profile response (the same data shown in
  // your example: name, role, employee_id, etc.), not localStorage.

  const { user, logout } = useAuth();

  /* ==========================================================
                        STATES
  ========================================================== */

  const [currentTime, setCurrentTime] = useState(new Date());

  const [notifications] = useState(4);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* ==========================================================
                        LIVE CLOCK
  ========================================================== */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ==========================================================
                        DATE
  ========================================================== */

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  }, [currentTime]);

  /* ==========================================================
                        TIME
  ========================================================== */

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString("en-IN", {
      hour12: true,
    });
  }, [currentTime]);

  /* ==========================================================
                        USER INITIALS (for mobile avatar fallback)
  ========================================================== */

  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  /* ==========================================================
                        ACTIONS
  ========================================================== */

  const goHome = () => {
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    // FIX: this used to just navigate("/") without ever telling the
    // backend — the auth cookie stayed valid the whole time. Now it
    // actually calls the logout API (clears the httpOnly cookie
    // server-side) via AuthContext, then redirects.
    await logout();
    navigate("/");
  };

  /* ==========================================================
                        COMPONENT
  ========================================================== */

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-[999] w-full bg-white border-b border-slate-200 shadow-sm"
    >
      {/* ==========================================================
                          TOP GRADIENT LINE
      ========================================================== */}

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformOrigin: "left",
          background:
            "linear-gradient(90deg,#2563EB 0%,#4F46E5 45%,#7C3AED 100%)",
        }}
        className="h-[2px] w-full"
      />

      {/* ==========================================================
                          HEADER CONTENT
      ========================================================== */}

      <div className="h-[46px] w-full px-3 sm:px-4 lg:px-6 flex items-center justify-between">
        {/* =====================================================
                        LEFT SECTION
        ====================================================== */}

        <div className="flex items-center gap-2.5">
          {/* Mobile Menu */}

          {/* <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center shadow-sm"
          >
            <HiMenuAlt2 className="text-base text-slate-700" />
          </motion.button> */}

          {/* Logo */}

          <motion.div
            whileHover={{ rotate: -5, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 320, damping: 14 }}
            className="w-8 h-8 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden"
          >
            <img
              src={dixonLogo}
              alt="Dixon"
              className="w-5.5 h-5.5 object-contain"
            />
          </motion.div>

          {/* Title */}

          <div className="flex items-baseline gap-2">
            <p className="hidden sm:block text-[11px] text-slate-500 leading-none">
              {subtitle}
            </p>
          </div>
        </div>

        {/* =====================================================
                    RIGHT SECTION START
        ====================================================== */}

        <div className="flex items-center gap-1.5">
          {/* =========================
             Date & Time (single compact pill)
          ========================== */}

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className="hidden xl:flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 h-8"
          >
            <FaCalendarAlt className="text-blue-600 text-[11px]" />
            <span className="text-[11px] font-medium text-slate-700">
              {formattedDate}
            </span>

            <span className="h-3 w-px bg-slate-300" />

            <FaClock className="text-purple-600 text-[11px]" />
            <AnimatePresence mode="wait">
              <motion.span
                key={formattedTime}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.15 }}
                className="text-[11px] font-semibold text-slate-700 font-mono tabular-nums"
              >
                {formattedTime}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* =========================
                  Home
          ========================== */}

          {/* <motion.button
            whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={goHome}
            className="hidden sm:flex items-center gap-1.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 h-8 text-[11px] font-semibold shadow-sm"
          >
            <FaHome size={11} />
            Home
          </motion.button> */}

          {/* =========================
               User Profile
          ========================== */}

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="hidden md:flex items-center gap-2 rounded border border-slate-200 bg-white px-2.5 h-8"
          >
            <FaUserCircle className="text-xl text-slate-400" />

            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-none">
                {user?.name || "—"}
              </p>
              <p className="text-[9px] text-slate-500 leading-none mt-0.5">
                {user?.role || ""}
              </p>
            </div>
          </motion.div>

          {/* =========================
                  Logout
          ========================== */}

          <motion.button
            whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(220,38,38,0.28)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded border border-red-200 bg-red-50 hover:bg-red-500 hover:text-white transition-colors text-red-600 px-2.5 h-8 text-[11px] font-semibold"
          >
            <FaSignOutAlt size={11} />
            <span className="hidden lg:block">Logout</span>
          </motion.button>

          {/* =========================
                Mobile User Avatar
          ========================== */}

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden w-8 h-8 rounded border border-slate-200 bg-white shadow-sm flex items-center justify-center"
          >
            {initials ? (
              <span className="text-[10px] font-bold text-slate-600">
                {initials}
              </span>
            ) : (
              <FaUserCircle className="text-lg text-slate-500" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
