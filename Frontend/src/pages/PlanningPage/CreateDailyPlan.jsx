import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowUturnLeft, HiOutlinePaperAirplane, HiOutlineTrash } from "react-icons/hi2";
import useDailyProductionPlan from "../../hooks/useDailyProductionPlan";
import { listMonthlyPlans, generatePlanNumber as generateMonthlyNumber } from "../../api/monthlyPlanApi";
import { generateDailyPlanNumber } from "../../api/dailyPlanApi";

const HALLS = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C-8"];
const SHIFTS = ["A", "B"];

const STATUS_COLORS = {
  Draft: "bg-[#9B9B9B]/15 text-[#0F1D24]",
  Published: "bg-[#FDC94D]/25 text-[#0F1D24]",
  Completed: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-700",
};

export default function DailyProductionPlan() {
  const {
    loading, header, details, hallMachines, monthlyParts, error,
    startPlanning, submitNewPlan, addRow, updateRow, removeRow, publish, reset,
  } = useDailyProductionPlan();

  // ---- Setup form state ----
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [monthlyPlanId, setMonthlyPlanId] = useState("");
  const [planningDate, setPlanningDate] = useState(new Date().toISOString().split("T")[0]);
  const [hall, setHall] = useState(HALLS[0]);
  const [shift, setShift] = useState("A");

  // ---- New-plan machine-row assignment state (only used before creation) ----
  const [rowAssignments, setRowAssignments] = useState({}); // machineId -> { monthlyDetailId, targetQty, plannedCycleTime, operatorCode }
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    listMonthlyPlans().then((res) => setMonthlyPlans(res.data || [])).catch(() => setMonthlyPlans([]));
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!monthlyPlanId) return;
    setRowAssignments({});
    await startPlanning({ monthlyPlanId, planningDate, hall, shift });
  };

  const setAssignment = (machineId, patch) => {
    setRowAssignments((prev) => ({ ...prev, [machineId]: { ...prev[machineId], ...patch } }));
  };

  const handlePartPick = (machineId, monthlyDetailId) => {
    const md = monthlyParts.find((p) => p.monthly_detail_id === Number(monthlyDetailId));
    setAssignment(machineId, {
      monthlyDetailId: md?.monthly_detail_id || "",
      partId: md?.part_id || "",
      plannedCycleTime: md?.planned_cycle_time || md?.actual_cycle_time || "",
      targetQty: rowAssignments[machineId]?.targetQty || "",
    });
  };

  const handleCreatePlan = async () => {
    setFormError("");
    const machineRows = hallMachines
      .map((m) => ({ machine: m, a: rowAssignments[m.id] }))
      .filter(({ a }) => a?.monthlyDetailId && a?.targetQty);

    if (machineRows.length === 0) {
      setFormError("Assign a part and target qty to at least one machine");
      return;
    }

    setCreating(true);
    try {
      const planNumber = await generateDailyPlanNumber(planningDate, hall, shift).then((r) => r.planNumber);
      await submitNewPlan({
        monthlyPlanId,
        planNumber,
        planningDate,
        hall,
        shift,
        machines: machineRows.map(({ machine, a }) => ({
          machineId: machine.id,
          monthlyDetailId: a.monthlyDetailId,
          partId: a.partId,
          targetQty: Number(a.targetQty),
          plannedCycleTime: a.plannedCycleTime ? Number(a.plannedCycleTime) : null,
          operatorCode: a.operatorCode || null,
        })),
      });
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create plan");
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Publish this plan? It cannot be edited after publishing.")) return;
    await publish();
  };

  // ==========================================================
  // View 1 — Setup form
  // ==========================================================
  if (!header) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-4">
        <motion.form
          onSubmit={handleStart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-lg rounded-sm border border-[#C6C6C6] bg-white p-4"
        >
          <h1 className="mb-3 text-base font-bold text-[#0F1D24]">Daily Production Plan</h1>

          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Monthly Plan</label>
            <select
              value={monthlyPlanId}
              onChange={(e) => setMonthlyPlanId(e.target.value)}
              required
              className="h-9 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[13px] outline-none focus:border-[#0F1D24]"
            >
              <option value="">-- Select monthly plan --</option>
              {monthlyPlans.map((p) => (
                <option key={p.monthly_plan_id} value={p.monthly_plan_id}>{p.plan_number}</option>
              ))}
            </select>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Date</label>
              <input
                type="date" value={planningDate} onChange={(e) => setPlanningDate(e.target.value)} required
                className="h-9 w-full rounded-sm border border-[#C6C6C6] px-2 text-[12.5px] outline-none focus:border-[#0F1D24]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Hall</label>
              <select value={hall} onChange={(e) => setHall(e.target.value)}
                className="h-9 w-full rounded-sm border border-[#C6C6C6] px-2 text-[12.5px] outline-none focus:border-[#0F1D24]">
                {HALLS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Shift</label>
              <select value={shift} onChange={(e) => setShift(e.target.value)}
                className="h-9 w-full rounded-sm border border-[#C6C6C6] px-2 text-[12.5px] outline-none focus:border-[#0F1D24]">
                {SHIFTS.map((s) => <option key={s} value={s}>Shift {s}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="mb-2 text-[11.5px] font-semibold text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="h-9 w-full rounded-sm bg-[#0F1D24] text-[13px] font-semibold text-[#FDC94D] disabled:opacity-50">
            {loading ? "Loading..." : "Start Planning"}
          </button>
        </motion.form>
      </div>
    );
  }

  // ==========================================================
  // View 2 — New plan: assign parts to machines before creating
  // ==========================================================
  if (header.isNew) {
    return (
      <div className="min-h-screen space-y-2 bg-[#F5F5F5] p-2">
        <div className="flex items-center justify-between rounded-sm border border-[#C6C6C6]/50 bg-white px-3 py-2">
          <div>
            <h1 className="text-[13px] font-bold text-[#0F1D24]">New Daily Plan — {hall} · Shift {shift}</h1>
            <p className="font-mono text-[11px] text-[#9B9B9B]">{planningDate}</p>
          </div>
          <button onClick={reset}
            className="flex h-8 items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-3 text-[11px] font-semibold text-[#0F1D24] hover:border-[#0F1D24]">
            <HiOutlineArrowUturnLeft className="h-3.5 w-3.5" />
            Change Selection
          </button>
        </div>

        <div className="overflow-x-auto rounded-sm border border-[#C6C6C6] bg-white">
          <table className="w-full min-w-[760px] text-[12px]">
            <thead className="bg-[#0F1D24] text-white">
              <tr>
                <th className="px-2.5 py-2 text-left font-semibold">Machine</th>
                <th className="px-2.5 py-2 text-left font-semibold">Part</th>
                <th className="px-2.5 py-2 text-right font-semibold font-mono">Target Qty</th>
                <th className="px-2.5 py-2 text-right font-semibold font-mono">Planned CT</th>
                <th className="px-2.5 py-2 text-left font-semibold">Operator Code</th>
              </tr>
            </thead>
            <tbody>
              {hallMachines.map((m) => {
                const a = rowAssignments[m.id] || {};
                return (
                  <tr key={m.id} className="border-t border-[#C6C6C6]/60">
                    <td className="px-2.5 py-1.5 font-mono font-semibold text-[#0F1D24]">
                      {m.machine_code} <span className="text-[#9B9B9B]">{m.machine_name}</span>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <select
                        value={a.monthlyDetailId || ""}
                        onChange={(e) => handlePartPick(m.id, e.target.value)}
                        className="h-7 w-full rounded-sm border border-[#C6C6C6] px-1.5 text-[11.5px] outline-none focus:border-[#0F1D24]"
                      >
                        <option value="">-- none --</option>
                        {monthlyParts.map((p) => (
                          <option key={p.monthly_detail_id} value={p.monthly_detail_id}>
                            {p.part_number} - {p.part_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <input
                        type="number" min="1" value={a.targetQty || ""}
                        onChange={(e) => setAssignment(m.id, { targetQty: e.target.value })}
                        className="h-7 w-20 rounded-sm border border-[#C6C6C6] px-1.5 text-right text-[11.5px] font-mono outline-none focus:border-[#0F1D24]"
                      />
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <input
                        type="number" step="0.01" min="0" value={a.plannedCycleTime || ""}
                        onChange={(e) => setAssignment(m.id, { plannedCycleTime: e.target.value })}
                        className="h-7 w-20 rounded-sm border border-[#C6C6C6] px-1.5 text-right text-[11.5px] font-mono outline-none focus:border-[#0F1D24]"
                      />
                    </td>
                    <td className="px-2.5 py-1.5">
                      <input
                        value={a.operatorCode || ""}
                        onChange={(e) => setAssignment(m.id, { operatorCode: e.target.value })}
                        placeholder="optional"
                        className="h-7 w-full rounded-sm border border-[#C6C6C6] px-1.5 text-[11.5px] outline-none focus:border-[#0F1D24]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(formError || error) && <p className="text-[11.5px] font-semibold text-red-600">{formError || error}</p>}

        <button onClick={handleCreatePlan} disabled={creating}
          className="rounded-sm bg-[#FDC94D] px-4 py-2 text-[12.5px] font-bold text-[#0F1D24] disabled:opacity-50">
          {creating ? "Creating..." : "Create Plan"}
        </button>
      </div>
    );
  }

  // ==========================================================
  // View 3 — Existing plan: stats + editable machine table
  // ==========================================================
  return (
    <div className="min-h-screen space-y-1 bg-[#F5F5F5] p-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-between rounded-sm border border-[#C6C6C6]/50 bg-white px-3 py-2 shadow-sm"
      >
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#0F1D24]">{header.plan_number}</h1>
          <p className="mt-0.5 font-mono text-[11px] text-[#9B9B9B]">
            {header.planning_date} · {header.hall} · Shift {header.shift}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-sm px-2.5 py-1 text-[11px] font-bold ${STATUS_COLORS[header.status] || STATUS_COLORS.Draft}`}>
            {header.status}
          </span>
          <button onClick={reset}
            className="flex h-8 items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-3 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24] hover:bg-[#F5F5F5]">
            <HiOutlineArrowUturnLeft className="h-3.5 w-3.5" />
            Change Selection
          </button>
          <AnimatePresence>
            {header.status === "Draft" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublish}
                disabled={loading}
                className="flex h-8 items-center gap-1.5 rounded-sm bg-[#0F1D24] px-3 text-xs font-semibold text-[#FDC94D] transition-all hover:bg-[#0F1D24]/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiOutlinePaperAirplane className="h-3.5 w-3.5" />
                Publish Plan
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 rounded-sm border border-[#C6C6C6] bg-white px-3 py-2 text-[11.5px] font-mono text-[#0F1D24]">
        <span>Total Machines: <b>{header.total_machines}</b></span>
        <span>Planned Machines: <b>{header.planned_machines}</b></span>
        <span>Total Target Qty: <b>{header.total_target_qty}</b></span>
      </div>

      {/* Machine table */}
      <div className="overflow-x-auto rounded-sm border border-[#C6C6C6] bg-white">
        <table className="w-full min-w-[820px] text-[12px]">
          <thead className="bg-[#0F1D24] text-white">
            <tr>
              <th className="px-2.5 py-2 text-left font-semibold">Machine</th>
              <th className="px-2.5 py-2 text-left font-semibold">Part</th>
              <th className="px-2.5 py-2 text-left font-semibold">Operator</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Target</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Planned CT</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Est. Hours</th>
              {header.status === "Draft" && <th className="px-2.5 py-2 text-center font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {details.map((row) => (
              <tr key={row.daily_detail_id} className="border-t border-[#C6C6C6]/60">
                <td className="px-2.5 py-2 font-mono font-semibold text-[#0F1D24]">
                  {row.machine_code} <span className="text-[#9B9B9B]">{row.machine_name}</span>
                </td>
                <td className="px-2.5 py-2">
                  <div className="font-mono text-[#0F1D24]">{row.part_number}</div>
                  <div className="text-[#9B9B9B]">{row.part_name}</div>
                </td>
                <td className="px-2.5 py-2 text-[#9B9B9B]">{row.operator_name || "-"}</td>
                <td className="px-2.5 py-2 text-right font-mono">{row.target_qty}</td>
                <td className="px-2.5 py-2 text-right font-mono">{row.planned_cycle_time ?? "-"}</td>
                <td className="px-2.5 py-2 text-right font-mono">{row.estimated_run_hours ?? "-"}</td>
                {header.status === "Draft" && (
                  <td className="px-2.5 py-2 text-center">
                    <button onClick={() => removeRow(row.daily_detail_id)}
                      className="flex h-6 w-6 items-center justify-center rounded-sm text-red-500 hover:bg-red-50 mx-auto">
                      <HiOutlineTrash className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {details.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-[11.5px] text-[#9B9B9B]">No machine assignments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}