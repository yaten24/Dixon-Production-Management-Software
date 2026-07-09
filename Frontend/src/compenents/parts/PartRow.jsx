import React from "react";
import { motion } from "framer-motion";

import PartStatusBadge from "./PartStatusBadge";
import PartActions from "./PartActions";

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.04,
      duration: 0.25,
    },
  }),
};

const PartRow = ({ part, index, serialNumber, refresh }) => {
  return (
    <motion.tr
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="transition-colors hover:bg-slate-50"
    >
      {/* Serial Number */}
      <td className="px-2 py-1.5 text-xs font-medium text-slate-500">
        {serialNumber}
      </td>

      {/* Part Number */}
      <td className="px-2 py-1.5">
        <p className="text-xs font-semibold text-slate-800">
          {part.part_number}
        </p>
      </td>

      {/* Part Name */}
      <td className="px-2 py-1.5">
        <p className="text-xs font-medium text-slate-800 leading-tight">
          {part.part_name}
        </p>

        <p className="text-[10px] text-slate-500 leading-tight">
          Production Part
        </p>
      </td>

      {/* Category */}
      <td className="px-2 py-1.5">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
          {part.product_category}
        </span>
      </td>

      {/* Source */}
      <td className="px-2 py-1.5 text-xs text-slate-700">
        {part.source}
      </td>

      {/* Customer */}
      <td className="px-2 py-1.5 text-xs text-slate-700">
        {part.customer}
      </td>

      {/* Standard Cycle Time */}
      <td className="px-2 py-1.5">
        <span className="text-xs font-medium text-blue-600">
          {part.standard_cycle_time} sec
        </span>
      </td>

      {/* Actual Cycle Time */}
      <td className="px-2 py-1.5">
        <span
          className={`text-xs font-medium ${
            Number(part.actual_cycle_time) <= Number(part.standard_cycle_time)
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {part.actual_cycle_time} sec
        </span>
      </td>

      {/* Status */}
      <td className="px-2 py-1.5">
        <PartStatusBadge status={part.status} />
      </td>

      {/* Actions */}
      <td className="px-2 py-1.5 text-center">
        <PartActions
          part={part}
          refresh={refresh}
        />
      </td>
    </motion.tr>
  );
};

export default React.memo(PartRow);