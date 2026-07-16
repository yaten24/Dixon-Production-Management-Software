// ProductionForm.jsx
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

  const isFromPlan = !!formData.plan_detail_id;

  const numberInputProps = {
    onWheel: (e) => e.target.blur(),
    onKeyDown: (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
    },
  };

  // ===========================
  // THEME TOKENS (brand palette)
  // highlight #0F1D24 — icon chips, headings, hover fills
  // gray      #9B9B9B — secondary text
  // accent    #FDC94D — focus rings, badges, CTA
  // darken    #C6C6C6 — borders, dividers
  // ===========================

  const inputClass = `
    w-full
    h-9
    px-2.5
    text-xs
    bg-white
    text-[#0F1D24]
    placeholder:text-[#9B9B9B]
    border
    border-[#C6C6C6]/60
    rounded
    outline-none
    focus:border-[#FDC94D]
    focus:ring-2
    focus:ring-[#FDC94D]/30
    transition-all
    duration-200
    [appearance:textfield]
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
  `;

  const planBadge = (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#0F1D24] bg-[#FDC94D]/25 border border-[#FDC94D]/50 rounded-full px-1.5 py-0.5 ml-1.5 align-middle">
      <ClipboardCheck size={9} />
      Plan
    </span>
  );

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

  const lossMinutes = useMemo(() => {
    const target = Number(formData.target) || 0;
    const actual = Number(formData.actual) || 0;
    const cycleTime = Number(formData.actualCycleTime) || 0;
    const shortfall = Math.max(target - actual, 0);
    const lossSeconds = shortfall * cycleTime;
    return Number((lossSeconds / 60).toFixed(1));
  }, [formData.target, formData.actual, formData.actualCycleTime]);

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

  const handleOperatorChange = (e) => {
    handleChange(e);
    handleChange({ target: { name: "operator_id", value: null } });
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
    handleChange({ target: { name: "part", value: part.part_name } });
    handleChange({ target: { name: "part_id", value: part.id } });
    handleChange({
      target: { name: "standardCycleTime", value: part.standard_cycle_time },
    });
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
        if (selectedIndex >= 0) selectPart(partSuggestions[selectedIndex]);
        break;
      case "Escape":
        setPartSuggestions([]);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setPartSuggestions, setOperatorSuggestions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
    >
      {/* top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#FDC94D]" />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold tracking-tight text-[#0F1D24]">
          Production Entry
        </h2>
        {isFromPlan && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0F1D24] bg-[#FDC94D]/25 border border-[#FDC94D]/50 rounded-full px-2 py-0.5">
            <ClipboardCheck size={10} />
            Pre-filled from Plan
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {/* OPERATOR */}
        <div
          ref={operatorWrapperRef}
          className="relative col-span-2 md:col-span-1"
        >
          <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
            Operator ID / Name
            {/* {isFromPlan && formData.operatorId && planBadge} */}
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

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => fetchOperator(formData.operatorId)}
              className="px-3 h-9 rounded bg-[#0F1D24] hover:bg-[#0F1D24]/90 text-[#FDC94D] text-xs font-semibold transition-colors"
            >
              Find
            </motion.button>
          </div>

          {operatorSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#C6C6C6]/60 rounded shadow-lg max-h-72 overflow-y-auto z-50">
              {operatorSuggestions.map((op, index) => (
                <div
                  key={op.id}
                  onClick={() => selectOperator(op)}
                  className={`px-2.5 py-1.5 cursor-pointer border-b border-[#C6C6C6]/40 last:border-b-0 ${
                    operatorSelectedIndex === index
                      ? "bg-[#FDC94D]/15"
                      : "hover:bg-[#F5F5F5]"
                  }`}
                >
                  <div className="text-xs font-semibold text-[#0F1D24]">
                    {op.operator_name}
                  </div>
                  <div className="text-[10px] text-[#9B9B9B] mt-0.5">
                    Code: {op.operator_code} &middot; Shift: {op.shift} &middot;
                    Hall: {op.hall}
                  </div>
                </div>
              ))}
            </div>
          )}

          {operatorDetails && (
            <div className="mt-1.5 border border-emerald-200 bg-emerald-50 rounded px-2 py-1.5">
              <div className="flex items-center gap-1">
                <div className="text-xs font-semibold text-emerald-700">
                  {operatorDetails.operator_name}
                </div>
                {formData.operatorId && (
                  <ArrowRight size={10} className="text-emerald-600" />
                )}
              </div>
              <div className="text-[11px] text-[#9B9B9B] mt-0.5">
                Shift: {operatorDetails.shift} &middot; Hall:{" "}
                {operatorDetails.hall}
              </div>
            </div>
          )}

          {(operatorNotFound || noOperatorResults) &&
            !operatorDetails &&
            operatorSuggestions.length === 0 && (
              <div className="mt-1.5 border border-[#FDC94D]/50 bg-[#FDC94D]/10 rounded p-2">
                {!showAddOperator ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#0F1D24] font-medium">
                      No operator found for "{formData.operatorId}".
                    </span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowAddOperator(true)}
                      className="h-6 px-2 shrink-0 bg-[#0F1D24] hover:bg-[#0F1D24]/90 text-[#FDC94D] text-[10px] font-semibold rounded"
                    >
                      + Add Operator
                    </motion.button>
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
                          setNewOperator((p) => ({
                            ...p,
                            shift: e.target.value,
                          }))
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
                          setNewOperator((p) => ({
                            ...p,
                            hall: e.target.value,
                          }))
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
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={submitNewOperator}
                        disabled={addingOperator}
                        className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded disabled:opacity-50"
                      >
                        {addingOperator ? "Saving..." : "Save & Use"}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => setShowAddOperator(false)}
                        className="h-7 px-2 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#0F1D24] text-[11px] rounded border border-[#C6C6C6]/50"
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
          <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
            Part Name / Number
            {/* {isFromPlan && formData.part && planBadge} */}
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

          {partSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#C6C6C6]/60 rounded shadow-lg max-h-72 overflow-y-auto z-50">
              {partSuggestions.map((part, index) => (
                <div
                  key={part.id}
                  onClick={() => selectPart(part)}
                  className={`px-2.5 py-1.5 cursor-pointer border-b border-[#C6C6C6]/40 last:border-b-0 ${
                    selectedIndex === index ? "bg-[#FDC94D]/15" : "hover:bg-[#F5F5F5]"
                  }`}
                >
                  <div className="text-xs font-semibold text-[#0F1D24]">
                    {part.part_name}
                  </div>
                  <div className="text-[10px] text-[#9B9B9B] mt-0.5">
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

          {noPartResults && !formData.part_id && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#FDC94D]/50 rounded shadow-lg z-50 p-2">
              {!showAddPart ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#0F1D24] font-medium">
                    No part found for "{formData.part}".
                  </span>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setNewPart((p) => ({ ...p, part_name: formData.part }));
                      setShowAddPart(true);
                    }}
                    className="h-6 px-2 shrink-0 bg-[#0F1D24] hover:bg-[#0F1D24]/90 text-[#FDC94D] text-[10px] font-semibold rounded"
                  >
                    + Add Part
                  </motion.button>
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
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={submitNewPart}
                      disabled={addingPart}
                      className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded disabled:opacity-50"
                    >
                      {addingPart ? "Saving..." : "Save & Use"}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setShowAddPart(false)}
                      className="h-7 px-2 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#0F1D24] text-[11px] rounded border border-[#C6C6C6]/50"
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
          <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
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
          <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
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
          <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
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

      <div className="mt-3 pt-2.5 border-t border-[#C6C6C6]/40">
        <p className="text-[10px] uppercase tracking-wide text-[#9B9B9B] font-medium mb-1.5">
          Auto-calculated &amp; Editable
          {isFromPlan && formData.target && (
            <span className="ml-1.5 normal-case text-[#0F1D24] font-semibold">
              (Target from Plan)
            </span>
          )}
        </p>

        <div className="grid grid-cols-5 gap-2">
          <div className="border border-[#C6C6C6]/50 bg-[#F9F9F9] rounded px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-[#9B9B9B] leading-none">
              Standard CT
            </p>
            <p className="text-xs font-bold font-mono mt-1 text-[#0F1D24]">
              {formData.standardCycleTime || "-"}
            </p>
          </div>

          <div className="border border-[#C6C6C6]/50 bg-[#F9F9F9] rounded px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-[#9B9B9B] leading-none">
              Calc Target
            </p>
            <p className="text-xs font-bold font-mono mt-1 text-[#0F1D24]">
              {calculatedTarget === "" ? "-" : calculatedTarget}
            </p>
          </div>

          <div className="border border-[#FDC94D]/60 bg-[#FDC94D]/15 rounded px-2 py-1.5">
            <label className="text-[9px] uppercase tracking-wide text-[#0F1D24] leading-none block font-semibold">
              Target (editable)
            </label>
            <input
              type="number"
              name="target"
              value={formData.target}
              onChange={handleChange}
              {...numberInputProps}
              className="w-full h-5 px-1 text-xs font-bold font-mono text-[#0F1D24] bg-transparent border-0 outline-none"
            />
          </div>

          <div className="border border-red-200 bg-red-50 rounded px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-red-400 leading-none">
              Loss (min)
            </p>
            <p className="text-xs font-bold font-mono mt-1 text-red-600">
              {lossMinutes}
            </p>
          </div>

          <div className="border border-orange-200 bg-orange-50 rounded px-2 py-1.5">
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