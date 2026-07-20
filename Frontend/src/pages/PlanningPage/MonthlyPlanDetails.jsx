import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axiosInstance';
import useMonthlyPlan from '../hooks/useMonthlyPlan';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function MonthlyPlanDetails() {
  const { id } = useParams();
  const { header, details, loading, error, addPart, updatePart, removePart } = useMonthlyPlan(id);

  const [partQuery, setPartQuery] = useState('');
  const [partResults, setPartResults] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [targetQty, setTargetQty] = useState('');
  const [cycleTime, setCycleTime] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!partQuery.trim()) { setPartResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`/parts/search?q=${encodeURIComponent(partQuery)}`);
        setPartResults(res.data.data);
      } catch {
        setPartResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [partQuery]);

  const resetForm = () => {
    setSelectedPart(null);
    setPartQuery('');
    setTargetQty('');
    setCycleTime('');
    setEditingId(null);
    setFormError('');
  };

  const handleSelectPart = (part) => {
    setSelectedPart(part);
    setPartQuery(`${part.part_name} (${part.part_number})`);
    setCycleTime(part.actual_cycle_time || '');
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!editingId && !selectedPart) return setFormError('Part select karo pehle');
    if (!targetQty || Number(targetQty) <= 0) return setFormError('Valid target quantity daalo');

    setSubmitting(true);
    try {
      if (editingId) {
        await updatePart(editingId, {
          monthlyTargetQty: Number(targetQty),
          plannedCycleTime: cycleTime ? Number(cycleTime) : null,
        });
      } else {
        await addPart({
          partId: selectedPart.id,
          monthlyTargetQty: Number(targetQty),
          plannedCycleTime: cycleTime ? Number(cycleTime) : null,
        });
      }
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save nahi hua, dobara try karo');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.monthly_detail_id);
    setPartQuery(`${row.part_name} (${row.part_number})`);
    setTargetQty(row.monthly_target_qty);
    setCycleTime(row.planned_cycle_time || '');
    setSelectedPart(null);
  };

  const handleDelete = async (detailId) => {
    if (!confirm('Ye part plan se hata dein?')) return;
    await removePart(detailId);
  };

  if (loading) return <div className="p-8 text-center text-[#9B9B9B] font-mono text-sm">Loading plan...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-mono text-sm">{error}</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6 rounded-sm border border-[#C6C6C6] bg-[#0F1D24] p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">{header.plan_number}</h1>
            <p className="text-sm text-[#C6C6C6]">
              {MONTH_NAMES[header.plan_month - 1]} {header.plan_year} · {header.hall} · {header.working_days} working days
            </p>
          </div>
          <span className="rounded-sm bg-[#FDC94D] px-3 py-1 text-xs font-mono font-semibold text-[#0F1D24]">
            {header.status}
          </span>
        </div>
        <div className="mt-3 flex gap-6 text-sm font-mono">
          <span>Total Parts: <b>{header.total_parts}</b></span>
          <span>Total Target Qty: <b>{header.total_target_qty}</b></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 rounded-sm border border-[#C6C6C6] p-4">
        <h2 className="mb-3 text-sm font-semibold text-[#0F1D24]">
          {editingId ? 'Edit Part Target' : 'Add Part to Plan'}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <label className="mb-1 block text-xs font-mono text-[#9B9B9B]">Part</label>
            <input
              type="text"
              value={partQuery}
              disabled={!!editingId}
              onChange={(e) => { setPartQuery(e.target.value); setShowDropdown(true); setSelectedPart(null); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search part name or number"
              className="h-9 w-full rounded-sm border border-[#C6C6C6] px-3 text-sm outline-none focus:border-[#0F1D24] disabled:bg-gray-100"
            />
            <AnimatePresence>
              {showDropdown && partResults.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-sm border border-[#C6C6C6] bg-white shadow-md"
                >
                  {partResults.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => handleSelectPart(p)}
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-[#FDC94D]/20"
                    >
                      {p.part_name} <span className="text-[#9B9B9B]">({p.part_number})</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="mb-1 block text-xs font-mono text-[#9B9B9B]">Monthly Target Qty</label>
            <input
              type="number" min="1" value={targetQty}
              onChange={(e) => setTargetQty(e.target.value)}
              className="h-9 w-full rounded-sm border border-[#C6C6C6] px-3 text-sm font-mono outline-none focus:border-[#0F1D24]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-mono text-[#9B9B9B]">Planned Cycle Time (sec)</label>
            <input
              type="number" step="0.01" min="0" value={cycleTime}
              onChange={(e) => setCycleTime(e.target.value)}
              className="h-9 w-full rounded-sm border border-[#C6C6C6] px-3 text-sm font-mono outline-none focus:border-[#0F1D24]"
            />
          </div>
        </div>

        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}

        <div className="mt-4 flex gap-2">
          <button type="submit" disabled={submitting}
            className="rounded-sm bg-[#FDC94D] px-4 py-2 text-sm font-semibold text-[#0F1D24] disabled:opacity-50">
            {submitting ? 'Saving...' : editingId ? 'Update Part' : 'Add Part'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-sm border border-[#C6C6C6] px-4 py-2 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-sm border border-[#C6C6C6]">
        <table className="w-full text-sm">
          <thead className="bg-[#0F1D24] text-white">
            <tr>
              <th className="px-3 py-2 text-left">Part</th>
              <th className="px-3 py-2 text-right font-mono">Target Qty</th>
              <th className="px-3 py-2 text-right font-mono">Cycle Time</th>
              <th className="px-3 py-2 text-right font-mono">Completed</th>
              <th className="px-3 py-2 text-right font-mono">Balance</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {details.map((row) => (
                <motion.tr key={row.monthly_detail_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="border-t border-[#C6C6C6]">
                  <td className="px-3 py-2">{row.part_name} <span className="text-[#9B9B9B]">({row.part_number})</span></td>
                  <td className="px-3 py-2 text-right font-mono">{row.monthly_target_qty}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.planned_cycle_time ?? '-'}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.completed_qty}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.balance_qty}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => startEdit(row)} className="mr-2 text-xs text-[#0F1D24] underline">Edit</button>
                    <button onClick={() => handleDelete(row.monthly_detail_id)} className="text-xs text-red-600 underline">Delete</button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {details.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-[#9B9B9B]">Koi part add nahi hua ab tak</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

