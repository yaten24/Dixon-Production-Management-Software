import React from "react";
import { Award, Moon } from "lucide-react";
import { CardShell, CardLabel } from "./CardPrimitives";
import { pct } from "../../utils/dashboardMath";

const SummaryCard = ({
  className,
  icon = Moon,
  title = "Yesterday's Summary",
  target = 0,
  actual = 0,
  good = 0,
  remaining = 0,
  oee = 0,
  footer,
}) => {
  const achievement = pct(actual, target);
  const goodPct = pct(good, actual);

  const oeeTone = oee >= 85 ? "text-emerald-600" : oee >= 65 ? "text-[#FDC94D]" : "text-red-500";

  return (
    <CardShell className={`flex min-h-0 flex-col gap-[clamp(8px,2.6cqw,12px)] [container-type:inline-size] ${className || ""}`}>
      <CardLabel icon={icon}>
        <span className="text-[clamp(11px,3.8cqw,15px)]">{title}</span>
      </CardLabel>

      {/* Target vs Actual */}
      <div className="grid flex-shrink-0 grid-cols-2 gap-[clamp(6px,2cqw,9px)]">
        <div className="flex flex-col justify-center rounded-sm border border-[#C6C6C6] bg-[#F5F5F5] px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]">
          <span className="text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide text-[#6B7280]">
            Target
          </span>
          <span className="mt-[clamp(2px,0.8cqw,4px)] text-[clamp(15px,5.5cqw,20px)] font-extrabold leading-none text-[#0F1D24]">
            {target.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex flex-col justify-center rounded-sm border border-[#FDC94D]/40 bg-[#FDC94D]/10 px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]">
          <span className="text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide text-[#8A6D1A]">
            Actual
          </span>
          <span className="mt-[clamp(2px,0.8cqw,4px)] text-[clamp(15px,5.5cqw,20px)] font-extrabold leading-none text-[#0F1D24]">
            {actual.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Achievement progress */}
      <div className="flex-shrink-0">
        <div className="flex items-baseline justify-between">
          <span className="text-[clamp(9px,2.8cqw,11px)] font-medium text-[#9B9B9B]">Achievement</span>
          <span className="text-[clamp(13px,4.5cqw,17px)] font-extrabold text-[#0F1D24]">{achievement}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#F5F5F5]">
          <div
            className="h-full rounded-full bg-[#FDC94D] transition-all"
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
      </div>

      {/* Good / Remaining / OEE */}
      <div className="grid flex-shrink-0 grid-cols-3 gap-[clamp(5px,1.6cqw,8px)] text-center">
        <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-emerald-700/80">
            Good
          </p>
          <p className="mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold text-emerald-600">
            {good.toLocaleString("en-IN")}
          </p>
          <p className="text-[clamp(6.5px,2cqw,8px)] font-medium text-emerald-600/70">{goodPct}%</p>
        </div>
        <div className="rounded-sm border border-[#C6C6C6] bg-[#F5F5F5] px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-[#6B7280]">
            Remaining
          </p>
          <p className="mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold text-[#0F1D24]">
            {remaining.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-sm border border-[#C6C6C6] bg-[#0F1D24] px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-white/50">
            OEE
          </p>
          <p className={`mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold ${oeeTone}`}>{oee}%</p>
        </div>
      </div>

      {footer && (
        <div className="flex flex-shrink-0 items-center gap-1 rounded-sm bg-[#FDC94D]/15 px-[clamp(6px,2cqw,9px)] py-[clamp(4px,1.4cqw,7px)] text-[clamp(8px,2.5cqw,10px)] font-semibold text-[#0F1D24]">
          <Award size={11} className="flex-shrink-0 text-[#FDC94D]" />
          {footer}
        </div>
      )}
    </CardShell>
  );
};

export default SummaryCard;