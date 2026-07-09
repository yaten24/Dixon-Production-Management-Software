import React from "react";
import { motion } from "framer-motion";

const MachineStatCard = ({
  title,
  value,
  icon,
  bgColor = "bg-blue-50",
  textColor = "text-blue-600",
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`${bgColor} rounded border border-gray-200 px-2.5 py-1.5 flex items-center justify-between shadow-sm`}
    >
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500 font-medium truncate leading-tight">
          {title}
        </p>

        <h2 className={`text-base font-bold leading-tight ${textColor}`}>
          {value}
        </h2>
      </div>

      <div className={`text-lg shrink-0 ml-2 ${textColor}`}>
        {icon}
      </div>
    </motion.div>
  );
};

export default MachineStatCard;