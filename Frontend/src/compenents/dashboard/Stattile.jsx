import React from "react";
import { CardShell } from "./CardPrimitives";

const StatTile = ({ className, icon: Icon, value, label, accent = "text-[#0F1D24]" }) => (
  <CardShell
    className={`flex min-h-0 flex-col items-center justify-center gap-1 text-center [container-type:inline-size] ${className || ""}`}
  >
    <Icon size={16} className={`flex-shrink-0 ${accent}`} />
    <span className={`text-[clamp(16px,7cqw,24px)] font-extrabold leading-none ${accent}`}>
      {value}
    </span>
    <span className="text-[clamp(7.5px,2.4cqw,9.5px)] font-medium leading-tight text-[#9B9B9B]">
      {label}
    </span>
  </CardShell>
);

export default StatTile;