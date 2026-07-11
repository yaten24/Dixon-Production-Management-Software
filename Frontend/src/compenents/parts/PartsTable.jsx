import React from "react";
import { AnimatePresence } from "framer-motion";
import { PackageSearch } from "lucide-react";
import PartRow from "./PartRow";

const columns = [
  "S.No",
  "Part Number",
  "Part Name",
  "Category",
  "Source",
  "Customer",
  "Std CT",
  "Actual CT",
  "Status",
  "Actions",
];

const PartsTable = ({ parts = [], onView, onEdit, onDelete }) => {
  if (parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-[#E2E4E9] bg-white py-10">
        <PackageSearch size={28} className="text-slate-300" />
        <p className="text-xs font-medium text-slate-500">
          No parts match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-[#E2E4E9] bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#E2E4E9] bg-slate-50">
            {columns.map((col) => (
              <th
                key={col}
                className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#E2E4E9]">
          <AnimatePresence initial={false}>
            {parts.map((part, index) => (
              <PartRow
                key={part.id}
                part={part}
                index={index}
                serialNumber={index + 1}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default PartsTable;