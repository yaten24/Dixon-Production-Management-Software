import React from "react";
import { FaIndustry } from "react-icons/fa";

const SummaryCard = ({ hall, target, actual, rejection, color, hasData = true, onClick }) => {
  const efficiency = target === 0 ? 0 : ((actual / target) * 100).toFixed(1);

  const effColor =
    efficiency >= 90 ? "text-emerald-600" : efficiency >= 70 ? "text-amber-600" : "text-red-600";

  const barColor =
    efficiency >= 90 ? "bg-emerald-500" : efficiency >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded border bg-white p-1.5 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer ${
        hasData ? "border-gray-100 hover:border-blue-300" : "border-amber-200 hover:border-amber-300"
      }`}
    >
      {!hasData && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
          No Data
        </span>
      )}

      <div className="mb-1.5 flex items-center gap-2">
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-white text-[11px] shadow-sm"
          style={{ background: hasData ? color : "#CBD5E1" }}
        >
          <FaIndustry />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[11px] font-semibold text-gray-800">{hall}</h2>
          <p className="text-[8px] uppercase tracking-wide text-gray-400">
            Production Summary
          </p>
        </div>
      </div>

      <div className="space-y-1 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Target</span>
          <span className="font-semibold text-gray-800">{target}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Actual</span>
          <span className="font-semibold text-blue-600">{actual}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Rejection</span>
          <span className="font-semibold text-red-500">{rejection}</span>
        </div>
      </div>

      <div className="mt-1.5 border-t border-gray-100 pt-1.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">Efficiency</span>
          <span className={`text-xs font-bold ${hasData ? effColor : "text-gray-400"}`}>
            {efficiency}%
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded ${hasData ? barColor : "bg-gray-300"} transition-all duration-300`}
            style={{ width: `${Math.min(efficiency, 100)}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default SummaryCard;