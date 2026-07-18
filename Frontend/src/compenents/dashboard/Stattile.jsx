import React from "react";
import { CardShell } from "./CardPrimitives";

const StatTile = ({ className, icon: Icon, value, label, accent = "text-[#0F1D24]" }) => (
  <CardShell className={`items-center justify-center text-center ${className}`}>
    <Icon size={16} className={`mb-1 ${accent}`} />
    <span className={`text-xl font-extrabold leading-none ${accent}`}>{value}</span>
    <span className="mt-1 text-[8.5px] font-medium leading-tight text-[#9B9B9B]">{label}</span>
  </CardShell>
);

export default StatTile;