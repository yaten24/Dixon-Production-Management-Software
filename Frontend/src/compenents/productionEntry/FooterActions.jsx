import React from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaSave } from "react-icons/fa";

const FooterActions = ({
  currentMachineIndex,
  filteredMachines,
  previousMachine,
  nextMachine,
  finalSubmit,
  submitting = false,
}) => {
  const isFirstMachine = currentMachineIndex === 0;
  const isLastMachine = currentMachineIndex === filteredMachines.length - 1;

  return (
    <div className="mt-4 border-t border-[#C6C6C6]/50 pt-3">
      {/* NAVIGATION */}
      <div className="grid grid-cols-2 gap-2">
        {/* PREVIOUS */}
        <motion.button
          type="button"
          onClick={previousMachine}
          disabled={isFirstMachine || submitting}
          whileHover={!isFirstMachine && !submitting ? { y: -1 } : {}}
          whileTap={!isFirstMachine && !submitting ? { scale: 0.97 } : {}}
          className="
            flex
            h-9
            items-center
            justify-center
            gap-1.5
            rounded
            border
            border-[#C6C6C6]
            bg-white
            text-sm
            font-semibold
            text-[#0F1D24]
            transition-colors
            duration-200
            hover:border-[#0F1D24]
            hover:bg-[#F5F5F5]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <FaChevronLeft className="text-xs" />
          Previous
        </motion.button>

        {/* NEXT — hidden on the last machine, replaced by Save Entry below */}
        {!isLastMachine && (
          <motion.button
            type="button"
            onClick={nextMachine}
            disabled={submitting}
            whileHover={!submitting ? { y: -1 } : {}}
            whileTap={!submitting ? { scale: 0.97 } : {}}
            className="
              flex
              h-9
              items-center
              justify-center
              gap-1.5
              rounded
              bg-[#0F1D24]
              text-sm
              font-semibold
              text-[#FDC94D]
              shadow-sm
              transition-colors
              duration-200
              hover:bg-[#0F1D24]/90
              disabled:cursor-not-allowed
              disabled:bg-[#C6C6C6]
              disabled:text-white
            "
          >
            Save & Next
            <FaChevronRight className="text-xs" />
          </motion.button>
        )}

        {/* SAVE ENTRY — only on the last machine, saves just THIS entry.
            No more looping back over every previously-saved machine — 
            each one already saved itself via "Save & Next". */}
        {isLastMachine && (
          <motion.button
            type="button"
            onClick={finalSubmit}
            disabled={submitting}
            whileHover={!submitting ? { y: -1 } : {}}
            whileTap={!submitting ? { scale: 0.97 } : {}}
            className="
              flex
              h-9
              items-center
              justify-center
              gap-1.5
              rounded
              bg-emerald-600
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-colors
              duration-200
              hover:bg-emerald-700
              disabled:cursor-not-allowed
              disabled:bg-emerald-300
            "
          >
            <motion.span
              animate={submitting ? { rotate: 360 } : { rotate: 0 }}
              transition={submitting ? { duration: 0.8, repeat: Infinity, ease: "linear" } : {}}
              className="flex"
            >
              <FaSave className="text-xs" />
            </motion.span>
            {submitting ? "Saving..." : "Save Entry"}
          </motion.button>
        )}
      </div>

      {/* STATUS */}
      <motion.div
        key={currentMachineIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mt-2 text-center text-xs text-[#9B9B9B]"
      >
        Machine <span className="font-semibold text-[#0F1D24]">{currentMachineIndex + 1}</span>{" "}
        of <span className="font-semibold text-[#0F1D24]">{filteredMachines.length}</span>
      </motion.div>
    </div>
  );
};

export default FooterActions;