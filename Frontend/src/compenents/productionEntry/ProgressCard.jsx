import React from "react";

// Desktop-app flat bar — no rounded corners, no motion. Full width
// since a progress bar's width IS the point (unlike the summary
// cards below, it isn't a "cell" that should shrink to content).
const ProgressCard = ({ progress }) => {
  return (
    <div className="mb-1 border border-[#C6C6C6] bg-white px-3 py-1.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#0F1D24]">
          Entry Progress
        </span>
        <span className="font-mono text-xs font-bold text-[#0F1D24]">
          {progress}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden border border-[#C6C6C6] bg-[#F5F5F5]">
        <div
          className="h-full bg-[#0F1D24] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressCard;