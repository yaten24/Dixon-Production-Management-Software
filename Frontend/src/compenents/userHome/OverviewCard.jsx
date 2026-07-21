// OverviewCard.jsx
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

// Priority-driven sizing — "lg" is the hero card, "md" is compact.
const SIZE_STYLES = {
  lg: {
    pad: "p-3",
    icon: "h-11 w-11",
    iconInner: "h-5.5 w-5.5",
    title: "text-[10.5px]",
    value: "text-[30px]",
    subtitle: "text-[11.5px]",
    gap: "gap-3",
    bar: "mt-2.5 h-1.5",
  },
  md: {
    pad: "p-2",
    icon: "h-8 w-8",
    iconInner: "h-4 w-4",
    title: "text-[9px]",
    value: "text-[18px]",
    subtitle: "text-[10px]",
    gap: "gap-2",
    bar: "mt-1.5 h-1",
  },
};

const OverviewCard = ({ item }) => {
  const Icon = item.icon;
  const tone = TONE_STYLES[item.tone] || TONE_STYLES.blue;
  const s = SIZE_STYLES[item.size] || SIZE_STYLES.md;
  const isAlert = item.tone === "red";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`group relative flex h-full flex-col overflow-hidden rounded border border-[#C6C6C6]/50 bg-white ${s.pad} shadow-[0_1px_2px_rgba(15,29,36,0.05)] transition-shadow duration-300 hover:border-transparent hover:shadow-[0_12px_28px_-8px_rgba(15,29,36,0.18)]`}
    >
      <div className={`relative flex flex-1 items-start justify-between ${s.gap}`}>
        {/* Left */}
        <div className="min-w-0 flex-1">
          <p className={`truncate font-bold uppercase tracking-wide text-[#9B9B9B] ${s.title}`}>
            {item.title}
          </p>

          <h2 className={`mt-1 font-mono font-bold leading-none ${s.value} ${tone.value}`}>
            {item.value}
          </h2>

          <p className={`mt-1 truncate font-semibold text-[#9B9B9B] ${s.subtitle}`}>
            {item.subtitle}
          </p>
        </div>

        {/* Right — icon tinted to match this card's semantic color; alerts pulse */}
        <motion.div
          animate={isAlert ? { scale: [1, 1.1, 1] } : {}}
          transition={isAlert ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : {}}
          className={`flex flex-shrink-0 items-center justify-center rounded ${s.icon} ${tone.iconBg} ${tone.iconText} shadow-sm`}
        >
          <Icon className={s.iconInner} />
        </motion.div>
      </div>

      {/* Progress accent */}
      <div className={`relative overflow-hidden rounded bg-[#C6C6C6]/40 ${s.bar}`}>
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