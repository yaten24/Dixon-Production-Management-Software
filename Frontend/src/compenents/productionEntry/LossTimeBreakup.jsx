import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaCheck, FaChevronDown } from "react-icons/fa";

// Brand palette: highlight #0F1D24 (navy) · gray #9B9B9B · accent #FDC94D (gold) · darken #C6C6C6 (borders)

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

// ==========================================================
// ThemedDropdown — replaces native <select> for Loss Time Reason.
// Same navy/gold theme as the rest of this panel (gold focus ring,
// navy text), with a gold checkmark on the selected option.
// ==========================================================
const ThemedDropdown = ({
  value,
  options,
  onChange,
  placeholder = "Select Reason",
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center gap-1.5 rounded border bg-white px-2.5 text-xs font-medium text-[#0F1D24] outline-none transition-all duration-200 ${
          open
            ? "border-[#FDC94D] ring-2 ring-[#FDC94D]/30"
            : "border-[#C6C6C6]/60 hover:border-[#FDC94D]/60"
        }`}
      >
        <span
          className={`min-w-0 flex-1 truncate text-left ${!value ? "text-[#9B9B9B]" : ""}`}
        >
          {value || placeholder}
        </span>
        <FaChevronDown
          size={9}
          className={`shrink-0 text-[#9B9B9B] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto rounded border border-[#C6C6C6]/70 bg-white py-1 shadow-lg z-[99999]"
          >
            {options.map((reason) => {
              const isSelected = reason === value;
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    onChange(reason);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-[#0F1D24]/8 font-semibold text-[#0F1D24]"
                      : "text-[#0F1D24]/80 hover:bg-[#F5F5F5]"
                  }`}
                >
                  <span className="min-w-0 truncate">{reason}</span>
                  {isSelected && (
                    <FaCheck size={9} className="shrink-0 text-[#FDC94D]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LossTimeBreakup = ({
  lossReasons,
  lossTimeReasonOptions,
  addLossReason,
  removeLossReason,
  updateLossReason,
  totalLossMinutes,
}) => {
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
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative mt-3 overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
    >
      {/* top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#FDC94D]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.div
          variants={itemVariants}
          className="mb-3 flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[#0F1D24]">
              Loss Time Breakup
            </h3>
            <p className="mt-0.5 text-[11px] text-[#9B9B9B]">
              Enter loss time details
            </p>
          </div>

          <motion.button
            type="button"
            onClick={addLossReason}
            aria-label="Add loss reason"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F1D24] text-[#FDC94D] shadow-sm transition-colors hover:bg-[#0F1D24]/90"
          >
            <FaPlus size={12} />
          </motion.button>
        </motion.div>

        {/* LOSS REASON ROWS */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {lossReasons.map((item, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={`rounded-lg border p-2.5 transition-colors duration-300 ${
                  item.reason
                    ? "border-[#0F1D24]/20 bg-[#0F1D24]/[0.03]"
                    : "border-[#C6C6C6]/50 bg-[#F5F5F5]/50"
                }`}
              >
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-[11px] font-medium text-[#9B9B9B]">
                      Loss Time Reason
                    </label>

                    <ThemedDropdown
                      ariaLabel="Select loss time reason"
                      value={item.reason}
                      options={lossTimeReasonOptions}
                      onChange={(reason) =>
                        updateLossReason(index, "reason", reason)
                      }
                    />
                  </div>

                  {lossReasons.length > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => removeLossReason(index)}
                      aria-label="Remove loss reason"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-600 text-white transition-colors hover:bg-red-700"
                    >
                      <FaTrash size={11} />
                    </motion.button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {item.reason && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2">
                        <label
                          htmlFor={`loss-minutes-${index}`}
                          className="mb-1 block text-[11px] font-medium text-[#9B9B9B]"
                        >
                          Loss Time (Minutes)
                        </label>
                        <input
                          id={`loss-minutes-${index}`}
                          type="number"
                          min="0"
                          step="1"
                          value={item.minutes}
                          placeholder="Enter Minutes"
                          onChange={(e) =>
                            updateLossReason(index, "minutes", e.target.value)
                          }
                          {...numberInputProps}
                          className={`${inputClass} font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* TOTAL LOSS */}
        <motion.div variants={itemVariants} className="mt-3 flex justify-end">
          <motion.div
            key={totalLossMinutes}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-3 py-1.5 font-mono text-xs font-bold text-[#0F1D24]"
          >
            Total Loss: {totalLossMinutes} Min
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LossTimeBreakup;
