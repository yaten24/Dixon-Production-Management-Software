import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { getAllMachines } from "../api/machineApi";
import {
  getAllRejectionReasons,
  createRejectionReason,
} from "../api/rejectionReasonApi";
import { getAllLossReasons } from "../api/lossReasonApi";
import { checkPlan, getPlan } from "../api/productionPlanApi";

// ==========================================================
// Static shift time-slot definitions
// ==========================================================
const SHIFT_A_TIMES = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00",
];

const SHIFT_B_TIMES = [
  "20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00", "23:00 - 00:00",
  "00:00 - 01:00", "01:00 - 02:00", "02:00 - 03:00", "03:00 - 04:00",
  "04:00 - 05:00", "05:00 - 06:00", "06:00 - 07:00", "07:00 - 08:00",
];

const baseFormData = {
  date: "",
  hall: "",
  shift: "",
  timeSlot: "",

  operatorId: "",
  operator_id: null,

  part: "",
  part_id: null,

  standardCycleTime: "",
  actualCycleTime: "",

  target: "",
  actual: "",

  reject: "",
  mouldReject: "",

  mouldChange: false,
  old_part_id: null,
  old_part_number: "",
  new_part_id: null,
  new_part_number: "",
  mould_duration: "",
  mould_remarks: "",

  mouldPart: "",
  mouldStandardCycleTime: "",
  mouldActualCycleTime: "",
  mouldTarget: "",
  mouldActual: "",

  plan_detail_id: null,

  remarks: "",
};

const getLoggedInUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || null;
  } catch {
    return null;
  }
};

const buildReasonRows = (masterList, qtyField) =>
  masterList.map((r) => ({
    reason: r.reason_name,
    [qtyField]: "",
    custom: false,
    reason_id: r.id,
  }));

const isActiveReason = (item) => {
  if (item.status === undefined && item.is_active === undefined) return true;
  if (typeof item.status === "string" && item.status.toLowerCase() === "active") return true;
  if (Number(item.is_active) === 1 || item.is_active === true) return true;
  return false;
};

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const useProductionEntry = () => {
  const [setupComplete, setSetupComplete] = useState(false);

  const [allMachines, setAllMachines] = useState([]);
  const [masterRejectReasons, setMasterRejectReasons] = useState([]);
  const [masterLossReasons, setMasterLossReasons] = useState([]);

  const [loadingMaster, setLoadingMaster] = useState(false);
  const [masterError, setMasterError] = useState(null);

  useEffect(() => {
    const loadMasterData = async () => {
      setLoadingMaster(true);
      setMasterError(null);

      try {
        const [machinesRes, rejectRes, lossRes] = await Promise.all([
          getAllMachines(),
          getAllRejectionReasons(),
          getAllLossReasons(),
        ]);

        const machines = (machinesRes?.data || []).map((m) => ({
          ...m,
          name: m.name || m.machine_name,
        }));

        const rejectMaster = (rejectRes?.data || []).filter(isActiveReason);
        const lossMaster = (lossRes?.data || []).filter(isActiveReason);

        setAllMachines(machines);
        setMasterRejectReasons(rejectMaster);
        setMasterLossReasons(lossMaster);
      } catch (err) {
        console.error("Failed to load master data:", err);
        setMasterError("Failed to load machines / reasons from server.");
      } finally {
        setLoadingMaster(false);
      }
    };

    loadMasterData();
  }, []);

  const lossTimeReasonOptions = useMemo(
    () => masterLossReasons.map((r) => r.reason_name),
    [masterLossReasons],
  );

  const [formData, setFormData] = useState(baseFormData);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [mouldRejectReasons, setMouldRejectReasons] = useState([]);
  const [lossReasons, setLossReasons] = useState([{ reason: "", minutes: 0 }]);

  useEffect(() => {
    if (masterRejectReasons.length && rejectReasons.length === 0) {
      setRejectReasons(buildReasonRows(masterRejectReasons, "qty"));
    }
    if (masterRejectReasons.length && mouldRejectReasons.length === 0) {
      setMouldRejectReasons(buildReasonRows(masterRejectReasons, "qty"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterRejectReasons]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHallChange = (e) => {
    const hall = e.target.value;
    setFormData((prev) => ({ ...prev, hall, timeSlot: "" }));
  };

  const handleShiftChange = (e) => {
    const shift = e.target.value;
    setFormData((prev) => ({ ...prev, shift, timeSlot: "" }));
  };

  // ==========================================================
  // PRODUCTION PLAN — auto-load the plan for date+hall+shift once
  // setup is complete. If a plan exists we use it to drive which
  // machines show up and to prefill operator/part/target per machine.
  // If no plan exists, everything works exactly like before
  // (fully manual entry).
  // ==========================================================
  const [plan, setPlan] = useState(null); // { header, details }
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState(null);

  useEffect(() => {
    if (!setupComplete) return;
    if (!formData.date || !formData.hall || !formData.shift) return;

    let cancelled = false;

    const loadPlan = async () => {
      setPlanLoading(true);
      setPlanError(null);

      try {
        const check = await checkPlan(formData.date, formData.hall, formData.shift);

        if (check?.exists && check.plan_id) {
          const full = await getPlan(check.plan_id);
          if (!cancelled) setPlan(full);
        } else if (!cancelled) {
          setPlan(null);
        }
      } catch (err) {
        console.error("Failed to load production plan:", err);
        if (!cancelled) {
          setPlan(null);
          setPlanError(
            "Could not load the production plan for this date/hall/shift — continuing with manual entry.",
          );
        }
      } finally {
        if (!cancelled) setPlanLoading(false);
      }
    };

    loadPlan();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupComplete]);

  // machine_code -> plan detail row, for O(1) lookup while prefilling
  const planDetailsByMachineCode = useMemo(() => {
    const map = {};
    (plan?.details || []).forEach((d) => {
      map[d.machine_code] = d;
    });
    return map;
  }, [plan]);

  // If a plan exists, restrict + order machines to exactly what's planned.
  // Otherwise fall back to the old "everything in this hall" behaviour.
  const filteredMachines = useMemo(() => {
    const hallMachines = !formData.hall
      ? allMachines
      : allMachines.filter((m) => !m.hall || m.hall === formData.hall);

    if (plan?.details?.length) {
      const byCode = {};
      hallMachines.forEach((m) => {
        byCode[m.machine_code] = m;
      });

      const planned = plan.details.map((d) => byCode[d.machine_code]).filter(Boolean);

      return planned.length ? planned : hallMachines;
    }

    return hallMachines;
  }, [allMachines, formData.hall, plan]);

  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);

  const currentMachine = filteredMachines[currentMachineIndex] || null;

  const [machineEntries, setMachineEntries] = useState({});

  const [showMouldSection, setShowMouldSection] = useState(false);

  const saveCurrentMachine = useCallback(() => {
    if (!currentMachine) return;

    setMachineEntries((prev) => ({
      ...prev,
      [currentMachine.id]: {
        ...prev[currentMachine.id],
        formData,
        rejectReasons,
        mouldRejectReasons,
        lossReasons,
        saved: true,
      },
    }));
  }, [currentMachine, formData, rejectReasons, mouldRejectReasons, lossReasons]);

  const loadMachineData = useCallback(
    (machine) => {
      if (!machine) return;

      const existing = machineEntries[machine.id];

      if (existing) {
        setFormData(existing.formData);
        setRejectReasons(existing.rejectReasons);
        setMouldRejectReasons(existing.mouldRejectReasons);
        setLossReasons(existing.lossReasons);
        setShowMouldSection(!!existing.formData?.mouldChange);
        return;
      }

      const planDetail = planDetailsByMachineCode[machine.machine_code];

      const prevMachineIndex = currentMachineIndex - 1;
      const prevMachine = prevMachineIndex >= 0 ? filteredMachines[prevMachineIndex] : null;
      const prevSnapshot = prevMachine ? machineEntries[prevMachine.id] : null;

      const carryOperatorId = prevSnapshot?.formData?.operator_id || null;
      const carryOperatorCode = prevSnapshot?.formData?.operatorId || "";
      const carryPartId = prevSnapshot?.formData?.part_id || null;
      const carryPartName = prevSnapshot?.formData?.part || "";
      const carryStandardCT = prevSnapshot?.formData?.standardCycleTime || "";
      // FIX: actualCycleTime bhi carry-forward karo (pehle sirf standardCT carry hota tha)
      const carryActualCT = prevSnapshot?.formData?.actualCycleTime || "";

      const prevHadMould =
        prevSnapshot?.formData?.mouldChange && prevSnapshot?.formData?.new_part_id;
      const carryOldPartId = prevHadMould ? prevSnapshot?.formData?.new_part_id : null;
      const carryOldPartNumber = prevHadMould ? prevSnapshot?.formData?.new_part_number : "";

      const operatorCode = planDetail?.operator_id || carryOperatorCode;
      const partId = planDetail ? planDetail.part_id || null : carryPartId;
      const partName = planDetail?.part_name || carryPartName;

      // FIX: std CT aur actual CT — plan se ek hi jagah (parts table) se aati hain
      // (cycle_time / actual_cycle_time), dono usually equal hote hain.
      const standardCT = planDetail?.cycle_time ?? carryStandardCT;
      const actualCT =
        planDetail?.actual_cycle_time ?? planDetail?.cycle_time ?? carryActualCT;

      const target = planDetail?.target_qty ? String(planDetail.target_qty) : "";

      const plannedMould = (planDetail?.mould_changes || []).find(
        (mc) => mc.status === "Planned",
      );

      // FIX: mould change ke naye part ka std CT / actual CT / target ab
      // plan response se seedha aa raha hai (new_part_standard_cycle_time,
      // new_part_actual_cycle_time, new_part_target_quantity) — pehle ye
      // 3 fields set hi nahi ho rahi thi, form khaali dikhta tha.
      const mouldStdCT = plannedMould?.new_part_standard_cycle_time || "";
      const mouldActualCT =
        plannedMould?.new_part_actual_cycle_time ||
        plannedMould?.new_part_standard_cycle_time ||
        "";
      const mouldTargetQty = plannedMould?.new_part_target_quantity
        ? String(plannedMould.new_part_target_quantity)
        : "";

      setFormData((prev) => ({
        ...baseFormData,
        date: prev.date,
        hall: prev.hall,
        shift: prev.shift,
        timeSlot: prev.timeSlot,

        operatorId: operatorCode || "",
        operator_id: planDetail ? null : carryOperatorId,

        part: partName,
        part_id: partId,
        standardCycleTime: standardCT,
        actualCycleTime: actualCT,
        target,

        old_part_id: carryOldPartId,
        old_part_number: carryOldPartNumber,

        mouldChange: !!plannedMould,
        new_part_id: plannedMould?.new_part_id || null,
        new_part_number: plannedMould?.new_part_number || "",
        mouldPart: plannedMould?.new_part_name || "",
        mould_remarks: plannedMould?.reason || "",

        // FIX: mould section ke naye part ki std/actual CT aur target ab
        // auto-fill hoti hai, aur inputs pehle se editable hain (ProductionForm /
        // MouldChangeSection me koi extra change nahi chahiye).
        mouldStandardCycleTime: mouldStdCT,
        mouldActualCycleTime: mouldActualCT,
        mouldTarget: mouldTargetQty,

        plan_detail_id: planDetail?.detail_id || null,
      }));

      setShowMouldSection(!!plannedMould);
      setRejectReasons(buildReasonRows(masterRejectReasons, "qty"));
      setMouldRejectReasons(buildReasonRows(masterRejectReasons, "qty"));
      setLossReasons([{ reason: "", minutes: 0 }]);
    },
    [
      machineEntries,
      currentMachineIndex,
      filteredMachines,
      masterRejectReasons,
      planDetailsByMachineCode,
    ],
  );

  // ==========================================================
  // FIX: pehli machine (ya hall/shift switch ke baad ki pehli machine)
  // auto-load nahi hoti thi kyunki loadMachineData sirf Next/Prev pe
  // call hoti thi. Ye effect currentMachine badalte hi — ya plan load
  // hone ke baad — auto-fill kar dega, bas tab jab us machine ka data
  // abhi tak khaali hai (user ne kuch edit nahi kiya / already saved nahi hai).
  // ==========================================================
  useEffect(() => {
    if (!currentMachine) return;
    if (machineEntries[currentMachine.id]) return; // already saved, don't overwrite
    if (formData.part_id || formData.operatorId) return; // already filled, don't overwrite user's typing

    loadMachineData(currentMachine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMachine?.id, plan]);

  const progress = useMemo(() => {
    if (!filteredMachines.length) return 0;
    const savedCount = Object.values(machineEntries).filter((e) => e.saved).length;
    return Math.round((savedCount / filteredMachines.length) * 100);
  }, [machineEntries, filteredMachines]);

  const efficiency = useMemo(() => {
    const target = Number(formData.target) || 0;
    const actual = Number(formData.actual) || 0;
    if (!target) return 0;
    return Number(((actual / target) * 100).toFixed(2));
  }, [formData.target, formData.actual]);

  const totalRejectQty = useMemo(
    () => rejectReasons.reduce((sum, r) => sum + (Number(r.qty) || 0), 0),
    [rejectReasons],
  );

  const totalMouldRejectQty = useMemo(
    () => mouldRejectReasons.reduce((sum, r) => sum + (Number(r.qty) || 0), 0),
    [mouldRejectReasons],
  );

  const totalLossMinutes = useMemo(
    () => lossReasons.reduce((sum, l) => sum + (Number(l.minutes) || 0), 0),
    [lossReasons],
  );

  // ==========================================================
  // MOULD CHANGE DURATION
  // slot = 60 minutes.
  // old_time = old part actual qty * old part actual cycle time (sec) / 60
  // new_time = new part actual qty * new part actual cycle time (sec) / 60
  // duration = 60 - (old_time + new_time)  -> leftover time = mould change downtime
  // ==========================================================
  const mouldDurationCalc = useMemo(() => {
    if (!formData.mouldChange) return "";

    const oldQty = Number(formData.actual) || 0;
    const oldCT = Number(formData.actualCycleTime) || 0;
    const newQty = Number(formData.mouldActual) || 0;
    const newCT = Number(formData.mouldActualCycleTime) || 0;

    if (!oldCT && !newCT) return "";

    const oldMinutes = (oldQty * oldCT) / 60;
    const newMinutes = (newQty * newCT) / 60;
    const duration = 60 - (oldMinutes + newMinutes);

    return Number(Math.max(duration, 0).toFixed(1));
  }, [
    formData.mouldChange,
    formData.actual,
    formData.actualCycleTime,
    formData.mouldActual,
    formData.mouldActualCycleTime,
  ]);

  useEffect(() => {
    if (!formData.mouldChange) return;
    if (formData.mould_duration === mouldDurationCalc) return;

    setFormData((prev) => ({ ...prev, mould_duration: mouldDurationCalc }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouldDurationCalc, formData.mouldChange]);

  const addCustomRejectReason = () => {
    setRejectReasons((prev) => [...prev, { reason: "", qty: "", custom: true, reason_id: null }]);
  };

  const removeCustomRejectReason = (index) => {
    setRejectReasons((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRejectReason = (index, field, value) => {
    setRejectReasons((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addMouldRejectReason = (reason) => {
    setMouldRejectReasons((prev) => [
      ...prev,
      { reason: reason.reason_name, qty: "", custom: false, reason_id: reason.id },
    ]);
  };

  const removeMouldRejectReason = (index) => {
    setMouldRejectReasons((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomMouldRejectReason = () => {
    setMouldRejectReasons((prev) => [
      ...prev,
      { reason: "", qty: "", custom: true, reason_id: null },
    ]);
  };

  const removeCustomMouldRejectReason = (index) => {
    setMouldRejectReasons((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMouldRejectReason = (index, field, value) => {
    setMouldRejectReasons((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addLossReason = () => {
    setLossReasons((prev) => [...prev, { reason: "", minutes: 0 }]);
  };

  const removeLossReason = (index) => {
    setLossReasons((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const updateLossReason = (index, field, value) => {
    setLossReasons((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleMouldToggle = () => {
    setShowMouldSection((prev) => !prev);
    setFormData((prev) => ({ ...prev, mouldChange: !prev.mouldChange }));
  };

  const customReasonCache = useRef({});

  const resolveReasonId = async (row) => {
    if (!row.custom) return row.reason_id;
    if (!row.reason || !row.reason.trim()) return null;

    const key = row.reason.trim().toLowerCase();
    if (customReasonCache.current[key]) return customReasonCache.current[key];

    try {
      const res = await createRejectionReason({
        reason_code: `CUSTOM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        reason_name: row.reason.trim(),
      });
      const newId = res?.data?.id;
      if (newId) customReasonCache.current[key] = newId;
      return newId || null;
    } catch (err) {
      console.error("Failed to create custom rejection reason:", err);
      return null;
    }
  };

  const buildPayload = async (machine, snapshot, existingProductionId) => {
    const {
      formData: data,
      rejectReasons: rejectRows,
      mouldRejectReasons: mouldRows,
      lossReasons: lossRows,
    } = snapshot;

    const target = Number(data.target) || 0;
    const actual = Number(data.actual) || 0;
    const rejectQty = Number(data.reject) || 0;
    const good = Math.max(actual - rejectQty, 0);
    const eff = target ? Number(((actual / target) * 100).toFixed(2)) : 0;

    const lossMinutes = lossRows.reduce((s, l) => s + (Number(l.minutes) || 0), 0);

    const production_id =
      existingProductionId || `PID-${machine.machine_code || machine.id}-${Date.now()}`;

    const rejectDetailRows = [];

    for (const r of rejectRows) {
      if (!(Number(r.qty) > 0)) continue;
      const reason_id = await resolveReasonId(r);
      rejectDetailRows.push({
        reject_reason_id: reason_id,
        reject_qty: Number(r.qty) || 0,
        remarks: null,
      });
    }

    for (const r of mouldRows) {
      if (!(Number(r.qty) > 0)) continue;
      const reason_id = await resolveReasonId(r);
      rejectDetailRows.push({
        reject_reason_id: reason_id,
        reject_qty: Number(r.qty) || 0,
        remarks: "[Mould change reject]",
      });
    }

    const losses = lossRows
      .filter((l) => l.reason && Number(l.minutes) > 0)
      .map((l) => {
        const master = masterLossReasons.find(
          (r) => r.reason_name.trim().toLowerCase() === l.reason.trim().toLowerCase(),
        );
        return {
          loss_reason_id: master ? master.id : null,
          loss_minutes: Number(l.minutes) || 0,
          remarks: null,
        };
      })
      .filter((l) => l.loss_reason_id != null);

    const mould_changes = data.mouldChange
      ? [
          {
            old_part_id: data.old_part_id ?? null,
            old_part_number: data.old_part_number || null,
            new_part_id: data.new_part_id,
            new_part_number: data.new_part_number || data.mouldPart || null,
            duration_minutes: Number(data.mould_duration) || 0,
            remarks: data.mould_remarks || null,
            mould_actual_cycle_time: Number(data.mouldActualCycleTime) || 0,
          },
        ]
      : [];

    return {
      production_id,
      entry_date: data.date,
      hall: data.hall,
      shift: data.shift,
      time_slot: data.timeSlot,
      machine_code: machine.machine_code,
      machine_id: machine.id,
      operator_id: data.operator_id,
      part_id: data.part_id,
      standard_cycle_time: Number(data.standardCycleTime) || 0,
      actual_cycle_time: Number(data.actualCycleTime) || 0,
      target_qty: target,
      actual_qty: actual,
      good_qty: good,
      reject_qty: rejectQty,
      loss_minutes: lossMinutes,
      efficiency: eff,
      remarks: data.remarks,
      created_by: getLoggedInUserId(),
      rejects: rejectDetailRows,
      losses,
      mould_changes,
      plan_detail_id: data.plan_detail_id || null,
    };
  };

  const submitMachineEntry = async (machine, snapshot) => {
    const existing = machineEntries[machine.id];

    if (snapshot.formData.mouldChange && !snapshot.formData.new_part_id) {
      throw new Error(
        "Mould change is enabled but no new part was selected — pick a part from the mould section's suggestions before saving.",
      );
    }

    const payload = await buildPayload(machine, snapshot, existing?.production_id);

    const url = existing?.entryId
      ? `${API_BASE}/api/production-entries/${existing.entryId}`
      : `${API_BASE}/api/production-entries`;

    const response = await fetch(url, {
      method: existing?.entryId ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await response.json();

    if (!response.ok || !res?.success) {
      throw new Error(res?.message || `Failed to save entry (HTTP ${response.status}).`);
    }

    const entryId = res?.data?.id || existing?.entryId || null;

    setMachineEntries((prev) => ({
      ...prev,
      [machine.id]: {
        ...snapshot,
        saved: true,
        entryId,
        production_id: payload.production_id,
      },
    }));

    return res;
  };

  const previousMachine = () => {
    saveCurrentMachine();
    const newIndex = Math.max(0, currentMachineIndex - 1);
    setCurrentMachineIndex(newIndex);
    loadMachineData(filteredMachines[newIndex]);
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const nextMachine = async () => {
    if (!currentMachine) return;

    setSubmitError(null);

    if (!formData.operator_id || !formData.part_id) {
      setSubmitError(
        !formData.operator_id
          ? "Operator not found/selected — use Find or pick from the search list before moving on."
          : "Part not selected — pick a part from the suggestions list before moving on.",
      );
      return;
    }

    setSubmitting(true);

    const snapshot = { formData, rejectReasons, mouldRejectReasons, lossReasons };

    try {
      await submitMachineEntry(currentMachine, snapshot);

      const newIndex = Math.min(filteredMachines.length - 1, currentMachineIndex + 1);
      setCurrentMachineIndex(newIndex);
      loadMachineData(filteredMachines[newIndex]);
    } catch (err) {
      console.error("Failed to save entry for", currentMachine.machine_code, err);
      setSubmitError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save this machine's entry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const finalSubmit = async () => {
    if (!currentMachine) return null;

    setSubmitError(null);

    if (!formData.operator_id || !formData.part_id) {
      setSubmitError(
        !formData.operator_id
          ? "Operator not found/selected — use Find or pick from the search list before saving."
          : "Part not selected — pick a part from the suggestions list before saving.",
      );
      return null;
    }

    setSubmitting(true);

    const snapshot = { formData, rejectReasons, mouldRejectReasons, lossReasons };

    try {
      const res = await submitMachineEntry(currentMachine, snapshot);
      return [{ machine: currentMachine.machine_code, success: true, res }];
    } catch (err) {
      console.error("Failed to save entry for", currentMachine.machine_code, err);
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to save this machine's entry. Please try again.";
      setSubmitError(message);
      return [{ machine: currentMachine.machine_code, success: false, error: message }];
    } finally {
      setSubmitting(false);
    }
  };

  return {
    setupComplete,
    setSetupComplete,

    formData,

    handleChange,
    handleHallChange,
    handleShiftChange,

    shiftATimes: SHIFT_A_TIMES,
    shiftBTimes: SHIFT_B_TIMES,

    filteredMachines,
    currentMachine,

    machineEntries,

    currentMachineIndex,
    setCurrentMachineIndex,

    progress,
    efficiency,

    totalRejectQty,
    totalMouldRejectQty,
    totalLossMinutes,

    rejectReasons,
    mouldRejectReasons,
    lossReasons,

    lossTimeReasonOptions,

    addCustomRejectReason,
    removeCustomRejectReason,
    updateRejectReason,

    addMouldRejectReason,
    removeMouldRejectReason,
    addCustomMouldRejectReason,
    removeCustomMouldRejectReason,
    updateMouldRejectReason,

    addLossReason,
    removeLossReason,
    updateLossReason,

    showMouldSection,
    handleMouldToggle,

    saveCurrentMachine,
    loadMachineData,

    previousMachine,
    nextMachine,

    finalSubmit,

    loadingMaster,
    masterError,
    submitting,
    submitError,

    plan,
    planLoading,
    planError,
  };
};

export default useProductionEntry;