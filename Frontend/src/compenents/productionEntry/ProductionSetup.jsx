import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaIndustry,
  FaClock,
  FaLayerGroup,
  FaArrowRight,
  FaCheckCircle,
  FaCheck,
  FaChevronDown,
} from "react-icons/fa";

const HALL_OPTIONS = [
  { code: "", label: "Select Hall" },
  { code: "Hall 1", label: "Hall 1" },
  { code: "Hall 2", label: "Hall 2" },
  { code: "Hall 3", label: "Hall 3" },
  { code: "Hall 4", label: "Hall 4" },
  { code: "C 8", label: "C8" },
];

const SHIFT_OPTIONS = [
  { code: "", label: "Select Shift" },
  { code: "A", label: "Shift A" },
  { code: "B", label: "Shift B" },
];

// ==========================================================
// Local themed dropdown — navy/gold brand palette, replaces
// native <select>. Defined right here so this file has no
// external dependency on a shared component.
// ==========================================================
const ThemedDropdown = ({ value, options, onChange, ariaLabel, placeholder = "Select" }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selected = options.find((o) => o.code === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center gap-1.5 rounded border bg-white px-2.5 text-xs font-medium text-[#0F1D24] outline-none transition-all ${
          open ? "border-[#0F1D24] ring-1 ring-[#0F1D24]" : "border-[#C6C6C6] hover:border-[#0F1D24]"
        }`}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selected ? selected.label : placeholder}
        </span>
        <FaChevronDown
          className={`shrink-0 text-[9px] text-[#9B9B9B] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded border border-[#C6C6C6]/70 bg-white py-1 shadow-lg">
          {options.map((o) => {
            const isSelected = o.code === value;
            return (
              <button
                key={o.code || "empty"}
                type="button"
                onClick={() => {
                  onChange(o.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-[#0F1D24]/8 font-semibold text-[#0F1D24]"
                    : "text-[#0F1D24]/80 hover:bg-[#F5F5F5]"
                }`}
              >
                <span className="min-w-0 truncate">{o.label}</span>
                {isSelected && <FaCheck className="shrink-0 text-[9px] text-[#FDC94D]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProductionSetup = ({
  formData,
  handleChange,
  handleHallChange,
  handleShiftChange,
  shiftATimes,
  shiftBTimes,
  setSetupComplete,
}) => {
  const isComplete =
    formData.date && formData.hall && formData.shift && formData.timeSlot;

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const setDate = (value) => {
    handleChange({ target: { name: "date", value } });
  };

  const applyPreset = (preset) => {
    const today = new Date();

    if (preset === "today") {
      setDate(formatDate(today));
    }

    if (preset === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      setDate(formatDate(yesterday));
    }

    if (preset === "thisWeek") {
      const day = today.getDay(); // 0 = Sunday
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      setDate(formatDate(monday));
    }
  };

  const isPresetActive = (preset) => {
    if (!formData.date) return false;
    const today = new Date();
    const selected = formData.date;

    if (preset === "today") return selected === formatDate(today);

    if (preset === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return selected === formatDate(yesterday);
    }

    if (preset === "thisWeek") {
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      return selected === formatDate(monday);
    }

    return false;
  };

  const presets = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "thisWeek", label: "This Week" },
  ];

  const timeSlotOptions = [
    { code: "", label: "Select Time Slot" },
    ...(formData.shift === "A" ? shiftATimes : shiftBTimes).map((t) => ({
      code: t,
      label: t,
    })),
  ];

  const summaryItems = [
    { label: "Hall", value: formData.hall },
    { label: "Shift", value: formData.shift },
    { label: "Time Slot", value: formData.timeSlot },
    { label: "Date", value: formData.date },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-4xl overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm"
    >
      {/* HEADER */}
      <div className="flex items-center gap-2 border-b border-[#C6C6C6]/50 bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-3 py-2.5">
        <span className="h-1.5 w-1.5 rounded bg-[#FDC94D]" />
        <div>
          <h2 className="text-sm font-bold tracking-tight text-[#0F1D24]">
            Production Setup
          </h2>
          <p className="mt-0.5 text-xs text-[#9B9B9B]">
            Configure production details before starting entry.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* DATE */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#0F1D24]">
              <FaCalendarAlt className="text-[11px] text-[#0F1D24]" />
              Production Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="h-9 w-full rounded border border-[#C6C6C6] px-2.5 text-xs font-medium text-[#0F1D24] outline-none transition-all focus:border-[#0F1D24] focus:ring-1 focus:ring-[#0F1D24]"
            />

            {/* PRESET BUTTONS */}
            <div className="mt-1.5 flex gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset.key)}
                  className={`h-6 flex-1 rounded text-[10px] font-semibold transition-colors ${
                    isPresetActive(preset.key)
                      ? "bg-[#0F1D24] text-[#FDC94D]"
                      : "bg-[#F5F5F5] text-[#9B9B9B] hover:bg-[#C6C6C6]/40"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* HALL */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#0F1D24]">
              <FaIndustry className="text-[11px] text-[#0F1D24]" />
              Hall
            </label>
            <ThemedDropdown
              ariaLabel="Select hall"
              value={formData.hall}
              options={HALL_OPTIONS}
              onChange={(code) => handleHallChange({ target: { name: "hall", value: code } })}
              placeholder="Select Hall"
            />
          </div>

          {/* SHIFT */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#0F1D24]">
              <FaLayerGroup className="text-[11px] text-[#0F1D24]" />
              Shift
            </label>
            <ThemedDropdown
              ariaLabel="Select shift"
              value={formData.shift}
              options={SHIFT_OPTIONS}
              onChange={(code) => handleShiftChange({ target: { name: "shift", value: code } })}
              placeholder="Select Shift"
            />
          </div>

          {/* TIME SLOT */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#0F1D24]">
              <FaClock className="text-[11px] text-[#0F1D24]" />
              Time Slot
            </label>
            <ThemedDropdown
              ariaLabel="Select time slot"
              value={formData.timeSlot}
              options={timeSlotOptions}
              onChange={(code) => handleChange({ target: { name: "timeSlot", value: code } })}
              placeholder="Select Time Slot"
            />
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-4 overflow-hidden rounded border border-[#C6C6C6]/50">
          <div className="flex items-center gap-1.5 border-b border-[#C6C6C6]/50 bg-[#F5F5F5] px-3 py-2">
            <FaCheckCircle
              className={`text-[11px] transition-colors ${
                isComplete ? "text-emerald-500" : "text-[#C6C6C6]"
              }`}
            />
            <h3 className="text-xs font-semibold text-[#0F1D24]">
              Selected Configuration
            </h3>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-[#C6C6C6]/40 md:grid-cols-4 md:divide-y-0">
            {summaryItems.map((item) => (
              <div key={item.label} className="p-3">
                <p className="text-[10px] uppercase tracking-wide text-[#9B9B9B]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[#0F1D24]">
                  {item.value || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION */}
        <div className="mt-4 flex justify-end">
          <motion.button
            onClick={() => setSetupComplete(true)}
            disabled={!isComplete}
            whileHover={isComplete ? { scale: 1.02 } : {}}
            whileTap={isComplete ? { scale: 0.97 } : {}}
            className="flex h-9 items-center gap-1.5 rounded bg-[#0F1D24] px-4 text-xs font-semibold text-[#FDC94D] shadow-sm transition-colors hover:bg-[#0F1D24]/90 disabled:cursor-not-allowed disabled:bg-[#C6C6C6] disabled:text-white"
          >
            Continue
            <FaArrowRight className="text-[11px]" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductionSetup;