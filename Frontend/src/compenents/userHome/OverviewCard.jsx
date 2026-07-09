import React from "react";
import { motion } from "framer-motion";

const OverviewCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative overflow-hidden rounded border border-slate-200 bg-white p-2 shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Decorative gradient glow on hover */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20 ${item.iconBg}`}
      />

      <div className="relative flex items-center justify-between gap-3">
        {/* Left */}

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
            {item.title}
          </p>

          <h2
            className={`mt-1.5 text-3xl font-bold leading-none ${item.valueColor}`}
          >
            {item.value}
          </h2>

          <p
            className={`mt-2 truncate text-xs font-medium ${item.subtitleColor}`}
          >
            {item.subtitle}
          </p>
        </div>

        {/* Right */}

        <motion.div
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={`flex h-14 w-14 items-center justify-center rounded text-white shadow-md flex-shrink-0 ${item.iconBg}`}
        >
          <Icon className="h-7 w-7" />
        </motion.div>
      </div>

      {/* Progress */}

      <div className="relative mt-4 h-1.5 overflow-hidden rounded bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full transition-all duration-500 group-hover:w-full ${item.iconBg}`}
        />
      </div>
    </motion.div>
  );
};

export default OverviewCard;