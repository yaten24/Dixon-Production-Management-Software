import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Building2,
  Factory,
  Search,
  Clock,
  ChevronDown,
  RefreshCw,
  X,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  checkPlan,
  createPlan as createPlanApi,
  getPlan,
  updateDetail as updateDetailApi,
  publishPlan as publishPlanApi,
} from "../api/productionPlanApi";
import { searchOperators } from "../api/operatorApi";
import { getMachines } from "../api/machineApi";

const halls = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C-8"];
const shifts = ["A", "B", "C", "General"];

// field-name fallbacks — backend may return snake_case or camelCase
const mCode = (m) => m.machine_code || m.machineCode;
const mName = (m) => m.machine_name || m.machineName;
const opCode = (o) => o.operator_code || o.operatorCode || o.employeeId;
const opName = (o) => o.operator_name || o.operatorName || o.name;
const opStatus = (o) => o.status || o.operator_status || "Available";

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const AllocateMachineOperator = () => {
  const [allocationDate, setAllocationDate] = useState(
    new Date().toISOString().substring(0, 10),
  );
  const [hall, setHall] = useState("Hall 1");
  const [shift, setShift] = useState("A");

  // ---- plan state ----
  const [planLoading, setPlanLoading] = useState(false);
  const [planId, setPlanId] = useState(null);
  const [planHeader, setPlanHeader] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [planError, setPlanError] = useState("");

  // ---- new-plan machine picker (shown only when no plan exists yet) ----
  const [availableMachines, setAvailableMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [machineSearch, setMachineSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [creatingPlan, setCreatingPlan] = useState(false);

  // ---- change operator modal ----
  const [opModalDetail, setOpModalDetail] = useState(null); // detail row being edited
  const [opSearch, setOpSearch] = useState("");
  const [opResults, setOpResults] = useState([]);
  const [opLoading, setOpLoading] = useState(false);
  const [opSelected, setOpSelected] = useState(null);
  const [opSaving, setOpSaving] = useState(false);
  const debouncedOpSearch = useDebounce(opSearch, 300);

  const [publishing, setPublishing] = useState(false);

  // -------------------------------------------------------------
  // Load / detect plan whenever date + hall + shift changes
  // -------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const loadPlan = async () => {
      setPlanLoading(true);
      setPlanError("");
      setPlanId(null);
      setPlanHeader(null);
      setPlanDetails([]);
      setSelectedCodes(new Set());

      try {
        const res = await checkPlan(allocationDate, hall, shift);
        if (cancelled) return;

        if (res.exists && res.plan_id) {
          const plan = await getPlan(res.plan_id);
          if (cancelled) return;
          setPlanId(res.plan_id);
          setPlanHeader(plan.header);
          setPlanDetails(plan.details || []);
        } else {
          // no plan yet -> fetch machines for this hall so user can create one
          setMachinesLoading(true);
          const machinesRes = await getMachines({ hall });
          if (cancelled) return;
          setAvailableMachines(machinesRes.data || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setPlanError("Failed to load plan. Please retry.");
      } finally {
        if (!cancelled) {
          setPlanLoading(false);
          setMachinesLoading(false);
        }
      }
    };

    loadPlan();
    return () => {
      cancelled = true;
    };
  }, [allocationDate, hall, shift]);

  const filteredMachines = useMemo(() => {
    const q = machineSearch.toLowerCase();
    return availableMachines.filter(
      (m) =>
        mCode(m)?.toLowerCase().includes(q) ||
        mName(m)?.toLowerCase().includes(q),
    );
  }, [availableMachines, machineSearch]);

  const toggleMachine = (code) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const handleCreatePlan = async () => {
    if (selectedCodes.size === 0) {
      alert("Please select at least one machine.");
      return;
    }
    setCreatingPlan(true);
    setPlanError("");
    try {
      const machines = Array.from(selectedCodes).map((code) => ({
        machine_code: code,
      }));
      const plan = await createPlanApi({
        planning_date: allocationDate,
        hall,
        shift,
        machines,
      });
      setPlanId(plan.header.plan_id);
      setPlanHeader(plan.header);
      setPlanDetails(plan.details || []);
    } catch (err) {
      console.error(err);
      setPlanError(err?.response?.data?.message || "Failed to create plan.");
    } finally {
      setCreatingPlan(false);
    }
  };

  // -------------------------------------------------------------
  // Change Operator modal
  // -------------------------------------------------------------
  const openChangeOperator = (detail) => {
    setOpModalDetail(detail);
    setOpSearch("");
    setOpResults([]);
    setOpSelected(null);
  };

  const closeChangeOperator = () => {
    setOpModalDetail(null);
    setOpSearch("");
    setOpResults([]);
    setOpSelected(null);
  };

  useEffect(() => {
    if (!opModalDetail) return;
    let cancelled = false;

    const run = async () => {
      setOpLoading(true);
      try {
        const res = await searchOperators(debouncedOpSearch);
        if (!cancelled) setOpResults(res.data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setOpResults([]);
      } finally {
        if (!cancelled) setOpLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedOpSearch, opModalDetail]);

  const confirmChangeOperator = async () => {
    if (!opSelected || !opModalDetail) {
      alert("Please select a new operator.");
      return;
    }
    setOpSaving(true);
    try {
      const plan = await updateDetailApi(opModalDetail.detail_id, {
        operator_id: opCode(opSelected),
        part_id: opModalDetail.part_id,
        target_qty: opModalDetail.target_qty,
      });
      setPlanHeader(plan.header);
      setPlanDetails(plan.details || []);
      closeChangeOperator();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update operator.");
    } finally {
      setOpSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!planId) return;
    setPublishing(true);
    try {
      const plan = await publishPlanApi(planId);
      setPlanHeader(plan.header);
      setPlanDetails(plan.details || []);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to publish plan (backend route may be disabled — see productionPlanRoutes.js).",
      );
    } finally {
      setPublishing(false);
    }
  };

  const isPublished = planHeader?.status === "Published";

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-5">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-sm border border-[#E2E4E9] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-sm bg-[#2563EB] flex items-center justify-center">
              <Factory className="text-white" size={18} />
            </div>
            <div className={`h-5 w-px flex-shrink-0 bg-[#C6C6C6]`} />
            <div className="hidden min-w-0 leading-tight sm:block">
              <p className="text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                Operator Allocation
              </p>
              <h1 className="truncate text-[12.5px] font-bold text-[#0F1D24]">
                Select date, hall and shift to view or create a production
                plan.
              </h1>
            </div>
          </div>

          {planHeader && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500">
                {planHeader.plan_number}
              </span>
              <span
                className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold ${
                  isPublished
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {planHeader.status || "Draft"}
              </span>
              {!isPublished && (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="h-7 px-3 rounded-sm bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {publishing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  Publish
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-sm border border-[#E2E4E9] p-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                Allocation Date
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-2 text-slate-400"
                  size={14}
                />
                <input
                  type="date"
                  value={allocationDate}
                  onChange={(e) => setAllocationDate(e.target.value)}
                  className="w-full h-8 border border-[#E2E4E9] rounded-sm pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                Hall
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-3 top-2 text-slate-400"
                  size={14}
                />
                <select
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                  className="w-full h-8 border border-[#E2E4E9] rounded-sm pl-8 pr-8 text-xs appearance-none outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  {halls.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-2 text-slate-400"
                  size={14}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                Shift
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-2 text-slate-400"
                  size={14}
                />
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full h-8 border border-[#E2E4E9] rounded-sm pl-8 pr-8 text-xs appearance-none outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  {shifts.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-2 text-slate-400"
                  size={14}
                />
              </div>
            </div>
          </div>
        </div>

        {planError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm px-4 py-2.5">
            {planError}
          </div>
        )}

        {/* Loading */}
        {planLoading && (
          <div className="bg-white rounded-sm border border-[#E2E4E9] py-14 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-[#2563EB]" size={22} />
            <p className="text-xs text-slate-500">Checking for plan...</p>
          </div>
        )}

        {/* ------------------------------------------------------
            No plan yet -> machine picker to create one
        ------------------------------------------------------- */}
        {!planLoading && !planId && (
          <div className="bg-white rounded-sm border border-[#E2E4E9] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  No plan found for {hall} / Shift {shift} / {allocationDate}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select machines to create a new production plan.
                </p>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                {selectedCodes.size} selected
              </span>
            </div>

            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-2.5 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search machine code or name..."
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                className="w-full h-8 border border-[#E2E4E9] rounded-sm pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            {machinesLoading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="animate-spin text-[#2563EB]" size={18} />
              </div>
            ) : filteredMachines.length > 0 ? (
              <div className="grid sm:grid-cols-3 gap-2 max-h-[340px] overflow-y-auto">
                {filteredMachines.map((m) => {
                  const code = mCode(m);
                  const isSelected = selectedCodes.has(code);
                  return (
                    <div
                      key={code}
                      onClick={() => toggleMachine(code)}
                      className={`cursor-pointer rounded-sm border p-3 transition ${
                        isSelected
                          ? "border-[#2563EB] bg-blue-50"
                          : "border-[#E2E4E9] hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {code}
                        </span>
                        {isSelected && (
                          <CheckCircle2 size={14} className="text-[#2563EB]" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {mName(m)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-[#E2E4E9] rounded-sm py-10 text-center text-xs text-slate-400">
                No machines found for {hall}.
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreatePlan}
                disabled={creatingPlan || selectedCodes.size === 0}
                className="h-8 px-4 rounded-sm bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {creatingPlan && <Loader2 size={13} className="animate-spin" />}
                Create Plan
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------
            Plan exists -> compact details table
        ------------------------------------------------------- */}
        {!planLoading && planId && (
          <div className="bg-white rounded-sm border border-[#E2E4E9] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#E2E4E9] text-[11px] text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-2 font-medium">Machine</th>
                  <th className="text-left px-4 py-2 font-medium">Operator</th>
                  <th className="text-left px-4 py-2 font-medium">Part</th>
                  <th className="text-left px-4 py-2 font-medium">
                    Cycle Time
                  </th>
                  <th className="text-left px-4 py-2 font-medium">
                    Target Qty
                  </th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {planDetails.map((d) => (
                  <tr
                    key={d.detail_id}
                    className="border-b border-[#E2E4E9] last:border-0 hover:bg-[#F7F8FA]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-mono font-semibold text-slate-800">
                        {d.machine_code}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {d.machine_name}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {d.operator_name || (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {d.part_number ? (
                        <>
                          <div className="font-mono">{d.part_number}</div>
                          <div className="text-[11px] text-slate-400">
                            {d.part_name}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">
                      {d.actual_cycle_time ?? d.cycle_time ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">
                      {d.target_qty || 0}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[11px]">
                        {d.machine_status || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => openChangeOperator(d)}
                        disabled={isPublished}
                        className="h-7 px-2.5 rounded-sm border border-[#E2E4E9] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40 text-slate-600 text-[11px] font-medium flex items-center gap-1 transition ml-auto"
                      >
                        <RefreshCw size={12} />
                        Change
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------
          Change Operator modal
      ------------------------------------------------------- */}
      <AnimatePresence>
        {opModalDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-sm border border-[#E2E4E9] w-full max-w-md max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E4E9]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Change Operator
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {opModalDetail.machine_code}
                  </p>
                </div>
                <button
                  onClick={closeChangeOperator}
                  className="h-7 w-7 rounded-sm hover:bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="px-4 pt-3">
                <div className="bg-[#F7F8FA] border border-[#E2E4E9] rounded-sm px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Operator</span>
                  <span className="font-semibold text-slate-800">
                    {opModalDetail.operator_name || "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-hidden flex flex-col">
                <div className="relative mb-3">
                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={14}
                  />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search Employee ID or Name..."
                    value={opSearch}
                    onChange={(e) => setOpSearch(e.target.value)}
                    className="w-full h-8 border border-[#E2E4E9] rounded-sm pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-2 overflow-y-auto">
                  {opLoading ? (
                    <div className="py-8 flex justify-center">
                      <Loader2
                        className="animate-spin text-[#2563EB]"
                        size={16}
                      />
                    </div>
                  ) : opResults.length > 0 ? (
                    opResults.map((operator) => {
                      const isChosen =
                        opSelected && opCode(opSelected) === opCode(operator);
                      const isCurrent =
                        opCode(operator) === opModalDetail.operator_id;
                      return (
                        <div
                          key={opCode(operator)}
                          onClick={() => setOpSelected(operator)}
                          className={`cursor-pointer rounded-sm border px-3 py-2 transition ${
                            isChosen
                              ? "border-[#2563EB] bg-blue-50"
                              : "border-[#E2E4E9] hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold text-slate-800">
                                {opName(operator)}
                              </span>
                              {isCurrent && (
                                <span className="text-[11px] text-slate-400 ml-1">
                                  (Current)
                                </span>
                              )}
                              <p className="text-[11px] text-slate-500 font-mono">
                                {opCode(operator)}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold ${
                                opStatus(operator) === "Available"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {opStatus(operator)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="border border-dashed border-[#E2E4E9] rounded-sm py-8 text-center text-xs text-slate-400">
                      No operators found.
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#E2E4E9] p-4 flex justify-end gap-2">
                <button
                  onClick={closeChangeOperator}
                  className="h-8 px-3 rounded-sm border border-[#E2E4E9] hover:bg-slate-50 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmChangeOperator}
                  disabled={!opSelected || opSaving}
                  className="h-8 px-4 rounded-sm bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {opSaving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  Update Operator
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllocateMachineOperator;