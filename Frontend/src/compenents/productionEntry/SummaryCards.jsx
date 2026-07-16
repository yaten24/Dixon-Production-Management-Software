import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FaBullseye, FaGaugeHigh } from "react-icons/fa6";

// Brand palette: highlight #0F1D24 (navy) · gray #9B9B9B · accent #FDC94D (gold) · darken #C6C6C6 (borders)
// Actual/Reject stay semantic (green/red) — good vs bad production outcomes
// need universal color scanning. Target & Efficiency are neutral brand metrics.

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

const SummaryCards = ({ target, actual, reject, efficiency }) => {
  const cards = [
    {
      label: "Target",
      value: target || 0,
      suffix: "",
      icon: FaBullseye,
      accent: "#0F1D24",
      bg: "bg-[#0F1D24]/[0.04]",
      border: "border-[#0F1D24]/15",
      iconBg: "bg-[#0F1D24]",
      iconColor: "text-[#FDC94D]",
      valueColor: "text-[#0F1D24]",
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
      iconColor: "text-white",
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
      iconColor: "text-white",
      valueColor: "text-red-700",
    },
    {
      label: "Efficiency",
      value: efficiency || 0,
      suffix: "%",
      icon: FaGaugeHigh,
      accent: "#FDC94D",
      bg: "bg-[#FDC94D]/10",
      border: "border-[#FDC94D]/40",
      iconBg: "bg-[#0F1D24]",
      iconColor: "text-[#FDC94D]",
      valueColor: "text-[#0F1D24]",
    },
  ];

  return (
    <div className="mb-1 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className={`relative flex items-center justify-between overflow-hidden rounded border ${card.border} ${card.bg} py-2.5 pl-3.5 pr-3 shadow-sm transition-shadow duration-300 hover:shadow-md`}
          >
            {/* Left accent bar */}
            <span
              className="absolute left-0 top-0 h-full w-1"
              style={{ background: card.accent }}
            />

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase leading-tight tracking-wider text-[#9B9B9B]">
                {card.label}
              </p>
              <motion.h3
                key={card.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className={`mt-0.5 text-xl font-extrabold leading-tight ${card.valueColor}`}
              >
                {card.value}
                {card.suffix}
              </motion.h3>
            </div>

            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${card.iconBg} shadow-sm`}
            >
              <Icon className={`text-sm ${card.iconColor}`} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SummaryCards;