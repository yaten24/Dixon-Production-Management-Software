import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

// Staggered entrance — same animation language as QuickAccessCard:
// each section (header, button, grid, total, message) fades/slides in
// slightly after the previous one, so the panel feels like it
// assembles itself rather than just appearing.

// Palette variant: navy #0F1D24 (same) · gray #9B9B9B (same)
// · copper #C97B4A (replaces gold — warmer, more industrial/premium,
// less "plastic yellow") · border #C6C6C6 (same)

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const dotVariants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 16 },
  },
};

const RejectBreakup = ({
  reject,
  rejectReasons,
  updateRejectReason,
  totalRejectQty,

  addCustomRejectReason,
  removeCustomRejectReason,
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

  if (Number(reject) <= 0) {
    return null;
  }

  const isMatched =
    Number(reject) > 0 && Number(reject) === Number(totalRejectQty);
  const isMismatched =
    Number(reject) > 0 && Number(reject) !== Number(totalRejectQty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="mt-3 rounded border border-[#C6C6C6]/50 bg-white p-3 shadow-sm"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* HEADER */}
        <motion.div variants={itemVariants} className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span variants={dotVariants} className="h-1.5 w-1.5 rounded bg-[#C97B4A]" />
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#0F1D24]">Reject Breakup</h3>
              <p className="mt-0.5 text-[11px] text-[#9B9B9B]">
                Enter reject quantity against each rejection reason
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={addCustomRejectReason}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -1 }}
            className="flex h-7 items-center gap-1.5 rounded bg-[#0F1D24] px-2.5 text-xs font-semibold text-[#C97B4A] transition-colors hover:bg-[#0F1D24]/90"
          >
            <FaPlus size={10} />
            Custom Reason
          </motion.button>
        </motion.div>

        {/* REASON GRID */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {rejectReasons.map((item, index) => (
              <motion.div
                key={item.custom ? `custom-${index}` : item.reason}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.03 }}
                className={`rounded border p-2 transition-colors duration-300 ${
                  Number(item.qty) > 0
                    ? "border-[#C97B4A]/40 bg-[#C97B4A]/[0.06]"
                    : "border-[#C6C6C6]/50 bg-[#F5F5F5]/50"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-1.5">
                  {item.custom ? (
                    <input
                      type="text"
                      value={item.reason}
                      placeholder="Custom Reason"
                      onChange={(e) =>
                        updateRejectReason(index, "reason", e.target.value)
                      }
                      className="h-7 min-w-0 flex-1 rounded border border-[#C6C6C6] bg-white px-1.5 text-xs text-[#0F1D24] outline-none transition-colors focus:border-[#C97B4A] focus:ring-1 focus:ring-[#C97B4A]"
                    />
                  ) : (
                    <label
                      className="truncate text-[11px] font-semibold leading-tight text-[#0F1D24]"
                      title={item.reason}
                    >
                      {item.reason}
                    </label>
                  )}

                  {item.custom && (
                    <motion.button
                      type="button"
                      onClick={() => removeCustomRejectReason(index)}
                      whileTap={{ scale: 0.88 }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-red-600 text-white transition-colors hover:bg-red-700"
                    >
                      <FaTrash size={10} />
                    </motion.button>
                  )}
                </div>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={item.qty}
                  placeholder="Qty"
                  onChange={(e) => updateRejectReason(index, "qty", e.target.value)}
                  {...numberInputProps}
                  className="
                    w-full
                    h-8
                    rounded
                    border
                    border-[#C6C6C6]
                    px-2
                    text-xs
                    font-mono
                    text-[#0F1D24]
                    bg-white

                    outline-none
                    transition-colors
                    focus:border-[#C97B4A]
                    focus:ring-1
                    focus:ring-[#C97B4A]

                    [appearance:textfield]
                    [&::-webkit-inner-spin-button]:appearance-none
                    [&::-webkit-outer-spin-button]:appearance-none
                  "
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* TOTAL REJECT */}
        <motion.div variants={itemVariants} className="mt-2.5 flex justify-end">
          <motion.div
            key={totalRejectQty}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-3 py-1.5 font-mono text-xs font-bold text-[#0F1D24]"
          >
            Total Reject: {totalRejectQty}
          </motion.div>
        </motion.div>

        {/* VALIDATION / SUCCESS MESSAGE */}
        <AnimatePresence mode="wait">
          {isMismatched && (
            <motion.div
              key="mismatch"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-2 flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-600"
            >
              <FaExclamationCircle className="shrink-0 text-[10px]" />
              Reject Qty ({reject}) and Total Reject Breakup ({totalRejectQty}) must
              be equal.
            </motion.div>
          )}

          {isMatched && (
            <motion.div
              key="match"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-2 flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-600"
            >
              <FaCheckCircle className="shrink-0 text-[10px]" />
              Reject Breakup Total Matched
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default RejectBreakup;