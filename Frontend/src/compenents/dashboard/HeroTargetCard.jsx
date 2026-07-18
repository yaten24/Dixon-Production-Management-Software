import React from "react";
import { Target } from "lucide-react";
import { CardLabel } from "./CardPrimitives";
import { pct } from "../../utils/dashboardMath";

const HeroTargetCard = ({ className, target, actual, good, reject }) => {
  const achievement = pct(actual, target);
  const goodPct = pct(good, actual);
  const rejectPct = pct(reject, actual);

  return (
    <div
      className={`flex min-h-0 flex-col justify-between rounded-sm bg-[#0F1D24] p-3 text-white shadow-sm ${className}`}
    >
      <CardLabel icon={Target} tone="text-[#FDC94D]/90">
        Today&apos;s Overall Target
      </CardLabel>

      <div className="flex flex-1 flex-col justify-center py-1">
        <span className="text-4xl font-extrabold leading-none text-[#FDC94D]">
          {achievement}%
        </span>
        <span className="mt-1 text-[10px] text-white/60">Achieved of daily target</span>
      </div>

      <div className="flex-shrink-0 space-y-1.5">
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="text-white/70">Target</span>
          <span className="font-bold">{target.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="text-white/70">Actual</span>
          <span className="font-bold">{actual.toLocaleString("en-IN")}</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#FDC94D] transition-all"
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-0.5 text-[9px] font-semibold text-white/70">
          <span>Good {goodPct}%</span>
          <span>Reject {rejectPct}%</span>
        </div>
      </div>
    </div>
  );
};

export default HeroTargetCard;