import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Themed to match navy #0F1D24 / gold #FDC94D / gray #9B9B9B / border #C6C6C6
const CustomSelect = ({ label, icon: Icon, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-[10px] font-semibold text-[#9B9B9B] mb-1 block uppercase tracking-wide">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-7 border rounded pl-7 pr-7 text-[11px] flex items-center relative transition ${
          open
            ? "border-[#0F1D24] ring-1 ring-[#0F1D24]"
            : "border-[#C6C6C6]/60 hover:border-[#0F1D24]/40"
        }`}
      >
        {Icon && <Icon className="absolute left-2.5 text-[#9B9B9B]" size={12} />}
        <span className="text-[#0F1D24] font-medium truncate">{value}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="absolute right-2.5 text-[#9B9B9B]"
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1 w-full bg-white border border-[#C6C6C6]/50 rounded shadow-[0_8px_20px_-6px_rgba(15,29,36,0.18)] overflow-hidden"
          >
            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-1.5 text-[11px] cursor-pointer transition ${
                    isSelected
                      ? "bg-[#0F1D24] text-[#FDC94D] font-semibold"
                      : "text-[#0F1D24] hover:bg-[#FAFAF9]"
                  }`}
                >
                  {opt}
                  {isSelected && <Check size={12} />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;