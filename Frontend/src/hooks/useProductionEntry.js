import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { getAllMachines } from "../api/machineApi";
import api from "../api/axios"
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

// ==========================================================
// Slot length used for the Target Qty auto-calc formula below.
// NOTE: keep this in sync with PLANNED_MINUTES_PER_SLOT in
// AdvProductionEntry.jsx (used there for the OEE Availability calc) —
// they represent the same "one time-slot = 60 minutes" assumption.
// ==========================================================
const SLOT_MINUTES = 60;

// Target Qty auto-calc: plan_id/plan_detail_id are now fully optional
// (see PLAN IS OPTIONAL note below), so Target Qty can no longer rely
// on always having a matched plan detail to read target_qty from.
//   1. If the machine has a matched plan detail with a target_qty, use it
//      as-is (that's the officially planned number).
//   2. Otherwise compute a theoretical max for the slot:
//      target = floor( (slot seconds) / (ACTUAL cycle time seconds) )
//
// CHANGED: this used to be driven off Standard Cycle Time. Target is now
// derived from Actual Cycle Time instead, since Standard Cycle Time is a
// catalog/reference number for the part while Actual Cycle Time reflects
// what the machine is really running at right now — that's the number
// that should drive how many pieces are realistically achievable in the
// slot. Target Qty is also now a normal editable field (see `targetSource
// === "manual"` below) — the operator can type over the calculated value,
// and once they do, this auto-calc backs off and leaves their number alone.
const computeCalcTarget = (actualCycleTime, slotMinutes = SLOT_MINUTES) => {
  const act = Number(actualCycleTime) || 0;
  if (!act) return "";
  return String(Math.floor((slotMinutes * 60) / act));
};

// Once a mould change is active, the 60-minute slot is split in half:
// the old part runs the first half, the new part runs the second half.
// Both parts' auto-calculated targets should therefore be based on a
// 30-minute slot instead of the full 60.
const HALF_SLOT_MINUTES = SLOT_MINUTES / 2;

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
  // "plan"   -> target came from a matched plan detail's target_qty and
  //             should NOT be overwritten by the cycle-time formula.
  // "calc"   -> target was computed from the cycle-time formula and
  //             should keep recalculating whenever actual cycle time changes.
  // "manual" -> the operator typed a value into the (now editable) Target
  //             Qty field directly — auto-calc backs off and leaves it alone
  //             until a new part/plan is loaded.
  targetSource: null,
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
  // Same "plan" / "calc" / "manual" pattern as targetSource, but for the
  // new part's Target Qty — see the half-slot auto-calc effect below.
  mouldTargetSource: null,
  mouldActual: "",

  plan_id: null,
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

// ==========================================================
// PLAN IS OPTIONAL
// ==========================================================
// plan_id / plan_detail_id on production_entries are nullable
// (see migration_allow_manual_entries.sql) and the backend's
// validatePlanLink() only rejects the case where ONE of the two is
// provided without the other — both null is a perfectly valid
// "manual / ad-hoc entry, no matched plan" row.
//
// Previously this hook required a fixed pair of placeholder
// MANUAL_PLAN_ID / MANUAL_PLAN_DETAIL_ID ids (configured via env
// vars) before it would let ANY entry save when no real plan existed
// for the date/hall/shift. That's no longer needed: when there's no
// matched plan detail for a machine, plan_id/plan_detail_id are just
// sent as null and the entry saves as a manual entry, same as any
// other optional field.
// ==========================================================

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
  // If no plan exists, everything works as a fully manual entry —
  // plan_id/plan_detail_id simply stay null (see PLAN IS OPTIONAL
  // note above).
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
      const carryActualCT = prevSnapshot?.formData?.actualCycleTime || "";

      const prevHadMould =
        prevSnapshot?.formData?.mouldChange && prevSnapshot?.formData?.new_part_id;
      const carryOldPartId = prevHadMould ? prevSnapshot?.formData?.new_part_id : null;
      const carryOldPartNumber = prevHadMould ? prevSnapshot?.formData?.new_part_number : "";

      const operatorCode = planDetail?.operator_id || carryOperatorCode;
      const partId = planDetail ? planDetail.part_id || null : carryPartId;
      const partName = planDetail?.part_name || carryPartName;

      const standardCT = planDetail?.cycle_time ?? carryStandardCT;
      const actualCT =
        planDetail?.actual_cycle_time ?? planDetail?.cycle_time ?? carryActualCT;

      // ==========================================================
      // TARGET QTY — auto-calculated, but the field stays editable:
      //   1. Matched plan detail's target_qty, if one exists.
      //   2. Otherwise floor(slot seconds / ACTUAL cycle time) —
      //      see computeCalcTarget() above (now driven off Actual
      //      Cycle Time, not Standard Cycle Time).
      // ==========================================================
      const planTargetQty = planDetail?.target_qty ? String(planDetail.target_qty) : "";
      const target = planTargetQty || computeCalcTarget(actualCT);
      const targetSource = planTargetQty ? "plan" : (target ? "calc" : null);

      const plannedMould = (planDetail?.mould_changes || []).find(
        (mc) => mc.status === "Planned",
      );

      const mouldStdCT = plannedMould?.new_part_standard_cycle_time || "";
      const mouldActualCT =
        plannedMould?.new_part_actual_cycle_time ||
        plannedMould?.new_part_standard_cycle_time ||
        "";
      const mouldTargetQty = plannedMould?.new_part_target_quantity
        ? String(plannedMould.new_part_target_quantity)
        : "";

      // plan_id / plan_detail_id resolution: real plan header/detail id
      // when a plan was actually loaded and matched this machine,
      // otherwise null (manual/ad-hoc entry — see PLAN IS OPTIONAL note
      // above). Never a made-up id.
      const resolvedPlanId = plan?.header?.plan_id ?? plan?.header?.daily_plan_id ?? null;
      const resolvedPlanDetailId = planDetail?.detail_id ?? null;

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
        targetSource,

        old_part_id: carryOldPartId,
        old_part_number: carryOldPartNumber,

        mouldChange: !!plannedMould,
        new_part_id: plannedMould?.new_part_id || null,
        new_part_number: plannedMould?.new_part_number || "",
        mouldPart: plannedMould?.new_part_name || "",
        mould_remarks: plannedMould?.reason || "",

        mouldStandardCycleTime: mouldStdCT,
        mouldActualCycleTime: mouldActualCT,
        mouldTarget: mouldTargetQty,
        mouldTargetSource: mouldTargetQty ? "plan" : null,

        plan_id: resolvedPlanId,
        plan_detail_id: resolvedPlanDetailId,
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
      plan,
    ],
  );

  // ==========================================================
  // Auto-load the first machine (or first machine after a hall/shift
  // switch), same as before.
  // ==========================================================
  useEffect(() => {
    if (!currentMachine) return;
    if (machineEntries[currentMachine.id]) return; // already saved, don't overwrite
    if (formData.part_id || formData.operatorId) return; // already filled, don't overwrite user's typing

    loadMachineData(currentMachine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMachine?.id, plan]);

  // ==========================================================
  // TARGET QTY — keep it live-recalculated from ACTUAL Cycle Time
  // whenever that changes AFTER the initial load (e.g. the user picks
  // a different part in the search box, which changes cycle time).
  // A plan-provided target (targetSource === "plan") or a value the
  // operator typed in by hand (targetSource === "manual") is left
  // alone — those shouldn't be silently replaced by the formula.
  // ==========================================================
  useEffect(() => {
    if (formData.targetSource === "plan" || formData.targetSource === "manual") return;

    const slot = formData.mouldChange ? HALF_SLOT_MINUTES : SLOT_MINUTES;
    const calc = computeCalcTarget(formData.actualCycleTime, slot);
    if (calc && calc !== formData.target) {
      setFormData((prev) => ({ ...prev, target: calc, targetSource: calc ? "calc" : prev.targetSource }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.actualCycleTime, formData.targetSource, formData.mouldChange]);

  // ==========================================================
  // NEW PART (mould) TARGET QTY — same auto-calc pattern as the main
  // Target Qty above, but always against the half-slot (30 min), since
  // the new part only runs for the second half of the slot once a
  // mould change happens. Only active while mould change is on; a
  // plan-provided or manually-typed mould target is left alone.
  // ==========================================================
  useEffect(() => {
    if (!formData.mouldChange) return;
    if (formData.mouldTargetSource === "plan" || formData.mouldTargetSource === "manual") return;

    const calc = computeCalcTarget(formData.mouldActualCycleTime, HALF_SLOT_MINUTES);
    if (calc && calc !== formData.mouldTarget) {
      setFormData((prev) => ({
        ...prev,
        mouldTarget: calc,
        mouldTargetSource: calc ? "calc" : prev.mouldTargetSource,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.mouldActualCycleTime, formData.mouldTargetSource, formData.mouldChange]);

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
  //
  // Example: old part's target was 45, only 30 got made before the
  // change — 15 parts never got made, so we add the time it WOULD have
  // taken to make those 15 (at the old part's actual cycle time). Same
  // for the new part: target 55, only 20 made after the change — 35
  // parts short, add the time those 35 would have taken (at the new
  // part's actual cycle time). The two shortfall-times added together
  // is the mould change duration.
  //
  //   old_remaining = max(old target − old actual, 0)
  //   new_remaining = max(new target − new actual, 0)
  //   old_time (min) = old_remaining × old actual cycle time (sec) / 60
  //   new_time (min) = new_remaining × new actual cycle time (sec) / 60
  //   duration = old_time + new_time
  // ==========================================================
  const mouldDurationCalc = useMemo(() => {
    if (!formData.mouldChange) return "";

    const oldTarget = Number(formData.target) || 0;
    const oldActual = Number(formData.actual) || 0;
    const oldCT = Number(formData.actualCycleTime) || 0;

    const newTarget = Number(formData.mouldTarget) || 0;
    const newActual = Number(formData.mouldActual) || 0;
    const newCT = Number(formData.mouldActualCycleTime) || 0;

    if (!oldCT && !newCT) return "";

    const oldRemaining = Math.max(oldTarget - oldActual, 0);
    const newRemaining = Math.max(newTarget - newActual, 0);

    const oldMinutes = (oldRemaining * oldCT) / 60;
    const newMinutes = (newRemaining * newCT) / 60;
    const duration = oldMinutes + newMinutes;

    return Number(Math.max(duration, 0).toFixed(1));
  }, [
    formData.mouldChange,
    formData.target,
    formData.actual,
    formData.actualCycleTime,
    formData.mouldTarget,
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
    setLossReasons((prev) => [...prev, { reason: "", minutes: 0, custom: true }]);
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
    setFormData((prev) => {
      const turningOn = !prev.mouldChange;
      return {
        ...prev,
        mouldChange: turningOn,
        // Turning off: clear the new part's target so a stale half-slot
        // value doesn't linger. Turning on: leave it — the half-slot
        // effect above fills it in once mouldActualCycleTime is set.
        ...(turningOn ? {} : { mouldTarget: "", mouldTargetSource: null }),
      };
    });
  };

  const customReasonCache = useRef({});

  const resolveReasonId = async (row) => {
    if (!row.custom) return row.reason_id;
    if (!row.reason || !row.reason.trim()) return null;

    const key = row.reason.trim().toLowerCase();

    const existingMaster = masterRejectReasons.find(
      (r) => r.reason_name.trim().toLowerCase() === key,
    );
    if (existingMaster) return existingMaster.id;

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
            standard_cycle_time: Number(data.mouldStandardCycleTime) || null,
            target_qty: Number(data.mouldTarget) || null,
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
      // PLAN IS OPTIONAL: null/null is a valid manual entry — the
      // backend's validatePlanLink() only rejects a mismatched pair
      // (one present, one missing).
      plan_id: data.plan_id || null,
      plan_detail_id: data.plan_detail_id || null,
    };
  };

const submitMachineEntry = async (machine, snapshot) => {
  const existing = machineEntries[machine.id];

  if (snapshot.formData.mouldChange && !snapshot.formData.new_part_id) {
    throw new Error(
      "Mould change is enabled but no new part was selected — pick a part from the mould section's suggestions before saving."
    );
  }

  // Payload build
  const payload = await buildPayload(
    machine,
    snapshot,
    existing?.production_id
  );

  try {
    let response;

    if (existing?.entryId) {
      // Update Entry
      response = await api.put(
        `/production-entries/${existing.entryId}`,
        
        payload
      );
    } else {
      // Create Entry
      response = await api.post(
        "/production-entries",
        payload
      );
    }

    const res = response.data;

    if (!res?.success) {
      const detail =
        res?.error && res.error !== res?.message
          ? ` (${res.error})`
          : "";

      throw new Error(
        (res?.message || "Failed to save entry.") + detail
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
  } catch (error) {
    if (error.response) {
      const res = error.response.data;

      const detail =
        res?.error && res.error !== res?.message
          ? ` (${res.error})`
          : "";

      throw new Error(
        (res?.message || `Failed to save entry (HTTP ${error.response.status}).`) +
          detail
      );
    }

    throw new Error(error.message || "Network Error");
  }
};

  const previousMachine = () => {
    saveCurrentMachine();
    const newIndex = Math.max(0, currentMachineIndex - 1);
    setCurrentMachineIndex(newIndex);
    loadMachineData(filteredMachines[newIndex]);
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // `hasRealPlan` = a real plan was found in the DB for this
  // date+hall+shift (drives the informational banner in the
  // component). Saving is now ALWAYS possible regardless of whether a
  // plan was found — see PLAN IS OPTIONAL above.
  const hasRealPlan = !!plan?.header;

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
    hasRealPlan,
  };
};

export default useProductionEntry;