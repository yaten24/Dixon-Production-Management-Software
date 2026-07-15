import { motion } from "framer-motion";
import MachinePlanningRow from "./MachinePlanningRow";

const HEADERS = [
  { label: "Machine", align: "left" },
  { label: "Name", align: "left" },
  { label: "Operator", align: "left" },
  { label: "Part", align: "left" },
  { label: "Std CT", align: "center" },
  { label: "Actual CT", align: "left" },
  { label: "Target Qty", align: "left" },
  { label: "Status", align: "left" },
  { label: "Mould Change", align: "left" },
];

const MachinePlanningTable = ({ header, details, onRowSaved }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm"
  >
    {/* Header */}
    <div className="flex items-center gap-1.5 border-b border-[#C6C6C6]/50 bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[#FDC94D]" />
      <h2 className="text-xs font-bold tracking-wide text-[#0F1D24]">Machine Planning</h2>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-[#0F1D24]">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h.label}
                className={`whitespace-nowrap px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#FDC94D] text-${h.align}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#C6C6C6]/30">
          {details.map((row, index) => (
            <MachinePlanningRow
              key={row.detail_id}
              row={row}
              index={index}
              planId={header.plan_id}
              hall={header.hall}
              shift={header.shift}
              planningDate={header.planning_date}
              onSaved={onRowSaved}
            />
          ))}
        </tbody>
      </table>

      {!details.length && (
        <div className="flex h-24 items-center justify-center text-xs text-[#9B9B9B]">
          No machines planned yet.
        </div>
      )}
    </div>
  </motion.div>
);

export default MachinePlanningTable;