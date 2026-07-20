import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { searchParts } from "../../api/partApi";
import useCreateMonthlyPlan from "../../hooks/useCreateMonthlyPlan";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const emptyRow = () => ({
  key: crypto.randomUUID(), partQuery: "", part: null, results: [],
  targetQty: "", plannedCycleTime: "", searching: false,
});

const effectiveCycleTime = (row) => {
  const planned = parseFloat(row.plannedCycleTime);
  if (planned > 0) return planned;
  if (row.part?.actual_cycle_time > 0) return Number(row.part.actual_cycle_time);
  return Number(row.part?.standard_cycle_time) || 0;
};

export default function CreateMonthlyPlan() {
  const navigate = useNavigate();
  const { createPlan, autoGenerateNumber, submitting, generating, error } = useCreateMonthlyPlan();

  const [planNumber, setPlanNumber] = useState("");
  const [planMonth, setPlanMonth] = useState(new Date().getMonth() + 1);
  const [planYear, setPlanYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState([emptyRow()]);
  const [formError, setFormError] = useState("");
  const [activeRowKey, setActiveRowKey] = useState(null);

  const debounceTimers = useRef({});
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveRowKey(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateRow = (key, patch) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleSearch = useCallback((key, keyword) => {
    updateRow(key, { partQuery: keyword, part: null });
    setActiveRowKey(key);

    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);

    if (!keyword.trim()) {
      updateRow(key, { results: [], searching: false });
      return;
    }

    updateRow(key, { searching: true });
    debounceTimers.current[key] = setTimeout(async () => {
      try {
        const res = await searchParts(keyword);
        updateRow(key, { results: res.data || [], searching: false });
      } catch {
        updateRow(key, { results: [], searching: false });
      }
    }, 300);
  }, []);

  const selectPart = (key, part) => {
    updateRow(key, { part, partQuery: `${part.part_number} - ${part.part_name}`, results: [], searching: false });
    setActiveRowKey(null);
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (key) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
    delete debounceTimers.current[key];
  };

  const handleAutoGenerate = async () => {
    const num = await autoGenerateNumber(planMonth, planYear);
    setPlanNumber(num);
  };

  const validRows = rows.filter((r) => r.part && r.targetQty);
  const totalTargetParts = validRows.length;
  const totalTargetQty = validRows.reduce((sum, r) => sum + Number(r.targetQty || 0), 0);
  const totalRequiredHours = validRows.reduce((sum, r) => {
    const cyc = effectiveCycleTime(r);
    return sum + (cyc > 0 ? (Number(r.targetQty) * cyc) / 3600 : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!planNumber) return setFormError("Enter a plan number or auto-generate one");
    if (validRows.length === 0) return setFormError("Select at least one part and enter a target quantity");

    const payload = {
      planNumber, planMonth: Number(planMonth), planYear: Number(planYear),
      parts: validRows.map((r) => ({
        partId: r.part.id,
        monthlyTargetQty: Number(r.targetQty),
        plannedCycleTime: r.plannedCycleTime ? Number(r.plannedCycleTime) : null,
      })),
    };

    try {
      const res = await createPlan(payload);
      navigate(`/monthly-plans/${res.monthlyPlanId}`);
    } catch {
      // hook already sets error
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] p-3">
      <motion.h1
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-3 text-base font-bold text-[#0F1D24]"
      >
        Create Monthly Plan
      </motion.h1>

      <form onSubmit={handleSubmit} ref={containerRef}>
        {/* Header fields */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mb-3 grid grid-cols-1 gap-3 rounded-sm border border-[#C6C6C6] bg-white p-3 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Plan Number</label>
            <div className="flex gap-1.5">
              <input
                value={planNumber}
                onChange={(e) => setPlanNumber(e.target.value)}
                placeholder="Manual entry or auto-generate"
                className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[13px] outline-none transition-colors focus:border-[#0F1D24]"
              />
              <button
                type="button"
                onClick={handleAutoGenerate}
                disabled={generating}
                className="h-8 whitespace-nowrap rounded-sm bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-white transition-opacity disabled:opacity-50"
              >
                {generating ? "..." : "Auto Generate"}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Month</label>
            <select
              value={planMonth}
              onChange={(e) => setPlanMonth(e.target.value)}
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[13px] outline-none focus:border-[#0F1D24]"
            >
              {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Year</label>
            <input
              type="number"
              value={planYear}
              onChange={(e) => setPlanYear(e.target.value)}
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[13px] font-mono outline-none focus:border-[#0F1D24]"
            />
          </div>
        </motion.div>

        {/* Parts */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mb-3 rounded-sm border border-[#C6C6C6] bg-white p-3"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-[#0F1D24]">Parts</h2>
            <button
              type="button"
              onClick={addRow}
              className="rounded-sm border border-[#0F1D24] px-2.5 py-1 text-[11px] font-semibold text-[#0F1D24] transition-colors hover:bg-[#0F1D24] hover:text-white"
            >
              + Add Row
            </button>
          </div>

          {/* Column headers (desktop only) */}
          <div className="mb-1.5 hidden grid-cols-[2fr_1fr_0.7fr_0.7fr_0.7fr_0.9fr_0.9fr_0.9fr_28px] gap-2 px-1 text-[9.5px] font-mono uppercase tracking-wide text-[#9B9B9B] lg:grid">
            <span>Part</span>
            <span>Category</span>
            <span className="text-right">Std CT</span>
            <span className="text-right">Actual CT</span>
            <span className="text-right">Target/Hr</span>
            <span className="text-right">Monthly Target</span>
            <span className="text-right">Planned CT</span>
            <span className="text-right">Req. Hours</span>
            <span />
          </div>

          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {rows.map((row) => {
                const cyc = effectiveCycleTime(row);
                const targetPerHour = cyc > 0 ? (3600 / cyc).toFixed(1) : "-";
                const requiredHours = row.targetQty && cyc > 0 ? ((Number(row.targetQty) * cyc) / 3600).toFixed(2) : "-";

                return (
                  <motion.div
                    key={row.key}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-2 gap-2 rounded-sm border border-[#C6C6C6]/60 p-2 lg:grid-cols-[2fr_1fr_0.7fr_0.7fr_0.7fr_0.9fr_0.9fr_0.9fr_28px] lg:items-center lg:border-0 lg:border-b lg:border-[#C6C6C6]/60 lg:p-1 lg:pb-2"
                  >
                    {/* Part search */}
                    <div className="relative col-span-2 lg:col-span-1">
                      <input
                        value={row.partQuery}
                        onChange={(e) => handleSearch(row.key, e.target.value)}
                        onFocus={() => row.results.length > 0 && setActiveRowKey(row.key)}
                        placeholder="Search part number / name"
                        className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2 text-[12.5px] outline-none transition-colors focus:border-[#0F1D24]"
                      />
                      {row.searching && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#9B9B9B]">...</span>
                      )}
                      <AnimatePresence>
                        {activeRowKey === row.key && row.results.length > 0 && (
                          <motion.ul
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-20 mt-1 max-h-44 w-72 overflow-y-auto rounded-sm border border-[#C6C6C6] bg-white shadow-lg"
                          >
                            {row.results.map((p) => (
                              <li
                                key={p.id}
                                onClick={() => selectPart(row.key, p)}
                                className="cursor-pointer border-b border-[#C6C6C6]/40 px-2.5 py-1.5 text-[11.5px] last:border-b-0 hover:bg-[#FDC94D]/20"
                              >
                                <div className="font-mono font-semibold text-[#0F1D24]">{p.part_number}</div>
                                <div className="text-[#0F1D24]">{p.part_name}</div>
                                <div className="text-[10px] text-[#9B9B9B]">{p.product_category}</div>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="text-[11px] text-[#9B9B9B] lg:col-span-1">
                      <span className="mr-1 font-mono text-[9px] uppercase text-[#C6C6C6] lg:hidden">Category:</span>
                      {row.part?.product_category || "-"}
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#0F1D24]">
                      <span className="mr-1 font-mono text-[9px] uppercase text-[#C6C6C6] lg:hidden">Std CT:</span>
                      {row.part?.standard_cycle_time ?? "-"}
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#0F1D24]">
                      <span className="mr-1 font-mono text-[9px] uppercase text-[#C6C6C6] lg:hidden">Actual CT:</span>
                      {row.part?.actual_cycle_time ?? "-"}
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#0F1D24]">
                      <span className="mr-1 font-mono text-[9px] uppercase text-[#C6C6C6] lg:hidden">Target/Hr:</span>
                      {targetPerHour}
                    </div>

                    <div className="text-right">
                      <input
                        type="number" min="1" value={row.targetQty}
                        onChange={(e) => updateRow(row.key, { targetQty: e.target.value })}
                        placeholder="Qty"
                        className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2 text-right text-[12.5px] font-mono outline-none focus:border-[#0F1D24] lg:w-20"
                      />
                    </div>

                    <div className="text-right">
                      <input
                        type="number" step="0.01" min="0" value={row.plannedCycleTime}
                        onChange={(e) => updateRow(row.key, { plannedCycleTime: e.target.value })}
                        placeholder="optional"
                        className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2 text-right text-[12.5px] font-mono outline-none focus:border-[#0F1D24] lg:w-20"
                      />
                    </div>

                    <div className="text-right text-[11px] font-mono font-semibold text-[#0F1D24]">
                      <span className="mr-1 font-mono text-[9px] uppercase text-[#C6C6C6] lg:hidden">Req. Hrs:</span>
                      {requiredHours}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        className="flex h-6 w-6 items-center justify-center rounded-sm text-[#9B9B9B] transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remove row"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <motion.div
            layout
            className="mt-3 flex flex-wrap gap-4 border-t border-[#C6C6C6] pt-2.5 text-[11.5px] font-mono text-[#0F1D24]"
          >
            <span>Total Parts: <b>{totalTargetParts}</b></span>
            <span>Total Target Qty: <b>{totalTargetQty}</b></span>
            <span>Total Required Hours: <b>{totalRequiredHours.toFixed(2)}</b></span>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {(formError || error) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-2.5 text-[11.5px] font-semibold text-red-600"
            >
              {formError || error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-sm bg-[#FDC94D] px-4 py-2 text-[12.5px] font-bold text-[#0F1D24] shadow-[0_8px_18px_-8px_rgba(15,29,36,0.35)] transition-opacity disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Plan"}
        </motion.button>
      </form>
    </div>
  );
}