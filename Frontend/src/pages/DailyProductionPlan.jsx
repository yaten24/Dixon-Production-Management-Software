import { useState } from "react";
import PlanningSetup from "../compenents/productionPlan/PlanningSetup";
import PlanningStats from "../compenents/productionPlan/PlanningStats";
import MachinePlanningTable from "../compenents/productionPlan/MachinePlanningTable";
import {
  checkPlan,
  createPlan,
  getPlan,
  publishPlan,
} from "../api/productionPlanApi";
import { getAllMachines } from "../api/machineApi";

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
      <div className="p-6">
        <PlanningSetup onStart={handleStart} loading={loading} />
      </div>
    );
  }

  return (
    <div className="space-y-1 p-1">
      <div className="bg-white rounded-sm border border-[#E2E4E9] px-3 py-1 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            {plan.header.plan_number}
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
            {plan.header.planning_date} · {plan.header.hall} · Shift{" "}
            {plan.header.shift}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlan(null)}
            className="h-8 px-3 rounded-sm border border-[#E2E4E9] text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Change Selection
          </button>

          {plan.header.status === "Draft" && (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="h-8 px-3 rounded-sm bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Publish Plan
            </button>
          )}
        </div>
      </div>

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
