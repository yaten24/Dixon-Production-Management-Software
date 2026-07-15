import React, { useEffect, useRef, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";

const ThemedDropdown = ({ icon: Icon, value, options, onChange, ariaLabel, placeholder = "Select" }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selected = options.find((o) => o.code === value);

  return (
    <div ref={containerRef} className="relative min-w-[120px] flex-1 basis-[120px] md:w-[160px] md:flex-none md:basis-auto">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-full items-center gap-1.5 rounded border bg-white pl-2 pr-2 text-xs font-medium text-[#0F1D24] outline-none transition-all ${
          open ? "border-[#0F1D24] ring-2 ring-[#0F1D24]/10" : "border-[#C6C6C6] hover:border-[#0F1D24]"
        }`}
      >
        {Icon && <Icon className="shrink-0 text-[10px] text-[#0F1D24]" />}
        <span className="min-w-0 flex-1 truncate text-left">{selected ? selected.label : placeholder}</span>
        <FaChevronDown className={`shrink-0 text-[9px] text-[#9B9B9B] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-56 w-full min-w-[180px] overflow-y-auto rounded border border-[#C6C6C6]/70 bg-white py-1 shadow-lg">
          {options.map((o) => {
            const isSelected = o.code === value;
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => {
                  onChange(o.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isSelected ? "bg-[#0F1D24]/8 font-semibold text-[#0F1D24]" : "text-[#0F1D24]/80 hover:bg-[#F5F5F5]"
                }`}
              >
                <span className="min-w-0 truncate">{o.label}</span>
                {isSelected && <FaCheck className="shrink-0 text-[9px] text-[#FDC94D]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemedDropdown;