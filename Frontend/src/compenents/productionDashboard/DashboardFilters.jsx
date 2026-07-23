import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaDownload,
  FaChartLine,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaFilter,
  FaSyncAlt,
  FaUndo,
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
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-7 flex-shrink-0 items-center gap-1.5 border bg-white px-2 text-[11px] font-medium text-[#0F1D24] transition-colors ${
          open ? "border-[#0F1D24]" : "border-[#C6C6C6] hover:border-[#0F1D24]/60"
        }`}
      >
        <FaCalendarAlt className="text-[10px] text-[#0F1D24]" />
        <span className="whitespace-nowrap">{formatDisplay(selectedKey)}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-9 z-50 w-60 overflow-hidden border border-[#C6C6C6]/60 bg-white shadow-xl"
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
                  className={`flex h-5 items-center justify-center text-[9px] font-semibold ${
                    i === 0 || i === 6 ? "text-[#FDC94D]" : "text-[#9B9B9B]"
                  }`}
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
                const isTodayCell = key === todayKey;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleSelect(date)}
                    className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold transition-colors ${
                      isSelected
                        ? "bg-[#FDC94D] text-[#0F1D24]"
                        : isTodayCell
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

// Small vertical rule used to group related actions.
const Divider = ({ className = "" }) => <div className={`h-5 w-px flex-shrink-0 bg-[#C6C6C6] ${className}`} />;

const ActionButton = ({ onClick, icon: Icon, label, tone = "default", disabled, spinning, title }) => {
  const toneClass =
    tone === "primary"
      ? "bg-[#0F1D24] text-[#FDC94D] hover:bg-[#0F1D24]/90"
      : tone === "danger"
      ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      : "border border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24]/60 hover:bg-[#F5F5F5]";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={`flex h-7 flex-shrink-0 items-center gap-1.5 px-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
    >
      <Icon size={10} className={spinning ? "animate-spin" : ""} />
      <span className="hidden md:inline">{label}</span>
    </motion.button>
  );
};

// ============================================================
// Proper page header — identity + filters, all in a single row.
// Wraps gracefully on narrower widths but stays one logical row
// on desktop instead of stacking into two bands.
// ============================================================
const DashboardFilters = ({
  date,
  setDate,
  onExport,
  onBack,
  onApply,
  onRefresh,
  onReset,
  loading = false,
  eyebrow = "Production Dashboard",
  title = "Daily Production Overview",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex min-h-11 flex-shrink-0 flex-wrap items-center gap-2 border border-[#C6C6C6]/50 bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(15,29,36,0.05)]"
    >
      {/* Back */}
      {onBack && (
        <>
          <motion.button
            type="button"
            onClick={onBack}
            title="Back"
            whileHover={{ x: -1 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24] hover:bg-[#F5F5F5]"
          >
            <FaArrowLeft size={12} />
          </motion.button>
          <Divider />
        </>
      )}

      {/* Identity */}
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center shadow-[0_4px_10px_-2px_rgba(15,29,36,0.35)]"
        style={{ background: "linear-gradient(135deg, #1a2e38, #0F1D24)" }}
      >
        <FaChartLine className="text-xs text-[#FDC94D]" />
      </div>
      <div className="hidden min-w-0 leading-tight sm:block">
        <p className="text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{eyebrow}</p>
        <h1 className="truncate text-[12.5px] font-bold text-[#0F1D24]">{title}</h1>
      </div>

      {loading && (
        <span className="flex flex-shrink-0 items-center gap-1 text-[9px] font-medium text-[#9B9B9B]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FDC94D] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FDC94D]" />
          </span>
          Syncing…
        </span>
      )}

      <Divider className="hidden sm:block" />

      {/* Filters */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5">
        <CustomDatePicker value={date} onChange={setDate} />

        {onApply && (
          <ActionButton onClick={onApply} icon={FaFilter} label="Apply" tone="primary" title="Apply selected filters" />
        )}

        {onRefresh && (
          <ActionButton
            onClick={onRefresh}
            icon={FaSyncAlt}
            label="Refresh"
            disabled={loading}
            spinning={loading}
            title="Refresh data"
          />
        )}

        {onReset && <ActionButton onClick={onReset} icon={FaUndo} label="Reset" tone="danger" title="Reset filters" />}
      </div>

      {/* Push export to the far right, everything else stays left-grouped */}
      <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
        {date && (
          <span className="hidden text-[10px] font-medium text-[#9B9B9B] lg:block">
            Viewing <span className="font-semibold text-[#0F1D24]">{formatDisplay(date)}</span>
          </span>
        )}
        {onExport && (
          <ActionButton onClick={onExport} icon={FaDownload} label="Export Excel" tone="primary" title="Export to Excel" />
        )}
      </div>
    </motion.div>
  );
};

export default DashboardFilters;