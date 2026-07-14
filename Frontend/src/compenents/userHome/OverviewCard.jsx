import React from "react";
import { motion } from "framer-motion";

// ==========================================================
// Brand palette applied. Semantic tones (red = bad, green = good)
// are kept as-is since they carry real meaning for shop-floor
// metrics. Neutral tones now map to the brand's navy/gold instead
// of generic blue/amber, so this section matches the rest of the app.
// ==========================================================

const TONE_STYLES = {
  blue: {
    value: "text-[#0F1D24]",
    iconBg: "bg-[#0F1D24]",
    iconText: "text-[#FDC94D]",
    bar: "bg-[#0F1D24]",
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
    value: "text-[#0F1D24]",
    iconBg: "bg-[#FDC94D]/20",
    iconText: "text-[#0F1D24]",
    bar: "bg-[#FDC94D]",
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
      className="group relative overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-3 shadow-[0_1px_2px_rgba(15,29,36,0.05)] transition-all duration-300 hover:border-transparent hover:shadow-[0_12px_28px_-8px_rgba(15,29,36,0.18)]"
    >
      <div className="relative flex items-start justify-between gap-3">
        {/* Left */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            {item.title}
          </p>

          <h2 className={`mt-1.5 font-mono text-[26px] font-bold leading-none ${tone.value}`}>
            {item.value}
          </h2>

          <p className="mt-1 truncate text-[11px] font-semibold text-[#9B9B9B]">
            {item.subtitle}
          </p>
        </div>

        {/* Right — icon tinted to match this card's semantic color */}
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded ${tone.iconBg} ${tone.iconText} shadow-sm`}>
          <Icon className="h-5.5 w-5.5" />
        </div>
      </div>

      {/* Progress accent */}
      <div className="relative mt-1 h-1.5 overflow-hidden rounded bg-[#C6C6C6]/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className={`h-full rounded ${tone.bar}`}
        />
      </div>
    </motion.div>
  );
};

export default OverviewCard;