import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaDownload,
  FaChartLine,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSyncAlt,
  FaUndo,
  FaHistory,
  FaFileExcel,
  FaThLarge,
} from "react-icons/fa";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const parseDateKey = (key) => {
  if (!key) return new Date();
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const formatDisplay = (key) => {
  if (!key) return "Select date";
  return parseDateKey(key).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Fully custom, theme-matched calendar dropdown — same component used by
// LossFilters / RejectionFilters, kept identical here for a consistent
// look and feel across the app instead of a separately-themed picker.
const CustomDatePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDateKey(value));
  const wrapperRef = useRef(null);

  useEffect(() => {
    setViewDate(parseDateKey(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedKey = value || "";
  const todayKey = toDateKey(new Date());

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) cells.push(new Date(year, month, day));
    return cells;
  }, [viewDate]);

  const changeMonth = (delta) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  const handleSelect = (date) => {
    onChange(toDateKey(date));
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 flex-shrink-0 items-center gap-1.5 rounded border border-[#C6C6C6] bg-white px-2 text-[11px] font-medium text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
      >
        <FaCalendarAlt className="text-[10px] text-[#0F1D24]" />
        <span className="whitespace-nowrap">{formatDisplay(selectedKey)}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-9 z-50 w-60 overflow-hidden rounded border border-[#C6C6C6]/60 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between bg-[#0F1D24] px-2 py-1.5">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-5 w-5 items-center justify-center rounded text-[#FDC94D] transition hover:bg-white/10"
              >
                <FaChevronLeft size={9} />
              </button>
              <span className="text-[11px] font-bold text-white">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-5 w-5 items-center justify-center rounded text-[#FDC94D] transition hover:bg-white/10"
              >
                <FaChevronRight size={9} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 px-1.5 pt-1.5">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={`${w}-${i}`}
                  className="flex h-5 items-center justify-center text-[9px] font-semibold text-[#9B9B9B]"
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 px-1.5 pb-1.5">
              {calendarDays.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} className="h-6 w-6" />;
                const key = toDateKey(date);
                const isSelected = key === selectedKey;
                const isToday = key === todayKey;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleSelect(date)}
                    className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold transition-colors ${
                      isSelected
                        ? "bg-[#FDC94D] text-[#0F1D24]"
                        : isToday
                        ? "border border-[#0F1D24]/40 text-[#0F1D24]"
                        : "text-[#0F1D24] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2 py-1">
              <button
                type="button"
                onClick={() => handleSelect(new Date())}
                className="text-[10px] font-semibold text-[#0F1D24] hover:text-[#FDC94D]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[10px] font-medium text-[#9B9B9B] hover:text-[#0F1D24]"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardFilters = ({ date, setDate, onExport }) => {
  return (
    <div className="flex min-h-10 flex-shrink-0 flex-wrap items-center justify-between gap-2 rounded border border-[#C6C6C6]/50 bg-white px-2 py-1.5 shadow-sm">
      {/* Icon + Label */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#0F1D24]">
          <FaChartLine className="text-xs text-[#FDC94D]" />
        </div>
        <span className="hidden text-xs font-bold uppercase tracking-wide text-[#0F1D24] sm:block">
          Production Dashboard
        </span>
      </div>

      <div className="hidden h-5 w-px flex-shrink-0 bg-[#C6C6C6] sm:block" />

      <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5">
        <CustomDatePicker value={date} onChange={setDate} />

        <button
          onClick={onExport}
          title="Export to Excel"
          className="flex h-7 flex-shrink-0 items-center gap-1.5 rounded bg-[#0F1D24] px-2 text-[11px] font-semibold text-[#FDC94D] transition-colors hover:bg-[#0F1D24]/90"
        >
          <FaDownload size={10} />
          <span className="hidden md:inline">Export Excel</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;