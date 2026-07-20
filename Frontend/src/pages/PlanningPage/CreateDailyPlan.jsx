import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowUturnLeft, HiOutlinePaperAirplane } from "react-icons/hi2";
import PlanningSetup from "../../compenents/productionPlan/PlanningSetup";
import PlanningStats from "../../compenents/productionPlan/PlanningStats";
import MachinePlanningTable from "../../compenents/productionPlan/MachinePlanningTable";
import {
  checkPlan,
  createPlan,
  getPlan,
  publishPlan,
} from "../../api/productionPlanApi";
import { getAllMachines } from "../../api/machineApi";

const naturalSort = (a, b) => {
  const numA = parseInt(a.machine_code.replace(/\D/g, ""), 10);
  const numB = parseInt(b.machine_code.replace(/\D/g, ""), 10);
  return numA - numB;
};

const DailyProductionPlan = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null); // { header, details }

  const handleStart = async (form) => {
    try {
      setLoading(true);

      const check = await checkPlan(form.planning_date, form.hall, form.shift);

      if (check.exists) {
        const existingPlan = await getPlan(check.plan_id);
        setPlan(existingPlan);
        return;
      }

      const machineRes = await getAllMachines(); // { success, data: [...] }
      const hallMachines = (machineRes.data || [])
        .filter((m) => m.hall === form.hall)
        .sort(naturalSort)
        .map((m) => ({
          machine_code: m.machine_code,
          machine_name: m.machine_name,
        }));

      if (hallMachines.length === 0) {
        alert(`No machines found for ${form.hall}`);
        return;
      }

      const newPlan = await createPlan({ ...form, machines: hallMachines });
      setPlan(newPlan);
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

  const handleRowSaved = (updatedPlan) => {
    if (updatedPlan) setPlan(updatedPlan);
  };

  const handlePublish = async () => {
    if (
      !window.confirm(
        "Publish this plan? It cannot be edited after publishing.",
      )
    )
      return;
    try {
      setLoading(true);
      const updated = await publishPlan(plan.header.plan_id);
      setPlan(updated);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-6">
        <PlanningSetup onStart={handleStart} loading={loading} />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-1 bg-[#F5F5F5] p-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-between rounded border border-[#C6C6C6]/50 bg-white px-3 py-2 shadow-sm"
      >
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#0F1D24]">
            {plan.header.plan_number}
          </h1>
          <p className="mt-0.5 font-mono text-[11px] text-[#9B9B9B]">
            {plan.header.planning_date} · {plan.header.hall} · Shift{" "}
            {plan.header.shift}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlan(null)}
            className="flex h-8 items-center gap-1.5 rounded border border-[#C6C6C6] px-3 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24] hover:bg-[#F5F5F5]"
          >
            <HiOutlineArrowUturnLeft className="h-3.5 w-3.5" />
            Change Selection
          </button>

          <AnimatePresence>
            {plan.header.status === "Draft" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublish}
                disabled={loading}
                className="flex h-8 items-center gap-1.5 rounded bg-[#0F1D24] px-3 text-xs font-semibold text-[#FDC94D] transition-all hover:bg-[#0F1D24]/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiOutlinePaperAirplane className="h-3.5 w-3.5" />
                Publish Plan
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <PlanningStats header={plan.header} />
      <MachinePlanningTable
        header={plan.header}
        details={plan.details}
        onRowSaved={handleRowSaved}
      />
    </div>
  );
};

export default DailyProductionPlan;