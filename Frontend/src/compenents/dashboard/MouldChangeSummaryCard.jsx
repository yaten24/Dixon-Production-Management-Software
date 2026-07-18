import React from "react";
import { Wrench, ListChecks } from "lucide-react";
import { CardShell, CardLabel } from "./CardPrimitives";
import { pct } from "../../utils/dashboardMath";

const MouldChangeSummaryCard = ({
  className,
  icon = Wrench,
  title = "Mould Change Summary",
  planned = 0,
  unplanned = 0,
  completed = 0,
  pending = 0,
  avgChangeTime = 0,
  footer,
}) => {
  const total = planned + unplanned;
  const plannedPct = pct(planned, total);
  const unplannedPct = pct(unplanned, total);
  const completedPct = pct(completed, total);

  const unplannedTone = unplannedPct <= 20 ? "text-emerald-600" : unplannedPct <= 40 ? "text-[#FDC94D]" : "text-red-500";

  return (
    <CardShell className={`flex min-h-0 flex-col gap-[clamp(8px,2.6cqw,12px)] [container-type:inline-size] ${className || ""}`}>
      <CardLabel icon={icon}>
        <span className="text-[clamp(11px,3.8cqw,15px)]">{title}</span>
      </CardLabel>

      {/* Planned vs Unplanned */}
      <div className="grid flex-shrink-0 grid-cols-2 gap-[clamp(6px,2cqw,9px)]">
        <div className="flex flex-col justify-center rounded-sm border border-[#C6C6C6] bg-[#F5F5F5] px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]">
          <span className="text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide text-[#6B7280]">
            Planned
          </span>
          <span className="mt-[clamp(2px,0.8cqw,4px)] text-[clamp(15px,5.5cqw,20px)] font-extrabold leading-none text-[#0F1D24]">
            {planned.toLocaleString("en-IN")}
          </span>
          <span className="mt-0.5 text-[clamp(7px,2.1cqw,8.5px)] font-medium text-[#6B7280]">{plannedPct}% of total</span>
        </div>
        <div className="flex flex-col justify-center rounded-sm border border-red-300 bg-red-50 px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]">
          <span className="text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide text-red-600">
            Unplanned
          </span>
          <span className="mt-[clamp(2px,0.8cqw,4px)] text-[clamp(15px,5.5cqw,20px)] font-extrabold leading-none text-red-600">
            {unplanned.toLocaleString("en-IN")}
          </span>
          <span className={`mt-0.5 text-[clamp(7px,2.1cqw,8.5px)] font-medium ${unplannedTone}`}>{unplannedPct}% of total</span>
        </div>
      </div>

      {/* Split bar */}
      <div className="flex-shrink-0">
        <div className="flex items-baseline justify-between">
          <span className="text-[clamp(9px,2.8cqw,11px)] font-medium text-[#9B9B9B]">Planned / Unplanned Split</span>
          <span className="text-[clamp(11px,3.6cqw,14px)] font-extrabold text-[#0F1D24]">{total.toLocaleString("en-IN")} total</span>
        </div>
        <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-[#F5F5F5]">
          <div className="h-full bg-[#0F1D24] transition-all" style={{ width: `${plannedPct}%` }} />
          <div className="h-full bg-red-500 transition-all" style={{ width: `${unplannedPct}%` }} />
        </div>
      </div>

      {/* Completed / Pending / Avg Change Time */}
      <div className="grid flex-shrink-0 grid-cols-3 gap-[clamp(5px,1.6cqw,8px)] text-center">
        <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-emerald-700/80">
            Completed
          </p>
          <p className="mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold text-emerald-600">
            {completed.toLocaleString("en-IN")}
          </p>
          <p className="text-[clamp(6.5px,2cqw,8px)] font-medium text-emerald-600/70">{completedPct}%</p>
        </div>
        <div className="rounded-sm border border-[#FDC94D]/40 bg-[#FDC94D]/10 px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-[#8A6D1A]">
            Pending
          </p>
          <p className="mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold text-[#0F1D24]">
            {pending.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-sm border border-[#C6C6C6] bg-[#0F1D24] px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-white/50">
            Avg Time
          </p>
          <p className="mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold text-[#FDC94D]">
            {avgChangeTime}m
          </p>
        </div>
      </div>

      {footer && (
        <div className="flex flex-shrink-0 items-center gap-1 rounded-sm bg-[#FDC94D]/15 px-[clamp(6px,2cqw,9px)] py-[clamp(4px,1.4cqw,7px)] text-[clamp(8px,2.5cqw,10px)] font-semibold text-[#0F1D24]">
          <ListChecks size={11} className="flex-shrink-0 text-[#FDC94D]" />
          {footer}
        </div>
      )}
    </CardShell>
  );
};

export default MouldChangeSummaryCard;