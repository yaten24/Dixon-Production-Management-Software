import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { getAllMachines } from "../api/machineApi";
import {
  getAllRejectionReasons,
  createRejectionReason,
} from "../api/rejectionReasonApi";
import { getAllLossReasons } from "../api/lossReasonApi";

// ==========================================================
// Static shift time-slot definitions
// ASSUMPTION: adjust these to your actual shift timings.
// ==========================================================
const SHIFT_A_TIMES = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
];

const SHIFT_B_TIMES = [
  "20:00 - 21:00",
  "21:00 - 22:00",
  "22:00 - 23:00",
  "23:00 - 00:00",
  "00:00 - 01:00",
  "01:00 - 02:00",
  "02:00 - 03:00",
  "03:00 - 04:00",
  "04:00 - 05:00",
  "05:00 - 06:00",
  "06:00 - 07:00",
  "07:00 - 08:00",
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

// FIX: qty now defaults to "" instead of 0. With 0, the number input
// always rendered a literal "0" that the user had to manually delete
// before typing a real value — annoying when filling in a long list of
// reject reasons. Empty string renders as a blank input, and every place
// that reads qty already does Number(r.qty) || 0, so calculations are
// unaffected.
const buildReasonRows = (masterList, qtyField) =>
  masterList.map((r) => ({
    reason: r.reason_name,
    [qtyField]: "",
    custom: false,
    reason_id: r.id,
  }));

const isActiveReason = (item) => {
  if (item.status === undefined && item.is_active === undefined) {
    return true;
  }
  if (
    typeof item.status === "string" &&
    item.status.toLowerCase() === "active"
  ) {
    return true;
  }
  if (Number(item.is_active) === 1 || item.is_active === true) {
    return true;
  }
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

  const filteredMachines = useMemo(() => {
    if (!formData.hall) return allMachines;
    return allMachines.filter((m) => !m.hall || m.hall === formData.hall);
  }, [allMachines, formData.hall]);

  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);

  const currentMachine = filteredMachines[currentMachineIndex] || null;

  const [machineEntries, setMachineEntries] = useState({});

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
  }, [
    currentMachine,
    formData,
    rejectReasons,
    mouldRejectReasons,
    lossReasons,
  ]);

  const loadMachineData = useCallback(
    (machine) => {
      if (!machine) return;

      const existing = machineEntries[machine.id];

      if (existing) {
        setFormData(existing.formData);
        setRejectReasons(existing.rejectReasons);
        setMouldRejectReasons(existing.mouldRejectReasons);
        setLossReasons(existing.lossReasons);
      } else {
        const prevMachineIndex = currentMachineIndex - 1;
        const prevMachine =
          prevMachineIndex >= 0 ? filteredMachines[prevMachineIndex] : null;
        const prevSnapshot = prevMachine
          ? machineEntries[prevMachine.id]
          : null;

        const carryOperatorId = prevSnapshot?.formData?.operator_id || null;
        const carryOperatorCode = prevSnapshot?.formData?.operatorId || "";
        const carryPartId = prevSnapshot?.formData?.part_id || null;
        const carryPartName = prevSnapshot?.formData?.part || "";
        const carryStandardCT =
          prevSnapshot?.formData?.standardCycleTime || "";

        const prevHadMould =
          prevSnapshot?.formData?.mouldChange &&
          prevSnapshot?.formData?.new_part_id;
        const carryOldPartId = prevHadMould
          ? prevSnapshot?.formData?.new_part_id
          : null;
        const carryOldPartNumber = prevHadMould
          ? prevSnapshot?.formData?.new_part_number
          : "";

        setFormData((prev) => ({
          ...baseFormData,
          date: prev.date,
          hall: prev.hall,
          shift: prev.shift,
          timeSlot: prev.timeSlot,
          operatorId: carryOperatorCode,
          operator_id: carryOperatorId,
          part: carryPartName,
          part_id: carryPartId,
          standardCycleTime: carryStandardCT,
          old_part_id: carryOldPartId,
          old_part_number: carryOldPartNumber,
        }));

        setRejectReasons(buildReasonRows(masterRejectReasons, "qty"));
        setMouldRejectReasons(buildReasonRows(masterRejectReasons, "qty"));
        setLossReasons([{ reason: "", minutes: 0 }]);
      }
    },
    [machineEntries, currentMachineIndex, filteredMachines, masterRejectReasons],
  );

  const progress = useMemo(() => {
    if (!filteredMachines.length) return 0;
    const savedCount = Object.values(machineEntries).filter(
      (e) => e.saved,
    ).length;
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

  const addCustomRejectReason = () => {
    setRejectReasons((prev) => [
      ...prev,
      { reason: "", qty: "", custom: true, reason_id: null },
    ]);
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
      {
        reason: reason.reason_name,
        qty: "",
        custom: false,
        reason_id: reason.id,
      },
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
    setLossReasons((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const updateLossReason = (index, field, value) => {
    setLossReasons((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const [showMouldSection, setShowMouldSection] = useState(false);

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

    const lossMinutes = lossRows.reduce(
      (s, l) => s + (Number(l.minutes) || 0),
      0,
    );

    const production_id =
      existingProductionId ||
      `PID-${machine.machine_code || machine.id}-${Date.now()}`;

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
          (r) =>
            r.reason_name.trim().toLowerCase() ===
            l.reason.trim().toLowerCase(),
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
            // NEW: sent so the backend can sync the NEW part's
            // actual_cycle_time in the parts table.
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
    };
  };

  const submitMachineEntry = async (machine, snapshot) => {
    const existing = machineEntries[machine.id];

    if (snapshot.formData.mouldChange && !snapshot.formData.new_part_id) {
      throw new Error(
        "Mould change is enabled but no new part was selected — pick a part from the mould section's suggestions before saving.",
      );
    }

    const payload = await buildPayload(
      machine,
      snapshot,
      existing?.production_id,
    );

    const url = existing?.entryId
      ? `${API_BASE}/api/production-entries/${existing.entryId}`
      : `${API_BASE}/api/production-entries`;

    const response = await fetch(url, {
      method: existing?.entryId ? "PUT" : "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await response.json();

    if (!response.ok || !res?.success) {
      throw new Error(
        res?.message || `Failed to save entry (HTTP ${response.status}).`,
      );
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

    const snapshot = {
      formData,
      rejectReasons,
      mouldRejectReasons,
      lossReasons,
    };

    try {
      await submitMachineEntry(currentMachine, snapshot);

      const newIndex = Math.min(
        filteredMachines.length - 1,
        currentMachineIndex + 1,
      );
      setCurrentMachineIndex(newIndex);
      loadMachineData(filteredMachines[newIndex]);
    } catch (err) {
      console.error(
        "Failed to save entry for",
        currentMachine.machine_code,
        err,
      );
      setSubmitError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save this machine's entry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // CHANGED: this used to loop over EVERY saved machine and re-submit
  // them all again ("Submit All Entries"). Each machine already saves
  // itself the moment you hit "Save & Next", so re-submitting everything
  // at the end was redundant and confusing. Now this only saves the
  // CURRENT (last) machine — same one-by-one flow, just without the
  // batch step at the end. Renamed conceptually to a single-entry save,
  // kept the export name `finalSubmit` so AdvProductionEntry.jsx doesn't
  // need extra wiring.
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

    const snapshot = {
      formData,
      rejectReasons,
      mouldRejectReasons,
      lossReasons,
    };

    try {
      const res = await submitMachineEntry(currentMachine, snapshot);
      return [{ machine: currentMachine.machine_code, success: true, res }];
    } catch (err) {
      console.error(
        "Failed to save entry for",
        currentMachine.machine_code,
        err,
      );
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to save this machine's entry. Please try again.";
      setSubmitError(message);
      return [
        { machine: currentMachine.machine_code, success: false, error: message },
      ];
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
  };
};

export default useProductionEntry;