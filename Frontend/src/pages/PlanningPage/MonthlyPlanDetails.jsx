import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axiosInstance';
import useMonthlyPlan from '../hooks/useMonthlyPlan';
import {
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlinePlus,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
// NOTE: adjust this import to wherever PageTitleStrip actually lives relative to this file
// (it was co-located with ViewDailyPlanPage in components/pages/).
import PageTitleStrip from '../components/pages/PageTitleStrip';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_STYLES = {
  Draft: 'bg-[#F5F5F5] text-[#9B9B9B]',
  Published: 'bg-[#FDC94D]/20 text-[#0F1D24]',
  Completed: 'bg-green-100 text-green-700',
  Closed: 'bg-red-100 text-red-600',
};

// ============================================================
// Sidebar summary tile — matches ViewDailyPlanPage's navy panel.
// ============================================================
const SummaryTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-[#FDC94D]">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">{label}</p>
      <p className="truncate text-[12.5px] font-semibold text-white">{value}</p>
    </div>
  </div>
);

// ============================================================
// Stat card — matches ViewDailyPlanPage's metrics row.
// ============================================================
const StatCard = ({ value, label }) => (
  <div className="flex-1 border border-[#C6C6C6] bg-white px-4 py-3">
    <p className="text-xl font-bold leading-none text-[#0F1D24]">{value}</p>
    <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
  </div>
);

export default function MonthlyPlanDetails() {
  const { id } = useParams();
  const { header, details, loading, error, addPart, updatePart, removePart } = useMonthlyPlan(id);

  // --- Add/Edit part form state ---
  const [partQuery, setPartQuery] = useState('');
  const [partResults, setPartResults] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [targetQty, setTargetQty] = useState('');
  const [cycleTime, setCycleTime] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // --- Table search/filter state ---
  const [search, setSearch] = useState('');

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
    setFormOpen(false);
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
    setFormOpen(true);
  };

  const handleDelete = async (detailId) => {
    if (!confirm('Ye part plan se hata dein?')) return;
    await removePart(detailId);
  };

  // --- Derived: filtered rows + totals (mirrors ViewDailyPlanPage pattern) ---
  const filteredDetails = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return details;
    return details.filter((d) =>
      [d.part_name, d.part_number]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [details, search]);

  const totals = useMemo(() => {
    return filteredDetails.reduce(
      (acc, d) => ({
        targetQty: acc.targetQty + (Number(d.monthly_target_qty) || 0),
        completedQty: acc.completedQty + (Number(d.completed_qty) || 0),
        balanceQty: acc.balanceQty + (Number(d.balance_qty) || 0),
      }),
      { targetQty: 0, completedQty: 0, balanceQty: 0 }
    );
  }, [filteredDetails]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFEFEF]">
        <p className="text-sm font-medium text-[#9B9B9B]">Loading plan…</p>
      </div>
    );
  }

  if (error || !header) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFEFEF]">
        <p className="text-sm font-medium text-red-500">{error || 'Plan not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <PageTitleStrip
        eyebrow="Monthly Plan"
        title={header.plan_number}
        subtitle={`${MONTH_NAMES[header.plan_month - 1]} ${header.plan_year} · ${header.hall} · ${header.working_days} working days`}
        actions={
          <>
            <span
              className={`flex items-center bg-white px-2.5 text-[11px] font-bold ${
                STATUS_STYLES[header.status] || STATUS_STYLES.Draft
              }`}
            >
              {header.status}
            </span>
            <button
              onClick={() => {
                if (formOpen && editingId) resetForm();
                setFormOpen((v) => !v);
              }}
              className="flex items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              {formOpen ? 'Close' : 'Add Part'}
            </button>
          </>
        }
      />

      <main className="w-full space-y-3 px-3 pb-6 pt-3">
        {/* Context sidebar + stat cards */}
        <div className="grid grid-cols-1 gap-px border border-[#C6C6C6] bg-[#C6C6C6] md:grid-cols-[260px_1fr]">
          <div className="space-y-4 bg-[#0F1D24] p-5">
            <SummaryTile
              icon={HiOutlineCalendarDays}
              label="Period"
              value={`${MONTH_NAMES[header.plan_month - 1]} ${header.plan_year}`}
            />
            <SummaryTile icon={HiOutlineBuildingOffice2} label="Hall" value={header.hall} />
            <SummaryTile icon={HiOutlineClock} label="Working Days" value={header.working_days} />
          </div>

          <div className="flex flex-col gap-px bg-[#C6C6C6] sm:flex-row">
            <StatCard value={header.total_parts} label="Total Parts" />
            <StatCard value={header.total_target_qty} label="Total Target Qty" />
            <StatCard value={totals.completedQty.toLocaleString()} label="Completed Qty" />
            <StatCard value={totals.balanceQty.toLocaleString()} label="Balance Qty" />
          </div>
        </div>

        {/* Add / Edit part panel */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border border-[#C6C6C6] bg-white"
            >
              <form onSubmit={handleSubmit} className="p-4">
                <h2 className="mb-3 text-[12.5px] font-bold text-[#0F1D24]">
                  {editingId ? 'Edit Part Target' : 'Add Part to Plan'}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="relative">
                    <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                      Part
                    </label>
                    <input
                      type="text"
                      value={partQuery}
                      disabled={!!editingId}
                      onChange={(e) => {
                        setPartQuery(e.target.value);
                        setShowDropdown(true);
                        setSelectedPart(null);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search part name or number"
                      className="h-9 w-full border border-[#C6C6C6] px-3 text-[12px] outline-none focus:border-[#0F1D24] disabled:bg-[#FAFAFA] disabled:text-[#9B9B9B]"
                    />
                    <AnimatePresence>
                      {showDropdown && partResults.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto border border-[#C6C6C6] bg-white shadow-md"
                        >
                          {partResults.map((p) => (
                            <li
                              key={p.id}
                              onClick={() => handleSelectPart(p)}
                              className="cursor-pointer px-3 py-2 text-[12px] hover:bg-[#FDC94D]/20"
                            >
                              {p.part_name}{' '}
                              <span className="text-[#9B9B9B]">({p.part_number})</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                      Monthly Target Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={targetQty}
                      onChange={(e) => setTargetQty(e.target.value)}
                      className="h-9 w-full border border-[#C6C6C6] px-3 text-[12px] font-mono outline-none focus:border-[#0F1D24]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                      Planned Cycle Time (sec)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cycleTime}
                      onChange={(e) => setCycleTime(e.target.value)}
                      className="h-9 w-full border border-[#C6C6C6] px-3 text-[12px] font-mono outline-none focus:border-[#0F1D24]"
                    />
                  </div>
                </div>

                {formError && <p className="mt-2 text-[11px] text-red-600">{formError}</p>}

                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 bg-[#0F1D24] px-3 py-2 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24] disabled:opacity-50"
                  >
                    {submitting ? 'Saving…' : editingId ? 'Update Part' : 'Add Part'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border border-[#C6C6C6] bg-white px-3 py-2 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar: search + result count */}
        <div className="flex flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <HiOutlineClipboardDocumentList className="h-4 w-4 text-[#0F1D24]" />
            <h2 className="text-[12.5px] font-bold text-[#0F1D24]">Monthly Targets</h2>
            <span className="border border-[#C6C6C6] bg-[#FAFAFA] px-1.5 py-[1px] text-[10px] font-bold text-[#9B9B9B]">
              {filteredDetails.length}
              {search ? ` / ${details.length}` : ''}
            </span>
          </div>

          <div className="relative">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9B9B9B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search part name or number..."
              className="h-8 w-64 border border-[#C6C6C6] bg-white pl-8 pr-7 text-[11.5px] outline-none focus:border-[#0F1D24]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#9B9B9B] hover:text-[#0F1D24]"
              >
                <HiOutlineXMark className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Parts table */}
        <div className="border border-[#C6C6C6] bg-white">
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="sticky top-0 z-10 bg-[#0F1D24] text-white">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">Part</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Target Qty</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Cycle Time (s)</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Completed</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Balance</th>
                  <th className="px-2.5 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-[11.5px] text-[#9B9B9B]">
                      {search ? 'No parts match your search.' : 'Koi part add nahi hua ab tak.'}
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredDetails.map((row, idx) => (
                      <motion.tr
                        key={row.monthly_detail_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`border-t border-[#C6C6C6] transition-colors duration-100 hover:bg-[#FDC94D]/10 ${
                          idx % 2 === 1 ? 'bg-[#FAFAFA]/60' : 'bg-white'
                        }`}
                      >
                        <td className="px-2.5 py-1.5 font-mono font-semibold text-[#0F1D24]">
                          {row.part_name}{' '}
                          <span className="font-sans font-normal text-[#9B9B9B]">
                            ({row.part_number})
                          </span>
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-[#0F1D24]">
                          {row.monthly_target_qty}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">
                          {row.planned_cycle_time ?? '—'}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">
                          {row.completed_qty}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">
                          {row.balance_qty}
                        </td>
                        <td className="px-2.5 py-1.5 text-center">
                          <button
                            onClick={() => startEdit(row)}
                            className="mr-3 text-[11px] font-semibold text-[#0F1D24] underline decoration-[#C6C6C6] underline-offset-2 hover:decoration-[#0F1D24]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.monthly_detail_id)}
                            className="text-[11px] font-semibold text-red-600 underline decoration-red-200 underline-offset-2 hover:decoration-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
              {filteredDetails.length > 0 && (
                <tfoot className="sticky bottom-0 border-t-2 border-[#0F1D24] bg-[#FAFAFA]">
                  <tr>
                    <td className="px-2.5 py-2 text-right text-[10.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                      Totals
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totals.targetQty.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2" />
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totals.completedQty.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totals.balanceQty.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}