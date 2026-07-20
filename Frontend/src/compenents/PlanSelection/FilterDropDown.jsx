import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const options = ['All Plans', 'Daily', 'Weekly', 'Monthly', 'Custom'];

export default function FilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-100"
      >
        {value}
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Filter plan types"
          className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                {opt}
                {value === opt && <Check size={14} className="text-blue-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}