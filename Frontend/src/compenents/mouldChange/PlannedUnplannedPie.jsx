import React from "react";

const PlannedUnplannedPie = ({ planned = 0, unplanned = 0 }) => {
  const total = planned + unplanned;
  const plannedPercent = total > 0 ? Math.round((planned / total) * 100) : 0;
  const unplannedPercent = total > 0 ? 100 - plannedPercent : 0;

  const size = 96;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const plannedDash = (plannedPercent / 100) * circumference;

  return (
    <div className="flex items-center gap-4 px-3 py-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E4E9" strokeWidth={strokeWidth} />
          {total > 0 && (
            <>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#0F1D24"
                strokeWidth={strokeWidth}
                strokeDasharray={`${plannedDash} ${circumference - plannedDash}`}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#FDC94D"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference - plannedDash} ${plannedDash}`}
                strokeDashoffset={-plannedDash}
              />
            </>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-[#0F1D24]">{total}</span>
          <span className="text-[9px] text-[#9B9B9B]">Total</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#0F1D24]">
            <span className="h-2 w-2 rounded-sm bg-[#0F1D24]" /> Planned
          </span>
          <span className="font-medium text-[#0F1D24]">{planned} ({plannedPercent}%)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#0F1D24]">
            <span className="h-2 w-2 rounded-sm bg-[#FDC94D]" /> Unplanned
          </span>
          <span className="font-medium text-[#0F1D24]">{unplanned} ({unplannedPercent}%)</span>
        </div>
      </div>
    </div>
  );
};

export default PlannedUnplannedPie;