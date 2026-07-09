import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrochip,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";

const MachineNavigator = ({
  filteredMachines,
  machineEntries,
  currentMachineIndex,
  setCurrentMachineIndex,
  saveCurrentMachine,
  loadMachineData,
  currentMachine,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isFirst = currentMachineIndex === 0;
  const isLast = currentMachineIndex === filteredMachines.length - 1;

  const goTo = (index) => {
    if (index < 0 || index >= filteredMachines.length) return;

    saveCurrentMachine?.(currentMachine?.id);
    setCurrentMachineIndex(index);
    loadMachineData?.(filteredMachines[index]);
    setDropdownOpen(false);
  };

  const handlePrev = () => goTo(currentMachineIndex - 1);
  const handleNext = () => goTo(currentMachineIndex + 1);

  const isDone = !!machineEntries[currentMachine?.id];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentMachine?.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white border border-slate-200 rounded shadow-sm p-1 mb-1"
      >
        <div className="flex justify-between items-center gap-2">
          {/* LEFT: Prev button */}
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FaChevronLeft size={12} />
          </button>

          {/* CENTER: Machine info (click to open dropdown) */}
          <div className="relative flex-1 min-w-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex w-full items-center gap-2.5 min-w-0 rounded px-1 py-0.5 hover:bg-slate-50 transition-colors"
            >
              <div className="h-8 w-8 shrink-0 rounded bg-blue-100 flex items-center justify-center">
                <FaMicrochip className="text-blue-600 text-sm" />
              </div>

              <div className="min-w-0 text-left flex-1">
                <h2 className="text-sm font-bold text-slate-800 truncate leading-tight">
                  {currentMachine?.name}
                </h2>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Machine ID: {currentMachine?.id}
                </p>
              </div>

              <FaChevronDown
                size={10}
                className={`text-slate-400 shrink-0 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN LIST */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded border border-slate-200 bg-white shadow-lg z-20"
                >
                  {filteredMachines.map((m, idx) => {
                    const done = !!machineEntries[m.id];
                    const active = idx === currentMachineIndex;
                    return (
                      <button
                        key={m.id}
                        onClick={() => goTo(idx)}
                        className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="text-[10px] font-mono w-5 shrink-0 text-slate-400">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium truncate flex-1">
                          {m.name}
                        </span>
                        <span className="text-[9px] text-slate-400 shrink-0">
                          {m.id}
                        </span>
                        {done && (
                          <FaCheckCircle className="text-green-500 text-[10px] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Counter + status */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="text-right leading-tight">
              <div className="text-sm font-bold text-blue-600">
                {currentMachineIndex + 1}
                <span className="text-slate-300 font-medium"> / </span>
                <span className="text-slate-500 text-xs font-semibold">
                  {filteredMachines.length}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wide">
                Machine
              </div>
            </div>

            {isDone && (
              <FaCheckCircle className="text-green-500 text-base shrink-0" />
            )}

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={isLast}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 bg-slate-100 rounded overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded"
            initial={false}
            animate={{
              width: `${
                ((currentMachineIndex + 1) / filteredMachines.length) * 100
              }%`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MachineNavigator;
