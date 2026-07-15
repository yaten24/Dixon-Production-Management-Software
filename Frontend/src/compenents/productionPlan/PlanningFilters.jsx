import { HiOutlineArrowPath, HiOutlineCalendarDays, HiOutlineBuildingOffice2, HiOutlineClock } from "react-icons/hi2";
import { motion } from "framer-motion";
import ThemedDropdown from "../common/ThemedDropdown";

const PlanningFilters = ({ filters, halls, shifts, onChange, onLoad, loading }) => {
  const hallOptions = halls.map((h) => ({ code: h, label: h }));
  const shiftOptions = shifts.map((s) => ({ code: s, label: s }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-xl border border-[#C6C6C6]/50 bg-white p-3 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-4">
        {/* Planning Date */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-[#9B9B9B]">
            <HiOutlineCalendarDays className="h-3.5 w-3.5 text-[#0F1D24]" />
            Planning Date
          </label>
          <input
            type="date"
            value={filters.planningDate}
            onChange={(e) => onChange("planningDate", e.target.value)}
            className="h-9 w-full rounded border border-[#C6C6C6] px-2.5 text-xs font-medium text-[#0F1D24] outline-none transition-colors focus:border-[#0F1D24] focus:ring-2 focus:ring-[#0F1D24]/10"
          />
        </div>

        {/* Hall */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-[#9B9B9B]">
            <HiOutlineBuildingOffice2 className="h-3.5 w-3.5 text-[#0F1D24]" />
            Hall
          </label>
          <ThemedDropdown
            value={filters.hall}
            options={[{ code: "", label: "Select Hall" }, ...hallOptions]}
            onChange={(v) => onChange("hall", v)}
            ariaLabel="Select hall"
            placeholder="Select Hall"
          />
        </div>

        {/* Shift */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-[#9B9B9B]">
            <HiOutlineClock className="h-3.5 w-3.5 text-[#0F1D24]" />
            Shift
          </label>
          <ThemedDropdown
            value={filters.shift}
            options={[{ code: "", label: "Select Shift" }, ...shiftOptions]}
            onChange={(v) => onChange("shift", v)}
            ariaLabel="Select shift"
            placeholder="Select Shift"
          />
        </div>

        {/* Load button */}
        <div className="flex items-end">
          <motion.button
            onClick={onLoad}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded bg-[#0F1D24] text-xs font-semibold text-[#FDC94D] transition-all duration-200 hover:bg-[#0F1D24]/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <motion.span
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { duration: 0.7, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
              className="flex"
            >
              <HiOutlineArrowPath className="h-3.5 w-3.5" />
            </motion.span>
            {loading ? "Loading..." : "Load Planning"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanningFilters;