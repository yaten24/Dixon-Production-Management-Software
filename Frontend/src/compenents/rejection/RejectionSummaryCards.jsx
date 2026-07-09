import React from "react";
import {
  FaExclamationTriangle,
  FaIndustry,
  FaChartLine,
  FaCogs,
} from "react-icons/fa";

const RejectionSummaryCards = ({
  totalRejectQty = 0,
  highestReason = {},
  highestHall = {},
  highestMachine = {},
}) => {
  const cards = [
    {
      title: "Total Rejection",
      value: totalRejectQty,
      subtitle: "Rejected Parts",
      icon: <FaExclamationTriangle size={14} />,
      text: "text-red-600",
      accent: "bg-red-500",
      iconBg: "bg-red-50",
    },
    {
      title: "Highest Reason",
      value: highestReason?.reason || "N/A",
      subtitle: `${highestReason?.qty || 0} Qty`,
      icon: <FaChartLine size={14} />,
      text: "text-orange-600",
      accent: "bg-orange-500",
      iconBg: "bg-orange-50",
    },
    {
      title: "Highest Hall",
      value: highestHall?.hall || "N/A",
      subtitle: `${highestHall?.qty || 0} Qty`,
      icon: <FaIndustry size={14} />,
      text: "text-blue-600",
      accent: "bg-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      title: "Highest Machine",
      value: highestMachine?.machine || "N/A",
      subtitle: `${highestMachine?.qty || 0} Qty`,
      icon: <FaCogs size={14} />,
      text: "text-green-600",
      accent: "bg-green-500",
      iconBg: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-1 xl:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="
            group
            relative
            flex
            items-center
            gap-2.5
            overflow-hidden
            rounded
            border
            border-slate-200
            bg-white
            py-2
            pl-3
            pr-2.5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
            cursor-pointer
          "
        >
          {/* Left accent bar */}
          <span className={`absolute inset-y-0 left-0 w-1 ${card.accent}`} />

          {/* Icon */}
          <div
            className={`
              ${card.iconBg}
              ${card.text}
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded
              transition-transform
              duration-200
              group-hover:scale-105
            `}
          >
            {card.icon}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              {card.title}
            </p>

            <h2 className="truncate text-base font-bold leading-tight text-slate-800">
              {card.value}
            </h2>

            <p className={`truncate text-[10px] font-medium ${card.text}`}>
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RejectionSummaryCards;
