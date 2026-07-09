import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const ProductionForm = ({
  formData,
  handleChange,
  efficiency,

  fetchOperator,
  operatorDetails,

  fetchPartSuggestions,
  partSuggestions = [],
  setPartSuggestions,
}) => {
  const wrapperRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const numberInputProps = {
    onWheel: (e) => {
      e.target.blur();
    },

    onKeyDown: (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      }
    },
  };

  const inputClass = `
    w-full
    h-9
    px-2.5
    text-xs
    bg-white
    border
    border-[#E2E4E9]
    rounded-sm
    outline-none
    focus:border-blue-500
    focus:ring-1
    focus:ring-blue-500
    transition-all
    [appearance:textfield]
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
  `;

  // ===========================
  // TARGET — auto-calculated from Actual Cycle Time
  // FIX: target used to be a manually typed number, but the real target is
  // derived from cycle time (pieces achievable per hour = 3600s / cycle
  // time in seconds). Now it's computed automatically and shown read-only,
  // so it can never drift out of sync with the cycle time entered.
  // ASSUMPTION: actualCycleTime is entered in seconds; adjust the 3600
  // divisor if a different time base (e.g. per shift) is intended.
  // ===========================
  useEffect(() => {
    const ct = Number(formData.actualCycleTime);
    const computedTarget = ct > 0 ? Math.round(3600 / ct) : "";

    if (formData.target !== computedTarget) {
      handleChange({ target: { name: "target", value: computedTarget } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.actualCycleTime]);

  // ===========================
  // LOSS TIME (minutes) — (Target - Actual) pieces short, converted to
  // time using the actual cycle time: each missing piece "cost" one
  // cycle-time's worth of seconds, summed and converted to minutes.
  // FIX: previously there was no loss-time read-out at all; this derives
  // it from target/actual/cycle-time so it always stays in sync, the same
  // pattern as the existing efficiency read-out.
  // ===========================
  const lossMinutes = useMemo(() => {
    const target = Number(formData.target) || 0;
    const actual = Number(formData.actual) || 0;
    const cycleTime = Number(formData.actualCycleTime) || 0;

    const shortfall = Math.max(target - actual, 0);
    const lossSeconds = shortfall * cycleTime;

    return Number((lossSeconds / 60).toFixed(1));
  }, [formData.target, formData.actual, formData.actualCycleTime]);

  // ===========================
  // PART SEARCH
  // ===========================

  const handlePartChange = async (e) => {
    handleChange(e);

    const value = e.target.value;

    // typing a new part name invalidates the previously resolved part_id
    handleChange({ target: { name: "part_id", value: null } });

    if (value.length < 2) {
      setPartSuggestions([]);
      setSelectedIndex(-1);

      return;
    }

    fetchPartSuggestions(value);

    setSelectedIndex(-1);
  };

  const selectPart = (part) => {
    handleChange({
      target: {
        name: "part",
        value: part.part_name,
      },
    });

    // FIX: capture the numeric part id — needed as the FK for the backend
    // (production_entries.part_id). Previously only the display name was set.
    handleChange({
      target: {
        name: "part_id",
        value: part.id,
      },
    });

    handleChange({
      target: {
        name: "standardCycleTime",
        value: part.standard_cycle_time,
      },
    });

    setPartSuggestions([]);
    setSelectedIndex(-1);
  };

  const handlePartKeyDown = (e) => {
    if (!partSuggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();

        setSelectedIndex((prev) =>
          prev < partSuggestions.length - 1 ? prev + 1 : prev,
        );

        break;

      case "ArrowUp":
        e.preventDefault();

        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));

        break;

      case "Enter":
        e.preventDefault();

        if (selectedIndex >= 0) {
          selectPart(partSuggestions[selectedIndex]);
        }

        break;

      case "Escape":
        setPartSuggestions([]);

        setSelectedIndex(-1);

        break;

      default:
        break;
    }
  };

  // ===========================
  // CLICK OUTSIDE
  // ===========================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setPartSuggestions([]);

        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setPartSuggestions]);

  const summaryCards = [
    {
      label: "Standard CT",
      value: formData.standardCycleTime || "-",
      color: "text-slate-700",
    },
    {
      label: "Target",
      value: formData.target === "" ? "-" : formData.target,
      color: "text-blue-600",
    },
    { label: "Loss (min)", value: lossMinutes, color: "text-red-600" },
    { label: "Efficiency", value: `${efficiency}%`, color: "text-orange-600" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E2E4E9] rounded-sm p-3"
    >
      <h2 className="text-sm font-bold text-slate-800 mb-3">
        Production Entry
      </h2>

      {/* ===========================
          EDITABLE FIELDS
      =========================== */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {/* OPERATOR ID */}

        <div className="col-span-2 md:col-span-1">
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Operator ID
          </label>

          <div className="flex gap-1.5">
            <input
              type="text"
              name="operatorId"
              value={formData.operatorId}
              onChange={(e) => {
                handleChange(e);
                // typing a new code invalidates the previously resolved operator_id
                handleChange({ target: { name: "operator_id", value: null } });
              }}
              className={`${inputClass} flex-1`}
            />

            <button
              type="button"
              onClick={() => fetchOperator(formData.operatorId)}
              className="px-3 h-9 rounded-sm bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium transition-colors"
            >
              Find
            </button>
          </div>

          {operatorDetails && (
            <div className="mt-1.5 border border-emerald-200 bg-emerald-50 rounded-sm px-2 py-1.5">
              <div className="text-xs font-semibold text-emerald-700">
                {operatorDetails.operator_name}
              </div>

              <div className="text-[11px] text-slate-500 mt-0.5">
                Shift: {operatorDetails.shift} &middot; Hall:{" "}
                {operatorDetails.hall}
              </div>
            </div>
          )}
        </div>

        {/* PART SEARCH */}

        <div ref={wrapperRef} className="relative col-span-2 md:col-span-1">
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Part Name
          </label>

          <input
            type="text"
            name="part"
            value={formData.part}
            onChange={handlePartChange}
            onKeyDown={handlePartKeyDown}
            autoComplete="off"
            placeholder="Search part..."
            className={inputClass}
          />

          {partSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E2E4E9] rounded-sm shadow-lg max-h-72 overflow-y-auto z-50">
              {partSuggestions.map((part, index) => (
                <div
                  key={part.id}
                  onClick={() => selectPart(part)}
                  className={`px-2.5 py-1.5 cursor-pointer border-b border-[#E2E4E9] last:border-b-0 ${
                    selectedIndex === index ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-800">
                    {part.part_name}
                  </div>

                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {part.part_number} &middot; {part.product_category} &middot;{" "}
                    {part.customer}
                  </div>

                  <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                    Std CT: {part.standard_cycle_time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTUAL CT */}

        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Actual CT
          </label>

          <input
            type="number"
            name="actualCycleTime"
            value={formData.actualCycleTime}
            onChange={handleChange}
            {...numberInputProps}
            className={`${inputClass} font-mono`}
          />
        </div>

        {/* ACTUAL */}

        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Actual
          </label>

          <input
            type="number"
            name="actual"
            value={formData.actual}
            onChange={handleChange}
            {...numberInputProps}
            className={`${inputClass} font-mono`}
          />
        </div>

        {/* REJECT */}

        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Reject
          </label>

          <input
            type="number"
            name="reject"
            value={formData.reject}
            onChange={handleChange}
            {...numberInputProps}
            className={`${inputClass} font-mono`}
          />
        </div>
      </div>

      {/* ===========================
          AUTO-CALCULATED (READ-ONLY) SUMMARY CARDS
      =========================== */}

      <div className="mt-3 pt-2.5 border-t border-[#E2E4E9]">
        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-1.5">
          Auto-calculated
        </p>

        <div className="grid grid-cols-4 gap-2">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="border border-[#E2E4E9] bg-slate-50 rounded-sm px-2 py-1.5"
            >
              <p className="text-[9px] uppercase tracking-wide text-slate-400 leading-none">
                {card.label}
              </p>
              <p className={`text-xs font-bold font-mono mt-1 ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductionForm;
