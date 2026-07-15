import { useState, useEffect, useRef } from "react";
import { searchParts } from "../../api/partApi";

const PartSearchSelect = ({ value, valueName, onSelect }) => {
  const [query, setQuery] = useState(value ? `${value} - ${valueName || ""}` : "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    setQuery(value ? `${value} - ${valueName || ""}` : "");
  }, [value, valueName]);

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    // don't search if empty, or if the box still shows the already-selected value untouched
    if (!query || (value && query === `${value} - ${valueName || ""}`)) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchParts(query);

        // ⚠️ defensive: handle both raw-array responses AND { success, data: [...] } wrapper
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

        setResults(list);
        setOpen(true);
      } catch (err) {
        console.log("Part search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handlePick = (part) => {
    setQuery(`${part.part_number} - ${part.part_name}`);
    setOpen(false);
    onSelect({
      id: part.id,
      cycle_time: part.cycle_time ?? part.standard_cycle_time ?? "",
      actual_cycle_time: part.actual_cycle_time ?? "",
      part_number: part.part_number,
      part_name: part.part_name,
    });
  };

  return (
    <div className="relative" ref={boxRef}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!e.target.value) {
            onSelect(null);
            setResults([]);
          }
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search part (number/name)..."
        className="w-full h-8 rounded border border-[#C6C6C6]/60 px-2.5 text-xs text-[#0F1D24] placeholder:text-[#9B9B9B] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0F1D24] focus:border-[#0F1D24]"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded border border-[#C6C6C6]/60 bg-white shadow-md">
          {loading && (
            <div className="px-2.5 py-1.5 text-xs text-[#9B9B9B]">Searching...</div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-2.5 py-1.5 text-xs text-[#9B9B9B]">No parts found</div>
          )}

          {!loading &&
            results.map((p) => {
              const isSelected = p.part_number === value;
              return (
                <div
                  key={p.id}
                  onClick={() => handlePick(p)}
                  className={`flex cursor-pointer justify-between gap-2 px-2.5 py-1.5 text-xs transition-colors ${
                    isSelected ? "bg-[#0F1D24]/8" : "hover:bg-[#FDC94D]/15"
                  }`}
                >
                  <span className="font-mono text-[#9B9B9B]">{p.part_number}</span>
                  <span className="truncate font-medium text-[#0F1D24]">{p.part_name}</span>
                  <span className="font-mono text-[#9B9B9B]">
                    {p.cycle_time ?? p.standard_cycle_time ?? "--"}s
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default PartSearchSelect;