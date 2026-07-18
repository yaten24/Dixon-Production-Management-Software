import React from "react";
import { CardShell, CardLabel } from "./CardPrimitives";

const QuantityCard = ({ className, tone, label, value, sub, TrendIcon, trendLabel }) => {
  const palette =
    tone === "good"
      ? { text: "text-emerald-600", bg: "bg-emerald-50" }
      : { text: "text-red-600", bg: "bg-red-50" };

  return (
    <CardShell className={className}>
      <CardLabel>{label}</CardLabel>
      <div className="flex flex-1 flex-col justify-center">
        <span className={`text-2xl font-extrabold leading-none ${palette.text}`}>
          {value.toLocaleString("en-IN")}
        </span>
        <div className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full ${palette.bg} px-1.5 py-0.5 text-[9px] font-semibold ${palette.text}`}>
          <TrendIcon size={9} />
          {trendLabel}
        </div>
      </div>
      <span className="flex-shrink-0 text-[9px] text-[#9B9B9B]">{sub}</span>
    </CardShell>
  );
};

export default QuantityCard;