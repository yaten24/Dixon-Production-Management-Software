import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaTimes, FaIndustry, FaChevronRight } from "react-icons/fa";
import DateRangeFilter from "../DateRangeFilter";

const RejectionFilters = ({
  selectedHall,
  setSelectedHall,

  selectedShift,
  setSelectedShift,

  selectedReason,
  setSelectedReason,

  fromDate,
  setFromDate,

  toDate,
  setToDate,
}) => {
  const navigate = useNavigate();

  const handleReset = () => {
    setFromDate("");
    setToDate("");
  };

  const handleViewHallData = () => {
    // Route ko apne app ke actual path se replace kar lena
    navigate(`/hall-data/${selectedHall}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1 shadow-sm">
      {/* Icon + Label */}
      <div className="flex items-center gap-2 pr-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <FaFilter className="text-[11px] text-white" />
        </div>
        <span className="text-xs font-semibold text-slate-700">Filters</span>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        

      {/* Date Range */}
      <div className="flex-1">
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          compact
        />
      </div>
        <button
          onClick={handleViewHallData}
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
          <FaIndustry className="text-[11px]" />
          View Hall Data
          <FaChevronRight className="text-[9px] opacity-70" />
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