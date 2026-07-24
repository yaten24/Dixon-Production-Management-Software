import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X, Loader2, Check, AlertTriangle, Lock, Users } from "lucide-react";
import useDailyPlanOperatorAssignment from "../../hooks/useDailyPlanOperatorAssignment";
import { searchOperators } from "../../api/operatorApi";

const STATUS_COLORS = {
  Draft: "bg-[#9B9B9B]/15 text-[#0F1D24]",
  Published: "bg-[#FDC94D]/25 text-[#0F1D24]",
  Completed: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-700",
};

// ============================================================
// Stat card — matches the metrics-row pattern used elsewhere.
// ============================================================
const StatCard = ({ value, label, valueClassName = "text-[#0F1D24]" }) => (
  <div className="flex-1 border border-[#C6C6C6] bg-white px-4 py-3">
    <p className={`text-xl font-bold leading-none ${valueClassName}`}>{value}</p>
    <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
  </div>
);

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

  // Reopens the dropdown on refocus whenever there's a query worth showing
  // feedback for — including a zero-match state, not just stale results.
  const handleFocus = () => {
    if (results.length > 0 || query.trim()) setOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            value={query}
            disabled={disabled}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            placeholder={disabled ? "Locked" : "Search operator"}
            className="h-8 w-full border border-[#C6C6C6] py-1 pl-6 pr-6 text-[11.5px] outline-none transition-colors duration-100 focus:border-[#0F1D24] disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#9B9B9B]"
          />
          {searching && (
            <Loader2 className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-[#9B9B9B]" />
          )}
          {!searching && row.operator_code && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Unassign operator"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B9B9B] transition-colors duration-100 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex h-8 w-5 flex-shrink-0 items-center justify-center">
          {row.saveState === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9B9B9B]" />}
          {row.saveState === "saved" && <Check className="h-3.5 w-3.5 text-green-600" />}
          {row.saveState === "error" && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
        </div>
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 top-9 z-30 max-h-40 w-56 overflow-y-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.15)]">
          {results.map((op) => (
            <li
              key={op.operator_code}
              onClick={() => handleSelect(op)}
              className="cursor-pointer border-b border-[#C6C6C6] px-2.5 py-1.5 text-[11px] transition-colors duration-100 last:border-b-0 hover:bg-[#FDC94D]/20"
            >
              <div className="font-semibold text-[#0F1D24]">{op.operator_name}</div>
              <div className="font-mono text-[9.5px] text-[#9B9B9B]">{op.operator_code}</div>
            </li>
          ))}
        </ul>
      )}

      {open && !searching && query.trim() && results.length === 0 && (
        <div className="absolute left-0 top-9 z-30 w-56 border border-[#C6C6C6] bg-white px-2.5 py-2 text-[10.5px] text-[#9B9B9B] shadow-[0_4px_10px_rgba(15,29,36,0.15)]">
          No operators match "{query}"
        </div>
      )}

      {rowError && <p className="mt-1 text-[10px] font-medium text-red-600">{rowError}</p>}
    </div>
  );
};

export default function DailyPlanOperatorAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { header, rows, loading, error, isEditable, assignOperator, clearOperator } = useDailyPlanOperatorAssignment(id);

  const assignedCount = useMemo(() => rows.filter((r) => r.operator_code).length, [rows]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFEFEF]">
        <p className="text-[12px] text-[#9B9B9B]">Loading machine assignments…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFEFEF]">
        <p className="text-[12px] font-semibold text-red-600">{error}</p>
      </div>
    );
  }
  if (!header) return null;

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Page title strip */}
      <header className="w-full border-b border-[#C6C6C6] bg-white">
        <div
          className="h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)" }}
        />
        <div className="flex py-1.5 w-full items-center justify-between gap-3 px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              title="Back"
              aria-label="Go back"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 border-l border-[#C6C6C6] pl-2.5">
              <div className="hidden min-w-0 leading-tight sm:block">
                <p className="text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                  Operator Allocation
                </p>
                <h1 className="truncate text-[12.5px] font-bold text-[#0F1D24]">
                  {header.planning_date} · {header.hall} · Shift {header.shift}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex h-7 shrink-0 items-stretch gap-px bg-[#C6C6C6] [&>*]:flex [&>*]:items-center [&>*]:whitespace-nowrap">
            <span className={`px-2.5 text-[11px] font-bold ${STATUS_COLORS[header.status] || STATUS_COLORS.Draft}`}>
              {header.status}
            </span>
          </div>
        </div>
      </header>

      {/* Hairline-separated stack — no vertical gaps between sections */}
      <main className="w-full pb-3">
        <div className="flex flex-col gap-px border border-[#C6C6C6] bg-[#C6C6C6]">
          {!isEditable && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 text-[11.5px] font-semibold text-[#0F1D24]">
              <Lock className="h-3.5 w-3.5 flex-shrink-0 text-[#9B9B9B]" />
              This plan is {header.status.toLowerCase()} — assignments are locked and read-only.
            </div>
          )}

          {/* Stat cards */}
          <div className="flex flex-col gap-px bg-[#C6C6C6] sm:flex-row">
            <StatCard value={rows.length} label="Machines" />
            <StatCard value={assignedCount} label="Assigned" valueClassName="text-green-600" />
            <StatCard value={rows.length - assignedCount} label="Unassigned" valueClassName="text-red-500" />
          </div>

          {/* Machine table — no overflow-auto wrapper, so each row's
              operator dropdown can float over sibling rows instead of
              being clipped by a scroll container. */}
          <div className="bg-white">
            <table className="w-full min-w-[760px] text-left text-[12px]">
              <thead className="bg-[#0F1D24] text-white">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">Machine</th>
                  <th className="px-2.5 py-2 font-semibold">Part</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Target</th>
                  <th className="px-2.5 py-2 font-semibold">Operator</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-[11px] text-[#9B9B9B]">
                      No machines in this plan.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr
                      key={row.daily_detail_id}
                      className={`border-t border-[#C6C6C6] transition-colors duration-100 hover:bg-[#FDC94D]/10 ${
                        idx % 2 === 1 ? "bg-[#FAFAFA]/60" : "bg-white"
                      }`}
                    >
                      <td className="px-2.5 py-1.5 align-top">
                        <p className="truncate font-mono text-[11.5px] font-semibold text-[#0F1D24]">{row.machine_code}</p>
                        <p className="truncate text-[10px] text-[#9B9B9B]">{row.machine_name}</p>
                      </td>
                      <td className="px-2.5 py-1.5 align-top">
                        <p className="truncate font-mono text-[11px] text-[#0F1D24]">{row.part_number}</p>
                        <p className="truncate text-[10px] text-[#9B9B9B]">{row.part_name}</p>
                      </td>
                      <td className="px-2.5 py-1.5 text-right align-top font-mono text-[11.5px] font-semibold text-[#0F1D24]">
                        {row.target_qty}
                      </td>
                      <td className="w-64 px-2.5 py-1.5 align-top">
                        <OperatorPicker
                          row={row}
                          disabled={!isEditable}
                          onAssign={(op) => assignOperator(row.daily_detail_id, op)}
                          onClear={() => clearOperator(row.daily_detail_id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}