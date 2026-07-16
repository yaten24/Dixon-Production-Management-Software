import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Brand palette (from client's color reference):
// highlight #0F1D24 (deep navy)  — primary: icons, titles, hover fills
// gray      #9B9B9B              — secondary text
// accent    #FDC94D (warm gold)  — sparing highlight: eyebrow, bar, focus
// darken    #C6C6C6              — borders, dividers, neutral surfaces

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
  // TARGET — editable, auto-sets from Actual Cycle Time only when empty
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
  // LOSS TIME (minutes) — shortfall vs target, in this part's own slot
  // ===========================
  const mouldLossMinutes = useMemo(() => {
    const target = Number(formData.mouldTarget) || 0;
    const actual = Number(formData.mouldActual) || 0;
    const cycleTime = Number(formData.mouldActualCycleTime) || 0;

    const shortfall = Math.max(target - actual, 0);
    const lossSeconds = shortfall * cycleTime;

    return Number((lossSeconds / 60).toFixed(1));
  }, [formData.mouldTarget, formData.mouldActual, formData.mouldActualCycleTime]);

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
    // FIX: mouldActualCycleTime bhi clear karo taaki purani part ki Actual CT
    // stale na reh jaaye jab tak naya part select na ho jaaye.
    handleChange({ target: { name: "mouldActualCycleTime", value: "" } });

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

    // FIX: mouldActualCycleTime ab part select karte hi set ho jaati hai
    // (fallback standard_cycle_time pe agar actual DB me 0/null hai).
    handleChange({
      target: {
        name: "mouldActualCycleTime",
        value: part.actual_cycle_time || part.standard_cycle_time || "",
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
      <motion.label
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          checked={showMouldSection}
          onChange={handleMouldToggle}
          className="h-3.5 w-3.5 accent-[#FDC94D]"
        />
        <span className="text-xs font-semibold text-[#0F1D24]">
          Mould Change Entry
        </span>
      </motion.label>

      <AnimatePresence>
        {showMouldSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="group relative mt-2.5 overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              {/* top accent bar */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-[#FDC94D]" />

              <h3 className="text-sm font-bold tracking-tight text-[#0F1D24] mb-3">
                Mould Change Production Entry
              </h3>

              {/* ===========================
                  OLD PART → NEW PART
              =========================== */}
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
                    Old Part (current)
                  </label>
                  <div className="h-9 px-2.5 text-xs bg-[#F5F5F5] border border-[#C6C6C6]/50 rounded flex items-center text-[#0F1D24] font-medium truncate">
                    {formData.old_part_number || formData.part || "—"}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
                    New Part
                  </label>
                  <motion.div
                    key={formData.new_part_number || formData.mouldPart}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="h-9 px-2.5 text-xs bg-emerald-50 border border-emerald-200 rounded flex items-center text-emerald-700 font-semibold truncate"
                  >
                    {formData.new_part_number ||
                      formData.mouldPart ||
                      "Search below ↓"}
                  </motion.div>
                </div>
              </div>

              {/* ===========================
                  EDITABLE FIELDS
              =========================== */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {/* PART NAME SEARCH (this sets the NEW part) */}
                <div className="relative" ref={wrapperRef}>
                  <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
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

                  <AnimatePresence>
                    {mouldPartSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-1 bg-white border border-[#C6C6C6]/60 rounded shadow-lg z-50 max-h-72 overflow-y-auto"
                      >
                        {mouldPartSuggestions.map((part, index) => (
                          <div
                            key={part.id}
                            onClick={() => selectMouldPart(part)}
                            className={`px-2.5 py-1.5 cursor-pointer border-b border-[#C6C6C6]/40 last:border-b-0 ${
                              selectedIndex === index
                                ? "bg-[#FDC94D]/15"
                                : "hover:bg-[#F5F5F5]"
                            }`}
                          >
                            <div className="text-xs font-semibold text-[#0F1D24]">
                              {part.part_name}
                            </div>
                            <div className="text-[10px] text-[#9B9B9B] mt-0.5">
                              {part.part_number} &middot; {part.product_category}{" "}
                              &middot; {part.customer}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                              Std CT: {part.standard_cycle_time}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {noMouldPartResults && !formData.new_part_id && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-1 bg-white border border-[#FDC94D]/50 rounded shadow-lg z-50 p-2"
                      >
                        {!showAddPart ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-[#0F1D24] font-medium">
                              No part found for "{formData.mouldPart}".
                            </span>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => {
                                setNewPart((p) => ({
                                  ...p,
                                  part_name: formData.mouldPart,
                                }));
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
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={submitNewPart}
                                disabled={addingMouldPart}
                                className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded disabled:opacity-50"
                              >
                                {addingMouldPart ? "Saving..." : "Save & Use"}
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {formData.mouldPart && !formData.new_part_id && (
                    <p className="text-[10px] text-red-500 mt-1">
                      Select a part from the list to link it (required to save).
                    </p>
                  )}
                </div>

                {/* ACTUAL CT */}
                <div>
                  <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
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
                  <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
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
                  <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
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

              <div className="mt-3 pt-2.5 border-t border-[#C6C6C6]/40">
                <p className="text-[10px] uppercase tracking-wide text-[#9B9B9B] font-medium mb-1.5">
                  Auto-calculated &amp; Editable
                </p>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  <div className="border border-[#C6C6C6]/50 bg-[#F9F9F9] rounded px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wide text-[#9B9B9B] leading-none">
                      Standard CT
                    </p>
                    <p className="text-xs font-bold font-mono mt-1 text-[#0F1D24]">
                      {formData.mouldStandardCycleTime || "-"}
                    </p>
                  </div>

                  <div className="border border-[#C6C6C6]/50 bg-[#F9F9F9] rounded px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wide text-[#9B9B9B] leading-none">
                      Calc Target
                    </p>
                    <p className="text-xs font-bold font-mono mt-1 text-[#0F1D24]">
                      {calculatedMouldTarget === "" ? "-" : calculatedMouldTarget}
                    </p>
                  </div>

                  {/* Editable target */}
                  <div className="border border-[#FDC94D]/60 bg-[#FDC94D]/15 rounded px-2 py-1.5">
                    <label className="text-[9px] uppercase tracking-wide text-[#0F1D24] leading-none block font-semibold">
                      Target (editable)
                    </label>
                    <input
                      type="number"
                      name="mouldTarget"
                      value={formData.mouldTarget}
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
                      {mouldLossMinutes}
                    </p>
                  </div>

                  <div className="border border-orange-200 bg-orange-50 rounded px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wide text-orange-400 leading-none">
                      Efficiency
                    </p>
                    <p className="text-xs font-bold font-mono mt-1 text-orange-600">
                      {mouldEfficiency}%
                    </p>
                  </div>

                  {/* Mould Change Duration — 60 - (old part time + new part time) */}
                  <div className="border border-purple-200 bg-purple-50 rounded px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wide text-purple-400 leading-none">
                      Mould Change (min)
                    </p>
                    <p className="text-xs font-bold font-mono mt-1 text-purple-700">
                      {formData.mould_duration === "" ? "-" : formData.mould_duration}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mould Change Remarks */}
              <div className="mt-2.5">
                <label className="text-[11px] font-medium text-[#9B9B9B] block mb-1">
                  Mould Change Remarks
                </label>
                <input
                  type="text"
                  name="mould_remarks"
                  value={formData.mould_remarks}
                  onChange={handleChange}
                  placeholder="e.g. reason for change, breakdown notes..."
                  className={inputClass}
                />
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