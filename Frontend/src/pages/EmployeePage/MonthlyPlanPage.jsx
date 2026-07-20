import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineChevronRight,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineDocumentArrowDown,
  HiOutlineDocumentArrowUp,
  HiOutlinePrinter,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineBolt,
  HiOutlinePencilSquare,
  HiOutlineXMark,
} from 'react-icons/hi2';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HALLS = ['Hall 1', 'Hall 2', 'Hall 3', 'Hall 4', 'C-8'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUS_STYLES = {
  Draft: 'bg-[#F5F5F5] text-[#9B9B9B] border-[#C6C6C6]',
  Published: 'bg-[#0F1D24]/5 text-[#0F1D24] border-[#0F1D24]/20',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-red-50 text-red-600 border-red-200',
};

const seedRows = [
  {
    id: 1, partNumber: 'DX-INJ-1042', partName: 'Front Bezel - 55" TV', customer: 'Samsung',
    category: 'Injection', monthlyTarget: 62000, workingDays: 26, stdCycle: 18.5, plannedCycle: 19,
    priority: 'High', completed: 41500, remarks: '',
  },
  {
    id: 2, partNumber: 'DX-INJ-1088', partName: 'Rear Cover - LED Panel', customer: 'LG',
    category: 'Injection', monthlyTarget: 48000, workingDays: 26, stdCycle: 22, plannedCycle: 22.5,
    priority: 'Medium', completed: 30200, remarks: '',
  },
  {
    id: 3, partNumber: 'DX-INJ-1121', partName: 'Speaker Grill Assembly', customer: 'Dixon',
    category: 'Assembly', monthlyTarget: 35000, workingDays: 26, stdCycle: 12, plannedCycle: 12,
    priority: 'Low', completed: 35000, remarks: 'Ahead of target',
  },
];

const compute = (r) => {
  const dailyTarget = r.workingDays > 0 ? r.monthlyTarget / r.workingDays : 0;
  const balance = r.monthlyTarget - r.completed;
  const achievement = r.monthlyTarget > 0 ? (r.completed / r.monthlyTarget) * 100 : 0;
  return { ...r, dailyTarget, balance, achievement };
};

const badge = (cls) =>
  `inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`;

// ---------------------------------------------------------------------------
// Sub components
// ---------------------------------------------------------------------------

function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-md border border-[#C6C6C6] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-[#0F1D24]">{value}</p>
      {sub && <p className={`mt-0.5 text-[11px] font-medium ${accent ?? 'text-[#9B9B9B]'}`}>{sub}</p>}
    </div>
  );
}

function FilterBar({ filters, setFilters, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-[#C6C6C6] bg-white p-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-[#9B9B9B]">Hall</label>
        <select
          value={filters.hall}
          onChange={(e) => setFilters((f) => ({ ...f, hall: e.target.value }))}
          className="h-8 min-w-[130px] rounded-md border border-[#C6C6C6] bg-white px-2 text-xs font-medium text-[#0F1D24] focus:border-[#0F1D24] focus:outline-none"
        >
          <option value="">All Halls</option>
          {HALLS.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-[#9B9B9B]">Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          className="h-8 min-w-[110px] rounded-md border border-[#C6C6C6] bg-white px-2 text-xs font-medium text-[#0F1D24] focus:border-[#0F1D24] focus:outline-none"
        >
          <option value="">All</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex flex-1 min-w-[200px] flex-col gap-1">
        <label className="text-[11px] font-semibold text-[#9B9B9B]">Search Part / Customer</label>
        <div className="flex h-8 items-center gap-2 rounded-md border border-[#C6C6C6] px-2">
          <HiOutlineMagnifyingGlass className="h-4 w-4 text-[#9B9B9B]" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Part number, name, customer..."
            className="h-full w-full text-xs font-medium text-[#0F1D24] outline-none placeholder:text-[#C6C6C6]"
          />
        </div>
      </div>

      <button
        onClick={onReset}
        className="flex h-8 items-center gap-1.5 rounded-md border border-[#C6C6C6] px-3 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24] hover:bg-[#0F1D24]/[0.02]"
      >
        <HiOutlineArrowPath className="h-3.5 w-3.5" /> Reset
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MonthlyPlanPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(seedRows.map(compute));
  const [filters, setFilters] = useState({ hall: '', priority: '', search: '' });
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [status, setStatus] = useState('Draft');

  const planMeta = {
    planNumber: 'MPP-2026-07-0042',
    month: 'July',
    year: 2026,
    hall: 'Hall 1',
    workingDays: 26,
    createdBy: 'Y. Sharma',
    approvedBy: '—',
    revision: 'Rev-01',
    lastUpdated: '20 Jul 2026, 10:42 AM',
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filters.priority && r.priority !== filters.priority) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!`${r.partNumber} ${r.partName} ${r.customer}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters]);

  const summary = useMemo(() => {
    const totalTarget = rows.reduce((s, r) => s + r.monthlyTarget, 0);
    const totalCompleted = rows.reduce((s, r) => s + r.completed, 0);
    const totalBalance = totalTarget - totalCompleted;
    const avgAchievement = rows.length
      ? rows.reduce((s, r) => s + r.achievement, 0) / rows.length
      : 0;
    return {
      totalParts: rows.length,
      totalTarget,
      totalCompleted,
      totalBalance,
      avgAchievement,
      highPriority: rows.filter((r) => r.priority === 'High').length,
    };
  }, [rows]);

  const updateRow = (id, field, rawValue) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        let value = rawValue;
        if (['monthlyTarget', 'workingDays', 'completed', 'stdCycle', 'plannedCycle'].includes(field)) {
          value = Math.max(0, Number(rawValue) || 0);
        }
        const updated = { ...r, [field]: value };
        return compute(updated);
      })
    );
  };

  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const isLocked = status === 'Published' || status === 'Closed';

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* ---------------- Header ---------------- */}
      <div className="sticky top-0 z-20 border-b border-[#C6C6C6] bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-1 text-[11px] font-medium text-[#9B9B9B]">
            <span>Planning</span>
            <HiOutlineChevronRight className="h-3 w-3" />
            <span>Production</span>
            <HiOutlineChevronRight className="h-3 w-3" />
            <span className="text-[#0F1D24]">Monthly Plan</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-[#0F1D24]">
                  Monthly Production Plan
                </h1>
                <span className={badge(STATUS_STYLES[status])}>{status}</span>
                <span className={badge('border-[#C6C6C6] bg-[#F5F5F5] text-[#9B9B9B]')}>
                  {planMeta.revision}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-[#9B9B9B]">
                {planMeta.planNumber} &middot; {planMeta.month} {planMeta.year} &middot; {planMeta.hall}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-[#9B9B9B]">
              <span>Created by <b className="text-[#0F1D24]">{planMeta.createdBy}</b></span>
              <span>Approved by <b className="text-[#0F1D24]">{planMeta.approvedBy}</b></span>
              <span>Updated <b className="text-[#0F1D24]">{planMeta.lastUpdated}</b></span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-5 sm:px-6">
        {/* ---------------- KPI Summary ---------------- */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Total Parts" value={summary.totalParts} />
          <KpiCard label="Monthly Target" value={summary.totalTarget.toLocaleString()} />
          <KpiCard label="Completed" value={summary.totalCompleted.toLocaleString()} accent="text-emerald-600" sub="Qty" />
          <KpiCard label="Balance" value={summary.totalBalance.toLocaleString()} accent="text-red-500" sub="Qty" />
          <KpiCard label="Avg Achievement" value={`${summary.avgAchievement.toFixed(1)}%`}
            accent={summary.avgAchievement >= 90 ? 'text-emerald-600' : 'text-amber-600'} />
          <KpiCard label="High Priority" value={summary.highPriority} accent="text-red-500" sub="parts" />
        </div>

        {/* ---------------- Filters ---------------- */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onReset={() => setFilters({ hall: '', priority: '', search: '' })}
        />

        {/* ---------------- Grid ---------------- */}
        <div className="overflow-hidden rounded-md border border-[#C6C6C6] bg-white">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[1200px] border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-[#0F1D24] text-white">
                <tr>
                  {['#', 'Part No.', 'Part Name', 'Customer', 'Category', 'Monthly Target',
                    'Working Days', 'Daily Target', 'Std Cycle', 'Planned Cycle', 'Priority',
                    'Completed', 'Balance', 'Achv %', 'Remarks', ''].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r, idx) => (
                  <tr key={r.id} className="border-b border-[#F5F5F5] hover:bg-[#0F1D24]/[0.015]">
                    <td className="px-3 py-2 font-medium text-[#9B9B9B]">{idx + 1}</td>
                    <td className="px-3 py-2 font-semibold text-[#0F1D24]">{r.partNumber}</td>
                    <td className="px-3 py-2 text-[#0F1D24]">{r.partName}</td>
                    <td className="px-3 py-2 text-[#9B9B9B]">{r.customer}</td>
                    <td className="px-3 py-2 text-[#9B9B9B]">{r.category}</td>

                    <EditableCell
                      value={r.monthlyTarget} disabled={isLocked}
                      onChange={(v) => updateRow(r.id, 'monthlyTarget', v)}
                    />
                    <EditableCell
                      value={r.workingDays} disabled={isLocked}
                      onChange={(v) => updateRow(r.id, 'workingDays', v)}
                    />
                    <td className="px-3 py-2 font-mono text-[#0F1D24]">{r.dailyTarget.toFixed(0)}</td>
                    <EditableCell
                      value={r.stdCycle} disabled={isLocked}
                      onChange={(v) => updateRow(r.id, 'stdCycle', v)}
                    />
                    <EditableCell
                      value={r.plannedCycle} disabled={isLocked}
                      onChange={(v) => updateRow(r.id, 'plannedCycle', v)}
                    />

                    <td className="px-3 py-2">
                      <span className={badge(
                        r.priority === 'High' ? 'border-red-200 bg-red-50 text-red-600'
                        : r.priority === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-600'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      )}>
                        {r.priority}
                      </span>
                    </td>

                    <EditableCell
                      value={r.completed} disabled={isLocked}
                      onChange={(v) => updateRow(r.id, 'completed', v)}
                    />
                    <td className={`px-3 py-2 font-mono font-semibold ${r.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {r.balance.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F5F5F5]">
                          <div
                            className={`h-full ${r.achievement >= 90 ? 'bg-emerald-500' : r.achievement >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, r.achievement)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-[#0F1D24]">
                          {r.achievement.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[#9B9B9B]">{r.remarks || '—'}</td>
                    <td className="px-3 py-2">
                      {!isLocked && (
                        <button onClick={() => removeRow(r.id)} className="text-[#9B9B9B] hover:text-red-500">
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={16} className="px-3 py-10 text-center text-xs font-medium text-[#9B9B9B]">
                      No parts match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------------- Sticky Footer Actions ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#C6C6C6] bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton icon={HiOutlineDocumentArrowUp} label="Import Excel" />
            <ActionButton icon={HiOutlineDocumentArrowDown} label="Export Excel" />
            <ActionButton icon={HiOutlinePrinter} label="Export PDF" />
            <ActionButton icon={HiOutlinePencilSquare} label="Copy Previous Month" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 items-center gap-1.5 rounded-md border border-[#C6C6C6] px-4 text-xs font-semibold text-[#0F1D24] hover:bg-[#F5F5F5]"
            >
              <HiOutlineXMark className="h-4 w-4" /> Cancel
            </button>
            <button
              disabled={isLocked}
              onClick={() => setStatus('Draft')}
              className="flex h-9 items-center gap-1.5 rounded-md border border-[#C6C6C6] px-4 text-xs font-semibold text-[#0F1D24] hover:bg-[#F5F5F5] disabled:opacity-40"
            >
              Save Draft
            </button>
            <button
              disabled={isLocked || rows.length === 0}
              onClick={() => setStatus('Published')}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[#0F1D24] px-4 text-xs font-semibold text-white hover:bg-[#0F1D24]/90 disabled:opacity-40"
            >
              <HiOutlineCheckCircle className="h-4 w-4" /> Save &amp; Publish
            </button>
            <button
              disabled={status !== 'Published'}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[#FDC94D] px-4 text-xs font-semibold text-[#0F1D24] hover:bg-[#FDC94D]/90 disabled:opacity-40"
            >
              <HiOutlineBolt className="h-4 w-4" /> Generate Daily Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label }) {
  return (
    <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#C6C6C6] px-3 text-[11px] font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24] hover:bg-[#0F1D24]/[0.02]">
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function EditableCell({ value, onChange, disabled }) {
  return (
    <td className="px-1.5 py-1.5">
      <input
        type="number"
        min={0}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-20 rounded-md border border-transparent bg-transparent px-2 font-mono text-xs text-[#0F1D24] focus:border-[#0F1D24] focus:bg-[#0F1D24]/[0.02] focus:outline-none disabled:text-[#9B9B9B]"
      />
    </td>
  );
}