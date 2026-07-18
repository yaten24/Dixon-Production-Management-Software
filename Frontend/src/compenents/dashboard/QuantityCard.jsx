import React from "react";
import { CardShell, CardLabel } from "./CardPrimitives";

const QuantityCard = ({ className, tone, label, value, sub, TrendIcon, trendLabel }) => {
  const palette =
    tone === "good"
      ? {
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          bar: "bg-emerald-500",
        }
      : {
          text: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          bar: "bg-red-500",
        };

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

export default QuantityCard;