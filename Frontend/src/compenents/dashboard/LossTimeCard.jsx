import React from "react";
import { Clock } from "lucide-react";
import { CardShell, CardLabel } from "./CardPrimitives";

const LossTimeCard = ({ className, reasons = [] }) => {
  const total = reasons.reduce((s, r) => s + r.minutes, 0);
  const max = Math.max(...reasons.map((r) => r.minutes), 1);

  return (
    <CardShell className={className}>
      <div className="flex flex-shrink-0 items-baseline justify-between">
        <CardLabel icon={Clock}>Loss Time</CardLabel>
        <span className="text-sm font-extrabold text-[#0F1D24]">{total}m</span>
      </div>
      <div className="mt-1.5 flex flex-1 flex-col justify-center gap-1">
        {reasons.map((r) => (
          <div key={r.label} className="flex items-center gap-1.5">
            <span className="w-[76px] flex-shrink-0 truncate text-[9px] text-[#0F1D24]">{r.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F5F5F5]">
              <div
                className="h-full rounded-full bg-[#FDC94D]"
                style={{ width: `${(r.minutes / max) * 100}%` }}
              />
            </div>
            <span className="w-6 flex-shrink-0 text-right text-[9px] font-semibold text-[#9B9B9B]">
              {r.minutes}m
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
};

export default LossTimeCard;