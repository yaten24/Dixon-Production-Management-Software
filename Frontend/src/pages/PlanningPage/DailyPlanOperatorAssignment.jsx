import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X, Loader2, Check, AlertTriangle, Lock } from "lucide-react";
import useDailyPlanOperatorAssignment from "../../hooks/useDailyPlanOperatorAssignment";
import { searchOperators } from "../../api/operatorApi";

const STATUS_COLORS = {
  Draft: "bg-[#9B9B9B]/15 text-[#0F1D24]",
  Published: "bg-[#FDC94D]/25 text-[#0F1D24]",
  Completed: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-700",
};

// ==========================================================
// Animated starfield background — pure CSS, no library
// ==========================================================
const StarsBackground = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i, 
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.6,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 2,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes opaTwinkle {
          0%, 100% { opacity: 0.12; transform: scale(0.8); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
      `}</style>
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "9999px",
            background: "#0F1D24",
            animation: `opaTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Per-row operator picker. Self-contained (own search state, own
 * debounce, own request-race guard) so one row's in-flight search
 * never clobbers another row's results.
 */
const OperatorPicker = ({ row, disabled, onAssign, onClear }) => {
  const [query, setQuery] = useState(row.operator_name || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [rowError, setRowError] = useState("");

  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => { setQuery(row.operator_name || ""); }, [row.operator_name]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => () => debounceRef.current && clearTimeout(debounceRef.current), []);

  const handleSearch = useCallback((value) => {
    setQuery(value);
    setRowError("");
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const thisRequestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchOperators(value);
        if (thisRequestId === requestIdRef.current) {
          setResults(res.data || []);
          setSearching(false);
        }
      } catch {
        if (thisRequestId === requestIdRef.current) {
          setResults([]);
          setSearching(false);
        }
      }
    }, 300);
  }, []);

  const handleSelect = async (operator) => {
    setOpen(false);
    setResults([]);
    setRowError("");
    const res = await onAssign(operator);
    if (!res.ok) {
      setRowError(res.message);
      setQuery(row.operator_name || "");
    } else {
      setQuery(operator.operator_name);
    }
  };

  const handleClear = async () => {
    setRowError("");
    const res = await onClear();
    if (!res.ok) setRowError(res.message);
    else setQuery("");
  };

  // BUG FIX: previously only reopened the dropdown on focus when stale
  // results already existed — a query with zero matches ("no results"
  // state) or a freshly-cleared input never reopened on refocus. Now it
  // reopens whenever there's a query worth showing feedback for.
  const handleFocus = () => {
    if (results.length > 0 || query.trim()) setOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            value={query}
            disabled={disabled}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            placeholder={disabled ? "Locked" : "Search operator"}
            className="h-7 w-full rounded-sm border border-[#C6C6C6] py-1 pl-6 pr-6 text-[11.5px] outline-none transition-colors focus:border-[#0F1D24] disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#9B9B9B]"
          />
          {searching && (
            <Loader2 className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-[#9B9B9B]" />
          )}
          {!searching && row.operator_code && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Unassign operator"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B9B9B] transition-colors hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex h-7 w-5 flex-shrink-0 items-center justify-center">
          {row.saveState === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9B9B9B]" />}
          {row.saveState === "saved" && (
            <Check className="h-3.5 w-3.5 text-green-600" style={{ animation: "opaPop 0.3s ease-out both" }} />
          )}
          {row.saveState === "error" && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
        </div>
      </div>

      {open && results.length > 0 && (
        <ul
          style={{ animation: "opaDropIn 0.15s ease-out both" }}
          className="absolute left-0 top-8 z-30 max-h-40 w-56 overflow-y-auto rounded-sm border border-[#C6C6C6] bg-white shadow-lg"
        >
          {results.map((op) => (
            <li
              key={op.operator_code}
              onClick={() => handleSelect(op)}
              className="cursor-pointer border-b border-[#C6C6C6]/40 px-2.5 py-1.5 text-[11px] transition-colors last:border-b-0 hover:bg-[#FDC94D]/20"
            >
              <div className="font-semibold text-[#0F1D24]">{op.operator_name}</div>
              <div className="font-mono text-[9.5px] text-[#9B9B9B]">{op.operator_code}</div>
            </li>
          ))}
        </ul>
      )}

      {open && !searching && query.trim() && results.length === 0 && (
        <div
          style={{ animation: "opaDropIn 0.15s ease-out both" }}
          className="absolute left-0 top-8 z-30 w-56 rounded-sm border border-[#C6C6C6] bg-white px-2.5 py-2 text-[10.5px] text-[#9B9B9B] shadow-lg"
        >
          No operators match "{query}"
        </div>
      )}

      {rowError && <p className="mt-1 text-[10px] font-medium text-red-600">{rowError}</p>}
    </div>
  );
};

// ==========================================================
// Machine row — compact card, replaces the old <table> row so the
// operator dropdown never gets clipped by a horizontal-scroll wrapper.
// ==========================================================
const MachineRow = ({ row, index, disabled, onAssign, onClear }) => (
  <div
    style={{ animation: `opaRowIn 0.25s ease-out ${index * 0.03}s both` }}
    className="grid grid-cols-1 items-center gap-2 rounded-sm border border-[#C6C6C6]/60 bg-white px-2.5 py-2 transition-shadow hover:shadow-[0_2px_8px_-2px_rgba(15,29,36,0.12)] sm:grid-cols-[1fr_1fr_70px_200px]"
  >
    <div className="min-w-0">
      <p className="truncate font-mono text-[11.5px] font-semibold text-[#0F1D24]">{row.machine_code}</p>
      <p className="truncate text-[10px] text-[#9B9B9B]">{row.machine_name}</p>
    </div>
    <div className="min-w-0">
      <p className="truncate font-mono text-[11px] text-[#0F1D24]">{row.part_number}</p>
      <p className="truncate text-[10px] text-[#9B9B9B]">{row.part_name}</p>
    </div>
    <div className="text-left font-mono text-[11.5px] font-semibold text-[#0F1D24] sm:text-right">
      {row.target_qty}
    </div>
    <OperatorPicker row={row} disabled={disabled} onAssign={onAssign} onClear={onClear} />
  </div>
);

export default function DailyPlanOperatorAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { header, rows, loading, error, isEditable, assignOperator, clearOperator } = useDailyPlanOperatorAssignment(id);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#F7F7F5]">
        <StarsBackground />
        <p className="relative z-10 text-[12px] text-[#9B9B9B]">Loading machine assignments...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#F7F7F5]">
        <StarsBackground />
        <p className="relative z-10 text-[12px] font-semibold text-red-600">{error}</p>
      </div>
    );
  }
  if (!header) return null;

  const assignedCount = rows.filter((r) => r.operator_code).length;

  return (
    <div className="relative min-h-screen bg-[#F7F7F5] p-2.5">
      <style>{`
        @keyframes opaRowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes opaDropIn { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes opaPop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes opaFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <StarsBackground />

      <div className="relative z-10 mx-auto w-full">
        {/* Header */}
        <div
          style={{ animation: "opaFadeIn 0.25s ease-out both" }}
          className="mb-1 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#C6C6C6]/70 bg-white p-2"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-[#C6C6C6]/70 bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div>
              <h1 className="text-[13px] font-bold leading-tight text-[#0F1D24]">
                {header.plan_number} <span className="font-normal text-[#9B9B9B]">— Operator Assignment</span>
              </h1>
              <p className="text-[10px] text-[#9B9B9B]">
                {header.planning_date} · {header.hall} · Shift {header.shift}
              </p>
            </div>
          </div>
          <span className={`rounded-sm px-2 py-0.5 text-[10.5px] font-bold ${STATUS_COLORS[header.status] || STATUS_COLORS.Draft}`}>
            {header.status}
          </span>
        </div>

        {!isEditable && (
          <div
            style={{ animation: "opaFadeIn 0.25s ease-out 0.05s both" }}
            className="mb-1 flex items-center gap-2 rounded-sm border border-[#C6C6C6] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0F1D24]"
          >
            <Lock className="h-3.5 w-3.5 flex-shrink-0 text-[#9B9B9B]" />
            This plan is {header.status.toLowerCase()} — assignments are locked and read-only.
          </div>
        )}

        {/* Summary */}
        <div
          style={{ animation: "opaFadeIn 0.25s ease-out 0.1s both" }}
          className="mb-1 flex flex-wrap gap-3 rounded-sm border border-[#C6C6C6] bg-white px-2.5 py-1.5 text-[11px] font-mono text-[#0F1D24]"
        >
          <span>Machines: <b>{rows.length}</b></span>
          <span>Assigned: <b className="text-green-600">{assignedCount}</b></span>
          <span>Unassigned: <b className="text-red-500">{rows.length - assignedCount}</b></span>
        </div>

        {/* Machine rows — compact cards, no table/no overflow clipping */}
        <div className="space-y-1.5">
          {rows.map((row, i) => (
            <MachineRow
              key={row.daily_detail_id}
              row={row}
              index={i}
              disabled={!isEditable}
              onAssign={(op) => assignOperator(row.daily_detail_id, op)}
              onClear={() => clearOperator(row.daily_detail_id)}
            />
          ))}
          {rows.length === 0 && (
            <div className="rounded-sm border border-dashed border-[#C6C6C6] bg-white py-8 text-center text-[11px] text-[#9B9B9B]">
              No machines in this plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}