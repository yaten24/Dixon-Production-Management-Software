import React, { useEffect, useMemo, useRef, useState } from "react";
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

// Fully custom, theme-matched calendar dropdown — flat bordered
// desktop-app style, no motion, sharp corners throughout.
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
        className={`flex h-7 flex-shrink-0 items-center gap-1.5 border bg-white px-2 text-[11px] font-medium text-[#0F1D24] transition-colors duration-100 ${
          open ? "border-[#0F1D24]" : "border-[#C6C6C6] hover:border-[#0F1D24]"
        }`}
      >
        <FaCalendarAlt className="text-[10px] text-[#0F1D24]" />
        <span className="whitespace-nowrap">{formatDisplay(selectedKey)}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-50 w-60 border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
          <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-[#0F1D24] px-2 py-1.5">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-5 w-5 items-center justify-center border border-[#FDC94D]/0 text-[#FDC94D] transition-colors duration-100 hover:bg-white/10"
            >
              <FaChevronLeft size={9} />
            </button>
            <span className="text-[11px] font-bold text-white">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-5 w-5 items-center justify-center text-[#FDC94D] transition-colors duration-100 hover:bg-white/10"
            >
              <FaChevronRight size={9} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 border-b border-[#C6C6C6] bg-white px-1.5 pt-1.5 pb-1">
            {WEEKDAYS.map((w, i) => (
              <div
                key={`${w}-${i}`}
                className={`flex h-5 items-center justify-center text-[9px] font-bold ${
                  i === 0 || i === 6 ? "text-[#FDC94D]" : "text-[#9B9B9B]"
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 px-1.5 py-1.5">
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
                  className={`flex h-6 w-6 items-center justify-center border text-[10px] font-semibold transition-colors duration-100 ${
                    isSelected
                      ? "border-[#0F1D24] bg-[#0F1D24] text-[#FDC94D]"
                      : isTodayCell
                      ? "border-[#FDC94D] text-[#0F1D24]"
                      : "border-transparent text-[#0F1D24] hover:bg-[#FDC94D]/20"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[#C6C6C6] bg-[#FAFAFA] px-2 py-1.5">
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              className="text-[10px] font-bold text-[#0F1D24] hover:text-[#FDC94D]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[10px] font-semibold text-[#9B9B9B] hover:text-[#0F1D24]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Small vertical rule used to group related actions.
const Divider = ({ className = "" }) => <div className={`h-5 w-px flex-shrink-0 bg-[#C6C6C6] ${className}`} />;

const ActionButton = ({ onClick, icon: Icon, label, tone = "default", disabled, spinning, title }) => {
  const toneClass =
    tone === "primary"
      ? "border border-[#0F1D24] bg-[#0F1D24] text-[#FDC94D] hover:bg-white hover:text-[#0F1D24]"
      : tone === "danger"
      ? "border border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
      : "border border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24] hover:bg-[#F5F5F5]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 flex-shrink-0 items-center gap-1.5 px-2 text-[11px] font-semibold transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      <Icon size={10} className={spinning ? "animate-spin" : ""} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};

// ============================================================
// Proper page header — identity + filters, all in a single row.
// Flat bordered desktop toolbar, sharp corners, no motion.
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
    <div className="flex min-h-11 flex-shrink-0 flex-wrap items-center gap-2 border border-[#C6C6C6] bg-white px-3 py-1.5">
      {/* Back */}
      {onBack && (
        <>
          <button
            type="button"
            onClick={onBack}
            title="Back"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
          >
            <FaArrowLeft size={12} />
          </button>
          <Divider />
        </>
      )}

      {/* Identity */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#0F1D24] bg-[#0F1D24]">
        <FaChartLine className="text-xs text-[#FDC94D]" />
      </div>
      <div className="hidden min-w-0 leading-tight sm:block">
        <p className="text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{eyebrow}</p>
        <h1 className="truncate text-[12.5px] font-bold text-[#0F1D24]">{title}</h1>
      </div>

      {loading && (
        <span className="flex flex-shrink-0 items-center gap-1 text-[9px] font-semibold text-[#9B9B9B]">
          <span className="h-1.5 w-1.5 border border-[#FDC94D] bg-[#FDC94D]" />
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
    </div>
  );
};

export default DashboardFilters;