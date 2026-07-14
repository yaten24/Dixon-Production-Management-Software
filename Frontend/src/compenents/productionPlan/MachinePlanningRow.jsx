import { useState } from "react";
import OperatorSearchSelect from "./OperatorSearchSelect";
import PartSearchSelect from "./PartSearchSelect";
import { updateDetail } from "../../api/productionPlanApi";

const MachinePlanningRow = ({ row, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [targetQty, setTargetQty] = useState(row.target_qty || "");

  const save = async (payload) => {
    try {
      setSaving(true);
      const updatedPlan = await updateDetail(row.detail_id, {
        operator_id: payload.operator_id ?? row.operator_id,
        part_id: payload.part_id ?? row.part_id,
        target_qty: payload.target_qty ?? targetQty,
      }); // ⚠️ updateDetail() already returns res.data, so no `.data` here
      onSaved(updatedPlan);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const handleOperatorSelect = (operator_id) => save({ operator_id });
  const handlePartSelect = (part) => save({ part_id: part?.id || null });

  const handleTargetBlur = () => {
    if (Number(targetQty) !== Number(row.target_qty || 0)) {
      save({ target_qty: Number(targetQty) || 0 });
    }
  };

  const completed = row.operator_id && row.part_id && row.target_qty > 0;

  return (
    <tr className="hover:bg-gray-50 border-b border-[#E2E4E9]">
      <td className="px-3 py-1 text-xs font-mono font-semibold text-gray-700">
        {row.machine_code}
      </td>
      <td className="px-3 py-1 text-xs text-gray-600">{row.machine_name}</td>

      <td className="px-3 py-1 w-52">
        <OperatorSearchSelect
          value={row.operator_id}
          valueName={row.operator_name}
          onSelect={handleOperatorSelect}
        />
      </td>

      <td className="px-3 py-1 w-56">
        <PartSearchSelect
          value={row.part_number}
          valueName={row.part_name}
          onSelect={handlePartSelect}
        />
      </td>

      <td className="px-3 py-1 text-center text-xs font-mono text-gray-500">
        {row.cycle_time ? `${row.cycle_time}s` : "--"}
      </td>

      <td className="px-3 py-1 w-28">
        <input
          type="number"
          value={targetQty}
          onChange={(e) => setTargetQty(e.target.value)}
          onBlur={handleTargetBlur}
          className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
        />
      </td>

      <td className="px-3 py-1">
        {saving ? (
          <span className="text-[11px] text-gray-400">Saving...</span>
        ) : completed ? (
          <span className="bg-green-100 text-green-700 rounded-sm px-2 py-0.5 text-[11px] font-semibold">
            Planned
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-700 rounded-sm px-2 py-0.5 text-[11px] font-semibold">
            Pending
          </span>
        )}
      </td>
    </tr>
  );
};

export default MachinePlanningRow;
