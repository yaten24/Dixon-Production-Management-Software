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
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative mb-1 rounded border border-[#C6C6C6]/50 bg-white p-1 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          {/* LEFT: Prev button */}
          <motion.button
            onClick={handlePrev}
            disabled={isFirst}
            whileHover={!isFirst ? { scale: 1.05 } : {}}
            whileTap={!isFirst ? { scale: 0.92 } : {}}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#C6C6C6] text-[#9B9B9B] transition-colors hover:bg-[#F5F5F5] hover:text-[#0F1D24] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FaChevronLeft size={12} />
          </motion.button>

          {/* CENTER: Machine info (click to open dropdown) */}
          <div className="relative min-w-0 flex-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex w-full min-w-0 items-center gap-2.5 rounded px-1 py-0.5 transition-colors hover:bg-[#F5F5F5]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#0F1D24]">
                <FaMicrochip className="text-sm text-[#FDC94D]" />
              </div>

              <div className="min-w-0 flex-1 text-left">
                <h2 className="truncate text-sm font-bold leading-tight text-[#0F1D24]">
                  {currentMachine?.name}
                </h2>
                <p className="text-[10px] leading-tight text-[#9B9B9B]">
                  Machine ID: {currentMachine?.id}
                </p>
              </div>

              <FaChevronDown
                size={10}
                className={`shrink-0 text-[#9B9B9B] transition-transform ${
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
                  className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded border border-[#C6C6C6]/70 bg-white shadow-lg"
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
                            ? "bg-[#0F1D24]/8 text-[#0F1D24]"
                            : "text-[#0F1D24]/80 hover:bg-[#F5F5F5]"
                        }`}
                      >
                        <span className="w-5 shrink-0 font-mono text-[10px] text-[#9B9B9B]">
                          {idx + 1}
                        </span>
                        <span className="flex-1 truncate text-xs font-medium">
                          {m.name}
                        </span>
                        <span className="shrink-0 text-[9px] text-[#9B9B9B]">
                          {m.id}
                        </span>
                        {done && (
                          <FaCheckCircle className="shrink-0 text-[10px] text-emerald-500" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Counter + status */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="text-right leading-tight">
              <div className="text-sm font-bold text-[#0F1D24]">
                {currentMachineIndex + 1}
                <span className="font-medium text-[#C6C6C6]"> / </span>
                <span className="text-xs font-semibold text-[#9B9B9B]">
                  {filteredMachines.length}
                </span>
              </div>
              <div className="text-[9px] uppercase tracking-wide text-[#9B9B9B]">
                Machine
              </div>
            </div>

            {isDone && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
              >
                <FaCheckCircle className="shrink-0 text-base text-emerald-500" />
              </motion.div>
            )}

            {/* Next button */}
            <motion.button
              onClick={handleNext}
              disabled={isLast}
              whileHover={!isLast ? { scale: 1.05 } : {}}
              whileTap={!isLast ? { scale: 0.92 } : {}}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#C6C6C6] text-[#9B9B9B] transition-colors hover:bg-[#F5F5F5] hover:text-[#0F1D24] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FaChevronRight size={12} />
            </motion.button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 overflow-hidden rounded bg-[#C6C6C6]/40">
          <motion.div
            className="h-full rounded bg-[#FDC94D]"
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