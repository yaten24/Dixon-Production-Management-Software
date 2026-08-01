import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { listDailyPlans, deleteDailyPlan } from "../../api/dailyPlanApi";
import Sidebar from "../ProductionPages/Sidebar";

// ============================================================
// THEME TOKENS — kept consistent with Sidebar.jsx / dashboard pages
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/* ---------------------------------------------------------
   MONTH FILTER — compact month/year picker matching the
   theme used across the other dashboard pages.
--------------------------------------------------------- */
const MonthFilter = ({ year, month, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goPrev = () => {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  };
  const goNext = () => {
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  };
  const goToday = () => {
    const now = new Date();
    onChange(now.getFullYear(), now.getMonth());
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <div className="flex items-stretch overflow-hidden rounded-[2px] border border-[#C6C6C6] bg-white">
        <button
          onClick={goPrev}
          className="flex h-8 w-7 items-center justify-center text-[#0F1D24] transition-colors duration-100 hover:bg-[#F4F4F5]"
        >
          <HiOutlineChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 border-x border-[#C6C6C6] px-2.5 text-[11px] font-bold text-[#0F1D24] transition-colors duration-100 hover:bg-[#F4F4F5]"
        >
          <HiOutlineCalendarDays className="h-3.5 w-3.5 text-[#9B9B9B]" />
          {MONTH_NAMES[month]} {year}
        </button>
        <button
          onClick={goNext}
          className="flex h-8 w-7 items-center justify-center text-[#0F1D24] transition-colors duration-100 hover:bg-[#F4F4F5]"
        >
          <HiOutlineChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-[2px] border border-[#C6C6C6] bg-white p-1 shadow-lg">
          <button
            onClick={goToday}
            className="flex w-full items-center justify-center rounded-[2px] bg-[#0F1D24] px-2 py-1.5 text-[10.5px] font-bold text-[#FDC94D] hover:bg-[#0F1D24]/90"
          >
            Jump to Current Month
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------
   PLAN CHIP — small clickable hall/shift tag inside a table row
--------------------------------------------------------- */
const PlanChip = ({ plan, onOpen, onDelete }) => (
  <div
    onClick={() => onOpen(plan)}
    className="group/chip flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#C6C6C6] bg-[#FAFAFA] px-2 py-1 transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24]"
  >
    <span className="text-[10.5px] font-bold text-[#0F1D24] group-hover/chip:text-white">
      {plan.hall} <span className="text-[#9B9B9B] group-hover/chip:text-[#C6C6C6]">· Shift {plan.shift}</span>
    </span>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(plan.daily_plan_id);
      }}
      title="Delete plan"
      className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center text-[#C6C6C6] hover:text-red-500 group-hover/chip:text-[#C6C6C6]"
    >
      <HiOutlineTrash className="h-3 w-3" />
    </button>
  </div>
);

/* ---------------------------------------------------------
   MONTHLY PLAN TABLE — one row per calendar day, all in a
   single view (no internal scrollbar; the page itself scrolls).
--------------------------------------------------------- */
const MonthlyPlanTable = ({ year, month, plansByDate, onOpen, onDelete, onCreate, searchActive }) => {
  const total = daysInMonth(year, month);
  const rows = Array.from({ length: total }, (_, i) => i + 1).map((day) => {
    const date = new Date(year, month, day);
    const key = toDateKey(date);
    const dayPlans = plansByDate.get(key) || [];
    return { day, date, key, dayPlans };
  });

  const visibleRows = searchActive ? rows.filter((r) => r.dayPlans.length > 0) : rows;

  return (
    <div className="overflow-hidden rounded-[2px] border border-[#C6C6C6] bg-white">
      <table className="w-full border-collapse text-[11.5px]">
        <thead className="bg-[#0F1D24] text-white">
          <tr>
            <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wide">Date</th>
            <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wide">Day</th>
            <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wide">Status</th>
            <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wide">Plan Details (Hall · Shift)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EFEFEF]">
          {visibleRows.map(({ day, date, key, dayPlans }) => {
            const isToday = key === todayISO();
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0)) && !isToday;
            const planned = dayPlans.length > 0;
            return (
              <tr
                key={key}
                className={`transition-colors duration-100 ${
                  isToday ? "bg-[#FFFBEB]" : !planned && !isPast ? "bg-red-50/40" : "bg-white hover:bg-[#FAFAFA]"
                }`}
              >
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[12px] font-extrabold text-[#0F1D24]">
                      {String(day).padStart(2, "0")} {MONTH_NAMES[month].slice(0, 3)}
                    </span>
                    {isToday && (
                      <span className="rounded-[2px] border border-[#FDC94D]/60 bg-[#FDC94D]/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#0F1D24]">
                        Today
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 align-top text-[#475569]">
                  {WEEKDAY_SHORT[date.getDay()]}
                </td>
                <td className="px-3 py-2 align-top">
                  {planned ? (
                    <span className="inline-flex items-center gap-1 rounded-[2px] border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                      <HiOutlineCheckCircle className="h-3 w-3" /> Planned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-[2px] border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
                      <HiOutlineExclamationTriangle className="h-3 w-3" /> Not Planned
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {planned ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {dayPlans.map((plan) => (
                        <PlanChip key={plan.daily_plan_id} plan={plan} onOpen={onOpen} onDelete={onDelete} />
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => onCreate(key)}
                      className="flex items-center gap-1 rounded-[2px] border border-dashed border-[#C6C6C6] px-2 py-1 text-[10px] font-bold text-[#9B9B9B] transition-colors duration-100 hover:border-[#0F1D24] hover:text-[#0F1D24]"
                    >
                      <HiOutlinePlus className="h-3 w-3" /> Create plan for this date
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {visibleRows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-10 text-center text-[11.5px] font-semibold text-[#9B9B9B]">
                No plans match your search in {MONTH_NAMES[month]} {year}.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ---------------------------------------------------------
   DailyPlanPage — desktop-app layout: persistent sidebar,
   consolidated control-box header (search + month filter +
   New Plan), single-view monthly table (no nested scrollbar).
--------------------------------------------------------- */
const DailyPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // default view = current month
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

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

  const handleOpen = (plan) => navigate(`/production/plans/detail/${plan.daily_plan_id}`);
  const handleCreate = useCallback(
    (dateKey) => navigate("/production/plans/daily/create", dateKey ? { state: { date: dateKey } } : undefined),
    [navigate],
  );

  const handleMonthChange = (y, m) => {
    setViewYear(y);
    setViewMonth(m);
  };

  // ---- plans for the selected month, optionally filtered by search, grouped by date ----
  const plansByDate = useMemo(() => {
    const q = search.trim().toLowerCase();
    const map = new Map();
    plans.forEach((p) => {
      const d = new Date(p.planning_date);
      if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) return;
      if (q && !(String(p.hall || "").toLowerCase().includes(q) || String(p.shift || "").toLowerCase().includes(q))) return;
      const key = toDateKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return map;
  }, [plans, viewYear, viewMonth, search]);

  const monthPlannedCount = plansByDate.size;
  const monthTotalDays = daysInMonth(viewYear, viewMonth);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pb-3">
          {/* consolidated control box header — title left, search + month filter + actions right */}
          <div className="mx-3 mt-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 rounded-[2px] border border-[#C6C6C6] bg-white px-3 py-2">
            <div className="min-w-0 leading-tight">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#9B9B9B]">Production Planning</p>
              <h1 className="truncate text-[15px] font-extrabold tracking-tight text-[#0F1D24]">Daily Production Plans</h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex min-w-[170px] items-center gap-1.5 rounded-[2px] border border-[#C6C6C6] px-2 py-1.5">
                <HiOutlineMagnifyingGlass className="h-3.5 w-3.5 flex-shrink-0 text-[#9B9B9B]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by hall or shift..."
                  className="w-full text-[11px] font-medium text-[#0F1D24] outline-none placeholder:text-[#B0B0B0]"
                />
              </div>

              <MonthFilter year={viewYear} month={viewMonth} onChange={handleMonthChange} />

              <div className="h-6 w-px flex-shrink-0 bg-[#C6C6C6]" />

              <button
                onClick={() => navigate("/employee/dashboard")}
                className="flex h-8 items-center gap-1.5 rounded-[2px] border border-[#C6C6C6] bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
              >
                <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
                Dashboard
              </button>
              <button
                onClick={() => handleCreate()}
                className="flex h-8 items-center gap-1.5 rounded-[2px] border border-[#0F1D24] bg-[#0F1D24] px-2.5 text-[11px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90"
              >
                <HiOutlinePlus className="h-3.5 w-3.5" />
                New Plan
              </button>
            </div>
          </div>

          {!loading && !error && (
            <div className="mx-3 flex flex-shrink-0 items-center justify-between text-[10.5px] font-semibold text-[#9B9B9B]">
              <span>
                {MONTH_NAMES[viewMonth]} {viewYear} ·{" "}
                <span className="text-[#0F1D24]">{monthPlannedCount}</span> of{" "}
                <span className="text-[#0F1D24]">{monthTotalDays}</span> days planned
              </span>
              {monthPlannedCount < monthTotalDays && !search && (
                <span className="flex items-center gap-1 text-red-600">
                  <HiOutlineExclamationTriangle className="h-3.5 w-3.5" />
                  {monthTotalDays - monthPlannedCount} date(s) not planned this month
                </span>
              )}
            </div>
          )}

          <div className="mx-3">
            {loading ? (
              <div className="rounded-[2px] border border-[#C6C6C6] bg-white py-10 text-center text-xs text-[#9B9B9B]">Loading plans...</div>
            ) : error ? (
              <div className="rounded-[2px] border border-red-300 bg-red-50 py-8 text-center text-xs font-semibold text-red-600">{error}</div>
            ) : (
              <MonthlyPlanTable
                year={viewYear}
                month={viewMonth}
                plansByDate={plansByDate}
                onOpen={handleOpen}
                onDelete={handleDelete}
                onCreate={handleCreate}
                searchActive={search.trim() !== ""}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DailyPlanPage;