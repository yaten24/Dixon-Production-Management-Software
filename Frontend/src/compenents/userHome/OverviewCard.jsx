import React from "react";
import { motion } from "framer-motion";

// ==========================================================
// Light KPI card, white surface across every card (consistent,
// professional) — but the NUMBER itself is highlighted with a
// semantic color so bad metrics (rejection, loss time) read as
// red at a glance and good metrics (production) read as green.
// ==========================================================

const TONE_STYLES = {
  blue: {
    value: "text-blue-600",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    bar: "bg-blue-600",
  },
  green: {
    value: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    bar: "bg-emerald-600",
  },
  red: {
    value: "text-red-600",
    iconBg: "bg-red-50",
    iconText: "text-red-600",
    bar: "bg-red-600",
  },
  amber: {
    value: "text-amber-600",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    bar: "bg-amber-600",
  },
};

const OverviewCard = ({ item }) => {
  const Icon = item.icon;
  const tone = TONE_STYLES[item.tone] || TONE_STYLES.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-sm border border-slate-200 bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="relative flex items-start justify-between gap-3">
        {/* Left */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500">
            {item.title}
          </p>

          <h2 className={`mt-1.5 font-mono text-[26px] font-bold leading-none ${tone.value}`}>
            {item.value}
          </h2>

          <p className="mt-2 truncate text-[11px] font-semibold text-slate-600">
            {item.subtitle}
          </p>
        </div>

        {/* Right — icon tinted to match this card's semantic color */}
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sm ${tone.iconBg} ${tone.iconText}`}>
          <Icon className="h-5.5 w-5.5" />
        </div>
      </div>

      {/* Progress accent */}
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-sm bg-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className={`h-full rounded-sm ${tone.bar}`}
        />
      </div>
    </motion.div>
  );
};

export default OverviewCard;