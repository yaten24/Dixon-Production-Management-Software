import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getOperatorByCode, createOperator, searchOperators } from "../api/operatorApi";
import { searchParts, addPartQuick } from "../api/partApi";

import { FaIndustry, FaCheckCircle, FaExclamationTriangle, FaClipboardCheck } from "react-icons/fa";

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

  useEffect(() => {
    if (formData.operatorId && !formData.operator_id) {
      fetchOperator(formData.operatorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMachine?.id]);

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
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="flex flex-col items-center gap-3 text-[#0F1D24]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F1D24]"
          >
            <FaIndustry className="text-lg text-[#FDC94D]" />
          </motion.div>
          <p className="text-sm font-medium text-[#9B9B9B]">Loading machines and reasons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="mx-auto mt-11 max-w-full p-2">
        {masterError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex items-center gap-1.5 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-600"
          >
            <FaExclamationTriangle className="shrink-0 text-[11px]" />
            {masterError}
          </motion.div>
        )}

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex items-center gap-1.5 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-600"
          >
            <FaExclamationTriangle className="shrink-0 text-[11px]" />
            {submitError}
          </motion.div>
        )}

        <AnimatePresence>
          {submitResult && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              className={`mb-2 flex items-center gap-1.5 rounded border p-2.5 text-xs font-medium ${
                submitResult.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {submitResult.type === "success" ? (
                <FaCheckCircle className="shrink-0 text-[11px]" />
              ) : (
                <FaExclamationTriangle className="shrink-0 text-[11px]" />
              )}
              {submitResult.message}
            </motion.div>
          )}
        </AnimatePresence>

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
            {/* Production Plan status banner */}
            {planLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-1 rounded border border-[#0F1D24]/15 bg-[#0F1D24]/5 p-2 text-xs text-[#0F1D24]"
              >
                Checking for a published production plan for this date/hall/shift...
              </motion.div>
            )}
            {planError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-1 flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700"
              >
                <FaExclamationTriangle className="shrink-0 text-[10px]" />
                {planError}
              </motion.div>
            )}
            {plan?.header && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-1 flex items-center gap-1.5 rounded border border-[#FDC94D]/50 bg-[#FDC94D]/10 p-2 text-xs text-[#0F1D24]"
              >
                <FaClipboardCheck className="shrink-0 text-[10px] text-[#0F1D24]" />
                Plan <strong>{plan.header.plan_number}</strong> loaded — operator,
                part &amp; target pre-filled for {plan.details.length} machine
                {plan.details.length === 1 ? "" : "s"}. Just confirm actuals below.
              </motion.div>
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-2 rounded border border-[#C6C6C6]/50 bg-white p-3 shadow-sm"
            >
              <label
                htmlFor="remarks"
                className="mb-1 block text-xs font-medium text-[#9B9B9B]"
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
                className="w-full resize-none rounded border border-[#C6C6C6] px-3 py-2 text-xs text-[#0F1D24] outline-none transition-all duration-200 placeholder:text-[#9B9B9B] focus:border-[#FDC94D] focus:ring-2 focus:ring-[#FDC94D]/30"
              />
            </motion.div>

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