import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineArrowRight,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineClipboardDocumentList,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { listDailyPlans, deleteDailyPlan } from "../../api/dailyPlanApi";
import Sidebar from "../ProductionPages/Sidebar";

// ==========================================================
// THEME TOKENS — matches PartProductionDashboard.jsx
// ==========================================================
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Backend sends a full ISO datetime (e.g. "2026-07-19T18:30:00.000Z"), so we
// parse it directly instead of re-appending a time part (which produced an
// Invalid Date and left the card blank).
const formatDate = (isoDateTime) => {
  const d = new Date(isoDateTime);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return { weekday, day, month };
};

// "YYYY-MM-DD" key in the browser's local timezone, so an ISO datetime that
// represents local midnight compares correctly against today's date.
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayISO = () => toDateKey(new Date());

function formatMonthLabel(monthValue) {
  if (!monthValue) return "All Months";
  const [yyyy, mm] = monthValue.split("-");
  const d = new Date(`${yyyy}-${mm}-01T00:00:00`);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

// ==========================================================
// Shared outside-click hook for closing popovers
// ==========================================================
function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

// ==========================================================
// CUSTOM MONTH PICKER — year nav + 12-month grid, plus "All Months"
// ==========================================================
function MonthPickerPanel({ value, onSelect, onClose }) {
  const [yy] = value ? value.split("-") : [String(new Date().getFullYear())];
  const [viewYear, setViewYear] = useState(Number(yy));

  return (
    <div className="w-52 p-2">
      <button
        onClick={() => {
          onSelect("");
          onClose();
        }}
        className={`mb-1 w-full rounded-[2px] px-2 py-1.5 text-left text-[11px] font-semibold ${
          !value ? "bg-[#FDC94D]/15 text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
        }`}
      >
        All Months
      </button>
      <div className="flex items-center justify-between border-t border-[#EDEDED] px-1 pb-2 pt-2">
        <button
          onClick={() => setViewYear((y) => y - 1)}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#6B6B6B] hover:bg-[#FAFAFB]"
        >
          <HiOutlineChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[12px] font-extrabold text-[#0F1D24]">{viewYear}</span>
        <button
          onClick={() => setViewYear((y) => y + 1)}
          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#6B6B6B] hover:bg-[#FAFAFB]"
        >
          <HiOutlineChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1 px-1 pb-1">
        {MONTH_NAMES.map((m, idx) => {
          const monthValue = `${viewYear}-${pad2(idx + 1)}`;
          const isSelected = monthValue === value;
          return (
            <button
              key={m}
              onClick={() => {
                onSelect(monthValue);
                onClose();
              }}
              className={`rounded-[2px] px-2 py-1.5 text-[11px] font-semibold transition-colors duration-100 ${
                isSelected ? "bg-[#FDC94D] font-extrabold text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================
// MONTH CONTROL — trigger button + popover
// ==========================================================
function MonthControl({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/5 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
      >
        <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0 text-white/60" />
        <span className="whitespace-nowrap">{formatMonthLabel(value)}</span>
        <HiOutlineChevronDown
          className={`h-3 w-3 shrink-0 text-white/40 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-30 rounded-[2px] border border-[#C6C6C6] bg-white shadow-lg">
          <MonthPickerPanel value={value} onSelect={onChange} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ==========================================================
// SEARCH FIELD — dark header style, matches FilterField pattern
// ==========================================================
function SearchField({ value, onChange }) {
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/5 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30">
      <HiOutlineMagnifyingGlass className="h-3.5 w-3.5 shrink-0 text-white/60" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search hall, shift, date..."
        className="w-40 bg-transparent text-white outline-none placeholder:text-white/40"
      />
      {value && (
        <button onClick={() => onChange("")} className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-white/50 hover:text-white">
          <HiOutlineXMark className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ==========================================================
// HEADER — dark navy, matches DashboardHeader in PartProductionDashboard
// ==========================================================
function PageHeader({ search, onSearchChange, monthFilter, onMonthChange, onDashboard, onCreate }) {
  return (
    <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <h1 className="text-[18px] font-extrabold uppercase tracking-wide text-white">Operator Allocation</h1>
          <span className="hidden text-[10.5px] font-medium text-white/40 sm:inline">Assign operators to daily production plans</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MonthControl value={monthFilter} onChange={onMonthChange} />
          <SearchField value={search} onChange={onSearchChange} />

          <button
            onClick={onDashboard}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineSquares2X2 className="h-3.5 w-3.5" /> Dashboard
          </button>

          <button
            onClick={onCreate}
            className="flex h-7 items-center gap-1.5 rounded-[2px] bg-[#FDC94D] px-3 text-[10.5px] font-extrabold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/90"
          >
            <HiOutlinePlus className="h-3.5 w-3.5" /> New Plan
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================================
// STAT CARD — dark navy surface, matches PartProductionDashboard
// ==========================================================
function StatCard({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="rounded-[2px] border border-white/10 bg-[#0F1D24] p-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-[#FDC94D]/15 text-[#FDC94D]">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-white/40">{label}</p>
          <p className={`text-[18px] font-extrabold leading-tight tracking-tight ${tone || "text-white"}`}>{value}</p>
        </div>
      </div>
      {sub && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
          <span className="truncate text-white/40">{sub}</span>
        </div>
      )}
    </div>
  );
}

// ==========================================================
// PLANS TABLE — white surface, light header row, matches PartsTable
// ==========================================================
function PlansTable({ rows, loading, error, search, onCreate, onAssign, onDelete }) {
  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-1.5">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#0F1D24]">Daily Plans</h2>
          <p className="text-[11.5px] font-medium text-[#9B9B9B]">Select a plan to assign operators</p>
        </div>
        <span className="rounded-[2px] border border-[#C6C6C6] px-2 py-0.5 text-[10.5px] font-bold text-[#0F1D24]">
          {rows.length} plans
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#FAFAFB]">
              {["#", "Date", "Hall", "Shift", "Status", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className={`whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9B9B9B] ${
                    i === 5 ? "text-center" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="border border-[#C6C6C6] px-3 py-8 text-center text-[#9B9B9B]">
                  Loading plans…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="border border-[#C6C6C6] px-3 py-8 text-center font-semibold text-rose-600">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-[#C6C6C6] px-3 py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <HiOutlineExclamationTriangle className="h-6 w-6 text-[#9B9B9B]" />
                    <p className="text-[12.5px] font-bold text-[#0F1D24]">
                      {search ? "No plans match your search." : "No plans found"}
                    </p>
                    {!search && (
                      <>
                        <p className="max-w-xs text-[11px] text-[#9B9B9B]">
                          There are no daily production plans yet. Create one to get started.
                        </p>
                        <button
                          onClick={onCreate}
                          className="mt-1.5 flex items-center gap-1.5 rounded-[2px] bg-[#0F1D24] px-3 py-1.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90"
                        >
                          <HiOutlinePlus className="h-3.5 w-3.5" /> Create new plan
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((plan, idx) => {
                const parsedDate = new Date(plan.planning_date);
                const { weekday, day, month } = formatDate(plan.planning_date);
                const isToday = toDateKey(parsedDate) === todayISO();

                return (
                  <tr key={plan.daily_plan_id} onClick={() => onAssign(plan)} className="cursor-pointer hover:bg-[#FAFAFB]">
                    <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#9B9B9B]">{idx + 1}</td>
                    <td className="border border-[#C6C6C6] px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] bg-[#0F1D24] text-[#FDC94D]">
                          <span className="text-[9.5px] font-bold leading-none">{day}</span>
                        </div>
                        <span className="font-bold text-[#0F1D24]">
                          {weekday}, {month} {day}
                        </span>
                      </div>
                    </td>
                    <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#0F1D24]">{plan.hall}</td>
                    <td className="border border-[#C6C6C6] px-2.5 py-1.5 text-[#6B6B6B]">Shift {plan.shift}</td>
                    <td className="border border-[#C6C6C6] px-2.5 py-1.5">
                      {isToday ? (
                        <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] bg-[#FDC94D]/25 px-2 py-0.5 text-[10px] font-bold text-[#0F1D24]">
                          Today
                        </span>
                      ) : (
                        <span className="text-[#9B9B9B]">&ndash;</span>
                      )}
                    </td>
                    <td className="border border-[#C6C6C6] px-2.5 py-1.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssign(plan);
                          }}
                          title="Assign operators"
                          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#0F1D24] hover:bg-[#FDC94D]/25"
                        >
                          <HiOutlineArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(plan.daily_plan_id);
                          }}
                          title="Delete plan"
                          className="flex h-6 w-6 items-center justify-center rounded-[2px] text-rose-500 hover:bg-rose-50"
                        >
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================================
// PAGE
// ==========================================================
export default function DailyPlanPageForOperatorAllocation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listDailyPlans();
      setPlans(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await deleteDailyPlan(id);
      setPlans((prev) => prev.filter((p) => p.daily_plan_id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete plan");
    }
  };

  const handleAssignOperators = (plan) => navigate(`/production/plans/${plan.daily_plan_id}/operator/allocation`);
  const handleCreate = () => navigate("/production/plans/daily/create");

  const hasTodayPlan = plans.some((p) => toDateKey(new Date(p.planning_date)) === todayISO());
  const hallsInUse = useMemo(() => new Set(plans.map((p) => p.hall)).size, [plans]);

  const filteredPlans = useMemo(() => {
    let list = plans;

    if (monthFilter) {
      list = list.filter((p) => {
        const d = new Date(p.planning_date);
        const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
        return key === monthFilter;
      });
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.hall, p.shift, p.planning_date].filter(Boolean).some((field) => String(field).toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(a.planning_date) - new Date(b.planning_date));
  }, [plans, search, monthFilter]);

  const todayLabel = formatDate(new Date().toISOString());

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((c) => !c)} activePath={location.pathname} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-[2px] border border-[#C6C6C6]">
            <PageHeader
              search={search}
              onSearchChange={setSearch}
              monthFilter={monthFilter}
              onMonthChange={setMonthFilter}
              onDashboard={() => navigate("/production/home")}
              onCreate={handleCreate}
            />

            {!loading && !error && plans.length > 0 && !hasTodayPlan && (
              <div className="mx-2 flex-shrink-0 rounded-[2px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] font-semibold text-rose-700">
                No plan exists for today — create one immediately.
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-hidden p-1">
              <div className="flex h-full min-h-0 flex-col gap-2">
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard
                    icon={HiOutlineCalendarDays}
                    label="Today"
                    value={`${todayLabel.weekday}, ${todayLabel.month} ${todayLabel.day}`}
                  />
                  <StatCard icon={HiOutlineClipboardDocumentList} label="Total Plans" value={plans.length} />
                  <StatCard icon={HiOutlineBuildingOffice2} label="Halls In Use" value={hallsInUse} />
                  <StatCard
                    icon={hasTodayPlan ? HiOutlineCheckCircle : HiOutlineExclamationTriangle}
                    label="Today's Status"
                    value={hasTodayPlan ? "Planned" : "Missing"}
                    tone={hasTodayPlan ? "text-emerald-400" : "text-rose-400"}
                  />
                </div>

                <div className="min-h-0 flex-1">
                  <PlansTable
                    rows={filteredPlans}
                    loading={loading}
                    error={error}
                    search={search}
                    onCreate={handleCreate}
                    onAssign={handleAssignOperators}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}