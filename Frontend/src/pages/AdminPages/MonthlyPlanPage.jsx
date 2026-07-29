import React, { useEffect, useMemo, useState } from "react";
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
} from "react-icons/hi2";
import { listMonthlyPlans, deleteMonthlyPlan } from "../../api/monthlyPlanApi";
import Sidebar from "./Sidebar";

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
   MonthPlanCard — flat list-row, no rounded corners / floaty hover
--------------------------------------------------------- */
const MonthPlanCard = ({ plan, isCurrent, onOpen, onDelete }) => {
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plan.monthly_plan_id);
  };

  return (
    <div
      onClick={() => onOpen(plan)}
      className="group flex cursor-pointer items-center gap-2.5 border border-[#C6C6C6] bg-white px-2.5 py-2 transition-all duration-150 hover:-translate-y-[1px] hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:shadow-[0_6px_14px_rgba(15,29,36,0.14)]"
    >
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-[#FAFAFA] text-[#0F1D24] transition-colors duration-100 group-hover:border-[#FDC94D]/40 group-hover:bg-transparent group-hover:text-[#FDC94D]">
        <HiOutlineCalendarDays className="h-3.5 w-3.5" />
      </div>

      <span className="flex flex-1 items-center gap-1.5 truncate text-[12.5px] font-bold tracking-tight text-[#0F1D24] group-hover:text-white">
        {MONTH_NAMES[plan.plan_month - 1]} {plan.plan_year}
        {isCurrent && (
          <span className="flex-shrink-0 border border-[#FDC94D]/60 bg-[#FDC94D]/20 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-[#0F1D24] group-hover:bg-[#FDC94D] group-hover:text-[#0F1D24]">
            Current
          </span>
        )}
      </span>

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
        ? "Try a different month, year, or clear the search."
        : "There are no monthly production plans yet. Create one to get started."}
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
   MonthlyPlanPage — desktop-app layout: persistent sidebar,
   control-box header, quick-stat strip, search + range filter,
   flat grid-line list instead of floaty cards.
--------------------------------------------------------- */
const AdminMonthlyPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [rangeFilter, setRangeFilter] = useState("all"); // all | current | upcoming | past

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

  const handleOpen = (plan) => navigate(`/admin/production/plans/monthly/detail/${plan.monthly_plan_id}`);
  const handleCreate = () => navigate("/admin/production/plans/monthly/create");

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

  // ---- filtered + sorted list ----
  const visiblePlans = useMemo(() => {
    let list = [...plans];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const label = `${MONTH_NAMES[p.plan_month - 1]} ${p.plan_year}`.toLowerCase();
        return label.includes(q);
      });
    }

    if (rangeFilter === "current") {
      list = list.filter((p) => p.plan_month === currentMonth && p.plan_year === currentYear);
    } else if (rangeFilter === "upcoming") {
      list = list.filter((p) => p.plan_year > currentYear || (p.plan_year === currentYear && p.plan_month >= currentMonth));
    } else if (rangeFilter === "past") {
      list = list.filter((p) => p.plan_year < currentYear || (p.plan_year === currentYear && p.plan_month < currentMonth));
    }

    return list.sort((a, b) => (a.plan_year - b.plan_year) || (a.plan_month - b.plan_month));
  }, [plans, search, rangeFilter, currentMonth, currentYear]);

  const isFiltered = search.trim() !== "" || rangeFilter !== "all";

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
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pb-3">
          {/* control box header */}
          <div className="mx-3 mt-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
            <div className="min-w-0 leading-tight">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#9B9B9B]">Production Planning</p>
              <h1 className="truncate text-[15px] font-extrabold tracking-tight text-[#0F1D24]">Monthly Production Plans</h1>
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

          {/* warnings — flat, bordered */}
          {!loading && !error && plans.length > 0 && !hasCurrentPlan && (
            <div className="mx-3 flex flex-shrink-0 items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
              <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
              No plan exists for {MONTH_NAMES[currentMonth - 1]} {currentYear} — create one immediately.
            </div>
          )}
          {!loading && !error && hasCurrentPlan && !hasNextPlan && (
            <div className="mx-3 flex flex-shrink-0 items-center gap-2 border border-[#FDC94D]/60 bg-[#FDC94D]/10 px-3 py-2 text-[12px] font-semibold text-[#0F1D24]">
              <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
              No plan has been created yet for {MONTH_NAMES[nextMonth - 1]} {nextYear}.
            </div>
          )}

          {/* quick stats */}
          {!loading && !error && plans.length > 0 && (
            <div className="mx-3 flex flex-shrink-0 gap-1.5">
              <QuickStat label="Total Plans" value={stats.total} icon={HiOutlineClipboardDocumentList} accent={GOLD} />
              <QuickStat label="Upcoming" value={stats.upcoming} icon={HiOutlineArrowRight} accent="#2563EB" />
              <QuickStat label="Past" value={stats.past} icon={HiOutlineCalendarDays} accent="#9333EA" />
              <QuickStat
                label={`${MONTH_NAMES[currentMonth - 1]} Status`}
                value={hasCurrentPlan ? "Planned" : "Missing"}
                icon={hasCurrentPlan ? HiOutlineCheckCircle : HiOutlineExclamationTriangle}
                accent={hasCurrentPlan ? SUCCESS : DANGER}
                tone={hasCurrentPlan ? "text-emerald-600 text-[14px]" : "text-red-600 text-[14px]"}
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
                  placeholder="Search by month or year..."
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
                  <MonthPlanCard
                    key={plan.monthly_plan_id}
                    plan={plan}
                    isCurrent={plan.plan_month === currentMonth && plan.plan_year === currentYear}
                    onOpen={handleOpen}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMonthlyPlanPage;