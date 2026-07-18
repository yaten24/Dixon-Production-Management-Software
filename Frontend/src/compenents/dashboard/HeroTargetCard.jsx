import React from "react";
import { Target, TrendingUp, CalendarDays } from "lucide-react";
import { CardLabel } from "./CardPrimitives";
import { pct } from "../../utils/dashboardMath";

const HeroTargetCard = ({
  className,
  date,
  target,
  actual,
  good,
  reject,
  monthTarget = 0,
  monthActual = 0,
}) => {
  const achievement = pct(actual, target);
  const goodPct = pct(good, actual);
  const rejectPct = pct(reject, actual);

  const monthAchievement = pct(monthActual, monthTarget);
  const monthRemaining = Math.max(monthTarget - monthActual, 0);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-sm bg-[#0F1D24] p-3 text-white shadow-sm [container-type:inline-size] ${className}`}
    >
      <div className="flex flex-shrink-0 items-center justify-between">
        <CardLabel icon={Target} tone="text-[#FDC94D]/90">
          <span className="text-[clamp(11px,3.8cqw,15px)]">Today&apos;s Overall Target</span>
        </CardLabel>
        <span className="rounded-sm border border-white/15 bg-white/5 px-2 py-0.5 text-[clamp(9px,2.8cqw,12px)] font-semibold text-white/70">
          {formattedDate}
        </span>
      </div>

      {/* Today: Target vs Actual */}
      <div className="mt-2 grid flex-1 grid-cols-2 gap-2">
        <div className="flex flex-col justify-center rounded-sm border border-white/10 bg-white/5 px-2.5 py-2">
          <p className="text-[clamp(9px,2.8cqw,12px)] font-semibold uppercase tracking-wide text-white/50">
            Target
          </p>
          <p className="mt-0.5 text-[clamp(20px,8cqw,30px)] font-extrabold leading-none text-white">
            {target.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-sm border border-[#FDC94D]/30 bg-[#FDC94D]/10 px-2.5 py-2">
          <p className="text-[clamp(9px,2.8cqw,12px)] font-semibold uppercase tracking-wide text-[#FDC94D]/80">
            Actual
          </p>
          <p className="mt-0.5 text-[clamp(20px,8cqw,30px)] font-extrabold leading-none text-[#FDC94D]">
            {actual.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Today's achievement % + progress bar */}
      <div className="mt-2.5 flex-shrink-0">
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-1 text-[clamp(10px,3cqw,13px)] font-medium text-white/60">
            <TrendingUp size={13} className="flex-shrink-0 text-[#FDC94D]" /> Today's Achievement
          </span>
          <span className="text-[clamp(16px,5.5cqw,22px)] font-extrabold text-[#FDC94D]">
            {achievement}%
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#FDC94D] transition-all"
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[clamp(9px,2.7cqw,12px)] font-semibold text-white/70">
          <span>Good {goodPct}%</span>
          <span>Reject {rejectPct}%</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-2.5 flex-shrink-0 border-t border-white/10" />

      {/* Monthly summary */}
      <div className="flex flex-1 flex-col justify-center">
        <p className="flex items-center gap-1 text-[clamp(10px,3cqw,13px)] font-semibold uppercase tracking-wide text-white/50">
          <CalendarDays size={13} className="flex-shrink-0 text-white/50" /> This Month
        </p>

        <div className="mt-1.5 grid flex-1 grid-cols-3 gap-1.5">
          <div className="flex flex-col justify-center rounded-sm bg-white/5 px-2 py-1.5">
            <p className="text-[clamp(7px,2.2cqw,10px)] font-medium text-white/50">TARGET</p>
            <p className="text-[clamp(13px,4.5cqw,18px)] font-bold text-white">
              {monthTarget.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-sm bg-[#FDC94D]/10 px-2 py-1.5">
            <p className="text-[clamp(7px,2.2cqw,10px)] font-medium text-[#FDC94D]/80">ACHIEVED</p>
            <p className="text-[clamp(13px,4.5cqw,18px)] font-bold text-[#FDC94D]">
              {monthActual.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-sm bg-white/5 px-2 py-1.5">
            <p className="text-[clamp(7px,2.2cqw,10px)] font-medium text-white/50">REMAINING</p>
            <p className="text-[clamp(13px,4.5cqw,18px)] font-bold text-white">
              {monthRemaining.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="mt-1.5 h-2 w-full flex-shrink-0 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#FDC94D] transition-all"
            style={{ width: `${Math.min(monthAchievement, 100)}%` }}
          />
        </div>
        <p className="mt-1 flex-shrink-0 text-right text-[clamp(9px,2.7cqw,12px)] font-semibold text-white/60">
          {monthAchievement}% of monthly target
        </p>
      </div>
    </div>
  );
};

export default HeroTargetCard;