import React, { useRef } from "react";
import { FaFilter, FaUndo, FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const LossFilters = ({
  selectedDate,
  selectedReason,
  reasons = [],
  onDateChange,
  onReasonChange,
  onApply,
  onReset,
}) => {
  const dateRef = useRef(null);

  const openPicker = () => {
    if (dateRef.current?.showPicker) {
      dateRef.current.showPicker();
    } else {
      dateRef.current?.focus();
    }
  };

  const inputClass = `
    h-7
    rounded
    border
    border-[#C6C6C6]
    bg-white
    px-2
    text-[11px]
    text-[#0F1D24]
    outline-none
    transition-all
    duration-200
    focus:border-[#0F1D24]
    focus:ring-2
    focus:ring-[#0F1D24]/10
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex h-10 flex-shrink-0 flex-nowrap items-center justify-between gap-2 overflow-x-auto rounded border border-[#C6C6C6]/50 bg-white px-2 py-1 shadow-sm"
    >
      <div className="flex flex-shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#0F1D24]">
          <FaFilter className="text-xs text-[#FDC94D]" />
        </div>

        <div className="hidden sm:block">
          <h3 className="text-xs font-bold leading-tight text-[#0F1D24]">
            Loss Time Filters
          </h3>
          <p className="text-[9px] leading-tight text-[#9B9B9B]">
            Filter production loss records
          </p>
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-nowrap items-center gap-1.5">
        <div
          className="flex h-7 flex-shrink-0 cursor-pointer items-center gap-1.5 rounded border border-[#C6C6C6] bg-white px-2 transition-colors hover:border-[#0F1D24]"
          onClick={openPicker}
        >
          <FaCalendarAlt className="text-[10px] text-[#0F1D24]" />
          <input
            ref={dateRef}
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-full w-[104px] border-none bg-transparent text-[11px] text-[#0F1D24] outline-none"
          />
        </div>

        <select
          value={selectedReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className={`${inputClass} max-w-[130px] flex-shrink-0`}
        >
          <option value="">All Reasons</option>
          {reasons.map((reason) => (
            <option key={reason.id} value={reason.id}>
              {reason.name}
            </option>
          ))}
        </select>

        <motion.button
          onClick={onApply}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          className="flex h-7 flex-shrink-0 items-center gap-1.5 rounded bg-[#0F1D24] px-2 text-[11px] font-semibold text-[#FDC94D] transition-colors hover:bg-[#0F1D24]/90"
        >
          <FaFilter size={10} />
          <span className="hidden md:inline">Apply</span>
        </motion.button>

        <motion.button
          onClick={onReset}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          className="flex h-7 flex-shrink-0 items-center gap-1.5 rounded border border-[#C6C6C6] bg-white px-2 text-[11px] font-semibold text-[#0F1D24] transition-colors hover:bg-[#F5F5F5]"
        >
          <FaUndo size={10} />
          <span className="hidden md:inline">Reset</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LossFilters;