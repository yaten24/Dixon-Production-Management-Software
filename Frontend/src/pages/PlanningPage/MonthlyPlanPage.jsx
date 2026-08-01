import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineArrowRight,
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiOutlineMagnifyingGlass,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { listMonthlyPlans, deleteMonthlyPlan } from "../../api/monthlyPlanApi";
import Sidebar from "../ProductionPages/Sidebar";

// ============================================================
// THEME TOKENS — unified with PartProductionDashboard.jsx / DailyPlanPage.jsx
// (same border colour, border width, radius, and spacing rhythm)
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

// how many years to show side-by-side (fixed range)
const YEAR_RANGE_BACK = 1;  // years before current year
const YEAR_RANGE_FORWARD = 2; // years after current year (total = 1 + 1 + 2 = 4 years)

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

/* ---------------------------------------------------------
   YEAR FILTER — dropdown listing years present in the range
--------------------------------------------------------- */
function YearFilter({ years, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/5 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
      >
        <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0 text-white/60" />
        <span className="text-white/50">Year:</span>
        <span>{value || "All"}</span>
        <HiOutlineChevronDown className={`h-3 w-3 shrink-0 text-white/40 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 max-h-56 w-32 overflow-auto rounded-[2px] border border-[#C6C6C6] bg-white py-1 shadow-lg">
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`flex w-full items-center px-2.5 py-1.5 text-left text-[11.5px] font-semibold ${
              !value ? "bg-[#FDC94D]/15 text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
            }`}
          >
            All
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => {
                onChange(y);
                setOpen(false);
              }}
              className={`flex w-full items-center px-2.5 py-1.5 text-left text-[11.5px] font-semibold ${
                value === y ? "bg-[#FDC94D]/15 text-[#0F1D24]" : "text-[#4B4B4B] hover:bg-[#FAFAFB]"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   MINI STAT — dark strip, matches DailyPlanPage's info strip
--------------------------------------------------------- */
const MiniStat = ({ icon: Icon, label, value, accent = GOLD }) => (
  <span className="flex items-center gap-1.5">
    <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
    <span className="text-white">{value}</span> {label}
  </span>
);

/* ---------------------------------------------------------
   EmptyStateWarning — flat dashed panel, rounded-[2px] corners
--------------------------------------------------------- */
const EmptyStateWarning = ({ onCreate, filtered }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-[2px] border border-dashed border-[#C6C6C6] bg-white py-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[2px] border border-red-200 bg-red-50 text-red-500">
      <HiOutlineExclamationTriangle className="h-6 w-6" />
    </div>

    <p className="text-[13px] font-bold text-[#0F1D24]">{filtered ? "No plans match your search" : "No plans found"}</p>
    <p className="mt-1 max-w-xs text-[11.5px] text-[#9B9B9B]">
      {filtered
        ? "Try a different year, range, or clear the search."
        : "There are no monthly production plans yet. Create one to get started."}
    </p>

    {!filtered && (
      <button
        onClick={() => onCreate()}
        className="mt-4 flex items-center gap-1.5 rounded-[2px] border border-[#0F1D24] bg-[#0F1D24] px-4 py-2 text-xs font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
      >
        <HiOutlinePlus className="h-3.5 w-3.5" />
        Create new plan
      </button>
    )}
  </div>
);

/* ---------------------------------------------------------
   YEAR TABLE — fills the full height/width of its grid cell.
   Every month row that has no plan gets an inline "Create" action.
--------------------------------------------------------- */
function YearTable({ year, monthMap, currentMonth, currentYear, onOpen, onDelete, onCreate }) {
  const isCurrentYear = Number(year) === currentYear;

  return (
    <div className={`flex h-full w-full min-h-0 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1.5">
        <h2 className="text-[13px] font-extrabold text-[#0F1D24]">{year}</h2>
        {isCurrentYear && (
          <span className="rounded-[2px] border border-[#FDC94D]/60 bg-[#FDC94D]/20 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
            This Year
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#FAFAFB]">
              {["Month", "Status", "Action"].map((h, i) => (
                <th
                  key={h}
                  className={`whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#9B9B9B] ${
                    i === 2 ? "text-center" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MONTH_NAMES.map((mName, idx) => {
              const monthNum = idx + 1;
              const plan = monthMap.get(monthNum);
              const planned = Boolean(plan);
              const isCurrent = isCurrentYear && monthNum === currentMonth;
              // months strictly before the current month/year have no plan data in the
              // software database — these are not creatable, just a historical warning.
              const isPastMonth = Number(year) < currentYear || (isCurrentYear && monthNum < currentMonth);
              const isPastUnplanned = !planned && isPastMonth;
              const isFutureUnplanned = !planned && !isPastMonth;

              return (
                <tr
                  key={mName}
                  onClick={() => planned && onOpen(plan)}
                  className={`${planned ? "cursor-pointer" : ""} ${
                    isCurrent ? "bg-[#FDC94D]/10" : planned ? "hover:bg-[#FAFAFB]" : isPastUnplanned ? "bg-[#F3F3F3]" : "bg-rose-50/30"
                  }`}
                >
                  <td className="whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1.5 font-semibold text-[#0F1D24]">
                    {mName}
                    {isCurrent && <span className="ml-1.5 text-[8px] font-bold uppercase text-[#B8860B]">Now</span>}
                  </td>
                  <td className="whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1.5">
                    {planned ? (
                      <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700 before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500">
                        Planned
                      </span>
                    ) : isPastUnplanned ? (
                      <span
                        title="Planning not available in software database"
                        className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] bg-[#EFEFEF] px-2 py-0.5 text-[9.5px] font-bold text-[#6B6B6B] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#9B9B9B]"
                      >
                        Not Available
                      </span>
                    ) : (
                      <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] bg-rose-50 px-2 py-0.5 text-[9.5px] font-bold text-rose-700 before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500">
                        Not Planned
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap border border-[#C6C6C6] px-2 py-1 text-center">
                    {planned ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen(plan);
                          }}
                          title="Open plan"
                          className="flex h-5 w-5 items-center justify-center text-[#9B9B9B] hover:text-[#0F1D24]"
                        >
                          <HiOutlineArrowRight className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(plan.monthly_plan_id);
                          }}
                          title="Delete plan"
                          className="flex h-5 w-5 items-center justify-center text-[#9B9B9B] hover:text-red-500"
                        >
                          <HiOutlineTrash className="h-3 w-3" />
                        </button>
                      </div>
                    ) : isPastUnplanned ? (
                      <span
                        title="Planning not available in software database"
                        className="text-[10px] font-semibold italic text-[#B0B0B0]"
                      >
                        No data
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreate(Number(year), monthNum);
                        }}
                        className="mx-auto flex items-center gap-1 rounded-[2px] border border-dashed border-[#C6C6C6] px-1.5 py-0.5 text-[9px] font-bold text-[#9B9B9B] transition-colors duration-100 hover:border-[#0F1D24] hover:text-[#0F1D24]"
                      >
                        <HiOutlinePlus className="h-2.5 w-2.5" /> Create
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MonthlyPlanPage — same fixed-height shell as PartProductionDashboard
   and DailyPlanPage: dark navy control header (search + filters inline),
   dark stat strip, fixed 3–4 year range tables filling full height/width.
--------------------------------------------------------- */
const MonthlyPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [rangeFilter, setRangeFilter] = useState("all"); // all | current | upcoming | past
  const [yearFilter, setYearFilter] = useState("");

  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listMonthlyPlans();
      setPlans(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await deleteMonthlyPlan(id);
      setPlans((prev) => prev.filter((p) => p.monthly_plan_id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete plan");
    }
  };

  const handleOpen = (plan) => navigate(`/production/plans/monthly/detail/${plan.monthly_plan_id}`);
  const handleCreate = (year, month) =>
    navigate(
      "/production/plans/monthly/create",
      year && month ? { state: { year, month } } : undefined,
    );

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  const hasCurrentPlan = plans.some((p) => p.plan_month === currentMonth && p.plan_year === currentYear);
  const hasNextPlan = plans.some((p) => p.plan_month === nextMonth && p.plan_year === nextYear);

  // ---- derived stats ----
  const stats = useMemo(() => {
    const upcoming = plans.filter(
      (p) => p.plan_year > currentYear || (p.plan_year === currentYear && p.plan_month >= currentMonth)
    ).length;
    const past = plans.length - upcoming;
    return { total: plans.length, upcoming, past };
  }, [plans, currentMonth, currentYear]);

  // ---- fixed 4-year range: currentYear-1 .. currentYear+2 (merged with any outlier plan years) ----
  const rangeYears = useMemo(() => {
    const base = [];
    for (let y = currentYear - YEAR_RANGE_BACK; y <= currentYear + YEAR_RANGE_FORWARD; y++) base.push(String(y));
    const planYears = new Set(plans.map((p) => String(p.plan_year)));
    const merged = new Set([...base, ...planYears]);
    return Array.from(merged).sort((a, b) => a - b);
  }, [plans, currentYear]);

  // ---- filtered list (search + range + year) ----
  const visiblePlans = useMemo(() => {
    let list = [...plans];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const label = `${MONTH_NAMES[p.plan_month - 1]} ${p.plan_year}`.toLowerCase();
        return label.includes(q);
      });
    }

    if (yearFilter) {
      list = list.filter((p) => String(p.plan_year) === String(yearFilter));
    }

    if (rangeFilter === "current") {
      list = list.filter((p) => p.plan_month === currentMonth && p.plan_year === currentYear);
    } else if (rangeFilter === "upcoming") {
      list = list.filter((p) => p.plan_year > currentYear || (p.plan_year === currentYear && p.plan_month >= currentMonth));
    } else if (rangeFilter === "past") {
      list = list.filter((p) => p.plan_year < currentYear || (p.plan_year === currentYear && p.plan_month < currentMonth));
    }

    return list;
  }, [plans, search, rangeFilter, yearFilter, currentMonth, currentYear]);

  const isFiltered = search.trim() !== "" || rangeFilter !== "all" || yearFilter !== "";

  // ---- group into year -> (month -> plan) maps for the tables ----
  const yearGroups = useMemo(() => {
    const years = yearFilter ? [yearFilter] : rangeYears;
    return years
      .map((year) => {
        const monthMap = new Map();
        visiblePlans
          .filter((p) => String(p.plan_year) === String(year))
          .forEach((p) => monthMap.set(p.plan_month, p));
        return { year, monthMap };
      })
      .filter((g) => !isFiltered || yearFilter || g.monthMap.size > 0)
      .sort((a, b) => a.year - b.year);
  }, [rangeYears, yearFilter, visiblePlans, isFiltered]);

  const gridColsClass =
    yearGroups.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : yearGroups.length === 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : yearGroups.length === 2
      ? "sm:grid-cols-2"
      : "grid-cols-1";

  const RANGE_TABS = [
    { id: "all", label: "All" },
    { id: "current", label: "Current" },
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
  ];

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-[2px] border border-[#C6C6C6]">
            {/* dark navy control header — search + filters + actions, same rhythm as reference screens */}
            <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
                <div className="min-w-0 leading-tight">
                  <h1 className="truncate text-[18px] font-extrabold uppercase tracking-wide text-white">
                    Monthly Production Plans
                  </h1>
                  <p className="mt-0.5 truncate text-[10.5px] font-semibold text-white/50">
                    {rangeYears[0]}&ndash;{rangeYears[rangeYears.length - 1]} plan coverage
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-7 min-w-[170px] items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/5 px-2.5">
                    <HiOutlineMagnifyingGlass className="h-3.5 w-3.5 flex-shrink-0 text-white/50" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by month or year..."
                      className="w-full bg-transparent text-[10.5px] font-semibold text-white outline-none placeholder:text-white/40"
                    />
                  </div>

                  <YearFilter years={rangeYears} value={yearFilter} onChange={setYearFilter} />

                  <div className="flex items-stretch overflow-hidden rounded-[2px] border border-white/15">
                    {RANGE_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setRangeFilter(tab.id)}
                        className={`h-7 px-2.5 text-[10.5px] font-bold transition-colors duration-100 ${
                          rangeFilter === tab.id ? "bg-[#FDC94D] text-[#0F1D24]" : "text-white/60 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

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

            {/* secondary dark info strip — stats, same style as DailyPlanPage */}
            <div className="mx-2 flex flex-shrink-0 flex-wrap items-center gap-x-6 gap-y-1 rounded-[2px] border border-white/10 bg-[#0F1D24] px-3 py-2 text-[11px] font-bold text-white/80">
              <MiniStat icon={HiOutlineClipboardDocumentList} label="Total Plans" value={stats.total} accent={GOLD} />
              <MiniStat icon={HiOutlineArrowRight} label="Upcoming" value={stats.upcoming} accent="#60A5FA" />
              <MiniStat icon={HiOutlineCalendarDays} label="Past" value={stats.past} accent="#C084FC" />
              <MiniStat
                icon={hasCurrentPlan ? HiOutlineCheckCircle : HiOutlineExclamationTriangle}
                label={`${MONTH_NAMES[currentMonth - 1]} Status`}
                value={hasCurrentPlan ? "Planned" : "Missing"}
                accent={hasCurrentPlan ? SUCCESS : DANGER}
              />
              <span className="ml-auto text-white/50">
                Showing: <span className="text-white">{yearFilter || `${rangeYears[0]}\u2013${rangeYears[rangeYears.length - 1]}`}</span>
              </span>
            </div>

            {/* warnings — flat, bordered */}
            {!loading && !error && plans.length > 0 && !hasCurrentPlan && (
              <div className="mx-2 flex flex-shrink-0 items-center gap-2 rounded-[2px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] font-semibold text-rose-700">
                <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
                No plan exists for {MONTH_NAMES[currentMonth - 1]} {currentYear} — create one immediately.
              </div>
            )}
            {!loading && !error && hasCurrentPlan && !hasNextPlan && (
              <div className="mx-2 flex flex-shrink-0 items-center gap-2 rounded-[2px] border border-[#FDC94D]/60 bg-[#FDC94D]/10 px-3 py-2 text-[11.5px] font-semibold text-[#0F1D24]">
                <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
                No plan has been created yet for {MONTH_NAMES[nextMonth - 1]} {nextYear}.
              </div>
            )}

            {/* year-range tables — grid fills the full remaining height and width */}
            <div className="min-h-0 flex-1 overflow-hidden p-1">
              {loading ? (
                <div className="flex h-full items-center justify-center rounded-[2px] border border-[#C6C6C6] bg-white text-[11.5px] font-semibold text-[#9B9B9B]">
                  Loading plans...
                </div>
              ) : error ? (
                <div className="flex h-full items-center justify-center rounded-[2px] border border-rose-200 bg-rose-50 text-[11.5px] font-semibold text-rose-600">
                  {error}
                </div>
              ) : yearGroups.length === 0 ? (
                <EmptyStateWarning onCreate={handleCreate} filtered={isFiltered} />
              ) : (
                <div className={`grid h-full min-h-0 grid-cols-1 gap-2 ${gridColsClass}`}>
                  {yearGroups.map(({ year, monthMap }) => (
                    <YearTable
                      key={year}
                      year={year}
                      monthMap={monthMap}
                      currentMonth={currentMonth}
                      currentYear={currentYear}
                      onOpen={handleOpen}
                      onDelete={handleDelete}
                      onCreate={handleCreate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MonthlyPlanPage;