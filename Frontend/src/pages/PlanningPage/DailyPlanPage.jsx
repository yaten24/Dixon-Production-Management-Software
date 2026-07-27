import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineArrowRight,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { listDailyPlans, deleteDailyPlan } from "../../api/dailyPlanApi";
import Sidebar from "../../compenents/common/Sidebar";

// ============================================================
// THEME TOKENS — kept consistent with Sidebar.jsx / dashboard pages
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";

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

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ---------------------------------------------------------
   QUICK STAT — compact stat tile for the strip under the header
--------------------------------------------------------- */
const QuickStat = ({ label, value, icon: Icon, accent = NAVY, tone }) => (
  <div className="flex flex-1 items-center gap-2.5 border border-[#C6C6C6] bg-white px-3 py-2" style={{ borderLeft: `3px solid ${accent}` }}>
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#C6C6C6]" style={{ color: accent }}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="truncate text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
      <p className={`font-mono text-[18px] font-extrabold leading-none ${tone || "text-[#0F1D24]"}`}>{value}</p>
    </div>
  </div>
);

/* ---------------------------------------------------------
   DayPlanCard — flat list-row, no rounded corners / floaty hover
--------------------------------------------------------- */
const DayPlanCard = ({ plan, onOpen, onDelete }) => {
  const parsedDate = new Date(plan.planning_date);
  const { weekday, day, month } = formatDate(plan.planning_date);
  const isToday = toDateKey(parsedDate) === todayISO();
  const isPast = parsedDate < new Date(new Date().setHours(0, 0, 0, 0)) && !isToday;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plan.daily_plan_id);
  };

  return (
    <div
      onClick={() => onOpen(plan)}
      className="group flex cursor-pointer items-center gap-2.5 border border-[#C6C6C6] bg-white px-2.5 py-2 transition-all duration-150 hover:-translate-y-[1px] hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:shadow-[0_6px_14px_rgba(15,29,36,0.14)]"
    >
      <div className="flex h-7 w-7 flex-shrink-0 flex-col items-center justify-center border border-[#C6C6C6] bg-[#FAFAFA] text-[#0F1D24] transition-colors duration-100 group-hover:border-[#FDC94D]/40 group-hover:bg-transparent group-hover:text-[#FDC94D]">
        <span className="text-[10px] font-bold leading-none">{day}</span>
      </div>

      <div className="flex flex-1 flex-col truncate">
        <span className="flex items-center gap-1.5 truncate text-[12.5px] font-bold tracking-tight text-[#0F1D24] group-hover:text-white">
          {weekday}, {month} {day}
          {isToday && (
            <span className="flex-shrink-0 border border-[#FDC94D]/60 bg-[#FDC94D]/20 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-[#0F1D24] group-hover:bg-[#FDC94D] group-hover:text-[#0F1D24]">
              Today
            </span>
          )}
          {isPast && !isToday && (
            <span className="flex-shrink-0 border border-[#C6C6C6] bg-[#F0F0F0] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B] group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-[#C6C6C6]">
              Past
            </span>
          )}
        </span>
        <span className="truncate text-[10px] text-[#9B9B9B] group-hover:text-[#C6C6C6]">
          {plan.hall} · Shift {plan.shift}
        </span>
      </div>

      {/* <HiOutlineArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-[#C6C6C6] opacity-0 transition-opacity duration-100 group-hover:text-[#FDC94D] group-hover:opacity-100" /> */}

      <button
        onClick={handleDeleteClick}
        title="Delete plan"
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[#C6C6C6] opacity-0 transition-colors duration-100 hover:text-red-500 group-hover:opacity-100"
      >
        <HiOutlineTrash className="h-3 w-3" />
      </button>
    </div>
  );
};

/* ---------------------------------------------------------
   EmptyStateWarning — flat dashed panel, no motion
--------------------------------------------------------- */
const EmptyStateWarning = ({ onCreate, filtered }) => (
  <div className="flex flex-col items-center justify-center border border-dashed border-[#C6C6C6] bg-white py-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center border border-red-200 bg-red-50 text-red-500">
      <HiOutlineExclamationTriangle className="h-6 w-6" />
    </div>
    <p className="text-[13px] font-bold text-[#0F1D24]">{filtered ? "No plans match your search" : "No plans found"}</p>
    <p className="mt-1 max-w-xs text-[11.5px] text-[#9B9B9B]">
      {filtered
        ? "Try a different hall, shift, or clear the search."
        : "There are no daily production plans yet. Create one to get started."}
    </p>
    {!filtered && (
      <button
        onClick={onCreate}
        className="mt-4 flex items-center gap-1.5 border border-[#0F1D24] bg-[#0F1D24] px-4 py-2 text-xs font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
      >
        <HiOutlinePlus className="h-3.5 w-3.5" />
        Create new plan
      </button>
    )}
  </div>
);

/* ---------------------------------------------------------
   DailyPlanPage — desktop-app layout: persistent sidebar,
   control-box header, quick-stat strip, search + range filter,
   flat grid-line list instead of floaty cards.
--------------------------------------------------------- */
const DailyPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [rangeFilter, setRangeFilter] = useState("all"); // all | today | week | upcoming | past

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

  const handleOpen = (plan) => navigate(`/employee/production/plans/daily/detail/${plan.daily_plan_id}`);
  const handleCreate = () => navigate("/employee/production/plans/daily/create");

  const hasTodayPlan = plans.some((p) => toDateKey(new Date(p.planning_date)) === todayISO());

  // ---- derived stats ----
  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = todayISO();
    const weekStart = startOfWeek(now);
    const thisWeek = plans.filter((p) => new Date(p.planning_date) >= weekStart).length;
    const upcoming = plans.filter((p) => new Date(p.planning_date) >= new Date(new Date().setHours(0, 0, 0, 0))).length;
    return { total: plans.length, thisWeek, upcoming, todayKey };
  }, [plans]);

  // ---- filtered + sorted list ----
  const visiblePlans = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const weekStart = startOfWeek(now);

    let list = [...plans];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          String(p.hall || "").toLowerCase().includes(q) ||
          String(p.shift || "").toLowerCase().includes(q)
      );
    }

    if (rangeFilter === "today") {
      list = list.filter((p) => toDateKey(new Date(p.planning_date)) === todayISO());
    } else if (rangeFilter === "week") {
      list = list.filter((p) => new Date(p.planning_date) >= weekStart);
    } else if (rangeFilter === "upcoming") {
      list = list.filter((p) => new Date(p.planning_date) >= todayStart);
    } else if (rangeFilter === "past") {
      list = list.filter((p) => new Date(p.planning_date) < todayStart);
    }

    return list.sort((a, b) => new Date(a.planning_date) - new Date(b.planning_date));
  }, [plans, search, rangeFilter]);

  const isFiltered = search.trim() !== "" || rangeFilter !== "all";

  const RANGE_TABS = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
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
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pb-3">
          {/* control box header */}
          <div className="mx-3 mt-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
            <div className="min-w-0 leading-tight">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#9B9B9B]">Production Planning</p>
              <h1 className="truncate text-[15px] font-extrabold tracking-tight text-[#0F1D24]">Daily Production Plans</h1>
            </div>

            <div className="flex flex-shrink-0 items-stretch gap-1.5">
              <button
                onClick={() => navigate("/employee/dashboard")}
                className="flex items-center gap-1.5 border border-[#C6C6C6] bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
              >
                <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
                Dashboard
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-1.5 border border-[#0F1D24] bg-[#0F1D24] px-2.5 text-[11px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90"
              >
                <HiOutlinePlus className="h-3.5 w-3.5" />
                New Plan
              </button>
            </div>
          </div>

          {!loading && !error && plans.length > 0 && !hasTodayPlan && (
            <div className="mx-3 flex flex-shrink-0 items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
              <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
              No plan exists for today — create one immediately.
            </div>
          )}

          {/* quick stats */}
          {!loading && !error && plans.length > 0 && (
            <div className="mx-3 flex flex-shrink-0 gap-1.5">
              <QuickStat label="Total Plans" value={stats.total} icon={HiOutlineClipboardDocumentList} accent={GOLD} />
              <QuickStat label="This Week" value={stats.thisWeek} icon={HiOutlineCalendarDays} accent="#2563EB" />
              <QuickStat label="Upcoming" value={stats.upcoming} icon={HiOutlineArrowRight} accent="#9333EA" />
              <QuickStat
                label="Today's Status"
                value={hasTodayPlan ? "Planned" : "Missing"}
                icon={hasTodayPlan ? HiOutlineCheckCircle : HiOutlineExclamationTriangle}
                accent={hasTodayPlan ? SUCCESS : DANGER}
                tone={hasTodayPlan ? "text-emerald-600 text-[14px]" : "text-red-600 text-[14px]"}
              />
            </div>
          )}

          {/* search + range filter */}
          {!loading && !error && plans.length > 0 && (
            <div className="mx-3 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-2.5 py-1.5">
              <div className="flex min-w-[180px] flex-1 items-center gap-1.5 border border-[#C6C6C6] px-2 py-1">
                <HiOutlineMagnifyingGlass className="h-3.5 w-3.5 flex-shrink-0 text-[#9B9B9B]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by hall or shift..."
                  className="w-full text-[11px] font-medium text-[#0F1D24] outline-none placeholder:text-[#B0B0B0]"
                />
              </div>

              <div className="flex items-stretch gap-px bg-[#C6C6C6]">
                {RANGE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRangeFilter(tab.id)}
                    className={`px-2.5 py-1 text-[10.5px] font-bold transition-colors duration-100 ${
                      rangeFilter === tab.id ? "bg-[#0F1D24] text-[#FDC94D]" : "bg-white text-[#0F1D24] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mx-3">
            {loading ? (
              <div className="border border-[#C6C6C6] bg-white py-10 text-center text-xs text-[#9B9B9B]">Loading plans...</div>
            ) : error ? (
              <div className="border border-red-300 bg-red-50 py-8 text-center text-xs font-semibold text-red-600">{error}</div>
            ) : plans.length === 0 ? (
              <EmptyStateWarning onCreate={handleCreate} />
            ) : visiblePlans.length === 0 ? (
              <EmptyStateWarning onCreate={handleCreate} filtered />
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {visiblePlans.map((plan) => (
                  <DayPlanCard key={plan.daily_plan_id} plan={plan} onOpen={handleOpen} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DailyPlanPage;