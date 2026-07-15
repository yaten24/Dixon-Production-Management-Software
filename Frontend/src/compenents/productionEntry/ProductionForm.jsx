import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardCheck } from "lucide-react";

const ProductionForm = ({
  formData,
  handleChange,
  efficiency,

  fetchOperator,
  operatorDetails,
  operatorNotFound,
  onAddOperator,
  addingOperator,

  // operator search-and-select (like Part search)
  fetchOperatorSuggestions,
  operatorSuggestions = [],
  setOperatorSuggestions,
  noOperatorResults,
  onSelectOperator,

  fetchPartSuggestions,
  partSuggestions = [],
  setPartSuggestions,
  noPartResults,
  onAddPart,
  addingPart,
}) => {
  const wrapperRef = useRef(null);
  const operatorWrapperRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [operatorSelectedIndex, setOperatorSelectedIndex] = useState(-1);

  // NEW: true whenever this machine's data was seeded from a Production
  // Plan row (see useProductionEntry -> loadMachineData -> plan_detail_id).
  // Purely cosmetic — a small badge so the operator knows the value came
  // from the plan and isn't something they typed by mistake. Editing the
  // field normally still works exactly as before.
  const isFromPlan = !!formData.plan_detail_id;

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

  const planBadge = (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-1.5 py-0.5 ml-1.5 align-middle">
      <ClipboardCheck size={9} />
      Plan
    </span>
  );

  // ===========================
  // TARGET — editable (user can override the calculated value)
  // ===========================
  const calculatedTarget = useMemo(() => {
    const ct = Number(formData.actualCycleTime);
    return ct > 0 ? Math.round(3600 / ct) : "";
  }, [formData.actualCycleTime]);

  useEffect(() => {
    if (formData.target === "" && calculatedTarget) {
      handleChange({ target: { name: "target", value: calculatedTarget } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedTarget]);

  // ===========================
  // LOSS TIME (minutes)
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
  // OPERATOR — search box + inline add form
  // ===========================
  const [showAddOperator, setShowAddOperator] = useState(false);
  const [newOperator, setNewOperator] = useState({
    operator_name: "",
    shift: "",
    hall: "",
  });
  const [addOperatorError, setAddOperatorError] = useState(null);

  useEffect(() => {
    setShowAddOperator(false);
    setAddOperatorError(null);
    setNewOperator({ operator_name: "", shift: "", hall: "" });
  }, [formData.operatorId]);

  const submitNewOperator = async () => {
    if (
      !newOperator.operator_name.trim() ||
      !newOperator.shift ||
      !newOperator.hall
    ) {
      setAddOperatorError("Name, shift and hall are required.");
      return;
    }

    setAddOperatorError(null);

    const result = await onAddOperator({
      operator_name: newOperator.operator_name.trim(),
      operator_code: formData.operatorId,
      shift: newOperator.shift,
      hall: newOperator.hall,
    });

    if (result.success) {
      setShowAddOperator(false);
      setNewOperator({ operator_name: "", shift: "", hall: "" });
    } else {
      setAddOperatorError(result.message);
    }
  };

  // type-to-search handler for the operator field — typing 2+ chars shows
  // a dropdown of matching operators (by code OR name) you can click to
  // select, same UX as the Part search box below.
  const handleOperatorChange = (e) => {
    handleChange(e);
    handleChange({ target: { name: "operator_id", value: null } });
    // Editing manually after a plan pre-fill means this is no longer
    // strictly "the plan's" value — clear the plan_detail_id link so the
    // badge disappears and future auto-behaviour doesn't get confused.
    if (formData.plan_detail_id) {
      handleChange({ target: { name: "plan_detail_id", value: null } });
    }

    const value = e.target.value;

    if (!value || value.trim().length < 2) {
      setOperatorSuggestions([]);
      setOperatorSelectedIndex(-1);
      return;
    }

    fetchOperatorSuggestions(value);
    setOperatorSelectedIndex(-1);
  };

  const selectOperator = (op) => {
    onSelectOperator(op);
    setOperatorSuggestions([]);
    setOperatorSelectedIndex(-1);
  };

  const handleOperatorKeyDown = (e) => {
    if (!operatorSuggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOperatorSelectedIndex((prev) =>
          prev < operatorSuggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setOperatorSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (operatorSelectedIndex >= 0) {
          selectOperator(operatorSuggestions[operatorSelectedIndex]);
        }
        break;
      case "Escape":
        setOperatorSuggestions([]);
        setOperatorSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // ===========================
  // PART — inline add form
  // ===========================
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPart, setNewPart] = useState({
    part_name: "",
    actual_cycle_time: "",
  });
  const [addPartError, setAddPartError] = useState(null);

  const submitNewPart = async () => {
    if (!newPart.part_name.trim() || !Number(newPart.actual_cycle_time)) {
      setAddPartError("Part name and actual cycle time are required.");
      return;
    }

    setAddPartError(null);

    const result = await onAddPart({
      part_name: newPart.part_name.trim(),
      actual_cycle_time: Number(newPart.actual_cycle_time),
    });

    if (result.success) {
      setShowAddPart(false);
      setNewPart({ part_name: "", actual_cycle_time: "" });
    } else {
      setAddPartError(result.message);
    }
  };

  // ===========================
  // PART SEARCH
  // ===========================

  const handlePartChange = async (e) => {
    handleChange(e);

    const value = e.target.value;

    handleChange({ target: { name: "part_id", value: null } });
    handleChange({ target: { name: "standardCycleTime", value: "" } });
    if (formData.plan_detail_id) {
      handleChange({ target: { name: "plan_detail_id", value: null } });
    }

    if (value.length < 2) {
      setPartSuggestions([]);
      setSelectedIndex(-1);
      setShowAddPart(false);

      return;
    }

    fetchPartSuggestions(value);

    setSelectedIndex(-1);
    setShowAddPart(false);
  };

  const selectPart = (part) => {
    handleChange({
      target: {
        name: "part",
        value: part.part_name,
      },
    });

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

    // FIX: actual_cycle_time bhi part se copy karo — pehle ye missing tha,
    // isliye Actual CT field khali reh jaata tha part select karne ke baad.
    // Fallback standard_cycle_time pe agar actual_cycle_time DB me 0/null hai.
    handleChange({
      target: {
        name: "actualCycleTime",
        value: part.actual_cycle_time || part.standard_cycle_time || "",
      },
    });

    setPartSuggestions([]);
    setSelectedIndex(-1);
    setShowAddPart(false);
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
      if (
        operatorWrapperRef.current &&
        !operatorWrapperRef.current.contains(event.target)
      ) {
        setOperatorSuggestions([]);
        setOperatorSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setPartSuggestions, setOperatorSuggestions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E2E4E9] rounded-sm p-3"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800">Production Entry</h2>
        {isFromPlan && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5">
            <ClipboardCheck size={10} />
            Pre-filled from Plan
          </span>
        )}
      </div>

      {/* ===========================
          EDITABLE FIELDS
      =========================== */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {/* OPERATOR ID — search & select */}

        <div
          ref={operatorWrapperRef}
          className="relative col-span-2 md:col-span-1"
        >
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Operator ID / Name
            {isFromPlan && formData.operatorId && planBadge}
          </label>

          <div className="flex gap-1.5">
            <input
              type="text"
              name="operatorId"
              value={formData.operatorId}
              onChange={handleOperatorChange}
              onKeyDown={handleOperatorKeyDown}
              autoComplete="off"
              placeholder="Search by code or name..."
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

          {/* SEARCH SUGGESTIONS */}
          {operatorSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E2E4E9] rounded-sm shadow-lg max-h-72 overflow-y-auto z-50">
              {operatorSuggestions.map((op, index) => (
                <div
                  key={op.id}
                  onClick={() => selectOperator(op)}
                  className={`px-2.5 py-1.5 cursor-pointer border-b border-[#E2E4E9] last:border-b-0 ${
                    operatorSelectedIndex === index
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-800">
                    {op.operator_name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Code: {op.operator_code} &middot; Shift: {op.shift}{" "}
                    &middot; Hall: {op.hall}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FOUND — show details */}
          {operatorDetails && (
            <div className="mt-1.5 border border-emerald-200 bg-emerald-50 rounded-sm px-2 py-1.5">
              <div className="flex items-center gap-1">
                <div className="text-xs font-semibold text-emerald-700">
                  {operatorDetails.operator_name}
                </div>
                {formData.operatorId && (
                  <ArrowRight size={10} className="text-emerald-600" />
                )}
              </div>

              <div className="text-[11px] text-slate-500 mt-0.5">
                Shift: {operatorDetails.shift} &middot; Hall:{" "}
                {operatorDetails.hall}
              </div>
            </div>
          )}

          {/* NOT FOUND — offer to add */}
          {(operatorNotFound || noOperatorResults) &&
            !operatorDetails &&
            operatorSuggestions.length === 0 && (
              <div className="mt-1.5 border border-amber-200 bg-amber-50 rounded-sm p-2">
                {!showAddOperator ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-700 font-medium">
                      No operator found for "{formData.operatorId}".
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddOperator(true)}
                      className="h-6 px-2 shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold rounded-sm"
                    >
                      + Add Operator
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      placeholder="Operator Name"
                      value={newOperator.operator_name}
                      onChange={(e) =>
                        setNewOperator((p) => ({
                          ...p,
                          operator_name: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />

                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={newOperator.shift}
                        onChange={(e) =>
                          setNewOperator((p) => ({ ...p, shift: e.target.value }))
                        }
                        className={inputClass}
                      >
                        <option value="">Shift</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="G">G</option>
                      </select>

                      <select
                        value={newOperator.hall}
                        onChange={(e) =>
                          setNewOperator((p) => ({ ...p, hall: e.target.value }))
                        }
                        className={inputClass}
                      >
                        <option value="">Hall</option>
                        <option value="Hall 1">Hall 1</option>
                        <option value="Hall 2">Hall 2</option>
                        <option value="Hall 3">Hall 3</option>
                        <option value="Hall 4">Hall 4</option>
                        <option value="C 8">C8</option>
                      </select>
                    </div>

                    {addOperatorError && (
                      <p className="text-[10px] text-red-600">
                        {addOperatorError}
                      </p>
                    )}

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={submitNewOperator}
                        disabled={addingOperator}
                        className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-sm disabled:opacity-50"
                      >
                        {addingOperator ? "Saving..." : "Save & Use"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddOperator(false)}
                        className="h-7 px-2 bg-slate-200 hover:bg-slate-300 text-slate-600 text-[11px] rounded-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* PART SEARCH */}

        <div ref={wrapperRef} className="relative col-span-2 md:col-span-1">
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Part Name / Number
            {isFromPlan && formData.part && planBadge}
          </label>

          <input
            type="text"
            name="part"
            value={formData.part}
            onChange={handlePartChange}
            onKeyDown={handlePartKeyDown}
            autoComplete="off"
            placeholder="Search by part name or number..."
            className={inputClass}
          />

          {/* SUGGESTIONS FOUND */}
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

          {/* NO RESULTS — offer to add */}
          {noPartResults && !formData.part_id && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-amber-200 rounded-sm shadow-lg z-50 p-2">
              {!showAddPart ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-700 font-medium">
                    No part found for "{formData.part}".
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPart((p) => ({ ...p, part_name: formData.part }));
                      setShowAddPart(true);
                    }}
                    className="h-6 px-2 shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold rounded-sm"
                  >
                    + Add Part
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    placeholder="Part Name"
                    value={newPart.part_name}
                    onChange={(e) =>
                      setNewPart((p) => ({ ...p, part_name: e.target.value }))
                    }
                    className={inputClass}
                  />

                  <input
                    type="number"
                    placeholder="Actual Cycle Time (sec)"
                    step="0.1"
                    value={newPart.actual_cycle_time}
                    {...numberInputProps}
                    onChange={(e) =>
                      setNewPart((p) => ({
                        ...p,
                        actual_cycle_time: e.target.value,
                      }))
                    }
                    className={`${inputClass} font-mono`}
                  />

                  {addPartError && (
                    <p className="text-[10px] text-red-600">{addPartError}</p>
                  )}

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={submitNewPart}
                      disabled={addingPart}
                      className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-sm disabled:opacity-50"
                    >
                      {addingPart ? "Saving..." : "Save & Use"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPart(false)}
                      className="h-7 px-2 bg-slate-200 hover:bg-slate-300 text-slate-600 text-[11px] rounded-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
          AUTO-CALCULATED + EDITABLE TARGET SECTION
      =========================== */}

      <div className="mt-3 pt-2.5 border-t border-[#E2E4E9]">
        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-1.5">
          Auto-calculated &amp; Editable
          {isFromPlan && formData.target && (
            <span className="ml-1.5 normal-case text-indigo-500 font-semibold">
              (Target from Plan)
            </span>
          )}
        </p>

        <div className="grid grid-cols-5 gap-2">
          {/* Standard CT (from part) */}
          <div className="border border-[#E2E4E9] bg-slate-50 rounded-sm px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-slate-400 leading-none">
              Standard CT
            </p>
            <p className="text-xs font-bold font-mono mt-1 text-slate-500">
              {formData.standardCycleTime || "-"}
            </p>
          </div>

          {/* Calculated target (read-only) */}
          <div className="border border-[#E2E4E9] bg-slate-50 rounded-sm px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-slate-400 leading-none">
              Calc Target
            </p>
            <p className="text-xs font-bold font-mono mt-1 text-slate-500">
              {calculatedTarget === "" ? "-" : calculatedTarget}
            </p>
          </div>

          {/* Editable target */}
          <div className="border border-[#E2E4E9] bg-blue-50 rounded-sm px-2 py-1.5">
            <label className="text-[9px] uppercase tracking-wide text-blue-400 leading-none block">
              Target (editable)
            </label>
            <input
              type="number"
              name="target"
              value={formData.target}
              onChange={handleChange}
              {...numberInputProps}
              className="w-full h-5 px-1 text-xs font-bold font-mono text-blue-600 bg-transparent border-0 outline-none"
            />
          </div>

          {/* Loss minutes */}
          <div className="border border-[#E2E4E9] bg-red-50 rounded-sm px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-red-400 leading-none">
              Loss (min)
            </p>
            <p className="text-xs font-bold font-mono mt-1 text-red-600">
              {lossMinutes}
            </p>
          </div>

          {/* Efficiency */}
          <div className="border border-[#E2E4E9] bg-orange-50 rounded-sm px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-orange-400 leading-none">
              Efficiency
            </p>
            <p className="text-xs font-bold font-mono mt-1 text-orange-600">
              {efficiency}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductionForm;