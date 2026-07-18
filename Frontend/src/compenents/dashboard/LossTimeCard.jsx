import React from "react";
import { Clock, CalendarDays, PackageX, Sun } from "lucide-react";
import { CardShell, CardLabel } from "./CardPrimitives";

const formatMinutes = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const SectionHeading = ({ icon: Icon, iconColor, children }) => (
  <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-[#E2E4E9] pb-[clamp(3px,1cqw,5px)]">
    <Icon size={12} className={`flex-shrink-0 ${iconColor}`} />
    <span className="text-[clamp(10px,3.2cqw,12.5px)] font-bold uppercase tracking-wide text-[#0F1D24]">
      {children}
    </span>
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
    <div
      className={`flex flex-col justify-center rounded-sm border ${palette.border} ${palette.bg} px-[clamp(6px,2cqw,9px)] py-[clamp(5px,1.6cqw,8px)]`}
    >
      <span
        className={`flex items-center gap-1 text-[clamp(7.5px,2.3cqw,9.5px)] font-semibold uppercase tracking-wide ${palette.label}`}
      >
        {Icon && <Icon size={9} className="flex-shrink-0" />}
        {label}
      </span>
      <span className={`mt-[clamp(2px,0.8cqw,4px)] font-extrabold leading-none ${palette.value} ${valueSize}`}>
        {value}
      </span>
    </div>
  );
};

const LossTimeCard = ({
  className,
  todayLossMinutes = 0,
  todayPartsLost = 0,
  monthLossMinutes = 0,
  monthPartsLost = 0,
}) => (
  <CardShell className={`flex min-h-0 flex-col gap-[clamp(8px,2.6cqw,12px)] [container-type:inline-size] ${className || ""}`}>
    <CardLabel icon={Clock}>
      <span className="text-[clamp(11px,3.8cqw,15px)]">Loss Time</span>
    </CardLabel>

    {/* Today */}
    <div className="flex flex-1 flex-col justify-center gap-[clamp(6px,2cqw,9px)]">
      <SectionHeading icon={Sun} iconColor="text-[#FDC94D]">
        Today
      </SectionHeading>
      <div className="grid grid-cols-2 gap-[clamp(6px,2cqw,9px)]">
        <StatBox tone="warning" label="Loss Time" value={formatMinutes(todayLossMinutes)} valueSize="text-[clamp(16px,6cqw,22px)]" />
        <StatBox tone="danger" label="Qty Lost" icon={PackageX} value={todayPartsLost.toLocaleString("en-IN")} valueSize="text-[clamp(16px,6cqw,22px)]" />
      </div>
    </div>

    {/* Divider */}
    <div className="flex-shrink-0 border-t border-[#E2E4E9]" />

    {/* This Month */}
    <div className="flex-shrink-0 space-y-[clamp(6px,2cqw,9px)]">
      <SectionHeading icon={CalendarDays} iconColor="text-[#0F1D24]">
        This Month
      </SectionHeading>
      <div className="grid grid-cols-2 gap-[clamp(6px,2cqw,9px)]">
        <StatBox tone="neutral" label="Loss Time" value={formatMinutes(monthLossMinutes)} valueSize="text-[clamp(13px,4.5cqw,17px)]" />
        <StatBox tone="danger" label="Parts Lost" icon={PackageX} value={monthPartsLost.toLocaleString("en-IN")} valueSize="text-[clamp(13px,4.5cqw,17px)]" />
      </div>
    </div>
  </CardShell>
);

export default LossTimeCard;