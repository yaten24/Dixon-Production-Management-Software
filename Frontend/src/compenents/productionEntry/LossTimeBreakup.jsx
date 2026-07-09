import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash } from "react-icons/fa";

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

  return (
    <div className="mt-3 border border-slate-200 bg-white rounded p-4 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Loss Time Breakup
          </h3>
          <p className="text-xs text-slate-500">Enter loss time details</p>
        </div>

        <button
          type="button"
          onClick={addLossReason}
          aria-label="Add loss reason"
          className="
            h-9
            w-9
            rounded-full
            bg-blue-600
            hover:bg-blue-700
            active:bg-blue-800
            text-white
            flex
            items-center
            justify-center
            text-sm
            shadow-sm
            transition-colors
            duration-150
          "
        >
          <FaPlus />
        </button>
      </div>

      {/* LOSS REASON ROWS */}
      <div className="flex flex-col gap-2">
        {lossReasons.map((item, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded p-3 bg-slate-50"
          >
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`loss-reason-${index}`}
                  className="text-xs font-medium text-slate-600 block mb-1"
                >
                  Loss Time Reason
                </label>

                <select
                  id={`loss-reason-${index}`}
                  value={item.reason}
                  onChange={(e) =>
                    updateLossReason(index, "reason", e.target.value)
                  }
                  className="
                    w-full
                    h-9
                    border
                    border-slate-300
                    rounded-full
                    px-3
                    text-sm
                    bg-white
                    text-slate-700
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-400
                    focus:border-blue-400
                    transition-all
                    duration-150
                  "
                >
                  <option value="">Select Reason</option>
                  {lossTimeReasonOptions.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {lossReasons.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLossReason(index)}
                  aria-label="Remove loss reason"
                  className="
                    shrink-0
                    h-9
                    w-9
                    rounded-full
                    bg-red-50
                    hover:bg-red-600
                    text-red-600
                    hover:text-white
                    flex
                    items-center
                    justify-center
                    text-sm
                    border
                    border-red-200
                    hover:border-red-600
                    transition-colors
                    duration-150
                  "
                >
                  <FaTrash />
                </button>
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
                      className="text-xs font-medium text-slate-600 block mb-1"
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
                      className="
                        w-full
                        h-9
                        border
                        border-slate-300
                        rounded-full
                        px-3
                        text-sm
                        bg-white
                        text-slate-700
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-400
                        focus:border-blue-400
                        transition-all
                        duration-150
                        [appearance:textfield]
                        [&::-webkit-inner-spin-button]:appearance-none
                        [&::-webkit-outer-spin-button]:appearance-none
                      "
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* TOTAL LOSS */}
      <div className="flex justify-end mt-3">
        <div
          className="
            bg-blue-50
            border
            border-blue-200
            rounded
            px-4
            py-1.5
            text-sm
            font-bold
            text-blue-700
          "
        >
          Total Loss : {totalLossMinutes} Min
        </div>
      </div>
    </div>
  );
};

export default LossTimeBreakup;
