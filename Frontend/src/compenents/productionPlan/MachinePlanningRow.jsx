import { useState, useEffect } from "react";
import OperatorSearchSelect from "./OperatorSearchSelect";
import PartSearchSelect from "./PartSearchSelect";
import MouldChangeModal from "./MouldChangeModal";
import { updateDetail } from "../../api/productionPlanApi";
import { updateActualCycleTime } from "../../api/partApi";
import { calcTargetQty } from "../../utils/shiftTime";
import { HiOutlineArrowsRightLeft } from "react-icons/hi2";

const MachinePlanningRow = ({ row, planId, hall, shift, planningDate, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [targetQty, setTargetQty] = useState(row.target_qty || "");
  const [actualCT, setActualCT] = useState(row.actual_cycle_time || row.cycle_time || "");
  const [showMouldModal, setShowMouldModal] = useState(false);

  useEffect(() => {
    setTargetQty(row.target_qty || "");
    setActualCT(row.actual_cycle_time || row.cycle_time || "");
  }, [row.target_qty, row.actual_cycle_time, row.cycle_time]);

  const autoTarget = calcTargetQty(actualCT);

  const save = async (payload) => {
    try {
      setSaving(true);
      const updatedPlan = await updateDetail(row.detail_id, {
        operator_id: payload.operator_id ?? row.operator_id,
        part_id: payload.part_id ?? row.part_id,
        target_qty: payload.target_qty ?? targetQty,
      });
      onSaved(updatedPlan);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const handleOperatorSelect = (operator_id) => save({ operator_id });

  const handlePartSelect = (part) => {
    setActualCT(part?.actual_cycle_time || part?.cycle_time || "");
    save({ part_id: part?.id || null });
  };

  const handleTargetBlur = () => {
    if (Number(targetQty) !== Number(row.target_qty || 0)) {
      save({ target_qty: Number(targetQty) || 0 });
    }
  };

  // Actual cycle time change -> parts table update + target_qty bhi save
  const handleActualCTBlur = async () => {
    if (!row.part_id) return;
    const newVal = Number(actualCT) || 0;
    if (newVal === Number(row.actual_cycle_time || row.cycle_time || 0)) return;
    try {
      setSaving(true);
      await updateActualCycleTime(row.part_id, newVal);
      const updatedPlan = await updateDetail(row.detail_id, {
        operator_id: row.operator_id,
        part_id: row.part_id,
        target_qty: Number(targetQty) || 0,
      });
      onSaved(updatedPlan);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const applyAutoTarget = () => {
    setTargetQty(autoTarget);
    save({ target_qty: autoTarget });
  };

  const completed = row.operator_id && row.part_id && row.target_qty > 0;
  const activeMouldChange = row.mould_changes?.find((mc) => mc.status !== "Cancelled");

  return (
    <>
      <tr className="hover:bg-gray-50 border-b border-[#E2E4E9]">
        <td className="px-3 py-1 text-xs font-mono font-semibold text-gray-700">{row.machine_code}</td>
        <td className="px-3 py-1 text-xs text-gray-600">{row.machine_name}</td>

        <td className="px-3 py-1 w-52">
          <OperatorSearchSelect value={row.operator_id} valueName={row.operator_name} onSelect={handleOperatorSelect} />
        </td>

        <td className="px-3 py-1 w-56">
          <PartSearchSelect value={row.part_number} valueName={row.part_name} onSelect={handlePartSelect} />
        </td>

        <td className="px-3 py-1 text-center text-xs font-mono text-gray-500">
          {row.cycle_time ? `${row.cycle_time}s` : "--"}
        </td>

        <td className="px-3 py-1 w-24">
          <input
            type="number"
            value={actualCT}
            onChange={(e) => setActualCT(e.target.value)}
            onBlur={handleActualCTBlur}
            disabled={!row.part_id}
            className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB] disabled:bg-gray-50"
          />
        </td>

        <td className="px-3 py-1 w-28">
          <input
            type="number"
            value={targetQty}
            onChange={(e) => setTargetQty(e.target.value)}
            onBlur={handleTargetBlur}
            className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
          {!!actualCT && Number(targetQty) !== autoTarget && (
            <button
              type="button"
              onClick={applyAutoTarget}
              className="text-[10px] text-[#2563EB] hover:underline mt-0.5"
            >
              Suggested: {autoTarget}
            </button>
          )}
        </td>

        <td className="px-3 py-1">
          {saving ? (
            <span className="text-[11px] text-gray-400">Saving...</span>
          ) : completed ? (
            <span className="bg-green-100 text-green-700 rounded-sm px-2 py-0.5 text-[11px] font-semibold">Planned</span>
          ) : (
            <span className="bg-yellow-100 text-yellow-700 rounded-sm px-2 py-0.5 text-[11px] font-semibold">Pending</span>
          )}
        </td>

        <td className="px-3 py-1">
          {activeMouldChange ? (
            <button
              onClick={() => setShowMouldModal(true)}
              className={`rounded-sm px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 ${
                activeMouldChange.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <HiOutlineArrowsRightLeft className="w-3 h-3" />
              {activeMouldChange.status === "Completed" ? "MC Done" : `MC → ${activeMouldChange.new_part_number}`}
            </button>
          ) : (
            <button
              onClick={() => setShowMouldModal(true)}
              className="rounded-sm border border-[#E2E4E9] px-2 py-0.5 text-[11px] text-gray-500 hover:border-[#2563EB] hover:text-[#2563EB] flex items-center gap-1"
            >
              <HiOutlineArrowsRightLeft className="w-3 h-3" /> Plan MC
            </button>
          )}
        </td>
      </tr>

      {showMouldModal && (
        <MouldChangeModal
          row={row}
          planId={planId}
          hall={hall}
          shift={shift}
          planningDate={planningDate}
          onClose={() => setShowMouldModal(false)}
          onSaved={onSaved}
        />
      )}
    </>
  );
};

export default MachinePlanningRow;