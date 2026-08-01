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
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { listDailyPlans, deleteDailyPlan } from "../../api/dailyPlanApi";
import Sidebar from "../ProductionPages/Sidebar";

// ============================================================
// THEME TOKENS — unified with PartProductionDashboard.jsx
// (same border colour, border width, radius, and spacing rhythm)
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";
const PAGE_BG = "#EFEFEF";
const BORDER_COLOR = "#C6C6C6";
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayISO = () => toDateKey(new Date());
const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/* ---------------------------------------------------------
   MONTH FILTER — dark segmented control, matches the header's
   date-pill styling from the reference.
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

  const goPrev = () => (month === 0 ? onChange(year - 1, 11) : onChange(year, month - 1));
  const goNext = () => (month === 11 ? onChange(year + 1, 0) : onChange(year, month + 1));
  const goToday = () => {
    const now = new Date();
    onChange(now.getFullYear(), now.getMonth());
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <div className="flex h-7 items-stretch overflow-hidden rounded-[2px] border border-white/15">
        <button onClick={goPrev} className="flex w-6 items-center justify-center text-white transition-colors duration-100 hover:bg-white/10">
          <HiOutlineChevronLeft className="h-3 w-3" />
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 border-x border-white/15 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:bg-white/10"
        >
          <HiOutlineCalendarDays className="h-3.5 w-3.5" />
          {MONTH_NAMES[month]} {year}
        </button>
        <button onClick={goNext} className="flex w-6 items-center justify-center text-white transition-colors duration-100 hover:bg-white/10">
          <HiOutlineChevronRight className="h-3 w-3" />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-44 rounded-[2px] border border-[#C6C6C6] bg-white p-1 shadow-lg">
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
    className="group/chip flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#C6C6C6] bg-[#FAFAFB] px-2 py-1 transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24]"
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
      className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center text-[#9B9B9B] hover:text-red-500 group-hover/chip:text-[#C6C6C6]"
    >
      <HiOutlineTrash className="h-3 w-3" />
    </button>
  </div>
);

/* ---------------------------------------------------------
   DailyPlanPage — dark navy control header (same rhythm as the
   reference screen), single white table-section card, and a
   fixed-height shell so the whole month fits on one screen
   with no page-level scrollbar.
--------------------------------------------------------- */
const DailyPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  const monthTotalDays = daysInMonth(viewYear, viewMonth);
  const monthPlannedCount = plansByDate.size;
  const monthNotPlanned = monthTotalDays - monthPlannedCount;
  const searchActive = search.trim() !== "";

  const rows = useMemo(() => {
    const all = Array.from({ length: monthTotalDays }, (_, i) => i + 1).map((day) => {
      const date = new Date(viewYear, viewMonth, day);
      const key = toDateKey(date);
      return { day, date, key, dayPlans: plansByDate.get(key) || [] };
    });
    return searchActive ? all.filter((r) => r.dayPlans.length > 0) : all;
  }, [monthTotalDays, viewYear, viewMonth, plansByDate, searchActive]);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden" style={{ background: PAGE_BG }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-[2px] border border-[#C6C6C6]">
            {/* dark navy control header — same border weight/colour as the reference screen */}
            <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
                <div className="min-w-0 leading-tight">
                  <h1 className="truncate text-[18px] font-extrabold uppercase tracking-wide text-white">
                    Daily Production Plans
                  </h1>
                  <p className="mt-0.5 truncate text-[10.5px] font-semibold text-white/50">
                    Monthly plan coverage &amp; hall/shift assignment
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-7 min-w-[170px] items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/5 px-2.5">
                    <HiOutlineMagnifyingGlass className="h-3.5 w-3.5 flex-shrink-0 text-white/50" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search hall or shift..."
                      className="w-full bg-transparent text-[10.5px] font-semibold text-white outline-none placeholder:text-white/40"
                    />
                  </div>

                  <MonthFilter year={viewYear} month={viewMonth} onChange={handleMonthChange} />

                  <div className="h-6 w-px flex-shrink-0 bg-white/10" />

                  <button
                    onClick={fetchPlans}
                    disabled={loading}
                    className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30 disabled:opacity-50"
                  >
                    <HiOutlineArrowPath className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
                  </button>

                  <button
                    onClick={() => navigate("/employee/dashboard")}
                    className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
                  >
                    <HiOutlineSquares2X2 className="h-3.5 w-3.5" /> Dashboard
                  </button>

                  <button
                    onClick={() => handleCreate()}
                    className="flex h-7 items-center gap-1.5 rounded-[2px] bg-[#FDC94D] px-3 text-[10.5px] font-extrabold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/90"
                  >
                    <HiOutlinePlus className="h-3.5 w-3.5" /> New Plan
                  </button>
                </div>
              </div>
            </header>

            {/* secondary dark info strip — same border colour/weight as the header */}
            <div className="mx-2 flex flex-shrink-0 flex-wrap items-center gap-x-6 gap-y-1 rounded-[2px] border border-white/10 bg-[#0F1D24] px-3 py-2 text-[11px] font-bold text-white/80">
              <span className="flex items-center gap-1.5">
                <HiOutlineCalendarDays className="h-3.5 w-3.5" style={{ color: GOLD }} />
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="h-3.5 w-3.5" style={{ color: SUCCESS }} />
                <span className="text-white">{monthPlannedCount}</span> Planned
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineExclamationTriangle className="h-3.5 w-3.5" style={{ color: DANGER }} />
                <span className="text-white">{monthNotPlanned}</span> Not Planned
              </span>
              <span className="ml-auto text-white/50">Total Days: <span className="text-white">{monthTotalDays}</span></span>
            </div>

            {error && (
              <div className="mx-2 flex-shrink-0 rounded-[2px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] font-semibold text-rose-700">
                {error}
              </div>
            )}

            {/* single table-section card — matches PartsTable border colour/width exactly */}
            <div className="min-h-0 flex-1 overflow-hidden p-1">
              <div className={`flex h-full min-h-0 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
                <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-1.5">
                  <div>
                    <h2 className="text-[16px] font-extrabold text-[#0F1D24]">Monthly Plan Coverage</h2>
                    <p className="text-[11.5px] font-medium text-[#9B9B9B]">
                      All dates &middot; {MONTH_NAMES[viewMonth]} {viewYear}
                    </p>
                  </div>
                  <span className="rounded-[2px] border border-[#C6C6C6] px-2 py-0.5 text-[10.5px] font-bold text-[#0F1D24]">
                    {rows.length} {searchActive ? "matching" : "days"}
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                  {loading ? (
                    <div className="flex h-full items-center justify-center text-[11.5px] font-semibold text-[#9B9B9B]">Loading plans...</div>
                  ) : error ? (
                    <div className="flex h-full items-center justify-center text-[11.5px] font-semibold text-red-600">{error}</div>
                  ) : (
                    <div className="flex h-full min-h-0 flex-col">
                      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
                        {(() => {
                          const chunkCount = 3;
                          const chunkSize = Math.ceil(rows.length / chunkCount) || 1;
                          const chunks = Array.from({ length: chunkCount }, (_, i) =>
                            rows.slice(i * chunkSize, i * chunkSize + chunkSize),
                          );
                          return chunks;
                        })().map((chunk, chunkIdx) => (
                          <table key={chunkIdx} className="w-full border-collapse text-[12.5px]">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-[#FAFAFB]">
                                {["Date", "Day", "Status", "Plan Details"].map((h) => (
                                  <th
                                    key={h}
                                    className="whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1.5 text-left text-[10px] font-bold uppercase tracking-wide text-[#9B9B9B]"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {chunk.map(({ day, date, key, dayPlans }) => {
                                const isToday = key === todayISO();
                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0)) && !isToday;
                                const planned = dayPlans.length > 0;
                                return (
                                  <tr
                                    key={key}
                                    className={`${
                                      isToday ? "bg-[#FDC94D]/10" : !planned && !isPast ? "bg-rose-50/40" : "hover:bg-[#FAFAFB]"
                                    }`}
                                  >
                                    <td className="border border-[#C6C6C6] px-2.5 py-1.5 align-middle">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[11px] font-extrabold text-[#0F1D24]">
                                          {String(day).padStart(2, "0")} {MONTH_NAMES[viewMonth].slice(0, 3)}
                                        </span>
                                        {isToday && (
                                          <span className="rounded-[2px] border border-[#FDC94D]/60 bg-[#FDC94D]/20 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#0F1D24]">
                                            Today
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="border border-[#C6C6C6] px-2.5 py-1.5 align-middle text-[#6B6B6B]">
                                      {WEEKDAY_SHORT[date.getDay()]}
                                    </td>
                                    <td className="border border-[#C6C6C6] px-2.5 py-1.5 align-middle">
                                      {planned ? (
                                        <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500">
                                          Planned
                                        </span>
                                      ) : (
                                        <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500">
                                          Not Planned
                                        </span>
                                      )}
                                    </td>
                                    <td className="border border-[#C6C6C6] px-2.5 py-1.5 align-middle">
                                      {planned ? (
                                        <div className="flex flex-wrap items-center gap-1">
                                          {dayPlans.map((plan) => (
                                            <PlanChip key={plan.daily_plan_id} plan={plan} onOpen={handleOpen} onDelete={handleDelete} />
                                          ))}
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleCreate(key)}
                                          className="flex items-center gap-1 rounded-[2px] border border-dashed border-[#C6C6C6] px-1.5 py-0.5 text-[9px] font-bold text-[#9B9B9B] transition-colors duration-100 hover:border-[#0F1D24] hover:text-[#0F1D24]"
                                        >
                                          <HiOutlinePlus className="h-2.5 w-2.5" /> Create
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                              {chunk.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="border border-[#C6C6C6] px-2.5 py-6 text-center text-[#9B9B9B]">
                                    {chunkIdx === 0 ? `No plans match your search in ${MONTH_NAMES[viewMonth]} ${viewYear}.` : ""}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        ))}
                      </div>

                      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1.5">
                        <span className="text-[11px] font-extrabold text-[#0F1D24]">
                          Total: <span className="font-mono">{monthPlannedCount} / {monthTotalDays}</span> days planned
                        </span>
                        <span className="text-[9px] font-semibold text-[#9B9B9B]">
                          {monthNotPlanned > 0 ? `${monthNotPlanned} date(s) still need a plan` : "All dates covered"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DailyPlanPage;