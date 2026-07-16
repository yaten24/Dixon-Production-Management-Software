import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaUndo, FaIndustry, FaChevronRight, FaSearch } from "react-icons/fa";
import { getAllMachines } from "../../api/lossTimeApi";

// Searchable combobox for picking one of the 85 machines
const MachineFilter = ({ value, onChange }) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      getAllMachines(query)
        .then(setOptions)
        .catch((err) => console.error("Machine search failed:", err));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!value) setSelectedLabel("");
  }, [value]);

  return (
    <div className="relative" ref={boxRef}>
      <div
        className="flex h-7 w-44 cursor-text items-center gap-1 rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
        onClick={() => setOpen(true)}
      >
        <FaSearch className="shrink-0 text-[9px] text-slate-400" />
        <input
          type="text"
          placeholder="Search machine..."
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange("");
          }}
          className="w-full bg-transparent outline-none"
        />
      </div>

      {open && (
        <div className="absolute z-40 mt-1 max-h-48 w-56 overflow-y-auto rounded border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
              setSelectedLabel("");
              setOpen(false);
            }}
            className="block w-full px-2 py-1 text-left text-[11px] text-slate-500 hover:bg-slate-50"
          >
            All Machines
          </button>
          {options.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => {
                onChange(String(m.id));
                setQuery("");
                setSelectedLabel(m.name);
                setOpen(false);
              }}
              className="block w-full truncate px-2 py-1 text-left text-[11px] text-slate-700 hover:bg-blue-50"
            >
              {m.name} <span className="text-slate-400">· {m.hall}</span>
            </button>
          ))}
          {options.length === 0 && (
            <p className="px-2 py-1 text-[10px] text-slate-400">No machines found</p>
          )}
        </div>
      )}
    </div>
  );
};

const LossFilters = ({
  selectedReason,
  selectedMachine,
  selectedHall, // used for "View Hall Data" navigation only

  reasons,

  onReasonChange,
  onMachineChange,

  onApply,
  onReset,
}) => {
  const navigate = useNavigate();

  const handleViewHallData = () => {
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
        {/* Machine (searchable, 85 machines) */}
        <MachineFilter value={selectedMachine} onChange={onMachineChange} />

        {/* Reason */}
        <div>
          <select
            value={selectedReason}
            onChange={(e) => onReasonChange(e.target.value)}
            className={inputClass}
          >
            <option value="">All Reasons</option>
            {reasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.name}
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