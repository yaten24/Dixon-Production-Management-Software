import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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

        {/* NEXT */}
        <button
          type="button"
          onClick={nextMachine}
          disabled={isLastMachine || submitting}
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
      </div>

      {/* SUBMIT BUTTON */}
      {isLastMachine && (
        <button
          type="button"
          onClick={finalSubmit}
          disabled={submitting}
          className="
            w-full
            h-10
            mt-2
            rounded-full
            bg-green-600
            hover:bg-green-700
            text-white
            font-semibold
            text-sm
            disabled:bg-green-300
            disabled:cursor-not-allowed
            transition-colors
            duration-150
          "
        >
          {submitting ? "Submitting..." : "Submit All Entries"}
        </button>
      )}

      {/* STATUS */}
      <div className="mt-2 text-center text-xs text-slate-500">
        Machine <span className="font-semibold">{currentMachineIndex + 1}</span>{" "}
        of <span className="font-semibold">{filteredMachines.length}</span>
      </div>
    </div>
  );
};

export default FooterActions;