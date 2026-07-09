import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaUndo, FaIndustry, FaChevronRight } from "react-icons/fa";

const LossFilters = ({
  fromDate,
  toDate,
  selectedReason,
  selectedHall, // navigation ke liye use hoga (dropdown nahi dikhega)

  reasons,

  onFromDateChange,
  onToDateChange,
  onReasonChange,

  onApply,
  onReset,
}) => {
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const navigate = useNavigate();

  const openPicker = (ref) => {
    if (ref.current?.showPicker) {
      ref.current.showPicker();
    } else {
      ref.current?.focus();
    }
  };

  const handleViewHallData = () => {
    // Route ko apne app ke actual path se replace kar lena
    navigate(`/hall-data/${selectedHall}`);
  };

  const inputClass = `
    h-7
    rounded
    border
    border-slate-300
    bg-white
    px-2
    text-[11px]
    text-slate-700
    outline-none
    transition-all
    duration-200
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-100
  `;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
      {/* Left: Heading */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-100">
          <FaFilter className="text-xs text-blue-600" />
        </div>

        <div>
          <h3 className="text-xs font-semibold leading-tight text-slate-800">
            Loss Time Filters
          </h3>
          <p className="text-[9px] leading-tight text-slate-500">
            Filter production loss records
          </p>
        </div>
      </div>

      {/* Right: Filters + Buttons */}
      <div className="flex flex-wrap items-end gap-2">
        {/* From Date */}
        <div className="cursor-pointer" onClick={() => openPicker(fromDateRef)}>
          <input
            ref={fromDateRef}
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* To Date */}
        <div className="cursor-pointer" onClick={() => openPicker(toDateRef)}>
          <input
            ref={toDateRef}
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Reason */}
        <div>
          <select
            value={selectedReason}
            onChange={(e) => onReasonChange(e.target.value)}
            className={inputClass}
          >
            <option value="">All</option>
            {reasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Apply */}
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
            transition-all
            duration-200
            hover:bg-blue-700
            active:scale-[0.97]
          "
        >
          <FaFilter size={10} />
          Apply
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="
            flex
            h-7
            items-center
            gap-1.5
            rounded
            border
            border-slate-300
            bg-white
            px-2
            text-[11px]
            font-semibold
            text-slate-700
            transition-all
            duration-200
            hover:bg-slate-100
            active:scale-[0.97]
          "
        >
          <FaUndo size={10} />
          Reset
        </button>

        {/* View Hall Data */}
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
            transition-all
            duration-200
            hover:bg-blue-700
            active:scale-[0.97]
          "
        >
          <FaIndustry className="text-[11px]" />
          View Hall Data
          <FaChevronRight className="text-[9px] opacity-70" />
        </button>
      </div>
    </div>
  );
};

export default LossFilters;
