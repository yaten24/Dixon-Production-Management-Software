import React from "react";
import { motion } from "framer-motion";

const ProgressCard = ({ progress }) => {
  return (
    <div className="bg-white border border-[#E2E4E9] rounded-sm px-2.5 py-1.5 mb-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-600">
          Entry Progress
        </span>

        <span className="text-xs font-bold text-[#2563EB] font-mono">
          {progress}%
        </span>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-sm overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-[#2563EB] rounded-sm"
        />
      </div>
    </div>
  );
};

export default ProgressCard;
