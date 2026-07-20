import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { searchParts } from "../../api/partApi"; // adjust path to your existing parts api file
import useCreateMonthlyPlan from "../../hooks/useCreateMonthlyPlan";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const emptyRow = () => ({
  key: crypto.randomUUID(), partQuery: "", part: null, results: [],
  targetQty: "", plannedCycleTime: "",
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

  const updateRow = (key, patch) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleSearch = async (key, keyword) => {
    updateRow(key, { partQuery: keyword, part: null });
    if (!keyword.trim()) return updateRow(key, { results: [] });
    try {
      const res = await searchParts(keyword);
      updateRow(key, { results: res.data || [] });
    } catch {
      updateRow(key, { results: [] });
    }
  };

  const selectPart = (key, part) => {
    updateRow(key, { part, partQuery: `${part.part_number} - ${part.part_name}`, results: [] });
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (key) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));

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

    if (!planNumber) return setFormError("Plan number daalo ya auto-generate karo");
    if (validRows.length === 0) return setFormError("Kam se kam ek part select karo aur target qty daalo");

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
    <div className="min-h-screen bg-white p-6">
      <h1 className="mb-4 text-lg font-semibold text-[#0F1D24]">Create Monthly Plan</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-sm border border-[#C6C6C6] p-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-mono text-[#9B9B9B]">Plan Number</label>
            <div className="flex gap-2">
              <input
                value={planNumber}
                onChange={(e) => setPlanNumber(e.target.value)}
                placeholder="Manual entry ya auto-generate"
                className="h-9 w-full rounded-sm border border-[#C6C6C6] px-3 text-sm outline-none focus:border-[#0F1D24]"
              />
              <button type="button" onClick={handleAutoGenerate} disabled={generating}
                className="h-9 whitespace-nowrap rounded-sm bg-[#0F1D24] px-3 text-xs font-mono text-white disabled:opacity-50">
                {generating ? "..." : "Auto Generate"}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-mono text-[#9B9B9B]">Month</label>
            <select value={planMonth} onChange={(e) => setPlanMonth(e.target.value)}
              className="h-9 w-full rounded-sm border border-[#C6C6C6] px-3 text-sm outline-none focus:border-[#0F1D24]">
              {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-mono text-[#9B9B9B]">Year</label>
            <input type="number" value={planYear} onChange={(e) => setPlanYear(e.target.value)}
              className="h-9 w-full rounded-sm border border-[#C6C6C6] px-3 text-sm font-mono outline-none focus:border-[#0F1D24]" />
          </div>
        </div>

        <div className="mb-4 rounded-sm border border-[#C6C6C6] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0F1D24]">Parts</h2>
            <button type="button" onClick={addRow} className="rounded-sm border border-[#0F1D24] px-3 py-1 text-xs font-mono">
              + Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-[#0F1D24] text-white">
                <tr>
                  <th className="px-2 py-2 text-left">Part</th>
                  <th className="px-2 py-2 text-left">Category</th>
                  <th className="px-2 py-2 text-right font-mono">Std CT</th>
                  <th className="px-2 py-2 text-right font-mono">Actual CT</th>
                  <th className="px-2 py-2 text-right font-mono">Target/Hr</th>
                  <th className="px-2 py-2 text-right font-mono">Monthly Target</th>
                  <th className="px-2 py-2 text-right font-mono">Planned CT (opt.)</th>
                  <th className="px-2 py-2 text-right font-mono">Req. Hours</th>
                  <th className="px-2 py-2 text-center">—</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rows.map((row) => {
                    const cyc = effectiveCycleTime(row);
                    const targetPerHour = cyc > 0 ? (3600 / cyc).toFixed(1) : "-";
                    const requiredHours = row.targetQty && cyc > 0 ? ((Number(row.targetQty) * cyc) / 3600).toFixed(2) : "-";
                    return (
                      <motion.tr key={row.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="border-t border-[#C6C6C6] align-top">
                        <td className="relative px-2 py-2">
                          <input
                            value={row.partQuery}
                            onChange={(e) => handleSearch(row.key, e.target.value)}
                            placeholder="Search part number / name"
                            className="h-8 w-full min-w-[180px] rounded-sm border border-[#C6C6C6] px-2 text-sm outline-none focus:border-[#0F1D24]"
                          />
                          {row.results.length > 0 && (
                            <ul className="absolute z-10 mt-1 max-h-40 w-64 overflow-y-auto rounded-sm border border-[#C6C6C6] bg-white shadow-md">
                              {row.results.map((p) => (
                                <li key={p.id} onClick={() => selectPart(row.key, p)}
                                  className="cursor-pointer px-3 py-2 text-xs hover:bg-[#FDC94D]/20">
                                  <div className="font-mono">{p.part_number}</div>
                                  <div>{p.part_name}</div>
                                  <div className="text-[#9B9B9B]">{p.product_category}</div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs text-[#9B9B9B]">{row.part?.product_category || "-"}</td>
                        <td className="px-2 py-2 text-right font-mono">{row.part?.standard_cycle_time ?? "-"}</td>
                        <td className="px-2 py-2 text-right font-mono">{row.part?.actual_cycle_time ?? "-"}</td>
                        <td className="px-2 py-2 text-right font-mono">{targetPerHour}</td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number" min="1" value={row.targetQty}
                            onChange={(e) => updateRow(row.key, { targetQty: e.target.value })}
                            className="h-8 w-24 rounded-sm border border-[#C6C6C6] px-2 text-right text-sm font-mono outline-none focus:border-[#0F1D24]"
                          />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number" step="0.01" min="0" value={row.plannedCycleTime}
                            onChange={(e) => updateRow(row.key, { plannedCycleTime: e.target.value })}
                            placeholder="optional"
                            className="h-8 w-24 rounded-sm border border-[#C6C6C6] px-2 text-right text-sm font-mono outline-none focus:border-[#0F1D24]"
                          />
                        </td>
                        <td className="px-2 py-2 text-right font-mono">{requiredHours}</td>
                        <td className="px-2 py-2 text-center">
                          <button type="button" onClick={() => removeRow(row.key)} className="text-xs text-red-600 underline">
                            X
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-6 border-t border-[#C6C6C6] pt-3 text-sm font-mono">
            <span>Total Parts: <b>{totalTargetParts}</b></span>
            <span>Total Target Qty: <b>{totalTargetQty}</b></span>
            <span>Total Required Hours: <b>{totalRequiredHours.toFixed(2)}</b></span>
          </div>
        </div>

        {(formError || error) && <p className="mb-3 text-xs text-red-600">{formError || error}</p>}

        <button type="submit" disabled={submitting}
          className="rounded-sm bg-[#FDC94D] px-5 py-2 text-sm font-semibold text-[#0F1D24] disabled:opacity-50">
          {submitting ? "Creating..." : "Create Plan"}
        </button>
      </form>
    </div>
  );
}