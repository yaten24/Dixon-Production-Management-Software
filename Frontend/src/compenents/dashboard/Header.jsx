// Header.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dixonLogo from "../../../public/Dixon_Technologies_Logo.png";

/* ==========================================================
   HEADER_HEIGHT = total rendered height of this header
   (2px accent line + 40px title bar). Fixed header, so page
   wrapper needs style={{ paddingTop: HEADER_HEIGHT }}
========================================================== */
const HEADER_HEIGHT = 42;

const THEME = {
  highlight: "#0F1D24",
  gray: "#9B9B9B",
  accent: "#FDC94D",
  darken: "#C6C6C6",
};

const Header = ({ subtitle = "Production Management System" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);

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
    [currentTime]
  );

  const formattedTime = useMemo(
    () => currentTime.toLocaleTimeString("en-IN", { hour12: true }),
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
    <header
      className="fixed top-0 left-0 right-0 z-[999] w-full bg-white border-b border-[#C6C6C6] select-none"
      style={{ boxShadow: "0 1px 0 rgba(15,29,36,0.06)" }}
    >
      {/* Accent line — flat, no animation, reads as a "system" strip */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, ${THEME.highlight} 0%, ${THEME.darken} 50%, ${THEME.accent} 100%)`,
        }}
      />

      {/* Title bar */}
      <div className="h-[40px] w-full flex items-stretch justify-between">
        {/* LEFT — logo block, bordered like an app icon well */}
        <div className="flex items-center gap-2.5 px-3 border-r border-[#C6C6C6]">
          {/* <img src={dixonLogo} alt="Dixon" className="w-24 h-8 object-contain" /> */}
          <div className="hidden sm:flex flex-col justify-center leading-none border-[#C6C6C6]">
            <span className="text-[18px] font-bold text-[#0F1D24] tracking-tight">
              Dixon PMS
            </span>
            <span className="text-[9px] font-medium text-[#9B9B9B]">
              {subtitle}
            </span>
          </div>
        </div>

        {/* RIGHT — status cluster, each item is its own bordered "panel" */}
        <div className="flex items-stretch">
          {/* Date / Time readout */}
          <div className="hidden lg:flex items-center gap-2 px-3 border-l border-[#C6C6C6] bg-[#FAFAFA]">
            <FaCalendarAlt className="text-[#0F1D24]/70 text-[10px]" />
            <span className="text-[11px] font-semibold text-[#0F1D24] font-mono tabular-nums">
              {formattedDate}
            </span>
            <span className="h-3 w-px bg-[#C6C6C6]" />
            <FaClock className="text-[#0F1D24]/70 text-[10px]" />
            <span className="text-[11px] font-bold text-[#0F1D24] font-mono tabular-nums w-[92px]">
              {formattedTime}
            </span>
          </div>

          {/* User account panel — dropdown-style, desktop-app account chip */}
          <div className="relative border-l border-[#C6C6C6]">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="hidden md:flex items-center gap-2 px-3 h-full hover:bg-[#F5F5F5] transition-colors duration-100"
            >
              <div className="w-6 h-6 rounded-sm bg-[#0F1D24] flex items-center justify-center text-[#FDC94D] text-[9px] font-bold">
                {initials || <FaUserCircle className="text-sm" />}
              </div>
              <div className="text-left leading-none">
                <p className="text-[11px] font-bold text-[#0F1D24]">
                  {user?.name || "—"}
                </p>
                <p className="text-[9px] font-semibold text-[#9B9B9B]">
                  {user?.role || ""}
                </p>
              </div>
              <HiOutlineChevronDown className="text-[10px] text-[#9B9B9B]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full w-44 bg-white border border-[#C6C6C6] shadow-[0_4px_10px_rgba(15,29,36,0.12)] z-50">
                <div className="px-3 py-2 border-b border-[#C6C6C6] bg-[#FAFAFA]">
                  <p className="text-[11px] font-bold text-[#0F1D24]">{user?.name}</p>
                  <p className="text-[9px] text-[#9B9B9B]">{user?.employee_id || ""}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors duration-100"
                >
                  <FaSignOutAlt size={10} />
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Logout icon-button — toolbar-style square button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex md:hidden items-center justify-center w-10 border-l border-[#C6C6C6] text-red-600 hover:bg-red-50 transition-colors duration-100"
          >
            <FaSignOutAlt size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
export { HEADER_HEIGHT };