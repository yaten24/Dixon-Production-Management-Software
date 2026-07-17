import React from "react";
import {
  FaFilter,
  FaTimes,
  FaSyncAlt,
  FaHistory,
  FaFileExcel,
  FaThLarge,
  FaCheck,
} from "react-icons/fa";

const RejectionFilters = ({
  selectedDate,
  setSelectedDate,

  selectedReason,
  setSelectedReason,

  reasonOptions = [], // [{ id, label }]

  onApply,
  onRefresh,
  onShowRecent,
  onExport,
  onShowHeatmap,
}) => {
  const handleReset = () => {
    setSelectedDate("");
    setSelectedReason("All");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
      {/* Icon + Label */}
      <div className="flex items-center gap-2 pr-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <FaFilter className="text-[11px] text-white" />
        </div>
        <span className="text-xs font-semibold text-slate-700">Filters</span>
      </div>

      {/* Single Date Picker */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="
          h-7
          rounded
          border
          border-slate-200
          px-2
          text-[11px]
          text-slate-700
          outline-none
          transition-colors
          focus:border-blue-400
        "
      />

      {/* Rejection Reason Dropdown */}
      <select
        value={selectedReason}
        onChange={(e) => setSelectedReason(e.target.value)}
        className="
          h-7
          rounded
          border
          border-slate-200
          px-2
          text-[11px]
          text-slate-700
          outline-none
          transition-colors
          focus:border-blue-400
        "
      >
        <option value="All">All Reasons</option>
        {reasonOptions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Actions */}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          onClick={onApply}
          className="
            flex
            h-7
            items-center
            gap-1.5
            rounded
            bg-blue-600
            px-2
            text-[11px]
            font-semibold
            text-white
            shadow-sm
            transition-all
            hover:bg-blue-700
            active:scale-[0.97]
          "
        >
          <FaCheck className="text-[10px]" />
          Apply Filters
        </button>

        <button
          onClick={onRefresh}
          className="
            flex
            h-7
            items-center
            gap-1.5
            rounded
            border
            border-slate-200
            bg-slate-50
            px-2
            text-[11px]
            font-semibold
            text-slate-600
            transition-all
            hover:bg-slate-100
            active:scale-[0.97]
          "
        >
          <FaSyncAlt className="text-[10px]" />
          Refresh
        </button>

        <button
          onClick={onShowRecent}
          className="
            flex
            h-7
            items-center
            gap-1.5
            rounded
            border
            border-indigo-200
            bg-indigo-50
            px-2
            text-[11px]
            font-semibold
            text-indigo-600
            transition-all
            hover:bg-indigo-100
            active:scale-[0.97]
          "
        >
          <FaHistory className="text-[10px]" />
          Recent Rejections
        </button>

        <button
          onClick={onExport}
          className="
            flex
            h-7
            items-center
            gap-1.5
            rounded
            border
            border-green-200
            bg-green-50
            px-2
            text-[11px]
            font-semibold
            text-green-700
            transition-all
            hover:bg-green-100
            active:scale-[0.97]
          "
        >
          <FaFileExcel className="text-[10px]" />
          Export Excel
        </button>

        <button
          onClick={onShowHeatmap}
          className="
            flex
            h-7
            items-center
            gap-1.5
            rounded
            border
            border-amber-200
            bg-amber-50
            px-2
            text-[11px]
            font-semibold
            text-amber-700
            transition-all
            hover:bg-amber-100
            active:scale-[0.97]
          "
        >
          <FaThLarge className="text-[10px]" />
          Heatmap
        </button>

        <button
          onClick={handleReset}
          className="
            flex
            h-7
            items-center
            gap-1.5
            rounded
            border
            border-red-200
            bg-red-50
            px-2
            text-[11px]
            font-semibold
            text-red-600
            transition-all
            hover:border-red-300
            hover:bg-red-100
            active:scale-[0.97]
          "
        >
          <FaTimes className="text-[10px]" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default RejectionFilters;