import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PartSearchSelect from "./PartSearchSelect";
import {
  createMouldChange,
  updateMouldChange,
  getMouldChangeDetail,
} from "../../api/mouldChangeApi";
import { getTimeSlots, calcTargetQty, remainingSecondsFromSlot } from "../../utils/shiftTime";
import { toDateOnly } from "../../utils/date";

// Prevent scroll-wheel from silently changing a focused number input's
// value (browser default behavior) — blur it so the wheel just scrolls
// the page instead. Bug that was causing "target input field error".
const blockWheelChange = (e) => e.target.blur();

const MouldChangeModal = ({ row, planId, hall, shift, planningDate, existingMC, onClose, onSaved }) => {
  const [loading, setLoading] = useState(!!existingMC);
  const [mcData, setMcData] = useState(null); // backend se fresh fetched detail
  const isEditing = !!existingMC;

  const [newPart, setNewPart] = useState(null);
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [actualCT, setActualCT] = useState("");
  const [targetQty, setTargetQty] = useState("");
  const [saving, setSaving] = useState(false);

  const slots = useMemo(() => getTimeSlots(shift), [shift]);

  // Modal khulte hi backend se latest data fetch karo — row.mould_changes
  // (list join se aaya) ke bharose nahi rehte, kyunki wo stale ho sakta hai.
  useEffect(() => {
    if (!existingMC) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getMouldChangeDetail(existingMC.mould_change_id);
        if (cancelled) return;

        const mc = res.mould_change;
        setMcData(mc);
        setNewPart({
          id: mc.new_part_id,
          part_number: mc.new_part_number,
          part_name: mc.new_part_name,
          cycle_time: mc.standard_cycle_time,
        });
        setTimeSlot(mc.time_slot || "");
        setReason(mc.reason || "");
        setActualCT(mc.actual_cycle_time || "");
        setTargetQty(mc.target_qty || "");
      } catch (err) {
        console.log("Failed to fetch mould change detail:", err);
        alert("Failed to load mould change details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [existingMC?.mould_change_id]);

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
      const payload = {
        new_part_id: newPart.id,
        time_slot: timeSlot,
        standard_cycle_time: newPart.cycle_time || null,
        actual_cycle_time: Number(actualCT) || null,
        target_qty: Number(targetQty) || 0,
        reason,
      };

      let res;
      if (isEditing) {
        res = await updateMouldChange(existingMC.mould_change_id, payload);
      } else {
        res = await createMouldChange({
          plan_id: planId,
          detail_id: row.detail_id,
          machine_code: row.machine_code,
          old_part_id: row.part_id || null,
          new_part_id: newPart.id,
          planned_date: toDateOnly(planningDate),
          planned_shift: shift,
          ...payload,
        });
      }
      onSaved(res.plan);
      onClose();
    } catch (err) {
      console.log(err);
      alert("Failed to save mould change");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPlan = async () => {
    if (!window.confirm("Cancel this planned mould change?")) return;
    try {
      setSaving(true);
      const res = await updateMouldChange(existingMC.mould_change_id, { status: "Cancelled" });
      onSaved(res.plan);
      onClose();
    } catch (err) {
      console.log(err);
      alert("Failed to cancel mould change");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-[#0F1D24]/40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-sm border border-[#C6C6C6]/50 w-full max-w-sm shadow-[0_20px_50px_-12px_rgba(15,29,36,0.35)] overflow-hidden"
        >
          <div className="border-b border-[#C6C6C6]/40 px-4 py-3 flex justify-between items-center bg-[#F5F5F5]/40">
            <h3 className="text-sm font-bold text-[#0F1D24]">
              {isEditing ? "Currently Planned" : "Plan Mould Change"} — {row.machine_code}
            </h3>
            <button
              onClick={onClose}
              className="text-[#9B9B9B] hover:text-[#0F1D24] text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-[#9B9B9B] flex flex-col items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#C6C6C6] border-t-[#0F1D24] rounded-full animate-spin" />
              Loading details...
            </div>
          ) : (
            <>
              <AnimatePresence>
                {isEditing && mcData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                    className="mx-4 mt-3 bg-[#FDC94D]/15 border border-[#FDC94D]/40 rounded-sm px-3 py-2 text-[11px] text-[#0F1D24] flex justify-between items-center overflow-hidden"
                  >
                    <span>
                      Planned: <span className="font-mono font-semibold">{mcData.new_part_number}</span> ·{" "}
                      {mcData.time_slot || "no slot"}
                    </span>
                    <span className="font-bold">{mcData.status}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#0F1D24] block mb-1">Change To Part</label>
                  <PartSearchSelect
                    value={newPart?.part_number || ""}
                    valueName={newPart?.part_name || ""}
                    onSelect={handlePartSelect}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0F1D24] block mb-1">Time Interval</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => handleSlotChange(e.target.value)}
                    className="w-full h-8 rounded border border-[#C6C6C6]/60 px-2 text-xs text-[#0F1D24] focus:outline-none focus:ring-1 focus:ring-[#0F1D24] focus:border-[#0F1D24] transition-colors"
                  >
                    <option value="">Select interval</option>
                    {slots.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <AnimatePresence>
                  {newPart && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 gap-2 overflow-hidden"
                    >
                      <div>
                        <label className="text-xs font-semibold text-[#0F1D24] block mb-1">Std Cycle Time</label>
                        <input
                          type="number"
                          value={newPart.cycle_time || ""}
                          disabled
                          onWheel={blockWheelChange}
                          className="w-full h-8 rounded border border-[#C6C6C6]/60 px-2 text-xs font-mono bg-[#F5F5F5] text-[#9B9B9B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#0F1D24] block mb-1">Actual Cycle Time</label>
                        <input
                          type="number"
                          value={actualCT}
                          onChange={(e) => handleActualCTChange(e.target.value)}
                          onWheel={blockWheelChange}
                          className="w-full h-8 rounded border border-[#C6C6C6]/60 px-2 text-xs font-mono text-[#0F1D24] focus:outline-none focus:ring-1 focus:ring-[#0F1D24] focus:border-[#0F1D24] transition-colors"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-[#0F1D24] block mb-1">
                          Target Qty {timeSlot && actualCT ? `(auto-calculated, verify)` : ""}
                        </label>
                        <input
                          type="number"
                          value={targetQty}
                          onChange={(e) => setTargetQty(e.target.value)}
                          onWheel={blockWheelChange}
                          className="w-full h-8 rounded border border-[#C6C6C6]/60 px-2 text-xs font-mono text-[#0F1D24] focus:outline-none focus:ring-1 focus:ring-[#0F1D24] focus:border-[#0F1D24] transition-colors"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-xs font-semibold text-[#0F1D24] block mb-1">Reason</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Customer order change"
                    className="w-full h-8 rounded border border-[#C6C6C6]/60 px-2 text-xs text-[#0F1D24] focus:outline-none focus:ring-1 focus:ring-[#0F1D24] focus:border-[#0F1D24] transition-colors"
                  />
                </div>

                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-9 rounded bg-[#0F1D24] hover:bg-[#0F1D24]/90 disabled:opacity-40 text-[#FDC94D] text-xs font-bold transition-colors"
                >
                  {saving ? "Saving..." : isEditing ? "Update Planned Mould Change" : "Save Planned Mould Change"}
                </motion.button>

                <AnimatePresence>
                  {isEditing && mcData?.status === "Planned" && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleCancelPlan}
                      disabled={saving}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-8 rounded border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold overflow-hidden"
                    >
                      Cancel Plan
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MouldChangeModal;