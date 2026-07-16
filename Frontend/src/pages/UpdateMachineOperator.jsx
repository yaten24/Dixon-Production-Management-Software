import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Factory,
  Search,
  Clock,
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
import CustomSelect from "../compenents/common/CustomSelect";
import CustomDatePicker from "../compenents/common/CustomDatePicker";

// Brand palette (matches QuickAccessCard):
// highlight #0F1D24 (deep navy)  — primary: icons, titles, active states, CTA fills
// gray      #9B9B9B              — secondary text
// accent    #FDC94D (warm gold)  — sparing highlight: top bars, CTA text-on-navy
// darken    #C6C6C6              — borders, dividers, neutral surfaces

const halls = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C-8"];
const shifts = ["A", "B"];

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

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};
const listItem = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const UpdateMachineOperator = () => {
  const [allocationDate, setAllocationDate] = useState(
    new Date().toISOString().substring(0, 10),
  );
  const [hall, setHall] = useState("Hall 1");
  const [shift, setShift] = useState("A");

  const [planLoading, setPlanLoading] = useState(false);
  const [planId, setPlanId] = useState(null);
  const [planHeader, setPlanHeader] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [planError, setPlanError] = useState("");

  const [availableMachines, setAvailableMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [machineSearch, setMachineSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [creatingPlan, setCreatingPlan] = useState(false);

  const [opModalDetail, setOpModalDetail] = useState(null);
  const [opSearch, setOpSearch] = useState("");
  const [opResults, setOpResults] = useState([]);
  const [opLoading, setOpLoading] = useState(false);
  const [opSelected, setOpSelected] = useState(null);
  const [opSaving, setOpSaving] = useState(false);
  const debouncedOpSearch = useDebounce(opSearch, 300);

  const [publishing, setPublishing] = useState(false);

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
    <div className="min-h-screen bg-[#FAFAF9] p-1">
      <div className="max-w-full mx-auto space-y-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded border border-[#C6C6C6]/50 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: -6, scale: 1.06 }}
              className="h-8 w-8 rounded bg-[#0F1D24] flex items-center justify-center ring-[3px] ring-[#0F1D24]/5"
            >
              <Factory className="text-[#FDC94D]" size={15} />
            </motion.div>
            <div>
              <h1 className="text-[13px] font-bold tracking-tight text-[#0F1D24]">
                Machine &amp; Operator Allocation
              </h1>
              <p className="text-[10px] font-medium text-[#9B9B9B]">
                Select date, hall and shift to view or create a production plan.
              </p>
            </div>
          </div>

          {planHeader && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#9B9B9B]">
                {planHeader.plan_number}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  isPublished
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-[#FDC94D]/15 text-[#0F1D24] border-[#FDC94D]/40"
                }`}
              >
                {planHeader.status || "Draft"}
              </span>
              {!isPublished && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handlePublish}
                  disabled={publishing}
                  className="h-7 px-2.5 rounded bg-[#0F1D24] hover:opacity-90 disabled:opacity-50 text-[#FDC94D] text-[10px] font-semibold flex items-center gap-1.5 transition"
                >
                  {publishing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  Publish
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded border border-[#C6C6C6]/50 p-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <CustomDatePicker
              label="Allocation Date"
              value={allocationDate}
              onChange={setAllocationDate}
            />

            <CustomSelect
              label="Hall"
              icon={Building2}
              value={hall}
              onChange={setHall}
              options={halls}
            />

            <CustomSelect
              label="Shift"
              icon={Clock}
              value={shift}
              onChange={setShift}
              options={shifts}
            />
          </div>
        </div>

        {planError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] rounded px-3 py-2">
            {planError}
          </div>
        )}

        {planLoading && (
          <div className="bg-white rounded border border-[#C6C6C6]/50 py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-[#0F1D24]" size={18} />
            <p className="text-[11px] text-[#9B9B9B]">Checking for plan...</p>
          </div>
        )}

        {/* No plan yet -> machine picker */}
        {!planLoading && !planId && (
          <div className="bg-white rounded border border-[#C6C6C6]/50 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h2 className="text-[12px] font-bold text-[#0F1D24]">
                  No plan found for {hall} / Shift {shift} / {allocationDate}
                </h2>
                <p className="text-[10px] text-[#9B9B9B] mt-0.5">
                  Select machines to create a new production plan.
                </p>
              </div>
              <span className="font-mono text-[10px] text-[#9B9B9B]">
                {selectedCodes.size} selected
              </span>
            </div>

            <div className="relative mb-2.5">
              <Search
                className="absolute left-2.5 top-2 text-[#9B9B9B]"
                size={12}
              />
              <input
                type="text"
                placeholder="Search machine code or name..."
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                className="w-full h-7 border border-[#C6C6C6]/60 rounded pl-7 pr-2 text-[11px] outline-none focus:ring-1 focus:ring-[#0F1D24]"
              />
            </div>

            {machinesLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="animate-spin text-[#0F1D24]" size={16} />
              </div>
            ) : filteredMachines.length > 0 ? (
              <motion.div
                variants={listContainer}
                initial="hidden"
                animate="show"
                className="grid sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto"
              >
                {filteredMachines.map((m) => {
                  const code = mCode(m);
                  const isSelected = selectedCodes.has(code);
                  return (
                    <motion.div
                      key={code}
                      variants={listItem}
                      whileHover={{ y: -2 }}
                      onClick={() => toggleMachine(code)}
                      className={`relative cursor-pointer overflow-hidden rounded border p-2.5 transition-colors ${
                        isSelected
                          ? "border-[#0F1D24] bg-[#0F1D24]/[0.03]"
                          : "border-[#C6C6C6]/50 hover:border-[#0F1D24]/40"
                      }`}
                    >
                      <span
                        className={`absolute inset-x-0 top-0 h-[2px] bg-[#FDC94D] origin-left transition-transform duration-300 ${
                          isSelected ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-[#0F1D24]">
                          {code}
                        </span>
                        {isSelected && (
                          <CheckCircle2 size={12} className="text-[#0F1D24]" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#9B9B9B] mt-1">
                        {mName(m)}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="border border-dashed border-[#C6C6C6]/60 rounded py-8 text-center text-[11px] text-[#9B9B9B]">
                No machines found for {hall}.
              </div>
            )}

            <div className="flex justify-end mt-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleCreatePlan}
                disabled={creatingPlan || selectedCodes.size === 0}
                className="h-7 px-3 rounded bg-[#0F1D24] hover:opacity-90 disabled:opacity-40 text-[#FDC94D] text-[11px] font-semibold flex items-center gap-1.5 transition"
              >
                {creatingPlan && <Loader2 size={12} className="animate-spin" />}
                Create Plan
              </motion.button>
            </div>
          </div>
        )}

        {/* Plan exists -> compact table */}
        {!planLoading && planId && (
          <div className="bg-white rounded border border-[#C6C6C6]/50 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#FAFAF9] border-b border-[#C6C6C6]/50 text-[10px] text-[#9B9B9B] uppercase tracking-wide">
                  <th className="text-left px-3 py-2 font-semibold">Machine</th>
                  <th className="text-left px-3 py-2 font-semibold">Operator</th>
                  <th className="text-left px-3 py-2 font-semibold">Part</th>
                  <th className="text-left px-3 py-2 font-semibold">Cycle</th>
                  <th className="text-left px-3 py-2 font-semibold">Target</th>
                  <th className="text-left px-3 py-2 font-semibold">Status</th>
                  <th className="text-right px-3 py-2 font-semibold"></th>
                </tr>
              </thead>
              <motion.tbody variants={listContainer} initial="hidden" animate="show">
                {planDetails.map((d) => (
                  <motion.tr
                    variants={listItem}
                    key={d.detail_id}
                    className="border-b border-[#C6C6C6]/40 last:border-0 hover:bg-[#FAFAF9]"
                  >
                    <td className="px-3 py-2">
                      <div className="font-mono font-semibold text-[#0F1D24]">
                        {d.machine_code}
                      </div>
                      <div className="text-[10px] text-[#9B9B9B]">
                        {d.machine_name}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[#0F1D24]">
                      {d.operator_name || (
                        <span className="text-[#9B9B9B]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[#0F1D24]">
                      {d.part_number ? (
                        <>
                          <div className="font-mono">{d.part_number}</div>
                          <div className="text-[10px] text-[#9B9B9B]">
                            {d.part_name}
                          </div>
                        </>
                      ) : (
                        <span className="text-[#9B9B9B]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-[#0F1D24]/80">
                      {d.actual_cycle_time ?? d.cycle_time ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-[#0F1D24]/80">
                      {d.target_qty || 0}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#C6C6C6]/20 text-[#0F1D24]/70 text-[10px]">
                        {d.machine_status || "Pending"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => openChangeOperator(d)}
                        disabled={isPublished}
                        className="h-7 px-2 rounded border border-[#C6C6C6]/60 hover:border-transparent hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-30 text-[#0F1D24] text-[10px] font-semibold flex items-center gap-1 transition ml-auto"
                      >
                        <RefreshCw size={11} />
                        Change
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Operator modal */}
      <AnimatePresence>
        {opModalDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F1D24]/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded border border-[#C6C6C6]/50 w-full max-w-sm max-h-[78vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#C6C6C6]/50">
                <div>
                  <h3 className="text-[12px] font-bold text-[#0F1D24]">
                    Change Operator
                  </h3>
                  <p className="text-[10px] text-[#9B9B9B] font-mono mt-0.5">
                    {opModalDetail.machine_code}
                  </p>
                </div>
                <button
                  onClick={closeChangeOperator}
                  className="h-6 w-6 rounded hover:bg-[#FAFAF9] flex items-center justify-center text-[#9B9B9B]"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="px-3 pt-2.5">
                <div className="bg-[#FAFAF9] border border-[#C6C6C6]/50 rounded px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-[#9B9B9B]">Current Operator</span>
                  <span className="font-semibold text-[#0F1D24]">
                    {opModalDetail.operator_name || "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="p-3 flex-1 overflow-hidden flex flex-col">
                <div className="relative mb-2.5">
                  <Search
                    className="absolute left-2.5 top-2 text-[#9B9B9B]"
                    size={12}
                  />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search Employee ID or Name..."
                    value={opSearch}
                    onChange={(e) => setOpSearch(e.target.value)}
                    className="w-full h-7 border border-[#C6C6C6]/60 rounded pl-7 pr-2 text-[11px] outline-none focus:ring-1 focus:ring-[#0F1D24]"
                  />
                </div>

                <div className="space-y-1.5 overflow-y-auto">
                  {opLoading ? (
                    <div className="py-6 flex justify-center">
                      <Loader2
                        className="animate-spin text-[#0F1D24]"
                        size={14}
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
                          className={`cursor-pointer rounded border px-2.5 py-1.5 transition ${
                            isChosen
                              ? "border-[#0F1D24] bg-[#0F1D24]/[0.03]"
                              : "border-[#C6C6C6]/50 hover:border-[#0F1D24]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-semibold text-[#0F1D24]">
                                {opName(operator)}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] text-[#9B9B9B] ml-1">
                                  (Current)
                                </span>
                              )}
                              <p className="text-[10px] text-[#9B9B9B] font-mono">
                                {opCode(operator)}
                              </p>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
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
                    <div className="border border-dashed border-[#C6C6C6]/60 rounded py-6 text-center text-[11px] text-[#9B9B9B]">
                      No operators found.
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#C6C6C6]/50 p-3 flex justify-end gap-2">
                <button
                  onClick={closeChangeOperator}
                  className="h-7 px-2.5 rounded border border-[#C6C6C6]/60 hover:bg-[#FAFAF9] text-[11px] font-medium transition"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={confirmChangeOperator}
                  disabled={!opSelected || opSaving}
                  className="h-7 px-3 rounded bg-[#0F1D24] hover:opacity-90 disabled:opacity-40 text-[#FDC94D] text-[11px] font-semibold flex items-center gap-1.5 transition"
                >
                  {opSaving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RefreshCw size={12} />
                  )}
                  Update Operator
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpdateMachineOperator;