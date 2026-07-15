import { useState, useMemo } from "react";
import PartSearchSelect from "./PartSearchSelect";
import { createMouldChange } from "../../api/mouldChangeApi";
import { getTimeSlots, calcTargetQty, remainingSecondsFromSlot } from "../../utils/shiftTime";
import { toDateOnly } from "../../utils/date";

const MouldChangeModal = ({ row, planId, hall, shift, planningDate, onClose, onSaved }) => {
  const [newPart, setNewPart] = useState(null);
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [actualCT, setActualCT] = useState("");
  const [targetQty, setTargetQty] = useState("");
  const [saving, setSaving] = useState(false);

  const slots = useMemo(() => getTimeSlots(shift), [shift]);

  const remainingSecondsFor = (slotVal) => {
    const slot = slots.find((s) => s.value === slotVal);
    return remainingSecondsFromSlot(shift, slot?.startHour);
  };

  const handlePartSelect = (part) => {
    setNewPart(part);
    const ct = part?.actual_cycle_time || part?.cycle_time || "";
    setActualCT(ct);
    setTargetQty(ct ? calcTargetQty(ct, remainingSecondsFor(timeSlot)) : "");
  };

  const handleSlotChange = (val) => {
    setTimeSlot(val);
    if (actualCT) setTargetQty(calcTargetQty(actualCT, remainingSecondsFor(val)));
  };

  const handleActualCTChange = (val) => {
    setActualCT(val);
    setTargetQty(calcTargetQty(val, remainingSecondsFor(timeSlot)));
  };

  const handleSave = async () => {
    if (!newPart) {
      alert("Select the part to change to");
      return;
    }
    if (!timeSlot) {
      alert("Select the time interval");
      return;
    }
    try {
      setSaving(true);
      const res = await createMouldChange({
        plan_id: planId,
        detail_id: row.detail_id,
        machine_code: row.machine_code,
        old_part_id: row.part_id || null,
        new_part_id: newPart.id,
        planned_date: toDateOnly(planningDate),
        planned_shift: shift,
        time_slot: timeSlot,
        standard_cycle_time: newPart.cycle_time || null,
        actual_cycle_time: Number(actualCT) || null,
        target_qty: Number(targetQty) || 0,
        reason,
      });
      onSaved(res.plan);
      onClose();
    } catch (err) {
      console.log(err);
      alert("Failed to save mould change");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm border border-[#E2E4E9] w-full max-w-sm shadow-lg">
        <div className="border-b border-[#E2E4E9] px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-800">
            Plan Mould Change — {row.machine_code}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Change To Part</label>
            <PartSearchSelect value="" valueName="" onSelect={handlePartSelect} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Time Interval</label>
            <select
              value={timeSlot}
              onChange={(e) => handleSlotChange(e.target.value)}
              className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="">Select interval</option>
              {slots.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {newPart && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Std Cycle Time</label>
                <input
                  type="number"
                  value={newPart.cycle_time || ""}
                  disabled
                  className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs font-mono bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Actual Cycle Time</label>
                <input
                  type="number"
                  value={actualCT}
                  onChange={(e) => handleActualCTChange(e.target.value)}
                  className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Target Qty {timeSlot && actualCT ? `(auto-calculated, verify)` : ""}
                </label>
                <input
                  type="number"
                  value={targetQty}
                  onChange={(e) => setTargetQty(e.target.value)}
                  className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer order change"
              className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-8 rounded-sm bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
          >
            {saving ? "Saving..." : "Save Planned Mould Change"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MouldChangeModal;