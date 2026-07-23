import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaIndustry } from "react-icons/fa";

import { hallRouteConfig } from "../../data/dashboardData"; // fixed: was "../../data/dashboardData" pointing nowhere useful before; now correctly resolves to the file that actually exports hallRouteConfig

const EFFICIENCY_TONE = {
  good: { text: "text-emerald-600", bar: "#10b981", glow: "rgba(16,185,129,0.14)" },
  mid: { text: "text-amber-600", bar: "#f59e0b", glow: "rgba(245,158,11,0.16)" },
  low: { text: "text-red-600", bar: "#ef4444", glow: "rgba(239,68,68,0.14)" },
};

const getEfficiencyTone = (efficiency) => {
  if (efficiency >= 90) return EFFICIENCY_TONE.good;
  if (efficiency >= 70) return EFFICIENCY_TONE.mid;
  return EFFICIENCY_TONE.low;
};

const SummaryCard = ({ hall, target, actual, rejection, color, hasData = true, onClick }) => {
  const navigate = useNavigate();

  const efficiency = target === 0 ? 0 : ((actual / target) * 100).toFixed(1);
  const tone = hasData ? getEfficiencyTone(efficiency) : { text: "text-[#9B9B9B]", bar: "#C6C6C6", glow: "rgba(155,155,155,0.1)" };

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const match = hallRouteConfig.find((r) => r.hall === hall);
    if (match) navigate(match.route);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`group relative w-full cursor-pointer overflow-hidden rounded border bg-white p-2.5 text-left shadow-[0_1px_2px_rgba(15,29,36,0.05)] transition-shadow duration-300 hover:shadow-[0_16px_30px_-12px_rgba(15,29,36,0.25)] ${
        hasData ? "border-[#C6C6C6]/50 hover:border-transparent" : "border-amber-200 hover:border-amber-300"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: tone.glow }}
      />

      <FaIndustry
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3 -right-2 text-[64px] opacity-[0.05] transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.08]"
        style={{ color: hasData ? color : "#9B9B9B" }}
      />

      {!hasData && (
        <span className="absolute right-2 top-2 z-10 rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
          No Data
        </span>
      )}

      <div className="relative mb-1.5 flex items-center gap-2">
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-[12px] shadow-[0_4px_10px_-2px_rgba(15,29,36,0.35)] transition-transform duration-300 group-hover:scale-105"
          style={{
            background: hasData ? `linear-gradient(135deg, ${color}, #0F1D24)` : "#C6C6C6",
            color: hasData ? "#FDC94D" : "#fff",
          }}
        >
          <FaIndustry />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[11.5px] font-bold text-[#0F1D24]">{hall}</h2>
          <p className="flex items-center gap-1 text-[8px] uppercase tracking-wide text-[#9B9B9B]">
            <span className="h-1 w-1 flex-shrink-0 rounded" style={{ background: hasData ? color : "#C6C6C6" }} />
            Production Summary
          </p>
        </div>
      </div>

      <div className="relative mb-1.5 rounded bg-[#0F1D24]/[0.03] px-2 py-1.5">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
          Actual Production
        </p>
        <motion.p
          key={actual}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="mt-0.5 font-mono text-xl font-extrabold leading-none tabular-nums text-[#0F1D24]"
        >
          {actual}
        </motion.p>
      </div>

      <div className="relative text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Target</span>
          <span className="font-semibold tabular-nums text-[#0F1D24]">{target}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Rejection</span>
          <span className="font-semibold tabular-nums text-red-600">{rejection}</span>
        </div>
      </div>

      <div className="relative mt-1.5 border-t border-[#C6C6C6]/40 pt-1.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-[#9B9B9B]">Efficiency</span>
          <span className={`text-xs font-bold tabular-nums ${tone.text}`}>{efficiency}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded bg-[#C6C6C6]/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(efficiency, 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded"
            style={{ background: tone.bar }}
          />
        </div>
      </div>
    </motion.button>
  );
};

export default SummaryCard;