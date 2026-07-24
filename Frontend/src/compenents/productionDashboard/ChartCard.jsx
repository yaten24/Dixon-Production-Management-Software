import React from "react";
import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";

const ChartCard = ({ icon, iconBg, title, subtitle, onViewHall, full, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex h-full min-h-0 flex-col rounded border border-[#C6C6C6]/50 bg-white p-2 shadow-sm ${
        full ? "w-full" : ""
      }`}
    >
      <div className="mb-2 flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded shadow-sm"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
          <div> 
            <h3 className="text-xs font-bold text-[#0F1D24]">{title}</h3>
            <p className="text-[9px] text-[#9B9B9B]">{subtitle}</p>
          </div>
        </div>

        {onViewHall && (
          <motion.button
            onClick={onViewHall}
            whileHover={{ x: 2 }}
            className="flex items-center gap-1 text-[10px] font-semibold text-[#0F1D24] transition-colors hover:text-[#0F1D24]/70"
          >
            View Details
            <FaChevronRight className="text-[8px]" />
          </motion.button>
        )}
      </div>

      <div className="min-h-0 flex-1">{children}</div>
    </motion.div>
  );
};

export default ChartCard;