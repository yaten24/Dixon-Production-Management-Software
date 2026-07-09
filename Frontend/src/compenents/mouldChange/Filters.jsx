import React from "react";

import { FaFilter, FaUndo } from "react-icons/fa";

const Filters = ({
  selectedHall,
  setSelectedHall,

  selectedMachine,
  setSelectedMachine,

  machineOptions = [],

  resetFilters,

  activeFilterCount = 0,
}) => {
  const inputClass = `
    h-10
    px-3
    bg-slate-50
    border
    border-slate-200
    text-sm
    outline-none
    focus:border-blue-400
    focus:bg-white
    transition-all
  `;

  return (
    <div className="bg-white shadow-sm p-1">
      {/* Header */}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaFilter className="text-blue-600 text-sm" />

          <h2 className="font-semibold text-slate-700">Filters</h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="
              px-2
              py-1
              bg-blue-50
              text-blue-600
              text-xs
              font-medium
            "
          >
            {activeFilterCount} Active
          </span>

          <button
            onClick={resetFilters}
            className="
              px-2
              py-1
              bg-red-50
              text-red-600
              text-xs
              flex
              items-center
              gap-1
              hover:bg-red-100
              transition
            "
          >
            <FaUndo size={10} />
            Reset
          </button>
        </div>
      </div>

      {/* Filters */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Hall */}

        <select
          value={selectedHall}
          onChange={(e) => setSelectedHall(e.target.value)}
          className={inputClass}
        >
          <option value="All">All Halls</option>

          <option value="Hall-1">Hall-1</option>

          <option value="Hall-2">Hall-2</option>

          <option value="Hall-3">Hall-3</option>

          <option value="Hall-4">Hall-4</option>
        </select>

        {/* Machine */}

        <select
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
          className={inputClass}
        >
          <option value="All">All Machines</option>

          {machineOptions.map((machine) => (
            <option key={machine} value={machine}>
              {machine}
            </option>
          ))}
        </select>

        {/* Quick Reset */}

        <button
          onClick={resetFilters}
          className="
            h-10
            bg-slate-800
            text-white
            text-sm
            font-medium
            hover:bg-slate-900
            transition-all
          "
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;
