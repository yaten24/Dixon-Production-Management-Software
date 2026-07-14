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
        className="w-full h-8 rounded-sm border border-[#E2E4E9] px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white rounded-sm border border-[#E2E4E9] shadow-md">
          {loading && (
            <div className="px-2.5 py-1.5 text-xs text-gray-400">Searching...</div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-2.5 py-1.5 text-xs text-gray-400">No parts found</div>
          )}

          {!loading &&
            results.map((p) => (
              <div
                key={p.id}
                onClick={() => handlePick(p)}
                className="px-2.5 py-1.5 text-xs hover:bg-blue-50 cursor-pointer flex justify-between gap-2"
              >
                <span className="font-mono text-gray-500">{p.part_number}</span>
                <span className="text-gray-700 truncate">{p.part_name}</span>
                <span className="font-mono text-gray-400">
                  {p.cycle_time ?? p.standard_cycle_time ?? "--"}s
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PartSearchSelect;