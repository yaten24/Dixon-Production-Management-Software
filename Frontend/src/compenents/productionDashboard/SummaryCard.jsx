import React from "react";
import { motion } from "framer-motion";
import { FaIndustry } from "react-icons/fa";

const SummaryCard = ({ hall, target, actual, rejection, color, hasData = true, onClick }) => {
  const efficiency = target === 0 ? 0 : ((actual / target) * 100).toFixed(1);

  const effColor =
    efficiency >= 90 ? "text-emerald-600" : efficiency >= 70 ? "text-amber-600" : "text-red-600";

  const barColor =
    efficiency >= 90 ? "bg-emerald-500" : efficiency >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`relative w-full cursor-pointer overflow-hidden rounded border bg-white p-2 text-left shadow-sm transition-shadow duration-200 hover:shadow-md ${
        hasData ? "border-[#C6C6C6]/50 hover:border-[#0F1D24]/30" : "border-amber-200 hover:border-amber-300"
      }`}
    >
      {!hasData && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
          No Data
        </span>
      )}

      <div className="mb-1.5 flex items-center gap-2">
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-[11px] shadow-sm"
          style={{ background: hasData ? color : "#C6C6C6", color: hasData ? "#FDC94D" : "#fff" }}
        >
          <FaIndustry />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[11px] font-bold text-[#0F1D24]">{hall}</h2>
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">
            Production Summary
          </p>
        </div>
      </div>

      {/* ACTUAL — most valuable number, given the most visual weight */}
      <div className="mb-1.5 rounded bg-[#0F1D24]/[0.03] px-2 py-1.5">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
          Actual Production
        </p>
        <motion.p
          key={actual}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="mt-0.5 font-mono text-xl font-extrabold leading-none text-[#0F1D24]"
        >
          {actual}
        </motion.p>
      </div>

      {/* Secondary metrics — smaller, contextual */}
      <div className="space-y-1 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Target</span>
          <span className="font-semibold text-[#0F1D24]">{target}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Rejection</span>
          <span className="font-semibold text-red-600">{rejection}</span>
        </div>
      </div>

      <div className="mt-1.5 border-t border-[#C6C6C6]/40 pt-1.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-[#9B9B9B]">Efficiency</span>
          <span className={`text-xs font-bold ${hasData ? effColor : "text-[#9B9B9B]"}`}>
            {efficiency}%
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#C6C6C6]/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(efficiency, 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded ${hasData ? barColor : "bg-[#C6C6C6]"}`}
          />
        </div>
      </div>
    </motion.button>
  );
};

export default SummaryCard;