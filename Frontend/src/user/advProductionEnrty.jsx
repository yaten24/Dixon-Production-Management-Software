import React, { useState } from "react";
import { getOperatorByCode, createOperator } from "../api/operatorApi";
import { searchParts, createPart } from "../api/partApi";

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

    // backend status flags
    loadingMaster,
    masterError,
    submitting,
    submitError,
  } = useProductionEntry();

  const currentTime = useClock();

  // ------------------------------------------------------
  // OPERATOR lookup / add-new state
  // ------------------------------------------------------
  const [operatorDetails, setOperatorDetails] = useState(null);
  const [operatorNotFound, setOperatorNotFound] = useState(false);
  const [addingOperator, setAddingOperator] = useState(false);

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
        // FIX: capture the numeric operator id — needed as the FK for the
        // backend (production_entries.operator_id). Previously this was
        // never stored, only the display details were.
        handleChange({ target: { name: "operator_id", value: res.data.id } });
      } else {
        setOperatorDetails(null);
        setOperatorNotFound(true);
        handleChange({ target: { name: "operator_id", value: null } });
      }
    } catch (error) {
      // A 404 from the backend usually rejects the promise rather than
      // resolving with { success: false } — treat it the same way:
      // operator genuinely not found, so offer the "add operator" flow.
      console.error(error);
      setOperatorDetails(null);
      setOperatorNotFound(true);
      handleChange({ target: { name: "operator_id", value: null } });
    }
  };

  // Called from ProductionForm's inline "Add Operator" mini-form.
  // Creates the operator on the backend, then wires the new numeric id
  // into formData exactly like a successful lookup would.
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
      const res = await createPart(newPart);

      if (res.success) {
        handleChange({ target: { name: "part", value: newPart.part_name } });
        handleChange({ target: { name: "part_id", value: res.insertId } });
        handleChange({
          target: {
            name: "standardCycleTime",
            value: newPart.standard_cycle_time,
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
      const res = await createPart(newPart);

      if (res.success) {
        handleChange({
          target: { name: "mouldPart", value: newPart.part_name },
        });
        handleChange({
          target: {
            name: "mouldStandardCycleTime",
            value: newPart.standard_cycle_time,
          },
        });
        handleChange({ target: { name: "new_part_id", value: res.insertId } });
        handleChange({
          target: {
            name: "new_part_number",
            value: newPart.part_number || newPart.part_name,
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

  // Wrap finalSubmit so the page can show a success/failure summary
  const handleFinalSubmit = async () => {
    setSubmitResult(null);
    const results = await finalSubmit();

    if (results && results.length) {
      const failed = results.filter((r) => !r.success);
      if (!failed.length) {
        setSubmitResult({
          type: "success",
          message: "All production entries submitted successfully.",
        });
      } else {
        setSubmitResult({
          type: "error",
          message: `Some entries failed: ${failed.map((f) => f.machine).join(", ")}`,
        });
      }
    } else {
      setSubmitResult({
        type: "error",
        message:
          "No machine data to submit. Please fill in at least one machine.",
      });
    }
  };

  // ------------------------------------------------------
  // Loading master data (machines / reject / loss reasons)
  // ------------------------------------------------------
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
    <div
      className="
      min-h-screen
      bg-slate-100
      "
    >
      {/* HEADER */}
      <Header />

      {/* CONTENT */}

      <div
        className="
        max-w-7xl
        mx-auto
        p-2
        mt-11
        "
      >
        {/* MASTER DATA ERROR BANNER */}
        {masterError && (
          <div
            className="
            mb-4
            bg-red-50
            border
            border-red-300
            text-red-700
            rounded
            p-3
            text-sm
            "
          >
            {masterError}
          </div>
        )}

        {/* SUBMIT ERROR BANNER */}
        {submitError && (
          <div
            className="
            mb-4
            bg-red-50
            border
            border-red-300
            text-red-700
            rounded
            p-3
            text-sm
            "
          >
            {submitError}
          </div>
        )}

        {/* SUBMIT RESULT BANNER */}
        {submitResult && (
          <div
            className={`
            mb-4
            rounded
            p-3
            text-sm
            border
            ${
              submitResult.type === "success"
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-red-50 border-red-300 text-red-700"
            }
            `}
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
            {/* MACHINE NAVIGATOR */}

            <MachineNavigator
              filteredMachines={filteredMachines}
              machineEntries={machineEntries}
              currentMachine={currentMachine}
              currentMachineIndex={currentMachineIndex}
              setCurrentMachineIndex={setCurrentMachineIndex}
              saveCurrentMachine={saveCurrentMachine}
              loadMachineData={loadMachineData}
            />

            {/* SUMMARY */}

            <SummaryCards
              target={formData.target}
              actual={formData.actual}
              reject={totalRejectQty}
              efficiency={efficiency}
            />

            {/* PRODUCTION FORM */}

            <ProductionForm
              formData={formData}
              handleChange={handleChange}
              efficiency={efficiency}
              fetchOperator={fetchOperator}
              operatorDetails={operatorDetails}
              operatorNotFound={operatorNotFound}
              onAddOperator={handleAddOperator}
              addingOperator={addingOperator}
              fetchPartSuggestions={fetchPartSuggestions}
              partSuggestions={partSuggestions}
              setPartSuggestions={setPartSuggestions}
              noPartResults={noPartResults}
              onAddPart={handleAddPart}
              addingPart={addingPart}
            />

            {/* REJECT BREAKUP */}

            <RejectBreakup
              reject={formData.reject}
              rejectReasons={rejectReasons}
              updateRejectReason={updateRejectReason}
              totalRejectQty={totalRejectQty}
              addCustomRejectReason={addCustomRejectReason}
              removeCustomRejectReason={removeCustomRejectReason}
            />

            {/* MOULD CHANGE */}

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

            {/* LOSS TIME */}

            <LossTimeBreakup
              lossReasons={lossReasons}
              lossTimeReasonOptions={lossTimeReasonOptions}
              addLossReason={addLossReason}
              removeLossReason={removeLossReason}
              updateLossReason={updateLossReason}
              totalLossMinutes={totalLossMinutes}
            />

            {/* REMARKS */}

            <div
              className="
    mt-2
    bg-white
    border
    border-slate-200
    rounded
    p-3
    shadow-sm
  "
            >
              <label
                htmlFor="remarks"
                className="
      text-xs
      font-medium
      text-slate-600
      block
      mb-1
    "
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
                className="
      w-full
      border
      border-slate-300
      rounded
      px-3
      py-2
      text-sm
      text-slate-700
      resize-none
      focus:outline-none
      focus:ring-2
      focus:ring-blue-400
      focus:border-blue-400
      transition-all
      duration-150
    "
              />
            </div>

            {/* FOOTER */}

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
