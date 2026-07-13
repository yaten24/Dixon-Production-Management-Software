import React from "react";
import { motion } from "framer-motion";

import EmployeeAvatar from "./EmployeeAvatar";
import EmployeeActions from "./EmployeeActions";

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: Math.min(index, 20) * 0.02, duration: 0.3, ease: "easeOut" },
  }),
};

const performanceBadgeClass = (value) => {
  if (value >= 90) return "bg-green-100 border-green-200 text-green-700";
  if (value >= 70) return "bg-amber-100 border-amber-200 text-amber-700";
  if (value > 0) return "bg-red-100 border-red-200 text-red-700";
  return "bg-slate-100 border-slate-200 text-slate-500";
};

const EmployeeRow = ({ operator, index, onView, onDelete }) => {
  const performance = Number(operator.performance) || 0;

  return (
    <motion.tr
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="group relative border-b border-slate-200 even:bg-slate-50/50 hover:bg-blue-50 transition-colors duration-300"
    >
      {/* Operator */}
      <td className="relative px-2 py-1.5 align-middle">
        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />
        <div className="transition-all duration-300 group-hover:translate-x-2">
          <EmployeeAvatar operator={operator} />
        </div>
      </td>

      {/* Hall */}
      <td className="px-3 py-1.5 align-middle">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 transition-all duration-300 group-hover:border-blue-200 group-hover:bg-blue-100 group-hover:text-blue-700">
          {operator.hall}
        </span>
      </td>

      {/* Shift */}
      <td className="px-3 py-1.5 align-middle">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border bg-indigo-100 border-indigo-200 text-indigo-700">
          {operator.shift}
        </span>
      </td>

      {/* Performance */}
      <td className="px-3 py-1.5 align-middle">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${performanceBadgeClass(
            performance
          )}`}
        >
          {performance}%
        </span>
      </td>

      {/* Actions */}
      <td className="px-3 py-1.5 align-middle">
        <div className="flex justify-center transition-transform duration-300 group-hover:scale-105">
          <EmployeeActions operator={operator} onView={() => onView?.(operator)} onDelete={() => onDelete?.(operator)} />
        </div>
      </td>
    </motion.tr>
  );
};

export default EmployeeRow;
