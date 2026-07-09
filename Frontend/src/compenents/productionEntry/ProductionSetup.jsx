import React from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaIndustry,
  FaClock,
  FaLayerGroup,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

const ProductionSetup = ({
  formData,
  handleChange,
  handleHallChange,
  handleShiftChange,
  shiftATimes,
  shiftBTimes,
  setSetupComplete,
}) => {
  const inputClass = `
    w-full
    h-9
    px-2.5
    text-xs
    bg-white
    border
    border-slate-300
    rounded
    outline-none
    focus:border-blue-500
    focus:ring-1
    focus:ring-blue-500
    transition-all
  `;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="max-w-4xl mx-auto rounded border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      {/* HEADER */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-white p-2">
        <h2 className="text-sm font-bold text-slate-800">
          Production Setup
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure production details before starting entry.
        </p>
      </div>

      {/* FORM */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* DATE */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <FaCalendarAlt className="text-blue-600 text-[11px]" />
              Production Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={inputClass}
            />

            {/* PRESET BUTTONS */}
            <div className="flex gap-1 mt-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset.key)}
                  className={`flex-1 h-6 rounded text-[10px] font-medium transition-colors ${
                    isPresetActive(preset.key)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* HALL */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <FaIndustry className="text-blue-600 text-[11px]" />
              Hall
            </label>
            <select
              name="hall"
              value={formData.hall}
              onChange={handleHallChange}
              className={inputClass}
            >
              <option value="">Select Hall</option>
              <option value="Hall 1">Hall 1</option>
              <option value="Hall 2">Hall 2</option>
              <option value="Hall 3">Hall 3</option>
              <option value="Hall 4">Hall 4</option>
              <option value="C 8">C8</option>
            </select>
          </div>

          {/* SHIFT */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <FaLayerGroup className="text-blue-600 text-[11px]" />
              Shift
            </label>
            <select
              name="shift"
              value={formData.shift}
              onChange={handleShiftChange}
              className={inputClass}
            >
              <option value="">Select Shift</option>
              <option value="A">Shift A</option>
              <option value="B">Shift B</option>
            </select>
          </div>

          {/* TIME SLOT */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <FaClock className="text-blue-600 text-[11px]" />
              Time Slot
            </label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Time Slot</option>
              {(formData.shift === "A" ? shiftATimes : shiftBTimes).map(
                (time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-4 rounded border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 border-b border-slate-200">
            <FaCheckCircle
              className={`text-[11px] ${
                isComplete ? "text-emerald-500" : "text-slate-300"
              }`}
            />
            <h3 className="text-xs font-semibold text-slate-700">
              Selected Configuration
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Hall
              </p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {formData.hall || "-"}
              </p>
            </div>

            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Shift
              </p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {formData.shift || "-"}
              </p>
            </div>

            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Time Slot
              </p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {formData.timeSlot || "-"}
              </p>
            </div>

            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Date
              </p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {formData.date || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end mt-4">
          <motion.button
            onClick={() => setSetupComplete(true)}
            disabled={!isComplete}
            whileHover={isComplete ? { scale: 1.02 } : {}}
            whileTap={isComplete ? { scale: 0.97 } : {}}
            className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
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