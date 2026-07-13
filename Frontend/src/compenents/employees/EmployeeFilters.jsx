import React from "react";
import { FaSearch } from "react-icons/fa";
import { FiPlus, FiRotateCcw, FiDownload } from "react-icons/fi";

const EmployeeFilters = ({
  search,
  setSearch,
  hall,
  setHall,
  shift,
  setShift,
  halls = [],
  shifts = [],
  onAddOperator,
  onResetFilters,
  onExport,
  exporting = false,
}) => {
  const hasActiveFilters = search.trim() !== "" || hall !== "All" || shift !== "All";

  return (
    <div className="bg-white rounded shadow-sm border border-gray-100 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-1.5">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <FaSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Operator Code or Name..."
            className="w-full h-8 pl-8 pr-3 text-xs rounded border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hall */}
        <select
          value={hall}
          onChange={(e) => setHall(e.target.value)}
          className="h-8 px-2.5 text-xs rounded border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Halls</option>
          {halls.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        {/* Shift */}
        <select
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="h-8 px-2.5 text-xs rounded border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Shifts</option>
          {shifts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Reset */}
        <button
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
          className="flex items-center justify-center gap-1.5 h-8 px-3 rounded border border-gray-200 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiRotateCcw size={13} />
          Reset
        </button>

        {/* Export + Add */}
        <div className="flex gap-1.5">
          <button
            onClick={onExport}
            disabled={exporting}
            title={hasActiveFilters ? "Export filtered data" : "Export all data"}
            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded border border-green-600 text-xs font-medium text-green-700 transition hover:bg-green-50 disabled:opacity-50 flex-1"
          >
            <FiDownload size={13} />
            {exporting ? "..." : "Export"}
          </button>

          <button
            onClick={onAddOperator}
            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded bg-blue-600 text-xs font-medium text-white transition hover:bg-blue-700 flex-1"
          >
            <FiPlus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilters;
