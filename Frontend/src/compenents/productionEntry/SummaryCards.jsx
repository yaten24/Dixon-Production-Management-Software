import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FaBullseye, FaGaugeHigh } from "react-icons/fa6";

// Brand palette: highlight #0F1D24 (navy) · gray #9B9B9B · accent #FDC94D (gold) · darken #C6C6C6 (borders)
// Actual/Reject stay semantic (green/red) — good vs bad production outcomes
// need universal color scanning. Target & Efficiency are neutral brand metrics.

// Desktop-app KPI strip: each tile is only as wide as its content
// needs (inline-flex, not a stretched equal-width grid column) —
// no leftover empty space padded out to match the widest sibling.
// Tiles wrap onto a new line if the row runs out of room.
const SummaryCards = ({ target, actual, reject, efficiency }) => {
  const cards = [
    {
      label: "Target",
      value: target || 0,
      suffix: "",
      icon: FaBullseye,
      border: "border-[#0F1D24]/25",
      iconBg: "bg-[#0F1D24]",
      iconColor: "text-[#FDC94D]",
      valueColor: "text-[#0F1D24]",
      accent: "#0F1D24",
    },
    {
      label: "Actual",
      value: actual || 0,
      suffix: "",
      icon: FaCheckCircle,
      border: "border-green-200",
      iconBg: "bg-green-600",
      iconColor: "text-white",
      valueColor: "text-green-700",
      accent: "#16A34A",
    },
    {
      label: "Reject",
      value: reject || 0,
      suffix: "",
      icon: FaTimesCircle,
      border: "border-red-200",
      iconBg: "bg-red-600",
      iconColor: "text-white",
      valueColor: "text-red-700",
      accent: "#DC2626",
    },
    {
      label: "Efficiency",
      value: efficiency || 0,
      suffix: "%",
      icon: FaGaugeHigh,
      border: "border-[#FDC94D]",
      iconBg: "bg-[#0F1D24]",
      iconColor: "text-[#FDC94D]",
      valueColor: "text-[#0F1D24]",
      accent: "#FDC94D",
    },
  ];

  return (
    <div className="mb-1 flex flex-wrap gap-1.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative flex items-center gap-3 overflow-hidden border bg-white py-2 pl-3.5 pr-3 ${card.border}`}
          >

            <div className="whitespace-nowrap">
              <p className="text-[10px] font-bold uppercase leading-tight tracking-wider text-[#9B9B9B]">
                {card.label}
              </p>
              <h3 className={`mt-0.5 font-mono text-lg font-extrabold leading-tight ${card.valueColor}`}>
                {card.value}
                {card.suffix}
              </h3>
            </div>

            <div className={`flex h-8 w-8 shrink-0 items-center justify-center ${card.iconBg}`}>
              <Icon className={`text-sm ${card.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;