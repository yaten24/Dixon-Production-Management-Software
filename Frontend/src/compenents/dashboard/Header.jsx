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

/* ==========================================================
                        THEME
   Brand palette (client's color reference):
     highlight #0F1D24  (deep navy)   — icons, titles, hover fills
     gray      #9B9B9B                — secondary text
     accent    #FDC94D  (warm gold)   — sparing highlight: eyebrow, bar, hover
     darken    #C6C6C6                — borders, dividers, neutral surfaces
========================================================== */

const THEME = {
  highlight: "#0F1D24",
  gray: "#9B9B9B",
  accent: "#FDC94D",
  darken: "#C6C6C6",
};

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
      className="fixed top-0 left-0 right-0 z-[999] w-full bg-white border-b border-[#C6C6C6]/50 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
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
          background: `linear-gradient(90deg, ${THEME.highlight} 0%, ${THEME.darken} 45%, ${THEME.accent} 100%)`,
        }}
        className="h-[2px] w-full"
      />

      {/* ==========================================================
                          HEADER CONTENT
      ========================================================== */}

      <div className="h-[46px] w-full px-2 sm:px-2 lg:px-2 flex items-center justify-between">
        {/* =====================================================
                        LEFT SECTION
        ====================================================== */}

        <div className="flex items-center gap-2">
          {/* Mobile Menu */}

          {/* <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-8 h-8 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] flex items-center justify-center"
          >
            <HiMenuAlt2 className="text-base text-[#0F1D24]" />
          </motion.button> */}

          {/* Logo — navy card w/ gold ring, matches the icon-tile
              treatment used on the quick-access cards */}

          <motion.div>
            <img
              src={dixonLogo}
              alt="Dixon"
              className="w-30 h-12 object-contain"
            />
          </motion.div>

          {/* Title */}

          {/* <div className="flex flex-col justify-center leading-none">
            <p className="text-[20px] font-bold uppercase tracking-wider text-[#FDC94D]">
              Dixon PMS
            </p>
            <p className="hidden sm:block text-[10px] font-semibold text-[#0F1D24] mt-0.5">
              {subtitle}
            </p>
          </div> */}
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
            className="hidden xl:flex items-center gap-2 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-3 h-8"
          >
            <FaCalendarAlt className="text-[#FDC94D] text-[11px]" />
            <span className="text-[11px] font-medium text-[#0F1D24]">
              {formattedDate}
            </span>

            <span className="h-3 w-px bg-[#C6C6C6]" />

            <FaClock className="text-[#FDC94D] text-[11px]" />
            <AnimatePresence mode="wait">
              <motion.span
                key={formattedTime}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.15 }}
                className="text-[11px] font-semibold text-[#0F1D24] font-mono tabular-nums"
              >
                {formattedTime}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* =========================
                  Home
          ========================== */}

          {/* <motion.button
            whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(15,29,36,0.25)" }}
            whileTap={{ scale: 0.95 }}
            onClick={goHome}
            style={{ background: THEME.highlight, color: THEME.accent }}
            className="hidden sm:flex items-center gap-1.5 rounded px-2.5 h-8 text-[11px] font-semibold shadow-sm"
          >
            <FaHome size={11} />
            Home
          </motion.button> */}

          {/* =========================
               User Profile
          ========================== */}

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="hidden md:flex items-center gap-2 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-2.5 h-8"
          >
            <FaUserCircle className="text-xl text-[#9B9B9B]" />

            <div>
              <p className="text-[11px] font-bold text-[#0F1D24] leading-none">
                {user?.name || "—"}
              </p>
              <p className="text-[9px] font-semibold text-[#FDC94D] leading-none mt-0.5">
                {user?.role || ""}
              </p>
            </div>
          </motion.div>

          {/* =========================
                  Logout
          ========================== */}

          <motion.button
            whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(220,38,38,0.22)" }}
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
            className="md:hidden w-8 h-8 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] shadow-sm flex items-center justify-center"
          >
            {initials ? (
              <span className="text-[10px] font-bold text-[#0F1D24]">
                {initials}
              </span>
            ) : (
              <FaUserCircle className="text-lg text-[#9B9B9B]" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
