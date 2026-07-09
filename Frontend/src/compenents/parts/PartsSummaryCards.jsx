import React, { useMemo } from "react";
import { motion } from "framer-motion";

import {
  Boxes,
  CheckCircle2,
  Layers3,
  TimerReset,
} from "lucide-react";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.35,
    },
  }),
};

const PartsSummaryCards = ({ parts }) => {
  const summary = useMemo(() => {
    const totalParts = parts.length;

    const activeParts = parts.filter(
      (part) => part.status === "Active"
    ).length;

    const totalCategories = new Set(
      parts.map((part) => part.productCategory)
    ).size;

    const averageCycleTime =
      totalParts === 0
        ? 0
        : (
            parts.reduce(
              (sum, part) => sum + Number(part.actualCycleTime),
              0
            ) / totalParts
          ).toFixed(1);

    return {
      totalParts,
      activeParts,
      totalCategories,
      averageCycleTime,
    };
  }, [parts]);

  const cards = [
    {
      title: "Total Parts",
      value: summary.totalParts,
      icon: Boxes,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Active Parts",
      value: summary.activeParts,
      icon: CheckCircle2,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Categories",
      value: summary.totalCategories,
      icon: Layers3,
      bg: "bg-orange-100",
      color: "text-orange-600",
    },
    {
      title: "Avg Actual CT",
      value: `${summary.averageCycleTime} sec`,
      icon: TimerReset,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {card.value}
                </h2>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg}`}
              >
                <Icon
                  className={card.color}
                  size={28}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PartsSummaryCards;