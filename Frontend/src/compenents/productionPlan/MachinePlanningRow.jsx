import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import OperatorSearchSelect from "./OperatorSearchSelect";
import PartSearchSelect from "./PartSearchSelect";
import MouldChangeModal from "./MouldChangeModal";
import { updateDetail } from "../../api/productionPlanApi";
import { updateActualCycleTime } from "../../api/partApi";
import { calcTargetQty } from "../../utils/shiftTime";
import { HiOutlineArrowsRightLeft, HiOutlineCheck, HiOutlineClock } from "react-icons/hi2";

// Brand palette: highlight #0F1D24 (navy) · gray #9B9B9B · accent #FDC94D (gold) · darken #C6C6C6 (borders)

const blockWheelChange = (e) => e.target.blur();

const MachinePlanningRow = ({
  row,
  index = 0,
  planId,
  hall,
  shift,
  planningDate,
  onSaved,
}) => {
  const [saving, setSaving] = useState(false);
  const [targetQty, setTargetQty] = useState(row.target_qty || "");
  const [actualCT, setActualCT] = useState(
    row.actual_cycle_time || row.cycle_time || "",
  );
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
  const activeMouldChange = row.mould_changes?.find(
    (mc) => mc.status !== "Cancelled",
  );

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.2, ease: "easeOut" }}
        className="border-b border-[#C6C6C6]/30 transition-colors hover:bg-[#FDC94D]/10"
      >
        <td className="px-2.5 py-1 text-[11px] font-mono font-bold text-[#0F1D24]">
          {row.machine_code}
        </td>
        <td className="px-2.5 py-1 text-[11px] text-[#9B9B9B] truncate max-w-[100px]">
          {row.machine_name}
        </td>

        <td className="px-2 py-1 w-48">
          <OperatorSearchSelect
            value={row.operator_id}
            valueName={row.operator_name}
            onSelect={handleOperatorSelect}
          />
        </td>

        <td className="px-2 py-1 w-120">
          <PartSearchSelect
            value={row.part_number}
            valueName={row.part_name}
            onSelect={handlePartSelect}
          />
        </td>

        <td className="px-2 py-1 text-center text-[11px] font-mono text-[#9B9B9B]">
          {row.cycle_time ? `${row.cycle_time}s` : "--"}
        </td>

        <td className="px-2 py-1 w-20">
          <input
            type="number"
            value={actualCT}
            onChange={(e) => setActualCT(e.target.value)}
            onBlur={handleActualCTBlur}
            onWheel={blockWheelChange}
            disabled={!row.part_id}
            className="w-full h-7 rounded border border-[#C6C6C6]/60 px-1.5 text-[11px] font-mono text-[#0F1D24] focus:outline-none focus:ring-1 focus:ring-[#0F1D24] focus:border-[#0F1D24] disabled:bg-[#F5F5F5] disabled:text-[#9B9B9B] transition-colors"
          />
        </td>

        <td className="px-2 py-1 w-24">
          <input
            type="number"
            value={targetQty}
            onChange={(e) => setTargetQty(e.target.value)}
            onBlur={handleTargetBlur}
            onWheel={blockWheelChange}
            className="w-full h-7 rounded border border-[#C6C6C6]/60 px-1.5 text-[11px] font-mono text-[#0F1D24] focus:outline-none focus:ring-1 focus:ring-[#0F1D24] focus:border-[#0F1D24] transition-colors"
          />
          {!!actualCT && Number(targetQty) !== autoTarget && (
            <button
              type="button"
              onClick={applyAutoTarget}
              className="text-[9px] font-semibold text-[#0F1D24] hover:text-[#FDC94D] hover:bg-[#0F1D24] rounded px-1 mt-0.5 transition-colors"
            >
              Suggested: {autoTarget}
            </button>
          )}
        </td>

        <td className="px-2 py-1">
          {saving ? (
            <span className="text-[10px] text-[#9B9B9B] animate-pulse">Saving...</span>
          ) : completed ? (
            <span className="inline-flex items-center gap-0.5 bg-[#0F1D24] text-[#FDC94D] rounded px-1.5 py-0.5 text-[10px] font-bold">
              <HiOutlineCheck className="w-2.5 h-2.5" /> Planned
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 bg-[#F5F5F5] text-[#9B9B9B] border border-[#C6C6C6]/60 rounded px-1.5 py-0.5 text-[10px] font-bold">
              <HiOutlineClock className="w-2.5 h-2.5" /> Pending
            </span>
          )}
        </td>

        <td className="px-2 py-1">
          {activeMouldChange ? (
            <button
              onClick={() => setShowMouldModal(true)}
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1 transition-colors ${
                activeMouldChange.status === "Completed"
                  ? "bg-[#0F1D24] text-[#FDC94D]"
                  : "bg-[#FDC94D]/20 text-[#0F1D24] border border-[#FDC94D]/50"
              }`}
            >
              <HiOutlineArrowsRightLeft className="w-2.5 h-2.5" />
              {activeMouldChange.status === "Completed"
                ? "MC Done"
                : `MC → ${activeMouldChange.new_part_number}`}
            </button>
          ) : (
            <button
              onClick={() => setShowMouldModal(true)}
              className="rounded border border-[#C6C6C6]/60 px-1.5 py-0.5 text-[10px] font-semibold text-[#9B9B9B] hover:border-[#0F1D24] hover:text-[#0F1D24] hover:bg-[#F5F5F5] flex items-center gap-1 transition-colors"
            >
              <HiOutlineArrowsRightLeft className="w-2.5 h-2.5" /> Plan MC
            </button>
          )}
        </td>
      </motion.tr>

      {showMouldModal && (
        <MouldChangeModal
          row={row}
          planId={planId}
          hall={hall}
          shift={shift}
          planningDate={planningDate}
          existingMC={activeMouldChange}
          onClose={() => setShowMouldModal(false)}
          onSaved={onSaved}
        />
      )}
    </>
  );
};

export default MachinePlanningRow;