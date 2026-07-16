import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Themed to match navy #0F1D24 / gold #FDC94D / gray #9B9B9B / border #C6C6C6
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

const toISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseISO = (value) => {
  if (!value) return new Date();
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDisplay = (value) => {
  const d = parseISO(value);
  return `${d.getDate()} ${monthNames[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const CustomDatePicker = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(parseISO(value));
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setViewDate(parseISO(value));
  }, [open, value]);

  const selected = parseISO(value);
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const pickDay = (day) => {
    onChange(toISO(day));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-[10px] font-semibold text-[#9B9B9B] mb-1 block uppercase tracking-wide">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-7 border rounded pl-7 pr-2 text-[11px] flex items-center relative transition ${
          open
            ? "border-[#0F1D24] ring-1 ring-[#0F1D24]"
            : "border-[#C6C6C6]/60 hover:border-[#0F1D24]/40"
        }`}
      >
        <Calendar className="absolute left-2.5 text-[#9B9B9B]" size={12} />
        <span className="text-[#0F1D24] font-medium">{formatDisplay(value)}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1 w-64 bg-white border border-[#C6C6C6]/50 rounded shadow-[0_8px_20px_-6px_rgba(15,29,36,0.18)] p-2.5"
          >
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={goPrevMonth}
                className="h-6 w-6 rounded hover:bg-[#FAFAF9] flex items-center justify-center text-[#0F1D24]"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-[11px] font-bold text-[#0F1D24]">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={goNextMonth}
                className="h-6 w-6 rounded hover:bg-[#FAFAF9] flex items-center justify-center text-[#0F1D24]"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {weekDays.map((w, i) => (
                <div
                  key={i}
                  className="h-6 flex items-center justify-center text-[9px] font-semibold text-[#9B9B9B]"
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                if (!day) return <div key={i} className="h-7" />;

                const isSelected = isSameDay(day, selected);
                const isToday = isSameDay(day, today);

                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => pickDay(day)}
                    className={`h-7 rounded text-[10px] flex items-center justify-center transition ${
                      isSelected
                        ? "bg-[#0F1D24] text-[#FDC94D] font-semibold"
                        : isToday
                        ? "border border-[#FDC94D] text-[#0F1D24] font-semibold"
                        : "text-[#0F1D24] hover:bg-[#FAFAF9]"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                onChange(toISO(today));
                setOpen(false);
              }}
              className="w-full mt-2 h-6 rounded border border-[#C6C6C6]/60 hover:bg-[#FAFAF9] text-[10px] font-semibold text-[#0F1D24] transition"
            >
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;