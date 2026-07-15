import { useState } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineSun,
  HiOutlineMoon,
} from "react-icons/hi2";
import { motion } from "framer-motion";

// Brand palette (matches QuickAccessCard):
// highlight #0F1D24 (deep navy)  — primary: icons, titles, active fills
// gray      #9B9B9B              — secondary text
// accent    #FDC94D (warm gold)  — sparing highlight: eyebrow, bar, active icon
// darken    #C6C6C6              — borders, dividers, neutral surfaces

const halls = [
  { value: "Hall 1", label: "Hall 1" },
  { value: "Hall 2", label: "Hall 2" },
  { value: "Hall 3", label: "Hall 3" },
  { value: "Hall 4", label: "Hall 4" },
  { value: "C8", label: "C-8" },
];

const shifts = [
  { code: "A", label: "Shift A", sub: "8:00 AM – 8:00 PM", icon: HiOutlineSun },
  { code: "B", label: "Shift B", sub: "8:00 PM – 8:00 AM", icon: HiOutlineMoon },
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
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded border border-[#C6C6C6]/50 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_28px_-8px_rgba(15,29,36,0.10)] overflow-hidden"
      >
        <div className="h-[3px] bg-[#FDC94D]" />

        <div className="px-6 pt-6 pb-5 border-b border-[#C6C6C6]/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0F1D24] text-[#FDC94D] shadow-sm ring-4 ring-[#0F1D24]/5">
              <HiOutlineCalendarDays className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-[#9B9B9B] tracking-wide uppercase">
              Dixon PMS
            </span>
          </div>
          <h1 className="text-base font-bold tracking-tight text-[#0F1D24]">Daily Production Planning</h1>
          <p className="mt-1 text-xs font-medium text-[#9B9B9B]">
            Select date, hall and shift to begin planning
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-[#0F1D24] flex items-center gap-1.5 mb-1.5">
              <HiOutlineCalendarDays className="text-[#9B9B9B] w-3.5 h-3.5" /> Planning Date
            </label>
            <input
              type="date"
              value={form.planning_date}
              onChange={(e) => handleChange("planning_date", e.target.value)}
              className="w-full h-9 rounded border border-[#C6C6C6]/60 px-3 text-sm font-mono text-[#0F1D24] focus:outline-none focus:ring-2 focus:ring-[#FDC94D]/40 focus:border-[#0F1D24] transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0F1D24] flex items-center gap-1.5 mb-1.5">
              <HiOutlineBuildingOffice2 className="text-[#9B9B9B] w-3.5 h-3.5" /> Hall
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {halls.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => handleChange("hall", h.value)}
                  className={`h-9 rounded border text-xs font-semibold transition-all ${
                    form.hall === h.value
                      ? "bg-[#0F1D24] text-[#FDC94D] border-[#0F1D24] shadow-sm"
                      : "border-[#C6C6C6]/60 text-[#0F1D24] hover:border-[#0F1D24]/40 hover:bg-[#F5F5F5]"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0F1D24] flex items-center gap-1.5 mb-1.5">
              <HiOutlineClock className="text-[#9B9B9B] w-3.5 h-3.5" /> Shift
            </label>
            <div className="grid grid-cols-2 gap-2">
              {shifts.map((s) => {
                const Icon = s.icon;
                const active = form.shift === s.code;
                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => handleChange("shift", s.code)}
                    className={`rounded border px-3 py-2.5 text-left transition-all flex items-start gap-2 ${
                      active
                        ? "bg-[#0F1D24] border-[#0F1D24] shadow-sm"
                        : "border-[#C6C6C6]/60 hover:border-[#0F1D24]/40 hover:bg-[#F5F5F5]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? "text-[#FDC94D]" : "text-[#9B9B9B]"}`} />
                    <div>
                      <p className={`text-xs font-bold ${active ? "text-white" : "text-[#0F1D24]"}`}>
                        {s.label}
                      </p>
                      <p className={`text-[10px] font-mono mt-0.5 ${active ? "text-[#FDC94D]/80" : "text-[#9B9B9B]"}`}>
                        {s.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <motion.button
            disabled={!isValid || loading}
            onClick={() => onStart(form)}
            whileTap={{ scale: 0.98 }}
            className="w-full h-10 rounded bg-[#0F1D24] hover:bg-[#0F1D24]/90 disabled:opacity-40 disabled:cursor-not-allowed text-[#FDC94D] text-sm font-bold mt-1 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#FDC94D]/30 border-t-[#FDC94D] rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              <>
                Continue <HiOutlineArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanningSetup;