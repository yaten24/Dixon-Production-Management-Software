import React, { useState } from "react";
import { getOperatorByCode } from "../api/operatorApi";
import { searchParts } from "../api/partApi";

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
import HomeHeader from "../compenents/userHome/HomeHeader";
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

  const [operatorDetails, setOperatorDetails] = useState(null);
  const [partSuggestions, setPartSuggestions] = useState([]);

  const [submitResult, setSubmitResult] = useState(null);

  const fetchOperator = async (operatorCode) => {
    if (!operatorCode) {
      setOperatorDetails(null);
      handleChange({ target: { name: "operator_id", value: null } });
      return;
    }

    try {
      const res = await getOperatorByCode(operatorCode);

      if (res.success) {
        setOperatorDetails(res.data);
        // FIX: capture the numeric operator id — needed as the FK for the
        // backend (production_entries.operator_id). Previously this was
        // never stored, only the display details were.
        handleChange({ target: { name: "operator_id", value: res.data.id } });
      } else {
        setOperatorDetails(null);
        handleChange({ target: { name: "operator_id", value: null } });
      }
    } catch (error) {
      console.error(error);
      setOperatorDetails(null);
      handleChange({ target: { name: "operator_id", value: null } });
    }
  };

  const fetchPartSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setPartSuggestions([]);
      return;
    }

    try {
      const res = await searchParts(keyword);

      if (res.success) {
        setPartSuggestions(res.data);
      } else {
        setPartSuggestions([]);
      }
    } catch (error) {
      console.error(error);

      setPartSuggestions([]);
    }
  };

  // Add alongside your existing partSuggestions state:
  const [mouldPartSuggestions, setMouldPartSuggestions] = useState([]);

  // Add alongside your existing fetchPartSuggestions:
  const fetchMouldPartSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setMouldPartSuggestions([]);
      return;
    }

    try {
      const res = await searchParts(keyword);

      if (res.success) {
        setMouldPartSuggestions(res.data);
      } else {
        setMouldPartSuggestions([]);
      }
    } catch (error) {
      console.error(error);
      setMouldPartSuggestions([]);
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
              fetchPartSuggestions={fetchPartSuggestions}
              partSuggestions={partSuggestions}
              setPartSuggestions={setPartSuggestions}
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
