import React from "react";
import { FaIndustry } from "react-icons/fa";

const SummaryCard = ({ hall, target, actual, rejection, color }) => {
  const efficiency =
    target === 0 ? 0 : ((actual / target) * 100).toFixed(1);

  const effColor =
    efficiency >= 90
      ? "text-emerald-600"
      : efficiency >= 70
      ? "text-amber-600"
      : "text-red-600";

  const barColor =
    efficiency >= 90
      ? "bg-emerald-500"
      : efficiency >= 70
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="rounded border border-gray-100 bg-white p-2 shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* Header */}
      <div className="mb-2 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-white text-sm shadow-sm"
          style={{ background: color }}
        >
          <FaIndustry />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-800">
            {hall}
          </h2>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Production Summary
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1.5 text-xs">
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

      {/* Efficiency */}
      <div className="mt-2.5 border-t border-gray-100 pt-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-gray-500">Efficiency</span>
          <span className={`text-sm font-bold ${effColor}`}>
            {efficiency}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(efficiency, 100)}%` }}
          />
        </div>
      </div>

    </div>
  );
};

export default SummaryCard;