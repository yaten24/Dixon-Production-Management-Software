import React from "react";
import { CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { CardShell, CardLabel } from "./CardPrimitives";
import { pct } from "../../utils/dashboardMath";

const achievementColor = (achievement) => {
  if (achievement >= 100) return { text: "text-emerald-600", bar: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (achievement >= 75) return { text: "text-[#FDC94D]", bar: "bg-[#FDC94D]", bg: "bg-[#FDC94D]/10", border: "border-[#FDC94D]/30" };
  return { text: "text-red-500", bar: "bg-red-500", bg: "bg-red-50", border: "border-red-200" };
};

const ShiftWiseCard = ({ className, shifts = [] }) => (
  <CardShell className={`flex min-h-0 flex-col [container-type:inline-size] ${className || ""}`}>
    <CardLabel icon={CalendarDays}>
      <span className="text-[clamp(11px,3.8cqw,15px)]">Shift-wise Target</span>
    </CardLabel>

    <div className="mt-2 flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-y-auto">
      {shifts.map((s) => {
        const achievement = pct(s.actual, s.target);
        const remaining = Math.max(s.target - s.actual, 0);
        const colors = achievementColor(achievement);
        const TrendIcon = achievement >= 100 ? TrendingUp : TrendingDown;

        return (
          <div
            key={s.label}
            className={`flex-shrink-0 rounded-sm border ${colors.border} ${colors.bg} px-2.5 py-1.5`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[clamp(10px,3.2cqw,13px)] font-bold text-[#0F1D24]">
                {s.label}
              </span>
              <span className={`flex items-center gap-1 text-[clamp(12px,4cqw,16px)] font-extrabold ${colors.text}`}>
                <TrendIcon size={12} className="flex-shrink-0" />
                {achievement}%
              </span>
            </div>

            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white">
              <div
                className={`h-full rounded-full ${colors.bar} transition-all`}
                style={{ width: `${Math.min(achievement, 100)}%` }}
              />
            </div>

            <div className="mt-1 grid grid-cols-3 gap-1 text-center">
              <div>
                <p className="text-[clamp(6.5px,2cqw,8.5px)] font-medium uppercase tracking-wide text-[#9B9B9B]">Target</p>
                <p className="text-[clamp(9px,3cqw,12px)] font-bold text-[#0F1D24]">
                  {s.target.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[clamp(6.5px,2cqw,8.5px)] font-medium uppercase tracking-wide text-[#9B9B9B]">Actual</p>
                <p className={`text-[clamp(9px,3cqw,12px)] font-bold ${colors.text}`}>
                  {s.actual.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[clamp(6.5px,2cqw,8.5px)] font-medium uppercase tracking-wide text-[#9B9B9B]">Remaining</p>
                <p className="text-[clamp(9px,3cqw,12px)] font-bold text-[#0F1D24]">
                  {remaining.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </CardShell>
);

export default ShiftWiseCard;