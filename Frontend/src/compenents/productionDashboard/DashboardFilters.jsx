import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaDownload, FaChartLine, FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ==========================================================
// ThemedDatePicker — replaces native <input type="date"> with a
// navy/gold calendar dropdown. Keeps the same value contract
// (yyyy-mm-dd string) so the parent's setDate works unchanged.
// ==========================================================
const toISO = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatDisplay = (iso) => {
  if (!iso) return "Select date";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const ThemedDatePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(`${value}T00:00:00`) : new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (value) setViewDate(new Date(`${value}T00:00:00`));
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toISO(new Date());

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectDay = (d) => {
    const picked = new Date(year, month, d);
    onChange(toISO(picked));
    setOpen(false);
  };

  const changeMonth = (delta) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1.5 rounded border bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] outline-none transition-all duration-200 ${
          open ? "border-[#0F1D24] ring-2 ring-[#0F1D24]/10" : "border-[#C6C6C6] hover:border-[#0F1D24]"
        }`}
      >
        <FaCalendarAlt className="text-[10px] text-[#0F1D24]" />
        {formatDisplay(value)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-30 mt-1.5 w-64 rounded-lg border border-[#C6C6C6]/70 bg-white p-2.5 shadow-xl"
          >
            {/* Month nav */}
            <div className="mb-2 flex items-center justify-between">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => changeMonth(-1)}
                className="flex h-6 w-6 items-center justify-center rounded text-[#9B9B9B] transition-colors hover:bg-[#F5F5F5] hover:text-[#0F1D24]"
              >
                <FaChevronLeft size={10} />
              </motion.button>
              <span className="text-xs font-bold text-[#0F1D24]">
                {viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => changeMonth(1)}
                className="flex h-6 w-6 items-center justify-center rounded text-[#9B9B9B] transition-colors hover:bg-[#F5F5F5] hover:text-[#0F1D24]"
              >
                <FaChevronRight size={10} />
              </motion.button>
            </div>

            {/* Weekday header */}
            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-[9px] font-semibold text-[#9B9B9B]">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const iso = toISO(new Date(year, month, d));
                const isSelected = iso === value;
                const isToday = iso === today;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => selectDay(d)}
                    className={`flex h-7 w-7 items-center justify-center rounded text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? "bg-[#0F1D24] text-[#FDC94D]"
                        : isToday
                          ? "border border-[#FDC94D] text-[#0F1D24]"
                          : "text-[#0F1D24] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    {d}
                  </motion.button>
                );
              })}
            </div>

            {/* Today shortcut */}
            <button
              type="button"
              onClick={() => selectDay(new Date().getDate())}
              className="mt-2 w-full rounded bg-[#F5F5F5] py-1 text-[10px] font-semibold text-[#0F1D24] transition-colors hover:bg-[#C6C6C6]/40"
              style={{ display: viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear() ? "block" : "none" }}
            >
              Jump to Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardFilters = ({ date, setDate, onExport }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 rounded border border-[#C6C6C6]/50 bg-white p-1.5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
          <FaChartLine className="text-[11px] text-[#FDC94D]" />
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-wide text-[#0F1D24]">
            Production Dashboard
          </h1>
          <p className="text-[9px] text-[#9B9B9B]">
            Real-time production monitoring and analytics
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <ThemedDatePicker value={date} onChange={setDate} />

        <motion.button
          onClick={onExport}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          className="flex h-8 items-center gap-1.5 rounded bg-emerald-600 px-2.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <FaDownload className="text-[11px]" />
          Export Excel
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DashboardFilters;