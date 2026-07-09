import React, { useEffect, useState } from "react";

import {
  FaExchangeAlt,
  FaCalendarAlt,
  FaClock,
  FaIndustry,
} from "react-icons/fa";

import DateRangeFilter from "../DateRangeFilter";
import { useNavigate } from "react-router-dom";

/* ---------- design tokens (gray theme, matches HallWiseChart / MachineWiseChart / MachineTable) ----------
  base       #F3F4F6  page / outer bg
  panel      #FFFFFF  card / panel surface
  hairline   #E2E4E9  borders / grid
  blue       #2563EB  primary accent
  ink        #1F2430  primary text
  ink-dim    #6B7280  secondary text
------------------------------------------------------------------------------------------------------ */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');
`;

// Default: scroll smoothly to the hall-wise chart section.
// Give the HallWiseChart's wrapper element id="hall-wise-section" for this to work,
// or pass your own onViewHallWise handler (e.g. to navigate to a route) as a prop.
const scrollToHallWise = () => {
  const el = document.getElementById("hall-wise-section");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const DashboardHeader = ({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onViewHallWise,
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const navigate = useNavigate();

  const handleHallWiseClick = () => {
    navigate("/hall-wise");
  };

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="bg-gray-100 border border-gray-200 shadow-sm px-3 py-1.5 rounded-sm"
    >
      <style>{FONT_IMPORT}</style>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
        {/* Left Section */}

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 border border-blue-100 flex items-center justify-center rounded-sm">
            <FaExchangeAlt className="text-[#2563EB] text-sm" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <h1
              style={{ fontFamily: "'Oswald', sans-serif" }}
              className="text-base lg:text-lg font-semibold tracking-wide text-gray-800 uppercase"
            >
              Mould Change Dashboard
            </h1>

            <span className="flex items-center gap-1.5 text-[9px] font-semibold tracking-widest px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
        </div>

        {/* Right Section */}

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Hall Wise Button */}

          <button
            onClick={handleHallWiseClick}
            className="h-7 px-2.5 flex items-center cursor-pointer gap-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-sm hover:bg-[#1D4FD1] transition-colors duration-200"
          >
            Hall Wise Mould Change
          </button>

          {/* Date Range Filter */}

          <div className="border border-gray-200 bg-gray-50 rounded-sm">
            <DateRangeFilter
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
