import React from "react";
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
    <div className="mt-4 border-t border-slate-200 pt-3">
      {/* NAVIGATION */}
      <div className="grid grid-cols-2 gap-2">
        {/* PREVIOUS */}
        <button
          type="button"
          onClick={previousMachine}
          disabled={isFirstMachine || submitting}
          className="
            h-9
            rounded-full
            bg-slate-800
            hover:bg-slate-900
            text-white
            text-sm
            font-medium
            disabled:bg-slate-300
            disabled:cursor-not-allowed
            transition-colors
            duration-150
            flex
            items-center
            justify-center
            gap-1.5
          "
        >
          <FaChevronLeft className="text-xs" />
          Previous
        </button>

        {/* NEXT — hidden on the last machine, replaced by Save Entry below */}
        {!isLastMachine && (
          <button
            type="button"
            onClick={nextMachine}
            disabled={submitting}
            className="
              h-9
              rounded-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm
              font-medium
              disabled:bg-slate-300
              disabled:cursor-not-allowed
              transition-colors
              duration-150
              flex
              items-center
              justify-center
              gap-1.5
            "
          >
            Save & Next
            <FaChevronRight className="text-xs" />
          </button>
        )}

        {/* SAVE ENTRY — only on the last machine, saves just THIS entry.
            No more looping back over every previously-saved machine — 
            each one already saved itself via "Save & Next". */}
        {isLastMachine && (
          <button
            type="button"
            onClick={finalSubmit}
            disabled={submitting}
            className="
              h-9
              rounded-full
              bg-green-600
              hover:bg-green-700
              text-white
              text-sm
              font-semibold
              disabled:bg-green-300
              disabled:cursor-not-allowed
              transition-colors
              duration-150
              flex
              items-center
              justify-center
              gap-1.5
            "
          >
            <FaSave className="text-xs" />
            {submitting ? "Saving..." : "Save Entry"}
          </button>
        )}
      </div>

      {/* STATUS */}
      <div className="mt-2 text-center text-xs text-slate-500">
        Machine <span className="font-semibold">{currentMachineIndex + 1}</span>{" "}
        of <span className="font-semibold">{filteredMachines.length}</span>
      </div>
    </div>
  );
};

export default FooterActions;