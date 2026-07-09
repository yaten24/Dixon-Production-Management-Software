import React from "react";
import { motion } from "framer-motion";

/* ---------- matches dashboard accent family: blue -> indigo -> purple ---------- */

const ProductionStatCard = ({ stat }) => {
  const Icon = stat.icon;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="group relative overflow-hidden rounded border border-slate-200 bg-white p-1 shadow-sm transition-colors duration-200 hover:border-blue-400/60 hover:shadow-md"
    >
      {/* subtle gradient wash on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(124,58,237,0.04) 100%)",
        }}
        transition={{ duration: 0.25 }}
      />

      {/* top accent line, grows in on hover */}
      <motion.span
        className="absolute left-0 top-0 h-[2px] w-full origin-left scale-x-0 group-hover:scale-x-100"
        style={{
          background: "linear-gradient(90deg, #2563EB, #7C3AED)",
          transition: "transform 0.35s ease",
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {stat.title}
          </p>

          <h3 className="mt-1 text-xl font-bold leading-none text-slate-800">
            {stat.value}
          </h3>
        </div>

        <motion.div
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ type: "spring", stiffness: 320, damping: 14 }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${stat.bg}`}
        >
          <Icon size={17} className={stat.color} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductionStatCard;