import React from "react";
import { motion } from "framer-motion";

import EmployeeAvatar from "./EmployeeAvatar";
import EmployeeActions from "./EmployeeActions";

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.35,
      ease: "easeOut",
    },
  }),
};

const EmployeeRow = ({ employee, index, onView, onEdit, onDelete }) => {
  return (
    <motion.tr
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="
        group
        relative
        border-b
        border-slate-200
        even:bg-slate-50/50
        hover:bg-blue-50
        transition-colors
        duration-300
      "
    >
      {/* Employee */}

      <td className="relative px-2 py-1.5 align-middle">
        {/* Left Border */}

        <span
          className="
            absolute
            left-0
            top-0
            h-full
            w-1
            bg-blue-600
            scale-y-0
            origin-top
            transition-transform
            duration-300
            group-hover:scale-y-100
          "
        />

        <div className="transition-all duration-300 group-hover:translate-x-2">
          <EmployeeAvatar employee={employee} />
        </div>
      </td>

      {/* Department */}

      <td className="px-3 py-1.5 align-middle">
        <span
          className="
            inline-flex
            items-center
            rounded-full
            border
            border-slate-200
            bg-slate-100
            px-2
            py-0.5
            text-xs
            font-medium
            text-slate-700
            transition-all
            duration-300
            group-hover:border-blue-200
            group-hover:bg-blue-100
            group-hover:text-blue-700
          "
        >
          {employee.department}
        </span>
      </td>

      {/* Shift */}

      <td className="px-3 py-1.5 align-middle">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border transition-all duration-300 ${
            employee.shift === "Morning"
              ? "bg-yellow-100 border-yellow-200 text-yellow-700"
              : employee.shift === "Evening"
                ? "bg-indigo-100 border-indigo-200 text-indigo-700"
                : "bg-slate-100 border-slate-200 text-slate-700"
          }`}
        >
          {employee.shift}
        </span>
      </td>

      {/* Actions */}

      <td className="px-3 py-1.5 align-middle">
        <div className="flex justify-center transition-transform duration-300 group-hover:scale-105">
          <EmployeeActions
            employee={employee}
            onView={() => onView?.(employee)}
            onEdit={() => onEdit?.(employee)}
            onDelete={() => onDelete?.(employee)}
          />
        </div>
      </td>
    </motion.tr>
  );
};

export default EmployeeRow;