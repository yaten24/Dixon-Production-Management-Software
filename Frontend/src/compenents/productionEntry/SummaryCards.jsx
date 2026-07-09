import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FaBullseye, FaGaugeHigh } from "react-icons/fa6";

const SummaryCards = ({ target, actual, reject, efficiency }) => {
  const cards = [
    {
      label: "Target",
      value: target || 0,
      suffix: "",
      icon: FaBullseye,
      accent: "#2563EB",
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-600",
      valueColor: "text-blue-700",
    },
    {
      label: "Actual",
      value: actual || 0,
      suffix: "",
      icon: FaCheckCircle,
      accent: "#16A34A",
      bg: "bg-green-50",
      border: "border-green-100",
      iconBg: "bg-green-600",
      valueColor: "text-green-700",
    },
    {
      label: "Reject",
      value: reject || 0,
      suffix: "",
      icon: FaTimesCircle,
      accent: "#DC2626",
      bg: "bg-red-50",
      border: "border-red-100",
      iconBg: "bg-red-600",
      valueColor: "text-red-700",
    },
    {
      label: "Efficiency",
      value: efficiency || 0,
      suffix: "%",
      icon: FaGaugeHigh,
      accent: "#EA580C",
      bg: "bg-orange-50",
      border: "border-orange-100",
      iconBg: "bg-orange-600",
      valueColor: "text-orange-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-1">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative flex items-center justify-between overflow-hidden rounded border ${card.border} ${card.bg} pl-3.5 pr-3 py-2.5 shadow-sm`}
          >
            {/* Left accent bar */}
            <span
              className="absolute left-0 top-0 h-full w-1"
              style={{ background: card.accent }}
            />

            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider leading-tight">
                {card.label}
              </p>
              <h3
                className={`text-xl font-extrabold leading-tight mt-0.5 ${card.valueColor}`}
              >
                {card.value}
                {card.suffix}
              </h3>
            </div>

            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${card.iconBg} shadow-sm`}
            >
              <Icon className="text-white text-sm" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;