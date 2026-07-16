import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

// Brand palette: highlight #0F1D24 (navy) · gray #9B9B9B · accent #FDC94D (gold) · darken #C6C6C6 (borders)

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const MouldRejectBreakup = ({
  mouldReject,
  mouldRejectReasons = [],

  addCustomMouldRejectReason,
  removeCustomMouldRejectReason,

  updateMouldRejectReason,

  totalMouldRejectQty,
}) => {
  if (Number(mouldReject) <= 0) {
    return null;
  }

  const isMatched =
    Number(mouldReject) > 0 &&
    Number(mouldReject) === Number(totalMouldRejectQty);
  const isMismatched =
    Number(mouldReject) > 0 &&
    Number(mouldReject) !== Number(totalMouldRejectQty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
    >
      {/* top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#FDC94D]" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* HEADER */}
        <motion.div variants={itemVariants} className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[#0F1D24]">
              Mould Reject Breakup
            </h3>
            <p className="mt-0.5 text-[11px] text-[#9B9B9B]">
              Enter mould reject quantity against each reason
            </p>
          </div>

          <motion.button
            type="button"
            onClick={addCustomMouldRejectReason}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="flex h-7 items-center gap-1.5 rounded bg-[#0F1D24] px-2.5 text-xs font-semibold text-[#FDC94D] transition-colors hover:bg-[#0F1D24]/90"
          >
            <FaPlus size={10} />
            Custom Reason
          </motion.button>
        </motion.div>

        {/* REASONS */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {mouldRejectReasons.map((item, index) => (
              <motion.div
                key={item.custom ? `custom-${index}` : item.reason}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.03 }}
                className={`rounded-lg border p-2 transition-colors duration-300 ${
                  Number(item.qty) > 0
                    ? "border-[#FDC94D]/50 bg-[#FDC94D]/10"
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
                        updateMouldRejectReason(index, "reason", e.target.value)
                      }
                      className="h-7 min-w-0 flex-1 rounded border border-[#C6C6C6] bg-white px-1.5 text-xs text-[#0F1D24] outline-none transition-colors focus:border-[#FDC94D] focus:ring-1 focus:ring-[#FDC94D]"
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
                      onClick={() => removeCustomMouldRejectReason(index)}
                      whileHover={{ scale: 1.05 }}
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
                  onChange={(e) =>
                    updateMouldRejectReason(index, "qty", e.target.value)
                  }
                  onWheel={(e) => e.target.blur()}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      e.preventDefault();
                    }
                  }}
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
                    focus:border-[#FDC94D]
                    focus:ring-1
                    focus:ring-[#FDC94D]

                    [appearance:textfield]
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                  "
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* TOTAL */}
        <motion.div variants={itemVariants} className="mt-2.5 flex justify-end">
          <motion.div
            key={totalMouldRejectQty}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] px-3 py-1.5 font-mono text-xs font-bold text-[#0F1D24]"
          >
            Total Mould Reject: {totalMouldRejectQty}
          </motion.div>
        </motion.div>

        {/* VALIDATION / SUCCESS */}
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
              Mould Reject Qty ({mouldReject}) and Total Mould Reject Breakup (
              {totalMouldRejectQty}) must be equal.
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
              Mould Reject Breakup Total Matched
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default MouldRejectBreakup;