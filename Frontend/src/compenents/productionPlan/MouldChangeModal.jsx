import { useState } from "react";
import PartSearchSelect from "./PartSearchSelect";
import { createMouldChange } from "../../api/mouldChangeApi";

const MouldChangeModal = ({ row, planId, hall, shift, planningDate, onClose, onSaved }) => {
  const [newPart, setNewPart] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newPart) {
      alert("Select the part to change to");
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
        planned_date: planningDate,
        planned_shift: shift,
        scheduled_time: scheduledTime || null,
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
            <PartSearchSelect value="" valueName="" onSelect={(p) => setNewPart(p)} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Scheduled Time</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

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