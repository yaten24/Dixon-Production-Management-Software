import React from "react";
import { FaTrophy } from "react-icons/fa";

const TopPerformerBanner = ({ topPerformers = [] }) => {
  if (!topPerformers.length) return null;

  const best = topPerformers[0];

  return (
    <div className="flex items-center justify-between gap-3 rounded border border-amber-200 bg-amber-50 px-3 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <FaTrophy size={13} />
        </span>
        <p className="text-xs text-amber-800 truncate">
          Top Performer: <span className="font-semibold">{best.operator_name}</span> ({best.operator_code}) —{" "}
          <span className="font-semibold">{best.performance}%</span> completion, {best.hall}, Shift {best.shift}
        </p>
      </div>

      {topPerformers.length > 1 && (
        <span className="shrink-0 text-[10px] text-amber-700">+{topPerformers.length - 1} more in top list</span>
      )}
    </div>
  );
};

export default TopPerformerBanner;
