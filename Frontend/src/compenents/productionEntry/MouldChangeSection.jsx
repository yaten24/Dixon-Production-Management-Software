import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MouldChangeSection = ({
  showMouldSection,
  handleMouldToggle,
  formData,
  handleChange,
  children,
  fetchMouldPartSuggestions,
  mouldPartSuggestions = [],
  setMouldPartSuggestions,
  noMouldPartResults,
  onAddMouldPart,
  addingMouldPart,
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
    focus:border-orange-400
    focus:ring-1
    focus:ring-orange-400
    transition-all
    [appearance:textfield]
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
  `;

  // ===========================
  // OLD PART auto-fill
  // ===========================
  useEffect(() => {
    if (!showMouldSection) return;
    if (!formData.part_id) return;

    if (formData.old_part_id !== formData.part_id) {
      handleChange({
        target: { name: "old_part_id", value: formData.part_id },
      });
    }
    if (formData.old_part_number !== formData.part) {
      handleChange({
        target: { name: "old_part_number", value: formData.part },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMouldSection, formData.part_id, formData.part]);

  // ===========================
  // TARGET — now EDITABLE, same pattern as main ProductionForm.
  // Only auto-sets from Actual Cycle Time when the field is empty, so it
  // no longer stomps on a value you manually reduced/increased.
  // ===========================
  const calculatedMouldTarget = useMemo(() => {
    const ct = Number(formData.mouldActualCycleTime);
    return ct > 0 ? Math.round(3600 / ct) : "";
  }, [formData.mouldActualCycleTime]);

  useEffect(() => {
    if (formData.mouldTarget === "" && calculatedMouldTarget) {
      handleChange({
        target: { name: "mouldTarget", value: calculatedMouldTarget },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedMouldTarget]);

  // ===========================
  // LOSS TIME (minutes)
  // ===========================
  const mouldLossMinutes = useMemo(() => {
    const target = Number(formData.mouldTarget) || 0;
    const actual = Number(formData.mouldActual) || 0;
    const cycleTime = Number(formData.mouldActualCycleTime) || 0;

    const shortfall = Math.max(target - actual, 0);
    const lossSeconds = shortfall * cycleTime;

    return Number((lossSeconds / 60).toFixed(1));
  }, [
    formData.mouldTarget,
    formData.mouldActual,
    formData.mouldActualCycleTime,
  ]);

  // ===========================
  // EFFICIENCY
  // ===========================
  const mouldEfficiency = useMemo(() => {
    const target = Number(formData.mouldTarget) || 0;
    const actual = Number(formData.mouldActual) || 0;
    if (!target) return 0;
    return Number(((actual / target) * 100).toFixed(2));
  }, [formData.mouldTarget, formData.mouldActual]);

  // ===========================
  // PART — inline "Add Part" mini-form (for the NEW part)
  // ===========================
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPart, setNewPart] = useState({
    part_number: "",
    part_name: "",
    product_category: "",
    source: "",
    customer: "",
    standard_cycle_time: "",
  });
  const [addPartError, setAddPartError] = useState(null);

  const submitNewPart = async () => {
    if (
      !newPart.part_number.trim() ||
      !newPart.part_name.trim() ||
      !Number(newPart.standard_cycle_time)
    ) {
      setAddPartError(
        "Part number, part name and standard cycle time are required.",
      );
      return;
    }

    setAddPartError(null);

    const result = await onAddMouldPart({
      ...newPart,
      standard_cycle_time: Number(newPart.standard_cycle_time),
    });

    if (result.success) {
      setShowAddPart(false);
      setNewPart({
        part_number: "",
        part_name: "",
        product_category: "",
        source: "",
        customer: "",
        standard_cycle_time: "",
      });
    } else {
      setAddPartError(result.message);
    }
  };

  // ===========================
  // PART SEARCH (this is the NEW part)
  // ===========================

  const handleMouldPartChange = (e) => {
    handleChange(e);

    const value = e.target.value;

    handleChange({ target: { name: "new_part_id", value: null } });
    handleChange({ target: { name: "new_part_number", value: "" } });
    handleChange({ target: { name: "mouldStandardCycleTime", value: "" } });

    if (value.trim().length < 2) {
      setMouldPartSuggestions([]);
      setSelectedIndex(-1);
      setShowAddPart(false);
      return;
    }

    fetchMouldPartSuggestions(value);
    setSelectedIndex(-1);
    setShowAddPart(false);
  };

  const selectMouldPart = (part) => {
    handleChange({ target: { name: "mouldPart", value: part.part_name } });
    handleChange({
      target: {
        name: "mouldStandardCycleTime",
        value: part.standard_cycle_time,
      },
    });

    handleChange({ target: { name: "new_part_id", value: part.id } });
    handleChange({
      target: {
        name: "new_part_number",
        value: part.part_number || part.part_name,
      },
    });

    setMouldPartSuggestions([]);
    setSelectedIndex(-1);
    setShowAddPart(false);
  };

  const handleMouldKeyDown = (e) => {
    if (!mouldPartSuggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < mouldPartSuggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectMouldPart(mouldPartSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setMouldPartSuggestions([]);
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
        setMouldPartSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setMouldPartSuggestions]);

  return (
    <div className="mt-3">
      {/* CHECKBOX */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showMouldSection}
          onChange={handleMouldToggle}
          className="h-3.5 w-3.5 accent-orange-600"
        />
        <span className="text-xs font-semibold text-orange-600">
          Mould Change Entry
        </span>
      </label>

      <AnimatePresence>
        {showMouldSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 border border-[#E2E4E9] bg-orange-50/40 rounded-sm p-3">
              <h3 className="text-sm font-bold text-slate-800 mb-3">
                Mould Change Production Entry
              </h3>

              {/* ===========================
                  OLD PART → NEW PART
              =========================== */}
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Old Part (current)
                  </label>
                  <div className="h-9 px-2.5 text-xs bg-slate-100 border border-[#E2E4E9] rounded-sm flex items-center text-slate-600 font-medium truncate">
                    {formData.old_part_number || formData.part || "—"}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    New Part
                  </label>
                  <div className="h-9 px-2.5 text-xs bg-emerald-50 border border-emerald-200 rounded-sm flex items-center text-emerald-700 font-semibold truncate">
                    {formData.new_part_number ||
                      formData.mouldPart ||
                      "Search below ↓"}
                  </div>
                </div>
              </div>

              {/* ===========================
                  EDITABLE FIELDS
              =========================== */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {/* PART NAME SEARCH (this sets the NEW part) */}
                <div className="relative" ref={wrapperRef}>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Search New Part
                  </label>

                  <input
                    type="text"
                    name="mouldPart"
                    value={formData.mouldPart}
                    onChange={handleMouldPartChange}
                    onKeyDown={handleMouldKeyDown}
                    autoComplete="off"
                    placeholder="Search by name or number..."
                    className={inputClass}
                  />

                  {mouldPartSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E2E4E9] rounded-sm shadow-lg z-50 max-h-72 overflow-y-auto">
                      {mouldPartSuggestions.map((part, index) => (
                        <div
                          key={part.id}
                          onClick={() => selectMouldPart(part)}
                          className={`px-2.5 py-1.5 cursor-pointer border-b border-[#E2E4E9] last:border-b-0 ${
                            selectedIndex === index
                              ? "bg-orange-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-xs font-semibold text-slate-800">
                            {part.part_name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {part.part_number} &middot; {part.product_category}{" "}
                            &middot; {part.customer}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                            Std CT: {part.standard_cycle_time}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {noMouldPartResults && !formData.new_part_id && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-amber-200 rounded-sm shadow-lg z-50 p-2">
                      {!showAddPart ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-amber-700 font-medium">
                            No part found for "{formData.mouldPart}".
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewPart((p) => ({
                                ...p,
                                part_name: formData.mouldPart,
                              }));
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
                            placeholder="Part Number"
                            value={newPart.part_number}
                            onChange={(e) =>
                              setNewPart((p) => ({
                                ...p,
                                part_number: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                          <input
                            type="text"
                            placeholder="Part Name"
                            value={newPart.part_name}
                            onChange={(e) =>
                              setNewPart((p) => ({
                                ...p,
                                part_name: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                          <input
                            type="text"
                            placeholder="Product Category"
                            value={newPart.product_category}
                            onChange={(e) =>
                              setNewPart((p) => ({
                                ...p,
                                product_category: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                          <input
                            type="text"
                            placeholder="Source"
                            value={newPart.source}
                            onChange={(e) =>
                              setNewPart((p) => ({
                                ...p,
                                source: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                          <input
                            type="text"
                            placeholder="Customer"
                            value={newPart.customer}
                            onChange={(e) =>
                              setNewPart((p) => ({
                                ...p,
                                customer: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                          <input
                            type="number"
                            placeholder="Standard Cycle Time (sec)"
                            value={newPart.standard_cycle_time}
                            {...numberInputProps}
                            onChange={(e) =>
                              setNewPart((p) => ({
                                ...p,
                                standard_cycle_time: e.target.value,
                              }))
                            }
                            className={`${inputClass} font-mono`}
                          />

                          {addPartError && (
                            <p className="text-[10px] text-red-600">
                              {addPartError}
                            </p>
                          )}

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={submitNewPart}
                              disabled={addingMouldPart}
                              className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-sm disabled:opacity-50"
                            >
                              {addingMouldPart ? "Saving..." : "Save & Use"}
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

                  {formData.mouldPart && !formData.new_part_id && (
                    <p className="text-[10px] text-red-500 mt-1">
                      Select a part from the list to link it (required to save).
                    </p>
                  )}
                </div>

                {/* ACTUAL CT */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Actual CT
                  </label>
                  <input
                    type="number"
                    name="mouldActualCycleTime"
                    value={formData.mouldActualCycleTime}
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
                    name="mouldActual"
                    value={formData.mouldActual}
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
                    name="mouldReject"
                    value={formData.mouldReject}
                    onChange={handleChange}
                    {...numberInputProps}
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              {/* ===========================
                  AUTO-CALCULATED + EDITABLE TARGET
              =========================== */}

              <div className="mt-3 pt-2.5 border-t border-[#E2E4E9]">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-1.5">
                  Auto-calculated &amp; Editable
                </p>

                <div className="grid grid-cols-5 gap-2">
                  <div className="border border-[#E2E4E9] bg-white rounded-sm px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wide text-slate-400 leading-none">
                      Standard CT
                    </p>
                    <p className="text-xs font-bold font-mono mt-1 text-slate-700">
                      {formData.mouldStandardCycleTime || "-"}
                    </p>
                  </div>

                  <div className="border border-[#E2E4E9] bg-white rounded-sm px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wide text-slate-400 leading-none">
                      Calc Target
                    </p>
                    <p className="text-xs font-bold font-mono mt-1 text-slate-500">
                      {calculatedMouldTarget === "" ? "-" : calculatedMouldTarget}
                    </p>
                  </div>

                  {/* Editable target — was read-only before */}
                  <div className="border border-[#E2E4E9] bg-blue-50 rounded-sm px-2 py-1.5">
                    <label className="text-[9px] uppercase tracking-wide text-blue-400 leading-none block">
                      Target (editable)
                    </label>
                    <input
                      type="number"
                      name="mouldTarget"
                      value={formData.mouldTarget}
                      onChange={handleChange}
                      {...numberInputProps}
                      className="w-full h-5 px-1 text-xs font-bold font-mono text-blue-600 bg-transparent border-0 outline-none"
                    />
                  </div>

                  <div className="border border-[#E2E4E9] bg-white rounded-sm px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wide text-red-400 leading-none">
                      Loss (min)
                    </p>
                    <p className="text-xs font-bold font-mono mt-1 text-red-600">
                      {mouldLossMinutes}
                    </p>
                  </div>

                  <div className="border border-[#E2E4E9] bg-white rounded-sm px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wide text-orange-400 leading-none">
                      Efficiency
                    </p>
                    <p className="text-xs font-bold font-mono mt-1 text-orange-600">
                      {mouldEfficiency}%
                    </p>
                  </div>
                </div>
              </div>

              {/* CHILD COMPONENT */}
              <div className="mt-3">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MouldChangeSection;