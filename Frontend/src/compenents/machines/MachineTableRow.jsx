import React from "react";
import { motion } from "framer-motion";

import MachineStatusBadge from "./MachineStatusBadge";
import MachineActionButton from "./MachineActionButton";

const MachineTableRow = ({ index, machine, onStatusChange }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.02,
        duration: 0.25,
        ease: "easeOut",
      }}
      whileHover={{
        backgroundColor: "rgba(239,246,255,1)",
      }}
      className="group border-b border-gray-100 even:bg-gray-50/40 transition-colors duration-200"
    >
      {/* Serial Number */}
      <td className="px-2 py-1 text-[11px] font-medium text-gray-500">
        {index + 1}
      </td>
      {/* Machine Name */}
      <td className="px-2 py-1">
        <div className="text-xs font-semibold text-gray-800 transition-transform duration-200 group-hover:translate-x-0.5">
          {machine.machine_name}
        </div>
      </td>
      {/* Machine Code */}
      <td className="px-2 py-1 text-[11px] font-mono text-gray-500">
        {machine.machine_code}
      </td>
      {/* Hall */}
      <td className="px-2 py-1">
        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium transition-colors duration-200 group-hover:bg-blue-100 group-hover:text-blue-700">
          {machine.hall}
        </span>
      </td>
      {/* Status */}
      <td className="px-2 py-1">
        <MachineStatusBadge status={machine.status} />
      </td>

      <td className="px-2 py-1 text-center">
        <div className="flex justify-center">
          <MachineActionButton
            machine={machine}
            onStatusChange={onStatusChange}
          />
        </div>
      </td>
    </motion.tr>
  );
};

export default React.memo(MachineTableRow);
