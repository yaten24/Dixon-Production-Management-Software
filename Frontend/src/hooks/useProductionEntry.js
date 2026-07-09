import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { getAllMachines } from "../api/machineApi";
import {
  getAllRejectionReasons,
  createRejectionReason,
} from "../api/rejectionReasonApi";
import { getAllLossReasons } from "../api/lossReasonApi";
import {
  createProductionEntry,
  updateProductionEntry,
} from "../api/productionEntryApi";

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

  operatorId: "", // typed operator code, looked up via fetchOperator
  operator_id: null, // resolved numeric id, set once lookup succeeds

  part: "", // part name shown in the input
  part_id: null, // resolved numeric id, set once a suggestion is picked

  standardCycleTime: "",
  actualCycleTime: "",

  target: "",
  actual: "",

  // plain numbers typed directly by the user — validated against the
  // breakdown totals (rejectReasons / mouldRejectReasons sums) in the UI
  reject: "",
  mouldReject: "",

  mouldChange: false,
  old_part_id: null,
  old_part_number: "",
  new_part_id: null,
  new_part_number: "",
  mould_duration: "",
  mould_remarks: "",

  // FIX: these were read/written by MouldChangeSection.jsx
  // (formData.mouldPart, mouldStandardCycleTime, mouldActualCycleTime,
  // mouldTarget, mouldActual) but were never declared here. That meant
  // the inputs were "uncontrolled → controlled" on first render (React
  // warning) and, worse, loadMachineData()'s `{...baseFormData, ...}`
  // reset wiped them out inconsistently between machines.
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

// Build the initial breakdown rows from the master reasons list:
// every master reason is always shown (custom: false, not removable),
// with qty/minutes starting at 0. Custom rows get appended on top of this.
const buildReasonRows = (masterList, qtyField) =>
  masterList.map((r) => ({
    reason: r.reason_name,
    [qtyField]: 0,
    custom: false,
    reason_id: r.id,
  }));

// Backend returns status as "Active" (capital A); accept string status or
// is_active flag, case-insensitively.
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

// FIX: single source of truth for the API base URL instead of hardcoding
// "http://localhost:5000" inline inside submitMachineEntry. Set
// VITE_API_URL in your .env for production builds.
const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const useProductionEntry = () => {
  // ------------------------------------------------------
  // Setup stage
  // ------------------------------------------------------
  const [setupComplete, setSetupComplete] = useState(false);

  // ------------------------------------------------------
  // Master data (fetched from backend)
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // Per-machine working state
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // Machines filtered by selected hall
  // ------------------------------------------------------
  const filteredMachines = useMemo(() => {
    if (!formData.hall) return allMachines;
    return allMachines.filter((m) => !m.hall || m.hall === formData.hall);
  }, [allMachines, formData.hall]);

  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);

  const currentMachine = filteredMachines[currentMachineIndex] || null;

  const [machineEntries, setMachineEntries] = useState({});

  // ------------------------------------------------------
  // Save / load per-machine data (LOCAL ONLY)
  // ------------------------------------------------------
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
        setFormData((prev) => ({
          ...baseFormData,
          date: prev.date,
          hall: prev.hall,
          shift: prev.shift,
          timeSlot: prev.timeSlot,
        }));
        setRejectReasons(buildReasonRows(masterRejectReasons, "qty"));
        setMouldRejectReasons(buildReasonRows(masterRejectReasons, "qty"));
        setLossReasons([{ reason: "", minutes: 0 }]);
      }
    },
    [machineEntries, masterRejectReasons],
  );

  // ------------------------------------------------------
  // Progress / efficiency / totals
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // Reject breakup
  // ------------------------------------------------------
  const addCustomRejectReason = () => {
    setRejectReasons((prev) => [
      ...prev,
      { reason: "", qty: 0, custom: true, reason_id: null },
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

  // ------------------------------------------------------
  // Mould reject breakup
  // ------------------------------------------------------
  const addMouldRejectReason = (reason) => {
    setMouldRejectReasons((prev) => [
      ...prev,
      {
        reason: reason.reason_name,
        qty: 0,
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
      { reason: "", qty: 0, custom: true, reason_id: null },
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

  // ------------------------------------------------------
  // Loss time breakup
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // Mould change toggle
  // ------------------------------------------------------
  const [showMouldSection, setShowMouldSection] = useState(false);

  const handleMouldToggle = () => {
    setShowMouldSection((prev) => !prev);
    setFormData((prev) => ({ ...prev, mouldChange: !prev.mouldChange }));
  };

  // ------------------------------------------------------
  // Resolve a custom (typed, no id) reason to a real rejection_reasons row
  // ------------------------------------------------------
  const customReasonCache = useRef({});

  const resolveReasonId = async (row) => {
    if (!row.custom) return row.reason_id;
    if (!row.reason || !row.reason.trim()) return null;

    const key = row.reason.trim().toLowerCase();
    if (customReasonCache.current[key]) return customReasonCache.current[key];

    try {
      const res = await createRejectionReason({
        // FIX: Date.now() alone can collide if two custom reasons are
        // created within the same millisecond during a loop; add a random
        // suffix to keep reason_code unique.
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

  // ------------------------------------------------------
  // Build backend payload for one machine's saved entry.
  // ------------------------------------------------------
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

    // FIX: mould section's own new_part_id (set when the user picks a part
    // via mould-part search) is now used instead of the stale/never-set
    // data.new_part_id, which was always null and violated the schema's
    // NOT NULL constraint on new_part_id.
    const mould_changes = data.mouldChange
      ? [
          {
            old_part_id: data.old_part_id ?? null,
            old_part_number: data.old_part_number || null,
            new_part_id: data.new_part_id,
            new_part_number: data.new_part_number || data.mouldPart || null,
            duration_minutes: Number(data.mould_duration) || 0,
            remarks: data.mould_remarks || null,
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

  // ------------------------------------------------------
  // Create-or-update a single machine's entry on the backend.
  // ------------------------------------------------------
  const submitMachineEntry = async (machine, snapshot) => {
    const existing = machineEntries[machine.id];

    // FIX: mould change requires a resolved new_part_id — block the save
    // early with a clear message instead of letting it hit the DB and
    // fail with a cryptic "cannot be null" SQL error.
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
      credentials: "include", // send httpOnly cookie
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await response.json();

    // FIX: fetch() only rejects on network failure, not on HTTP 4xx/5xx.
    // Previously a failed save (validation error, duplicate production_id,
    // DB constraint violation) still fell through to "success" handling
    // below and the machine got marked saved: true — silently losing data.
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

  // ------------------------------------------------------
  // Navigation
  // ------------------------------------------------------
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
          ? "Operator not found/selected — use the Find button next to Operator ID before moving on."
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

  // ------------------------------------------------------
  // Final submit
  // ------------------------------------------------------
  const finalSubmit = async () => {
    saveCurrentMachine();

    setSubmitting(true);
    setSubmitError(null);

    const entriesToSubmit = {
      ...machineEntries,
      ...(currentMachine
        ? {
            [currentMachine.id]: {
              ...machineEntries[currentMachine.id],
              formData,
              rejectReasons,
              mouldRejectReasons,
              lossReasons,
              saved: true,
            },
          }
        : {}),
    };

    const results = [];

    try {
      for (const machine of filteredMachines) {
        const snapshot = entriesToSubmit[machine.id];

        if (!snapshot || !snapshot.saved) continue;

        if (!snapshot.formData.operator_id || !snapshot.formData.part_id) {
          results.push({
            machine: machine.machine_code,
            success: false,
            error: !snapshot.formData.operator_id
              ? "Operator not found/selected — use the Find button next to Operator ID"
              : "Part not selected — pick a part from the suggestions list",
          });
          continue;
        }

        try {
          const res = await submitMachineEntry(machine, snapshot);
          results.push({ machine: machine.machine_code, success: true, res });
        } catch (err) {
          results.push({
            machine: machine.machine_code,
            success: false,
            error: err?.response?.data?.message || err.message,
          });
        }
      }

      const failed = results.filter((r) => !r.success);

      if (failed.length) {
        setSubmitError(
          `Failed to submit for: ${failed.map((f) => `${f.machine} (${f.error})`).join(", ")}`,
        );
      }

      return results;
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
