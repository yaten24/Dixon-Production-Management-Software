import React from "react";
import { useNavigate } from "react-router-dom";
import { FaIndustry } from "react-icons/fa";

import { hallRouteConfig } from "../../data/dashboardData";

const EFFICIENCY_TONE = {
  good: { text: "text-emerald-700", bar: "bg-emerald-600" },
  mid: { text: "text-amber-700", bar: "bg-amber-500" },
  low: { text: "text-red-700", bar: "bg-red-600" },
};

const getEfficiencyTone = (efficiency) => {
  if (efficiency >= 90) return EFFICIENCY_TONE.good;
  if (efficiency >= 70) return EFFICIENCY_TONE.mid;
  return EFFICIENCY_TONE.low;
};

// Desktop-app KPI tile: flat bordered panel, no rounded corners,
// no motion. Card height trimmed — every stat box now lays label
// and number side-by-side in one row instead of stacked, so no box
// leaves dead vertical space below the number.
const SummaryCard = ({ hall, target, actual, rejection, color, hasData = true, onClick }) => {
  const navigate = useNavigate();

  const efficiency = target === 0 ? 0 : ((actual / target) * 100).toFixed(1);
  const tone = hasData ? getEfficiencyTone(efficiency) : { text: "text-[#9B9B9B]", bar: "bg-[#C6C6C6]" };

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const match = hallRouteConfig.find((r) => r.hall === hall);
    if (match) navigate(match.route);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group relative flex w-full flex-col border bg-white text-left cursor-pointer transition-colors duration-100 hover:bg-[#FAFAFA] ${
        hasData ? "border-[#C6C6C6]" : "border-amber-300"
      }`}
    >
      <div className="relative p-2">
        {!hasData && (
          <span className="absolute right-3 top-3 border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            No Data
          </span>
        )}

        {/* Header */}
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center border text-[17px]"
            style={{
              background: hasData ? color : "#C6C6C6",
              borderColor: hasData ? color : "#C6C6C6",
              color: "#FDC94D",
            }}
          >
            <FaIndustry />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-bold leading-tight text-[#0F1D24]">{hall}</h2>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9B9B9B]">
              Production Summary
            </p>
          </div>
        </div>

        {/* Actual production — label + number in one row */}
        <div className="mb-3 flex items-center justify-between border border-[#C6C6C6] bg-[#FAFAFA] px-4 py-2">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            Actual Production
          </p>
          <p className="font-mono text-[42px] font-extrabold leading-none tabular-nums text-[#0F1D24]">
            {actual}
          </p>
        </div>

        {/* Target / Rejection — label + number in one row each */}
        <div className="mb-3 grid grid-cols-2 gap-px border border-[#C6C6C6] bg-[#C6C6C6]">
          <div className="flex items-center justify-between bg-white px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9B9B9B]">Target</p>
            <p className="font-mono text-2xl font-extrabold tabular-nums text-[#0F1D24]">{target}</p>
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9B9B9B]">Rejection</p>
            <p className="font-mono text-2xl font-extrabold tabular-nums text-red-600">{rejection}</p>
          </div>
        </div>

        {/* Efficiency */}
        <div className="border-t border-[#C6C6C6] pt-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#9B9B9B]">Efficiency</span>
            <span className={`font-mono text-2xl font-extrabold tabular-nums ${tone.text}`}>{efficiency}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden border border-[#C6C6C6] bg-[#F5F5F5]">
            <div className={`h-full ${tone.bar}`} style={{ width: `${Math.min(efficiency, 100)}%` }} />
          </div>
        </div>
      </div>
    </button>
  );
};

export default SummaryCard;