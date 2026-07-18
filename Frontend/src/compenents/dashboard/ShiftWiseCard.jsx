import React from "react";
import { CalendarDays } from "lucide-react";
import { CardShell, CardLabel } from "./CardPrimitives";
import { pct } from "../../utils/dashboardMath";

const ShiftWiseCard = ({ className, shifts = [] }) => (
  <CardShell className={className}>
    <CardLabel icon={CalendarDays}>Shift-wise Target</CardLabel>
    <div className="mt-1.5 flex flex-1 flex-col justify-center gap-2.5">
      {shifts.map((s) => {
        const achievement = pct(s.actual, s.target);
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold text-[#0F1D24]">{s.label}</span>
              <span className="text-[11px] font-bold text-[#0F1D24]">{achievement}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F5F5F5]">
              <div
                className="h-full rounded-full bg-[#FDC94D] transition-all"
                style={{ width: `${Math.min(achievement, 100)}%` }}
              />
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[9px] text-[#9B9B9B]">
              <span>{s.actual.toLocaleString("en-IN")} actual</span>
              <span>{s.target.toLocaleString("en-IN")} target</span>
            </div>
          </div>
        );
      })}
    </div>
  </CardShell>
);

export default ShiftWiseCard;