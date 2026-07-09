import React from "react";
import { motion } from "framer-motion";

import MachineTableRow from "./MachineTableRow";
import NoMachineFound from "./NoMachineFound";

const MachineTable = ({
  filteredMachines,
  onStatusChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide w-12">
                S.No
              </th>

              <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                Machine Name
              </th>

              <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                Machine Code
              </th>

              <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                Hall
              </th>

              <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                Status
              </th>

              <th className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredMachines.length > 0 ? (
              filteredMachines.map((machine, index) => (
                <MachineTableRow
                  key={machine.id}
                  index={index}
                  machine={machine}
                  onStatusChange={onStatusChange}
                />
              ))
            ) : (
              <NoMachineFound colSpan={6} />
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default React.memo(MachineTable);