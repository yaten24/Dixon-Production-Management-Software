import MachinePlanningRow from "./MachinePlanningRow";

const MachinePlanningTable = ({ header, details, onRowSaved }) => (
  <div className="bg-white rounded-sm border border-[#E2E4E9]">
    <div className="border-b border-[#E2E4E9] px-3 py-1">
      <h2 className="text-sm font-semibold text-gray-800">Machine Planning</h2>
    </div>

    <div className="overflow-auto">
      <table className="min-w-full">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            <th className="px-3 py-1 text-left text-[11px] font-medium text-gray-500">Machine</th>
            <th className="px-3 py-1 text-left text-[11px] font-medium text-gray-500">Name</th>
            <th className="px-3 py-1 text-left text-[11px] font-medium text-gray-500">Operator</th>
            <th className="px-3 py-1 text-left text-[11px] font-medium text-gray-500">Part</th>
            <th className="px-3 py-1 text-center text-[11px] font-medium text-gray-500">Std CT</th>
            <th className="px-3 py-1 text-left text-[11px] font-medium text-gray-500">Actual CT</th>
            <th className="px-3 py-1 text-left text-[11px] font-medium text-gray-500">Target Qty</th>
            <th className="px-3 py-1 text-left text-[11px] font-medium text-gray-500">Status</th>
            <th className="px-3 py-1 text-left text-[11px] font-medium text-gray-500">Mould Change</th>
          </tr>
        </thead>
        <tbody>
          {details.map((row) => (
            <MachinePlanningRow
              key={row.detail_id}
              row={row}
              planId={header.plan_id}
              hall={header.hall}
              shift={header.shift}
              planningDate={header.planning_date}
              onSaved={onRowSaved}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default MachinePlanningTable;