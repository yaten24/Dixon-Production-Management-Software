import React from "react";
import { motion } from "framer-motion";

import PartStatusBadge from "./PartStatusBadge";
import PartActions from "./PartActions";

const rowVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.02, duration: 0.2 },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

// UPDATED: now forwards onView (Show button) as well as onEdit/onDelete.
// Previously PartActions was rendered with no onView handler at all, so
// clicking "Show" silently did nothing.
const PartRow = ({ part, index, serialNumber, onView, onEdit, onDelete }) => {
  return (
    <motion.tr
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="transition-colors hover:bg-slate-50"
    >
      <td className="px-2 py-1.5 text-xs font-medium text-slate-500 font-mono">
        {serialNumber}
      </td>

      <td className="px-2 py-1.5">
        <p className="text-xs font-semibold text-slate-800 font-mono">
          {part.part_number}
        </p>
      </td>

      <td className="px-2 py-1.5">
        <p className="text-xs font-medium text-slate-800 leading-tight">
          {part.part_name}
        </p>
        <p className="text-[10px] text-slate-500 leading-tight">
          Production Part
        </p>
      </td>

      <td className="px-2 py-1.5">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
          {part.product_category}
        </span>
      </td>

      <td className="px-2 py-1.5 text-xs text-slate-700">{part.source}</td>

      <td className="px-2 py-1.5 text-xs text-slate-700">{part.customer}</td>

      <td className="px-2 py-1.5">
        <span className="text-xs font-medium text-blue-600 font-mono">
          {part.standard_cycle_time} sec
        </span>
      </td>

      <td className="px-2 py-1.5">
        <span
          className={`text-xs font-medium font-mono ${
            Number(part.actual_cycle_time) <= Number(part.standard_cycle_time)
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {part.actual_cycle_time} sec
        </span>
      </td>

      <td className="px-2 py-1.5">
        <PartStatusBadge status={part.status} />
      </td>

      <td className="px-2 py-1.5 text-center">
        <PartActions
          part={part}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </motion.tr>
  );
};

export default React.memo(PartRow);