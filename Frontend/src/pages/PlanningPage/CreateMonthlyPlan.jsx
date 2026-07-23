import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronDown,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineClipboardDocumentList,
  HiOutlineSparkles,
  HiOutlineDocumentCheck,
} from "react-icons/hi2";
import { searchParts } from "../../api/partApi";
import useCreateMonthlyPlan from "../../hooks/useCreateMonthlyPlan";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

// ============================================================
// PageTitleStrip — shared header pattern (gradient accent line,
// back button, eyebrow/title/subtitle, right-aligned action group).
// ============================================================
function PageTitleStrip({ eyebrow, title, subtitle, showBack = true, actions }) {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-[#C6C6C6] bg-white">
      <div
        className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)" }}
      />
      <div className="flex h-11 w-full items-center justify-between gap-3 px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              title="Back"
              aria-label="Go back"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#C6C6C6] bg-white p-0 leading-none text-[#0F1D24] outline-none transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] focus-visible:ring-2 focus-visible:ring-[#FDC94D] focus-visible:ring-offset-1"
            >
              <HiOutlineArrowLeft className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}
          <div className={`flex min-w-0 flex-1 flex-col justify-center gap-0.5 ${showBack ? "border-l border-[#C6C6C6] pl-2.5" : ""}`}>
            <div className="flex items-baseline gap-2">
              {eyebrow && (
                <span className="shrink-0 text-[10px] font-bold uppercase leading-none tracking-wider text-[#0F1D24]/60">
                  {eyebrow}
                </span>
              )}
              {/* <h1 className="truncate text-[13px] font-bold leading-none tracking-tight text-[#0F1D24]">{title}</h1> */}
            </div>
            {subtitle && <p className="truncate font-mono text-[10px] leading-none text-[#9B9B9B]">{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className="flex h-7 shrink-0 items-stretch gap-px bg-[#C6C6C6] [&>*]:flex [&>*]:items-center [&>*]:whitespace-nowrap">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================================
// ThemedSelect — flat bordered dropdown matching the desktop
// design tokens (sharp corners, navy fill on selection).
// ============================================================
function ThemedSelect({ value, onChange, options, placeholder = "-- select --", disabled = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-full items-center justify-between border px-2.5 text-[11.5px] font-medium outline-none transition-colors duration-100
          ${disabled ? "cursor-not-allowed border-[#C6C6C6] bg-[#F5F5F5] text-[#9B9B9B]" : "border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24]"}
          ${open ? "border-[#0F1D24]" : ""}`}
      >
        <span className={selected ? "truncate text-[#0F1D24]" : "truncate text-[#9B9B9B]"}>
          {selected ? selected.label : placeholder}
        </span>
        <HiOutlineChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#9B9B9B] transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`cursor-pointer border-b border-[#C6C6C6] px-2.5 py-1.5 text-[11.5px] font-medium last:border-b-0 transition-colors duration-100
                ${String(opt.value) === String(value) ? "bg-[#0F1D24] text-[#FDC94D]" : "text-[#0F1D24] hover:bg-[#FDC94D]/20"}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// Stat card — matches the metrics-row pattern used elsewhere.
// ============================================================
const StatCard = ({ value, label }) => (
  <div className="flex-1 border border-[#C6C6C6] bg-white px-4 py-3">
    <p className="text-xl font-bold leading-none text-[#0F1D24]">{value}</p>
    <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
  </div>
);

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
  const tableRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) setActiveRowKey(null);
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
    <div className="min-h-screen bg-[#EFEFEF]">
      <PageTitleStrip
        eyebrow="Monthly Planning"
        title="Create Monthly Plan"
        subtitle={`${MONTH_NAMES[planMonth - 1]} ${planYear}${planNumber ? ` · ${planNumber}` : ""}`}
      />

      <main className="w-full px-3 pb-6 pt-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Context sidebar + setup form */}
          <div className="grid grid-cols-1 gap-px border border-[#C6C6C6] bg-[#C6C6C6] md:grid-cols-[260px_1fr]">
            <div className="bg-[#0F1D24] p-5 text-white">
              <div className="mb-1 flex items-center gap-2">
                <HiOutlineClipboardDocumentList className="h-4 w-4 text-[#FDC94D]" />
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#FDC94D]">Plan Overview</h2>
              </div>
              <p className="text-[11.5px] leading-relaxed text-white/70">
                Set the plan number, month and year, then add parts with their monthly targets below.
              </p>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">Plan Number</p>
                  <p className="truncate font-mono text-[12.5px] font-semibold">{planNumber || "Not set"}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">Month</p>
                    <p className="text-[12.5px] font-semibold">{MONTH_NAMES[planMonth - 1]}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">Year</p>
                    <p className="font-mono text-[12.5px] font-semibold">{planYear}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="border-b border-[#C6C6C6] bg-[#FAFAFA] px-4 py-2.5">
                <h2 className="text-[13px] font-bold text-[#0F1D24]">Plan Setup</h2>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Plan Number</label>
                  <div className="flex gap-px bg-[#C6C6C6]">
                    <input
                      value={planNumber}
                      onChange={(e) => setPlanNumber(e.target.value)}
                      placeholder="Manual entry or auto-generate"
                      className="h-8 w-full border-0 bg-white px-2.5 text-[12.5px] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGenerate}
                      disabled={generating}
                      className="flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90 disabled:opacity-50"
                    >
                      <HiOutlineSparkles className="h-3.5 w-3.5" />
                      {generating ? "..." : "Auto Generate"}
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-[#C6C6C6]" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Month</label>
                    <ThemedSelect
                      value={planMonth}
                      onChange={(v) => setPlanMonth(Number(v))}
                      options={MONTH_NAMES.map((m, i) => ({ value: i + 1, label: m }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-wide text-[#9B9B9B]">Year</label>
                    <input
                      type="number"
                      value={planYear}
                      onChange={(e) => setPlanYear(e.target.value)}
                      className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[12.5px] font-mono outline-none focus:border-[#0F1D24]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Totals row */}
          <div className="flex flex-col gap-px bg-[#C6C6C6] sm:flex-row">
            <StatCard value={totalTargetParts} label="Total Parts" />
            <StatCard value={totalTargetQty.toLocaleString()} label="Total Target Qty" />
            <StatCard value={totalRequiredHours.toFixed(2)} label="Total Required Hours" />
          </div>

          {/* Parts toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <HiOutlineClipboardDocumentList className="h-4 w-4 text-[#0F1D24]" />
              <h2 className="text-[12.5px] font-bold text-[#0F1D24]">Parts</h2>
              <span className="border border-[#C6C6C6] bg-[#FAFAFA] px-1.5 py-[1px] text-[10px] font-bold text-[#9B9B9B]">
                {rows.length}
              </span>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 border border-[#0F1D24] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Add Row
            </button>
          </div>

          {/* Parts table — no overflow-hidden/auto ancestor, so the
              per-row search dropdown can float over sibling rows. */}
          <div ref={tableRef} className="border border-[#C6C6C6] bg-white">
            <table className="w-full min-w-[920px] text-left text-[12px]">
              <thead className="bg-[#0F1D24] text-white">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">Part</th>
                  <th className="px-2.5 py-2 font-semibold">Category</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Std CT</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Actual CT</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Target/Hr</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Monthly Target</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Planned CT</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Req. Hours</th>
                  <th className="px-2.5 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((row, idx) => {
                    const cyc = effectiveCycleTime(row);
                    const targetPerHour = cyc > 0 ? (3600 / cyc).toFixed(1) : "—";
                    const requiredHours = row.targetQty && cyc > 0 ? ((Number(row.targetQty) * cyc) / 3600).toFixed(2) : "—";

                    return (
                      <motion.tr
                        key={row.key}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`border-t border-[#C6C6C6] transition-colors duration-100 hover:bg-[#FDC94D]/10 ${
                          idx % 2 === 1 ? "bg-[#FAFAFA]/60" : "bg-white"
                        }`}
                      >
                        <td className="relative px-2.5 py-1.5">
                          <input
                            value={row.partQuery}
                            onChange={(e) => handleSearch(row.key, e.target.value)}
                            onFocus={() => row.results.length > 0 && setActiveRowKey(row.key)}
                            placeholder="Search part number / name"
                            className="h-8 w-56 border border-[#C6C6C6] px-2 text-[12px] outline-none focus:border-[#0F1D24]"
                          />
                          {row.searching && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-[#9B9B9B]">...</span>
                          )}
                          <AnimatePresence>
                            {activeRowKey === row.key && row.results.length > 0 && (
                              <motion.ul
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute z-30 mt-1 max-h-44 w-72 overflow-y-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.15)]"
                              >
                                {row.results.map((p) => (
                                  <li
                                    key={p.id}
                                    onClick={() => selectPart(row.key, p)}
                                    className="cursor-pointer border-b border-[#C6C6C6] px-2.5 py-1.5 text-[11.5px] last:border-b-0 hover:bg-[#FDC94D]/20"
                                  >
                                    <div className="font-mono font-semibold text-[#0F1D24]">{p.part_number}</div>
                                    <div className="text-[#0F1D24]">{p.part_name}</div>
                                    <div className="text-[10px] text-[#9B9B9B]">{p.product_category}</div>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </td>

                        <td className="px-2.5 py-1.5 text-[#9B9B9B]">{row.part?.product_category || "—"}</td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">{row.part?.standard_cycle_time ?? "—"}</td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">{row.part?.actual_cycle_time ?? "—"}</td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">{targetPerHour}</td>

                        <td className="px-2.5 py-1.5 text-right">
                          <input
                            type="number" min="1" value={row.targetQty}
                            onChange={(e) => updateRow(row.key, { targetQty: e.target.value })}
                            placeholder="Qty"
                            className="h-8 w-20 border border-[#C6C6C6] px-2 text-right text-[12px] font-mono outline-none focus:border-[#0F1D24]"
                          />
                        </td>

                        <td className="px-2.5 py-1.5 text-right">
                          <input
                            type="number" step="0.01" min="0" value={row.plannedCycleTime}
                            onChange={(e) => updateRow(row.key, { plannedCycleTime: e.target.value })}
                            placeholder="opt."
                            className="h-8 w-20 border border-[#C6C6C6] px-2 text-right text-[12px] font-mono outline-none focus:border-[#0F1D24]"
                          />
                        </td>

                        <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-[#0F1D24]">{requiredHours}</td>

                        <td className="px-2.5 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(row.key)}
                            disabled={rows.length === 1}
                            title="Remove row"
                            className="mx-auto flex h-6 w-6 items-center justify-center text-red-500 transition-colors duration-100 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <HiOutlineTrash className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
              {validRows.length > 0 && (
                <tfoot className="border-t-2 border-[#0F1D24] bg-[#FAFAFA]">
                  <tr>
                    <td colSpan={5} className="px-2.5 py-2 text-right text-[10.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                      Totals
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totalTargetQty.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2" />
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totalRequiredHours.toFixed(2)}
                    </td>
                    <td className="px-2.5 py-2" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <AnimatePresence>
            {(formError || error) && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11.5px] font-semibold text-red-600"
              >
                {formError || error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-px bg-[#C6C6C6] border border-[#C6C6C6]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 items-center justify-center bg-white px-4 text-[12px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex h-10 items-center justify-center gap-1.5 bg-[#0F1D24] px-5 text-[12px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiOutlineDocumentCheck className="h-3.5 w-3.5" />
              {submitting ? "Creating..." : "Create Plan"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}