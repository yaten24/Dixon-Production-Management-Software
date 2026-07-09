import React, { useState, useEffect, useRef } from "react";

import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";

/* ---------- design tokens (gray theme, matches HallWiseChart / DashboardHeader) ----------
  panel      #FFFFFF  card / panel surface
  hairline   #E2E4E9  borders
  blue       #2563EB  primary accent
  ink        #1F2430  primary text
  ink-dim    #6B7280  secondary text
-------------------------------------------------------------------------------------- */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');
`;

const DateRangeFilter = ({ fromDate, toDate, setFromDate, setToDate }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const calendarRef = useRef(null);

  const [range, setRange] = useState([
    {
      startDate: fromDate ? new Date(fromDate) : new Date(),
      endDate: toDate ? new Date(toDate) : new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (ranges) => {
    const selection = ranges.selection;

    setRange([selection]);

    setFromDate(format(selection.startDate, "yyyy-MM-dd"));

    setToDate(format(selection.endDate, "yyyy-MM-dd"));
  };

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="relative w-full"
      ref={calendarRef}
    >
      <style>{FONT_IMPORT}</style>

      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex h-7 items-center gap-1.5 rounded-sm border border-gray-200 bg-white px-2 transition-colors hover:border-[#2563EB]"
      >
        <FaCalendarAlt className="text-[10px] text-[#2563EB] shrink-0" />

        <span className="truncate text-xs font-mono font-semibold text-gray-700">
          {fromDate && toDate ? `${fromDate} → ${toDate}` : "Select Range"}
        </span>

        <FaChevronDown
          className={`text-[9px] text-gray-400 shrink-0 transition-transform duration-200 ${
            showCalendar ? "rotate-180" : ""
          }`}
        />
      </button>

      {showCalendar && (
        <div className="absolute right-0 top-8 z-50 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-xl">
          <DateRange
            editableDateInputs
            moveRangeOnFirstSelection={false}
            ranges={range}
            onChange={handleSelect}
            months={1}
            direction="horizontal"
            rangeColors={["#2563EB"]}
            showMonthAndYearPickers={true}
            showDateDisplay={false}
          />

          <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-2.5 py-1.5">
            <span className="text-[10px] font-mono text-gray-500">
              {fromDate && toDate
                ? `${fromDate} → ${toDate}`
                : "No date selected"}
            </span>

            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className="rounded-sm bg-[#2563EB] px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-[#1D4FD1]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
