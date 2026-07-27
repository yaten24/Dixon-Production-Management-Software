import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  Cog,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Wrench,
  Target,
  Clock,
  PackageX,
  Sun,
  ListChecks,
} from "lucide-react";

import Sidebar from "../../compenents/dashboard/Sidebar";
import {
  dayTarget,
  shiftData,
  lossTimeReasons,
  machineStatus,
  userStatus,
  lastDay,
  currentMonth,
  weeklyOee,
  mouldChangeSummary,
} from "../../data/dashboardDemoData";
import { pct } from "../../utils/dashboardMath";

// ============================================================
// THEME TOKENS — kept consistent with AdminDashboard / Sidebar / Users / Machines / Parts / Employees
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";
const MUTED = "#9B9B9B";

/* ==========================================================
   CARD PRIMITIVES — shared flat shell + label used by every KPI card
========================================================== */
const CardShell = ({ className = "", children }) => (
  <div className={`flex min-h-0 flex-col rounded-sm border border-[#C6C6C6]/70 bg-white p-2 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardLabel = ({ icon: Icon, children, tone = "text-[#9B9B9B]" }) => (
  <div className={`flex flex-shrink-0 items-center gap-1 text-[9px] font-semibold uppercase tracking-wide ${tone}`}>
    {Icon && <Icon size={11} />}
    {children}
  </div>
);

/* ==========================================================
   HERO TARGET CARD — today's target vs actual + monthly summary
========================================================== */
const HeroTargetCard = ({ className, date, target, actual, good, reject, monthTarget = 0, monthActual = 0 }) => {
  const achievement = pct(actual, target);
  const goodPct = pct(good, actual);
  const rejectPct = pct(reject, actual);

  const monthAchievement = pct(monthActual, monthTarget);
  const monthRemaining = Math.max(monthTarget - monthActual, 0);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className={`flex h-full min-h-0 flex-col rounded-sm bg-[#0F1D24] p-3 text-white shadow-sm [container-type:inline-size] ${className}`}>
      <div className="flex flex-shrink-0 items-center justify-between">
        <CardLabel icon={Target} tone="text-[#FDC94D]/90">
          <span className="text-[clamp(11px,3.8cqw,15px)]">Today&apos;s Overall Target</span>
        </CardLabel>
        <span className="rounded-sm border border-white/15 bg-white/5 px-2 py-0.5 text-[clamp(9px,2.8cqw,12px)] font-semibold text-white/70">
          {formattedDate}
        </span>
      </div>

      <div className="mt-2 grid flex-1 grid-cols-2 gap-2">
        <div className="flex flex-col justify-center rounded-sm border border-white/10 bg-white/5 px-2.5 py-2">
          <p className="text-[clamp(9px,2.8cqw,12px)] font-semibold uppercase tracking-wide text-white/50">Target</p>
          <p className="mt-0.5 text-[clamp(20px,8cqw,30px)] font-extrabold leading-none text-white">
            {target.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-sm border border-[#FDC94D]/30 bg-[#FDC94D]/10 px-2.5 py-2">
          <p className="text-[clamp(9px,2.8cqw,12px)] font-semibold uppercase tracking-wide text-[#FDC94D]/80">Actual</p>
          <p className="mt-0.5 text-[clamp(20px,8cqw,30px)] font-extrabold leading-none text-[#FDC94D]">
            {actual.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex-shrink-0">
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-1 text-[clamp(10px,3cqw,13px)] font-medium text-white/60">
            <TrendingUp size={13} className="flex-shrink-0 text-[#FDC94D]" /> Today's Achievement
          </span>
          <span className="text-[clamp(16px,5.5cqw,22px)] font-extrabold text-[#FDC94D]">{achievement}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-[#FDC94D] transition-all" style={{ width: `${Math.min(achievement, 100)}%` }} />
        </div>
        <div className="mt-1 flex items-center justify-between text-[clamp(9px,2.7cqw,12px)] font-semibold text-white/70">
          <span>Good {goodPct}%</span>
          <span>Reject {rejectPct}%</span>
        </div>
      </div>

      <div className="my-2.5 flex-shrink-0 border-t border-white/10" />

      <div className="flex flex-1 flex-col justify-center">
        <p className="flex items-center gap-1 text-[clamp(10px,3cqw,13px)] font-semibold uppercase tracking-wide text-white/50">
          <CalendarDays size={13} className="flex-shrink-0 text-white/50" /> This Month
        </p>

        <div className="mt-1.5 grid flex-1 grid-cols-3 gap-1.5">
          <div className="flex flex-col justify-center rounded-sm bg-white/5 px-2 py-1.5">
            <p className="text-[clamp(7px,2.2cqw,10px)] font-medium text-white/50">TARGET</p>
            <p className="text-[clamp(13px,4.5cqw,18px)] font-bold text-white">{monthTarget.toLocaleString("en-IN")}</p>
          </div>
          <div className="flex flex-col justify-center rounded-sm bg-[#FDC94D]/10 px-2 py-1.5">
            <p className="text-[clamp(7px,2.2cqw,10px)] font-medium text-[#FDC94D]/80">ACHIEVED</p>
            <p className="text-[clamp(13px,4.5cqw,18px)] font-bold text-[#FDC94D]">{monthActual.toLocaleString("en-IN")}</p>
          </div>
          <div className="flex flex-col justify-center rounded-sm bg-white/5 px-2 py-1.5">
            <p className="text-[clamp(7px,2.2cqw,10px)] font-medium text-white/50">REMAINING</p>
            <p className="text-[clamp(13px,4.5cqw,18px)] font-bold text-white">{monthRemaining.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="mt-1.5 h-2 w-full flex-shrink-0 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-[#FDC94D] transition-all" style={{ width: `${Math.min(monthAchievement, 100)}%` }} />
        </div>
        <p className="mt-1 flex-shrink-0 text-right text-[clamp(9px,2.7cqw,12px)] font-semibold text-white/60">
          {monthAchievement}% of monthly target
        </p>
      </div>
    </div>
  );
};

/* ==========================================================
   SHIFT WISE CARD — per-shift target/actual/remaining
========================================================== */
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
          <div key={s.label} className={`flex-shrink-0 rounded-sm border ${colors.border} ${colors.bg} px-2.5 py-1.5`}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[clamp(10px,3.2cqw,13px)] font-bold text-[#0F1D24]">{s.label}</span>
              <span className={`flex items-center gap-1 text-[clamp(12px,4cqw,16px)] font-extrabold ${colors.text}`}>
                <TrendIcon size={12} className="flex-shrink-0" />
                {achievement}%
              </span>
            </div>

            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white">
              <div className={`h-full rounded-full ${colors.bar} transition-all`} style={{ width: `${Math.min(achievement, 100)}%` }} />
            </div>

            <div className="mt-1 grid grid-cols-3 gap-1 text-center">
              <div>
                <p className="text-[clamp(6.5px,2cqw,8.5px)] font-medium uppercase tracking-wide text-[#9B9B9B]">Target</p>
                <p className="text-[clamp(9px,3cqw,12px)] font-bold text-[#0F1D24]">{s.target.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[clamp(6.5px,2cqw,8.5px)] font-medium uppercase tracking-wide text-[#9B9B9B]">Actual</p>
                <p className={`text-[clamp(9px,3cqw,12px)] font-bold ${colors.text}`}>{s.actual.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[clamp(6.5px,2cqw,8.5px)] font-medium uppercase tracking-wide text-[#9B9B9B]">Remaining</p>
                <p className="text-[clamp(9px,3cqw,12px)] font-bold text-[#0F1D24]">{remaining.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </CardShell>
);

/* ==========================================================
   QUANTITY CARD — good / reject quantity tile
========================================================== */
const QuantityCard = ({ className, tone, label, value, sub, TrendIcon, trendLabel }) => {
  const palette =
    tone === "good"
      ? { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500" }
      : { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500" };

  return (
    <CardShell className={`flex min-h-0 flex-col [container-type:inline-size] ${className || ""}`}>
      <CardLabel>
        <span className="text-[clamp(11px,3.8cqw,15px)]">{label}</span>
      </CardLabel>

      <div className={`mt-2 flex flex-1 flex-col justify-center rounded-sm border ${palette.border} ${palette.bg} px-2.5 py-2`}>
        <div className="flex items-center justify-between">
          <span className={`text-[clamp(20px,9cqw,30px)] font-extrabold leading-none ${palette.text}`}>
            {value.toLocaleString("en-IN")}
          </span>
          <span className={`flex items-center gap-1 text-[clamp(11px,3.6cqw,14px)] font-bold ${palette.text}`}>
            <TrendIcon size={13} className="flex-shrink-0" />
            {trendLabel}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white">
          <div className={`h-full w-full rounded-full ${palette.bar}`} />
        </div>
      </div>

      <span className="mt-1.5 flex-shrink-0 text-[clamp(8px,2.5cqw,10px)] text-[#9B9B9B]">{sub}</span>
    </CardShell>
  );
};

/* ==========================================================
   STAT TILE — compact icon + value + label tile
========================================================== */
const StatTile = ({ className, icon: Icon, value, label, accent = "text-[#0F1D24]" }) => (
  <CardShell className={`flex min-h-0 flex-col items-center justify-center gap-1 text-center [container-type:inline-size] ${className || ""}`}>
    <Icon size={16} className={`flex-shrink-0 ${accent}`} />
    <span className={`text-[clamp(16px,7cqw,24px)] font-extrabold leading-none ${accent}`}>{value}</span>
    <span className="text-[clamp(7.5px,2.4cqw,9.5px)] font-medium leading-tight text-[#9B9B9B]">{label}</span>
  </CardShell>
);

/* ==========================================================
   LOSS TIME CARD — today / month loss-time + qty lost
========================================================== */
const formatMinutes = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const SectionHeading = ({ icon: Icon, iconColor, children }) => (
  <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-[#E2E4E9] pb-[clamp(3px,1cqw,5px)]">
    <Icon size={12} className={`flex-shrink-0 ${iconColor}`} />
    <span className="text-[clamp(10px,3.2cqw,12.5px)] font-bold uppercase tracking-wide text-[#0F1D24]">{children}</span>
  </div>
);

const StatBox = ({ tone, label, icon: Icon, value, valueSize }) => {
  const palette =
    tone === "warning"
      ? { border: "border-[#FDC94D]/40", bg: "bg-[#FDC94D]/10", label: "text-[#8A6D1A]", value: "text-[#0F1D24]" }
      : tone === "danger"
        ? { border: "border-red-300", bg: "bg-red-50", label: "text-red-600", value: "text-red-600" }
        : { border: "border-[#C6C6C6]", bg: "bg-[#F5F5F5]", label: "text-[#6B7280]", value: "text-[#0F1D24]" };

  return (
    <div className={`flex flex-col justify-center rounded-sm border ${palette.border} ${palette.bg} px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]`}>
      <span className={`flex items-center gap-1 text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide ${palette.label}`}>
        {Icon && <Icon size={9} className="flex-shrink-0" />}
        {label}
      </span>
      <span className={`mt-[clamp(2px,0.8cqw,4px)] font-extrabold leading-none ${palette.value} ${valueSize}`}>{value}</span>
    </div>
  );
};

const LossTimeCard = ({ className, todayLossMinutes = 0, todayPartsLost = 0, monthLossMinutes = 0, monthPartsLost = 0 }) => (
  <CardShell className={`flex min-h-0 flex-col gap-[clamp(8px,2.6cqw,12px)] [container-type:inline-size] ${className || ""}`}>
    <CardLabel icon={Clock}>
      <span className="text-[clamp(11px,3.8cqw,15px)]">Loss Time</span>
    </CardLabel>

    <div className="flex flex-1 flex-col justify-center gap-[clamp(6px,2cqw,9px)]">
      <SectionHeading icon={Sun} iconColor="text-[#FDC94D]">Today</SectionHeading>
      <div className="grid grid-cols-2 gap-[clamp(6px,2cqw,9px)]">
        <StatBox tone="warning" label="Loss Time" value={formatMinutes(todayLossMinutes)} valueSize="text-[clamp(16px,6cqw,22px)]" />
        <StatBox tone="danger" label="Qty Lost" icon={PackageX} value={todayPartsLost.toLocaleString("en-IN")} valueSize="text-[clamp(16px,6cqw,22px)]" />
      </div>
    </div>

    <div className="flex-shrink-0 border-t border-[#E2E4E9]" />

    <div className="flex-shrink-0 space-y-[clamp(6px,2cqw,9px)]">
      <SectionHeading icon={CalendarDays} iconColor="text-[#0F1D24]">This Month</SectionHeading>
      <div className="grid grid-cols-2 gap-[clamp(6px,2cqw,9px)]">
        <StatBox tone="neutral" label="Loss Time" value={formatMinutes(monthLossMinutes)} valueSize="text-[clamp(13px,4.5cqw,17px)]" />
        <StatBox tone="danger" label="Parts Lost" icon={PackageX} value={monthPartsLost.toLocaleString("en-IN")} valueSize="text-[clamp(13px,4.5cqw,17px)]" />
      </div>
    </div>
  </CardShell>
);

/* ==========================================================
   SUMMARY CARD — generic icon + title + row list (used for "Yesterday")
========================================================== */
const SummaryCard = ({ className, icon = CalendarDays, title = "Summary", rows = [], footer }) => (
  <CardShell className={`flex min-h-0 flex-col gap-[clamp(8px,2.6cqw,12px)] [container-type:inline-size] ${className || ""}`}>
    <CardLabel icon={icon}>
      <span className="text-[clamp(11px,3.8cqw,15px)]">{title}</span>
    </CardLabel>

    <div className="grid flex-1 grid-cols-3 gap-[clamp(6px,2cqw,9px)]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col justify-center rounded-sm border border-[#C6C6C6] bg-[#F5F5F5] px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]"
        >
          <span className="text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide text-[#6B7280]">
            {row.label}
          </span>
          <span className="mt-[clamp(2px,0.8cqw,4px)] text-[clamp(13px,4.8cqw,18px)] font-extrabold leading-none text-[#0F1D24]">
            {row.value}
          </span>
        </div>
      ))}
    </div>

    {footer && (
      <div className="flex flex-shrink-0 items-center gap-1 rounded-sm bg-[#FDC94D]/15 px-[clamp(6px,2cqw,9px)] py-[clamp(4px,1.4cqw,7px)] text-[clamp(8px,2.5cqw,10px)] font-semibold text-[#0F1D24]">
        {footer}
      </div>
    )}
  </CardShell>
);

/* ==========================================================
   MOULD CHANGE SUMMARY CARD — planned/unplanned + completion split
========================================================== */
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

      <div className="grid flex-shrink-0 grid-cols-2 gap-[clamp(6px,2cqw,9px)]">
        <div className="flex flex-col justify-center rounded-sm border border-[#C6C6C6] bg-[#F5F5F5] px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]">
          <span className="text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide text-[#6B7280]">Planned</span>
          <span className="mt-[clamp(2px,0.8cqw,4px)] text-[clamp(15px,5.5cqw,20px)] font-extrabold leading-none text-[#0F1D24]">
            {planned.toLocaleString("en-IN")}
          </span>
          <span className="mt-0.5 text-[clamp(7px,2.1cqw,8.5px)] font-medium text-[#6B7280]">{plannedPct}% of total</span>
        </div>
        <div className="flex flex-col justify-center rounded-sm border border-red-300 bg-red-50 px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]">
          <span className="text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide text-red-600">Unplanned</span>
          <span className="mt-[clamp(2px,0.8cqw,4px)] text-[clamp(15px,5.5cqw,20px)] font-extrabold leading-none text-red-600">
            {unplanned.toLocaleString("en-IN")}
          </span>
          <span className={`mt-0.5 text-[clamp(7px,2.1cqw,8.5px)] font-medium ${unplannedTone}`}>{unplannedPct}% of total</span>
        </div>
      </div>

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

      <div className="grid flex-shrink-0 grid-cols-3 gap-[clamp(5px,1.6cqw,8px)] text-center">
        <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-emerald-700/80">Completed</p>
          <p className="mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold text-emerald-600">{completed.toLocaleString("en-IN")}</p>
          <p className="text-[clamp(6.5px,2cqw,8px)] font-medium text-emerald-600/70">{completedPct}%</p>
        </div>
        <div className="rounded-sm border border-[#FDC94D]/40 bg-[#FDC94D]/10 px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-[#8A6D1A]">Pending</p>
          <p className="mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold text-[#0F1D24]">{pending.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-sm border border-[#C6C6C6] bg-[#0F1D24] px-1.5 py-[clamp(4px,1.4cqw,7px)]">
          <p className="text-[clamp(7px,2.1cqw,8.5px)] font-semibold uppercase tracking-wide text-white/50">Avg Time</p>
          <p className="mt-0.5 text-[clamp(11px,3.8cqw,14px)] font-extrabold text-[#FDC94D]">{avgChangeTime}m</p>
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

/* ==========================================================
   CHART CARD — flat shell wrapper for the weekly OEE chart
========================================================== */
const ChartCard = ({ icon, iconBg, title, subtitle, full, children }) => (
  <div className={`flex min-h-0 flex-col rounded-sm border border-[#C6C6C6]/70 bg-white p-2.5 shadow-sm ${full ? "h-full" : ""}`}>
    <div className="flex flex-shrink-0 items-center gap-2">
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="min-w-0 leading-tight">
        <h3 className="truncate text-[12px] font-extrabold text-[#0F1D24]">{title}</h3>
        {subtitle && <p className="truncate text-[9px] font-medium text-[#9B9B9B]">{subtitle}</p>}
      </div>
    </div>
    <div className="mt-2 min-h-0 flex-1">{children}</div>
  </div>
);

/* ==========================================================
   WEEKLY OEE CHART — bar chart + zoom overlay
========================================================== */
const MIN_HEIGHT = 200;
const MAX_VALUE = 100;
const OEE_COLOR = "#0F1D24";
const DAY_BAND_COLORS = ["#FFFFFF", "#0F1D2410"];

const ChartIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
    <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" />
    <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
  </svg>
);

const ExpandIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
    <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);

const Chart = ({ chartData }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 700, height: 300 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({ width: entry.contentRect.width, height: Math.max(entry.contentRect.height, MIN_HEIGHT) });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const PADDING = { top: 34, right: 16, bottom: 30, left: 34 };

  const chartW = Math.max(width - PADDING.left - PADDING.right, 10);
  const chartH = Math.max(height - PADDING.top - PADDING.bottom, 10);

  const { bars, yTicks } = useMemo(() => {
    if (width === 0) return { bars: [], yTicks: [] };

    const groupW = chartW / chartData.length;
    const barW = Math.max(groupW * 0.5, 16);

    const computed = chartData.map((d, i) => {
      const groupX = PADDING.left + groupW * i;
      const value = Math.max(Math.min(d.oee || 0, MAX_VALUE), 0);
      const barH = (value / MAX_VALUE) * chartH;
      return {
        day: d.day,
        groupX,
        groupW,
        centerX: groupX + groupW / 2,
        value,
        barX: groupX + (groupW - barW) / 2,
        barW,
        barH,
        barY: PADDING.top + chartH - barH,
      };
    });

    const tickCount = 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((MAX_VALUE / tickCount) * i));

    return { bars: computed, yTicks: ticks };
  }, [chartData, chartW, chartH, width, PADDING.left, PADDING.top]);

  const hovered = hoverIdx !== null ? bars[hoverIdx] : null;

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full">
      <style>{`
        @keyframes growBar2 { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      `}</style>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="block" preserveAspectRatio="none">
        {bars.map((g, i) => (
          <rect key={`band-${i}`} x={g.groupX} y={PADDING.top} width={g.groupW} height={chartH} fill={DAY_BAND_COLORS[i % 2]} />
        ))}

        {bars.slice(1).map((g, i) => (
          <line key={`div-${i}`} x1={g.groupX} x2={g.groupX} y1={PADDING.top} y2={PADDING.top + chartH} stroke="#D8DADE" strokeWidth={1} />
        ))}

        {yTicks.map((tick, i) => {
          const y = PADDING.top + chartH - (tick / MAX_VALUE) * chartH;
          return (
            <g key={i}>
              <line x1={PADDING.left} x2={width - PADDING.right} y1={y} y2={y} stroke="#EFEFEF" strokeWidth={1} />
              <text x={PADDING.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#9B9B9B" fontFamily="ui-monospace, monospace">
                {tick}
              </text>
            </g>
          );
        })}

        {bars.map((b, i) => (
          <g key={i}>
            <rect
              x={b.barX}
              y={b.barY}
              width={b.barW}
              height={b.barH}
              rx={3}
              fill={OEE_COLOR}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.4}
              style={{
                transformOrigin: `${b.barX + b.barW / 2}px ${PADDING.top + chartH}px`,
                animation: `growBar2 500ms ease-out ${i * 40}ms both`,
                transition: "opacity 150ms ease",
              }}
            />
            {b.value > 0 && (
              <text x={b.barX + b.barW / 2} y={Math.max(b.barY - 6, PADDING.top - 2)} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0F1D24">
                {b.value}%
              </text>
            )}
          </g>
        ))}

        {bars.map((g, i) => (
          <text key={`label-${i}`} x={g.centerX} y={height - PADDING.bottom + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F1D24">
            {g.day}
          </text>
        ))}

        {bars.map((g, i) => (
          <rect
            key={`hover-${i}`}
            x={g.groupX}
            y={PADDING.top}
            width={g.groupW}
            height={chartH}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-[#C6C6C6] bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: `${Math.min(Math.max((hovered.centerX / width) * 100, 14), 86)}%`, top: 4, transform: "translateX(-50%)" }}
        >
          <div className="font-bold text-[#0F1D24]">{hovered.day}</div>
          <div className="font-mono font-bold" style={{ color: OEE_COLOR }}>
            OEE {hovered.value}%
          </div>
        </div>
      )}
    </div>
  );
};

const WeeklyOeeChart = ({ className, data = [], loading }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const hasData = useMemo(() => data.some((d) => (d.oee || 0) > 0), [data]);
  const bestDay = useMemo(() => data.reduce((a, b) => ((b.oee || 0) > (a?.oee ?? -1) ? b : a), null), [data]);
  const avgOee = useMemo(
    () => (data.length ? Math.round(data.reduce((sum, d) => sum + (d.oee || 0), 0) / data.length) : 0),
    [data]
  );

  return (
    <div className={`min-h-0 ${className || ""}`}>
      <ChartCard icon={<ChartIcon className="h-3 w-3 text-[#FDC94D]" />} iconBg="#0F1D24" title="Last 7 Days · OEE" subtitle="OEE = Availability × Performance × Quality" full>
        {loading ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-[11px] text-[#9B9B9B]">Loading weekly data...</div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div className="mb-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-[#0F1D24]/20 bg-[#0F1D24]/5 px-2.5 py-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: OEE_COLOR }} />
                <span className="text-[11px] font-semibold text-[#0F1D24]">OEE</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Best Day</p>
                  <p className="text-xs font-extrabold text-[#0F1D24]">
                    {bestDay ? bestDay.day : "-"}
                    <span className="ml-1 text-[9px] font-semibold text-[#9B9B9B]">({bestDay?.oee || 0}%)</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsZoomed(true)}
                  className="flex h-6 items-center gap-1 rounded bg-[#0F1D24] px-2 text-[9px] font-semibold text-[#FDC94D] transition hover:bg-[#1a2e38]"
                >
                  <ExpandIcon className="h-2.5 w-2.5" />
                  Zoom
                </button>
              </div>
            </div>

            {!hasData && (
              <div className="mb-1 flex-shrink-0 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
                No performance data recorded yet — showing 0% for every day.
              </div>
            )}

            <div className="min-h-0 flex-1">
              <Chart chartData={data} />
            </div>

            <div className="mt-1 flex flex-shrink-0 items-center justify-end border-t border-[#C6C6C6]/40 pt-1">
              <span className="text-[9px] font-semibold text-[#9B9B9B]">
                Avg OEE: <span className="text-[#0F1D24]">{avgOee}%</span>
              </span>
            </div>
          </div>
        )}
      </ChartCard>

      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6]/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded shadow-sm" style={{ background: "#0F1D24" }}>
                <ChartIcon className="h-3.5 w-3.5 text-[#FDC94D]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F1D24]">Weekly OEE · Expanded View</h2>
                <p className="text-[10px] text-[#9B9B9B]">OEE = Availability × Performance × Quality — last 7 days</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Best Day</p>
                <p className="text-lg font-extrabold text-[#0F1D24]">
                  {bestDay ? bestDay.day : "-"}
                  <span className="ml-1 text-[10px] font-semibold text-[#9B9B9B]">({bestDay?.oee || 0}%)</span>
                </p>
              </div>
              <button onClick={() => setIsZoomed(false)} className="flex h-8 w-8 items-center justify-center rounded text-[#9B9B9B] transition hover:bg-[#0F1D24]/5">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!hasData && (
            <div className="flex-shrink-0 border-b border-amber-100 bg-amber-50 px-5 py-1.5 text-[10px] font-medium text-amber-700">
              No performance data recorded yet — showing 0% for every day.
            </div>
          )}

          <div className="min-h-0 flex-1 px-6 py-4">
            <Chart chartData={data} />
          </div>

          <div className="flex flex-shrink-0 items-center justify-end border-t border-[#C6C6C6]/40 bg-[#0F1D24]/[0.02] px-5 py-2">
            <span className="text-[10px] font-semibold text-[#9B9B9B]">
              Avg OEE: <span className="text-[#0F1D24]">{avgOee}%</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================
   DASHBOARD PAGE — single screen, no page-level scrollbar
========================================================== */
const Dashboard = () => {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F5F5F5]">
      <Sidebar />

      <style>{`
        @media (min-width: 1024px) {
          .mc-kpi-grid {
            grid-template-columns: repeat(12, minmax(0, 1fr));
            grid-template-rows: repeat(2, minmax(0, 1fr));
            grid-template-areas:
              "hero hero hero shift shift shift good good reject reject machines users"
              "hero hero hero loss loss loss lastday lastday lastday month month month";
          }
          .mc-hero { grid-area: hero; }
          .mc-shift { grid-area: shift; }
          .mc-good { grid-area: good; }
          .mc-reject { grid-area: reject; }
          .mc-machines { grid-area: machines; }
          .mc-users { grid-area: users; }
          .mc-loss { grid-area: loss; }
          .mc-lastday { grid-area: lastday; }
          .mc-month { grid-area: month; }
        }
      `}</style>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5">
          <div className="mc-kpi-grid grid min-h-0 flex-[1.35] grid-cols-2 auto-rows-fr gap-1.5 sm:grid-cols-4">
            <HeroTargetCard
              className="mc-hero col-span-2 sm:col-span-4"
              target={dayTarget.target}
              actual={dayTarget.actual}
              good={dayTarget.good}
              reject={dayTarget.reject}
            />

            <ShiftWiseCard className="mc-shift col-span-2 sm:col-span-2" shifts={shiftData} />

            <QuantityCard
              className="mc-good col-span-1"
              tone="good"
              label="Good Quantity"
              value={dayTarget.good}
              sub={`${pct(dayTarget.good, dayTarget.actual)}% of actual output`}
              TrendIcon={TrendingUp}
              trendLabel="0% vs yday"
            />

            <QuantityCard
              className="mc-reject col-span-1"
              tone="reject"
              label="Reject Quantity"
              value={dayTarget.reject}
              sub={`${pct(dayTarget.reject, dayTarget.actual)}% of actual output`}
              TrendIcon={TrendingDown}
              trendLabel="0% vs yday"
            />

            <StatTile className="mc-machines col-span-1" icon={Cog} value={`${machineStatus.active}/${machineStatus.total}`} label="Active Machines" />

            <StatTile className="mc-users col-span-1" icon={Users} value={userStatus.active} label={userStatus.label} />

            <LossTimeCard className="mc-loss col-span-2 sm:col-span-2" reasons={lossTimeReasons} />

            <SummaryCard
              className="mc-lastday col-span-2 sm:col-span-2"
              icon={CalendarDays}
              title={lastDay.dateLabel}
              rows={[
                { label: "Target", value: lastDay.target.toLocaleString("en-IN") },
                { label: "Actual", value: lastDay.actual.toLocaleString("en-IN") },
                { label: "OEE", value: `${lastDay.oee}%` },
              ]}
            />

            <MouldChangeSummaryCard
              className="mc-month col-span-2 sm:col-span-2"
              icon={Wrench}
              title="Mould Change Summary"
              planned={mouldChangeSummary.planned}
              unplanned={mouldChangeSummary.unplanned}
              completed={mouldChangeSummary.completed}
              pending={mouldChangeSummary.pending}
              avgChangeTime={mouldChangeSummary.avgChangeTime}
            />
          </div>

          <WeeklyOeeChart className="min-h-0 flex-1" data={weeklyOee} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;