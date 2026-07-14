import { useState } from "react";
import { HiOutlineCalendarDays, HiOutlineBuildingOffice2, HiOutlineClock } from "react-icons/hi2";
import { motion } from "framer-motion";

const halls = [
  { value: "Hall 1", label: "Hall 1" },
  { value: "Hall 2", label: "Hall 2" },
  { value: "Hall 3", label: "Hall 3" },
  { value: "Hall 4", label: "Hall 4" },
  { value: "C8", label: "C-8" }, // ⚠️ DB stores "C8" — display label kept "C-8" for readability
];

const shifts = [
  { code: "A", label: "Shift A" },
  { code: "B", label: "Shift B" },
];

const PlanningSetup = ({ onStart, loading }) => {
  const [form, setForm] = useState({
    planning_date: new Date().toISOString().split("T")[0],
    hall: "",
    shift: "",
  });

  const isValid = form.planning_date && form.hall && form.shift;
  const handleChange = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white rounded-sm border border-[#E2E4E9] shadow-sm"
      >
        <div className="border-b border-[#E2E4E9] px-5 py-4">
          <h1 className="text-base font-semibold text-gray-800">Daily Production Planning</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Select date, hall and shift to begin planning
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1.5">
              <HiOutlineCalendarDays className="text-gray-400" /> Planning Date
            </label>
            <input
              type="date"
              value={form.planning_date}
              onChange={(e) => handleChange("planning_date", e.target.value)}
              className="w-full h-9 rounded-sm border border-[#E2E4E9] px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1.5">
              <HiOutlineBuildingOffice2 className="text-gray-400" /> Hall
            </label>
            <select
              value={form.hall}
              onChange={(e) => handleChange("hall", e.target.value)}
              className="w-full h-9 rounded-sm border border-[#E2E4E9] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="">Select Hall</option>
              {halls.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1.5">
              <HiOutlineClock className="text-gray-400" /> Shift
            </label>
            <div className="grid grid-cols-2 gap-2">
              {shifts.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => handleChange("shift", s.code)}
                  className={`h-9 rounded-sm border text-xs font-medium transition-colors ${
                    form.shift === s.code
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "border-[#E2E4E9] text-gray-600 hover:border-[#2563EB]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!isValid || loading}
            onClick={() => onStart(form)}
            className="w-full h-9 rounded-sm bg-[#2563EB] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold mt-2"
          >
            {loading ? "Loading..." : "Continue"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanningSetup;