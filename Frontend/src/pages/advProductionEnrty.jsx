import React, { useState, useEffect } from "react";
import { getOperatorByCode, createOperator, searchOperators } from "../api/operatorApi";
import { searchParts, addPartQuick } from "../api/partApi";

import { FaIndustry } from "react-icons/fa";

import useProductionEntry from "../hooks/useProductionEntry";

import ProductionSetup from "../compenents/productionEntry/ProductionSetup";
import MachineNavigator from "../compenents/productionEntry/MachineNavigator";
import ProgressCard from "../compenents/productionEntry/ProgressCard";
import SummaryCards from "../compenents/productionEntry/SummaryCards";
import ProductionForm from "../compenents/productionEntry/ProductionForm";
import RejectBreakup from "../compenents/productionEntry/RejectBreakup";
import MouldChangeSection from "../compenents/productionEntry/MouldChangeSection";
import MouldRejectBreakup from "../compenents/productionEntry/MouldRejectBreakup";
import LossTimeBreakup from "../compenents/productionEntry/LossTimeBreakup";
import FooterActions from "../compenents/productionEntry/FooterActions";
import useClock from "../hooks/useClock";
import Header from "../compenents/dashboard/Header";

// ==========================================================
// Generates a guaranteed-unique part number using the current
// date + time (down to milliseconds).
// ==========================================================
const generatePartNumber = (base) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(
    now.getSeconds(),
  )}${pad(now.getMilliseconds())}`;
  const cleanBase = (base || "PART").trim().toUpperCase().replace(/\s+/g, "-");
  return `${cleanBase}-${datePart}-${timePart}`;
};

const AdvProductionEntry = () => {
  const {
    setupComplete,
    setSetupComplete,

    formData,

    handleChange,
    handleHallChange,
    handleShiftChange,

    shiftATimes,
    shiftBTimes,

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

    // NEW — production plan integration
    plan,
    planLoading,
    planError,
  } = useProductionEntry();

  const currentTime = useClock();

  // ------------------------------------------------------
  // OPERATOR lookup / search / add-new state
  // ------------------------------------------------------
  const [operatorDetails, setOperatorDetails] = useState(null);
  const [operatorNotFound, setOperatorNotFound] = useState(false);
  const [addingOperator, setAddingOperator] = useState(false);

  const [operatorSuggestions, setOperatorSuggestions] = useState([]);
  const [noOperatorResults, setNoOperatorResults] = useState(false);

  // ------------------------------------------------------
  // PART (main entry) lookup / add-new state
  // ------------------------------------------------------
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [noPartResults, setNoPartResults] = useState(false);
  const [addingPart, setAddingPart] = useState(false);

  // ------------------------------------------------------
  // PART (mould-change "new part") lookup / add-new state
  // ------------------------------------------------------
  const [mouldPartSuggestions, setMouldPartSuggestions] = useState([]);
  const [noMouldPartResults, setNoMouldPartResults] = useState(false);
  const [addingMouldPart, setAddingMouldPart] = useState(false);

  const [submitResult, setSubmitResult] = useState(null);

  // ========================================================
  // OPERATOR
  // ========================================================
  const fetchOperator = async (operatorCode) => {
    if (!operatorCode) {
      setOperatorDetails(null);
      setOperatorNotFound(false);
      handleChange({ target: { name: "operator_id", value: null } });
      return;
    }

    try {
      const res = await getOperatorByCode(operatorCode);

      if (res.success) {
        setOperatorDetails(res.data);
        setOperatorNotFound(false);
        handleChange({ target: { name: "operator_id", value: res.data.id } });
      } else {
        setOperatorDetails(null);
        setOperatorNotFound(true);
        handleChange({ target: { name: "operator_id", value: null } });
      }
    } catch (error) {
      console.error(error);
      setOperatorDetails(null);
      setOperatorNotFound(true);
      handleChange({ target: { name: "operator_id", value: null } });
    }
  };

  // NEW: when the Production Plan auto-fills operatorId (a code) for the
  // current machine but operator_id (numeric) is still missing, resolve
  // it automatically instead of forcing the user to click "Find".
  useEffect(() => {
    if (formData.operatorId && !formData.operator_id) {
      fetchOperator(formData.operatorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMachine?.id]);

  // search-as-you-type suggestions (code OR name)
  const fetchOperatorSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setOperatorSuggestions([]);
      setNoOperatorResults(false);
      return;
    }

    try {
      const res = await searchOperators(keyword);

      if (res.success && res.data.length) {
        setOperatorSuggestions(res.data);
        setNoOperatorResults(false);
      } else {
        setOperatorSuggestions([]);
        setNoOperatorResults(true);
      }
    } catch (error) {
      console.error(error);
      setOperatorSuggestions([]);
      setNoOperatorResults(true);
    }
  };

  const selectOperator = (op) => {
    setOperatorDetails(op);
    setOperatorNotFound(false);
    setNoOperatorResults(false);
    handleChange({ target: { name: "operatorId", value: op.operator_code } });
    handleChange({ target: { name: "operator_id", value: op.id } });
  };

  const handleAddOperator = async (newOperator) => {
    setAddingOperator(true);

    try {
      const res = await createOperator(newOperator);

      if (res.success) {
        const created = { id: res.insertId, ...newOperator };

        setOperatorDetails(created);
        setOperatorNotFound(false);

        handleChange({ target: { name: "operator_id", value: res.insertId } });
        handleChange({
          target: { name: "operatorId", value: newOperator.operator_code },
        });

        return { success: true };
      }

      return {
        success: false,
        message: res.message || "Failed to add operator.",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error.message ||
          "Failed to add operator.",
      };
    } finally {
      setAddingOperator(false);
    }
  };

  // ========================================================
  // PART — main production entry
  // ========================================================
  const fetchPartSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setPartSuggestions([]);
      setNoPartResults(false);
      return;
    }

    try {
      const res = await searchParts(keyword);

      if (res.success && res.data.length) {
        setPartSuggestions(res.data);
        setNoPartResults(false);
      } else {
        setPartSuggestions([]);
        setNoPartResults(true);
      }
    } catch (error) {
      console.error(error);
      setPartSuggestions([]);
      setNoPartResults(true);
    }
  };

  const handleAddPart = async (newPart) => {
    setAddingPart(true);

    try {
      const partPayload = {
        part_name: newPart.part_name,
        actual_cycle_time: newPart.actual_cycle_time,
        part_number: generatePartNumber(newPart.part_name),
      };

      const res = await addPartQuick(partPayload);

      if (res.success) {
        handleChange({
          target: { name: "part", value: partPayload.part_name },
        });
        handleChange({ target: { name: "part_id", value: res.insertId } });
        handleChange({
          target: {
            name: "standardCycleTime",
            value:
              res.data?.standard_cycle_time ?? partPayload.actual_cycle_time,
          },
        });

        setPartSuggestions([]);
        setNoPartResults(false);

        return { success: true };
      }

      return { success: false, message: res.message || "Failed to add part." };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error.message ||
          "Failed to add part.",
      };
    } finally {
      setAddingPart(false);
    }
  };

  // ========================================================
  // PART — mould-change "new part"
  // ========================================================
  const fetchMouldPartSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setMouldPartSuggestions([]);
      setNoMouldPartResults(false);
      return;
    }

    try {
      const res = await searchParts(keyword);

      if (res.success && res.data.length) {
        setMouldPartSuggestions(res.data);
        setNoMouldPartResults(false);
      } else {
        setMouldPartSuggestions([]);
        setNoMouldPartResults(true);
      }
    } catch (error) {
      console.error(error);
      setMouldPartSuggestions([]);
      setNoMouldPartResults(true);
    }
  };

  const handleAddMouldPart = async (newPart) => {
    setAddingMouldPart(true);

    try {
      const partPayload = {
        part_name: newPart.part_name,
        part_number:
          newPart.part_number || generatePartNumber(newPart.part_name),
        actual_cycle_time: newPart.standard_cycle_time,
      };

      const res = await addPartQuick(partPayload);

      if (res.success) {
        handleChange({
          target: { name: "mouldPart", value: partPayload.part_name },
        });
        handleChange({
          target: {
            name: "mouldStandardCycleTime",
            value: res.data?.standard_cycle_time ?? newPart.standard_cycle_time,
          },
        });
        handleChange({ target: { name: "new_part_id", value: res.insertId } });
        handleChange({
          target: {
            name: "new_part_number",
            value: partPayload.part_number,
          },
        });

        setMouldPartSuggestions([]);
        setNoMouldPartResults(false);

        return { success: true };
      }

      return { success: false, message: res.message || "Failed to add part." };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error.message ||
          "Failed to add part.",
      };
    } finally {
      setAddingMouldPart(false);
    }
  };

  // finalSubmit saves only the current (last) machine's entry.
  const handleFinalSubmit = async () => {
    setSubmitResult(null);
    const results = await finalSubmit();

    if (results && results.length) {
      const failed = results.filter((r) => !r.success);
      if (!failed.length) {
        setSubmitResult({
          type: "success",
          message: "Entry saved successfully.",
        });
      } else {
        setSubmitResult({
          type: "error",
          message: `Failed to save: ${failed.map((f) => f.error).join(", ")}`,
        });
      }
    } else {
      setSubmitResult({
        type: "error",
        message: "Could not save this entry. Please check the fields above.",
      });
    }
  };

  if (loadingMaster) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <FaIndustry className="animate-pulse text-3xl" />
          <p className="font-medium">Loading machines and reasons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto p-2 mt-11">
        {masterError && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded p-3 text-sm">
            {masterError}
          </div>
        )}

        {submitError && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded p-3 text-sm">
            {submitError}
          </div>
        )}

        {submitResult && (
          <div
            className={`mb-4 rounded p-3 text-sm border ${
              submitResult.type === "success"
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-red-50 border-red-300 text-red-700"
            }`}
          >
            {submitResult.message}
          </div>
        )}

        {!setupComplete ? (
          <ProductionSetup
            formData={formData}
            handleChange={handleChange}
            handleHallChange={handleHallChange}
            handleShiftChange={handleShiftChange}
            shiftATimes={shiftATimes}
            shiftBTimes={shiftBTimes}
            setSetupComplete={setSetupComplete}
          />
        ) : (
          <>
            {/* NEW — Production Plan status banner */}
            {planLoading && (
              <div className="mb-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded p-2">
                Checking for a published production plan for this date/hall/shift...
              </div>
            )}
            {planError && (
              <div className="mb-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                {planError}
              </div>
            )}
            {plan?.header && (
              <div className="mb-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">
                Plan <strong>{plan.header.plan_number}</strong> loaded — operator,
                part &amp; target pre-filled for {plan.details.length} machine
                {plan.details.length === 1 ? "" : "s"}. Just confirm actuals below.
              </div>
            )}

            <MachineNavigator
              filteredMachines={filteredMachines}
              machineEntries={machineEntries}
              currentMachine={currentMachine}
              currentMachineIndex={currentMachineIndex}
              setCurrentMachineIndex={setCurrentMachineIndex}
              saveCurrentMachine={saveCurrentMachine}
              loadMachineData={loadMachineData}
            />

            <SummaryCards
              target={formData.target}
              actual={formData.actual}
              reject={totalRejectQty}
              efficiency={efficiency}
            />

            <ProductionForm
              formData={formData}
              handleChange={handleChange}
              efficiency={efficiency}
              fetchOperator={fetchOperator}
              operatorDetails={operatorDetails}
              operatorNotFound={operatorNotFound}
              onAddOperator={handleAddOperator}
              addingOperator={addingOperator}
              fetchOperatorSuggestions={fetchOperatorSuggestions}
              operatorSuggestions={operatorSuggestions}
              setOperatorSuggestions={setOperatorSuggestions}
              noOperatorResults={noOperatorResults}
              onSelectOperator={selectOperator}
              fetchPartSuggestions={fetchPartSuggestions}
              partSuggestions={partSuggestions}
              setPartSuggestions={setPartSuggestions}
              noPartResults={noPartResults}
              onAddPart={handleAddPart}
              addingPart={addingPart}
            />

            <RejectBreakup
              reject={formData.reject}
              rejectReasons={rejectReasons}
              updateRejectReason={updateRejectReason}
              totalRejectQty={totalRejectQty}
              addCustomRejectReason={addCustomRejectReason}
              removeCustomRejectReason={removeCustomRejectReason}
            />

            <MouldChangeSection
              showMouldSection={showMouldSection}
              handleMouldToggle={handleMouldToggle}
              formData={formData}
              handleChange={handleChange}
              fetchMouldPartSuggestions={fetchMouldPartSuggestions}
              mouldPartSuggestions={mouldPartSuggestions}
              setMouldPartSuggestions={setMouldPartSuggestions}
              noMouldPartResults={noMouldPartResults}
              onAddMouldPart={handleAddMouldPart}
              addingMouldPart={addingMouldPart}
            >
              <MouldRejectBreakup
                mouldReject={formData.mouldReject}
                mouldRejectReasons={mouldRejectReasons}
                addCustomMouldRejectReason={addCustomMouldRejectReason}
                removeCustomMouldRejectReason={removeCustomMouldRejectReason}
                updateMouldRejectReason={updateMouldRejectReason}
                totalMouldRejectQty={totalMouldRejectQty}
              />
            </MouldChangeSection>

            <LossTimeBreakup
              lossReasons={lossReasons}
              lossTimeReasonOptions={lossTimeReasonOptions}
              addLossReason={addLossReason}
              removeLossReason={removeLossReason}
              updateLossReason={updateLossReason}
              totalLossMinutes={totalLossMinutes}
            />

            <div className="mt-2 bg-white border border-slate-200 rounded p-3 shadow-sm">
              <label
                htmlFor="remarks"
                className="text-xs font-medium text-slate-600 block mb-1"
              >
                Remarks
              </label>

              <textarea
                id="remarks"
                rows="3"
                name="remarks"
                placeholder="Add any additional notes here..."
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150"
              />
            </div>

            <FooterActions
              currentMachineIndex={currentMachineIndex}
              filteredMachines={filteredMachines}
              previousMachine={previousMachine}
              nextMachine={nextMachine}
              finalSubmit={handleFinalSubmit}
              submitting={submitting}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdvProductionEntry;