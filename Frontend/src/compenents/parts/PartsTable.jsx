import React from "react";

import PartRow from "./PartRow";

const PartsTable = ({ parts }) => {
  if (parts.length === 0) {
    return (
      <div className="rounded border border-dashed border-slate-300 bg-white py-10 text-center shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">No Parts Found</h2>

        <p className="mt-1 text-xs text-slate-500">
          Try changing the search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full whitespace-nowrap">
          <thead className="sticky top-0 bg-slate-100">
            <tr className="border-b border-slate-200 text-left">
              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                S.No
              </th>

              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Part Number
              </th>

              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Part Name
              </th>

              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Category
              </th>

              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Source
              </th>

              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Customer
              </th>

              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Std CT
              </th>

              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Actual CT
              </th>

              <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Status
              </th>

              <th className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {parts.map((part, index) => (
              <PartRow
                key={part.id}
                part={part}
                index={index}
                serialNumber={index + 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartsTable;
