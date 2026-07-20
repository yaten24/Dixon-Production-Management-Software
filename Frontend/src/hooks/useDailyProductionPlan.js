import { useState } from "react";
import {
  listDailyPlans,
  getDailyPlan,
  getDailyPlanDetails,
  createFullDailyPlan,
  addDailyPlanDetail,
  updateDailyPlanDetail,
  deleteDailyPlanDetail,
  updateDailyPlanStatus,
} from "../api/dailyPlanApi";
import { getAllMachines } from "../api/machineApi";
import { getMonthlyPlanDetails } from "../api/monthlyPlanApi";

const naturalSort = (a, b) => {
  const numA = parseInt(a.machine_code.replace(/\D/g, ""), 10);
  const numB = parseInt(b.machine_code.replace(/\D/g, ""), 10);
  return numA - numB;
};

export default function useDailyProductionPlan() {
  const [loading, setLoading] = useState(false);
  const [header, setHeader] = useState(null);
  const [details, setDetails] = useState([]);
  const [hallMachines, setHallMachines] = useState([]);
  const [monthlyParts, setMonthlyParts] = useState([]);
  const [error, setError] = useState("");

  const loadPlan = async (dailyPlanId) => {
    const [h, d] = await Promise.all([getDailyPlan(dailyPlanId), getDailyPlanDetails(dailyPlanId)]);
    setHeader(h.data);
    setDetails(d.data);
  };

  // Step 1: check if a plan already exists for date+hall+shift, else load machines + monthly parts for setup
  const startPlanning = async (form) => {
    setLoading(true);
    setError("");
    try {
      const existing = await listDailyPlans({ date: form.planningDate, hall: form.hall, shift: form.shift });
      if (existing.data.length > 0) {
        await loadPlan(existing.data[0].daily_plan_id);
        return;
      }

      const [machineRes, monthlyDetailRes] = await Promise.all([
        getAllMachines(),
        getMonthlyPlanDetails(form.monthlyPlanId),
      ]);

      const machines = (machineRes.data || []).filter((m) => m.hall === form.hall).sort(naturalSort);

      if (machines.length === 0) {
        setError(`No machines found for ${form.hall}`);
        return;
      }

      setHallMachines(machines);
      setMonthlyParts(monthlyDetailRes.data || []);
      setHeader({ isNew: true, monthly_plan_id: form.monthlyPlanId, planning_date: form.planningDate, hall: form.hall, shift: form.shift });
      setDetails([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start planning");
    } finally {
      setLoading(false);
    }
  };

  const submitNewPlan = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const res = await createFullDailyPlan(payload);
      await loadPlan(res.dailyPlanId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create plan");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addRow = async (payload) => {
    await addDailyPlanDetail(header.daily_plan_id, payload);
    await loadPlan(header.daily_plan_id);
  };

  const updateRow = async (detailId, payload) => {
    await updateDailyPlanDetail(header.daily_plan_id, detailId, payload);
    await loadPlan(header.daily_plan_id);
  };

  const removeRow = async (detailId) => {
    await deleteDailyPlanDetail(header.daily_plan_id, detailId);
    await loadPlan(header.daily_plan_id);
  };

  const publish = async () => {
    await updateDailyPlanStatus(header.daily_plan_id, "Published");
    await loadPlan(header.daily_plan_id);
  };

  const reset = () => {
    setHeader(null);
    setDetails([]);
    setHallMachines([]);
    setMonthlyParts([]);
    setError("");
  };

  return {
    loading, header, details, hallMachines, monthlyParts, error,
    startPlanning, submitNewPlan, addRow, updateRow, removeRow, publish, reset,
  };
}