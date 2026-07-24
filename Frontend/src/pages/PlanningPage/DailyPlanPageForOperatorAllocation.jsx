import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineExclamationTriangle,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
} from "react-icons/hi2";
import { listDailyPlans, deleteDailyPlan } from "../../api/dailyPlanApi";

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

// ============================================================
// Sidebar summary tile — matches the navy context panel used
// across the daily/monthly plan pages.
// ============================================================
const SummaryTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-[#FDC94D]">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="truncate text-[12.5px] font-semibold text-white">{value}</p>
    </div>
  </div>
);

// ============================================================
// Stat card — matches the metrics-row pattern used elsewhere.
// ============================================================
const StatCard = ({ value, label }) => (
  <div className="flex-1 border border-[#C6C6C6] bg-white px-4 py-3">
    <p className="text-xl font-bold leading-none text-[#0F1D24]">{value}</p>
    <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
      {label}
    </p>
  </div>
);

export default function DailyPlanPageForOperatorAllocation() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  // Row click goes straight to operator assignment — this page's sole
  // purpose is picking a plan to assign operators for.
  const handleAssignOperators = (plan) =>
    navigate(
      `/employee/production/plans/${plan.daily_plan_id}/operator/allocation`,
    );
  const handleCreate = () =>
    navigate("/employee/production/plans/daily/create");

  const hasTodayPlan = plans.some(
    (p) => toDateKey(new Date(p.planning_date)) === todayISO(),
  );

  const filteredPlans = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((p) =>
      [p.hall, p.shift, p.planning_date]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [plans, search]);

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Page title strip */}
      <header className="w-full border-b border-[#C6C6C6] bg-white">
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)",
          }}
        />
        <div className="flex py-1.5 w-full items-center justify-between gap-3 px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              title="Back"
              aria-label="Go back"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
            >
              <HiOutlineArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 border-l border-[#C6C6C6] pl-2.5">
              <div className="hidden min-w-0 leading-tight sm:block">
                <p className="text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                  Operator Allocationng
                </p>
                <h1 className="truncate text-[12.5px] font-bold text-[#0F1D24]">
                  Assign Operators — Daily Plans
                </h1>
              </div>
            </div>
          </div>

          <div className="flex h-7 shrink-0 items-stretch gap-px bg-[#C6C6C6] [&>*]:flex [&>*]:items-center [&>*]:whitespace-nowrap">
            <button
              onClick={() => navigate("/employee/dashboard")}
              className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
            >
              <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Create new plan</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full pb-6">
        {!loading && !error && plans.length > 0 && !hasTodayPlan && (
          <div className="flex items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-700">
            <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
            No plan exists for today — create one immediately.
          </div>
        )}

        {/* Context sidebar + stat cards */}
        <div className="grid grid-cols-1 gap-px border border-[#C6C6C6] bg-[#C6C6C6] md:grid-cols-[260px_1fr]">
          <div className="space-y-4 bg-[#0F1D24] p-5">
            <SummaryTile
              icon={HiOutlineCalendarDays}
              label="Today"
              value={
                formatDate(new Date().toISOString()).weekday +
                ", " +
                formatDate(new Date().toISOString()).month +
                " " +
                formatDate(new Date().toISOString()).day
              }
            />
            <SummaryTile
              icon={HiOutlineExclamationTriangle}
              label="Today's Plan"
              value={hasTodayPlan ? "Created" : "Missing"}
            />
          </div>

          <div className="flex flex-col gap-px bg-[#C6C6C6] sm:flex-row">
            <StatCard value={plans.length} label="Total Plans" />
            <StatCard
              value={hasTodayPlan ? "Yes" : "No"}
              label="Plan For Today"
            />
            <StatCard
              value={new Set(plans.map((p) => p.hall)).size}
              label="Halls In Use"
            />
          </div>
        </div>

        {/* Toolbar: search + result count */}
        <div className="flex flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <HiOutlineUserGroup className="h-4 w-4 text-[#0F1D24]" />
            <h2 className="text-[12.5px] font-bold text-[#0F1D24]">
              Daily Plans
            </h2>
            <span className="border border-[#C6C6C6] bg-[#FAFAFA] px-1.5 py-[1px] text-[10px] font-bold text-[#9B9B9B]">
              {filteredPlans.length}
              {search ? ` / ${plans.length}` : ""}
            </span>
          </div>

          <div className="relative">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9B9B9B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hall, shift, date..."
              className="h-8 w-64 border border-[#C6C6C6] bg-white pl-8 pr-7 text-[11.5px] outline-none focus:border-[#0F1D24]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#9B9B9B] hover:text-[#0F1D24]"
              >
                <HiOutlineXMark className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Plans table */}
        <div className="border border-[#C6C6C6] bg-white">
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="sticky top-0 z-10 bg-[#0F1D24] text-white">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">Date</th>
                  <th className="px-2.5 py-2 font-semibold">Hall</th>
                  <th className="px-2.5 py-2 font-semibold">Shift</th>
                  <th className="px-2.5 py-2 font-semibold">Status</th>
                  <th className="px-2.5 py-2 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-[11.5px] text-[#9B9B9B]"
                    >
                      Loading plans…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-[11.5px] font-semibold text-red-600"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <HiOutlineExclamationTriangle className="h-6 w-6 text-[#9B9B9B]" />
                        <p className="text-[12.5px] font-bold text-[#0F1D24]">
                          {search
                            ? "No plans match your search."
                            : "No plans found"}
                        </p>
                        {!search && (
                          <>
                            <p className="max-w-xs text-[11px] text-[#9B9B9B]">
                              There are no daily production plans yet. Create
                              one to get started.
                            </p>
                            <button
                              onClick={handleCreate}
                              className="mt-1.5 flex items-center gap-1.5 bg-[#0F1D24] px-3 py-1.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
                            >
                              <HiOutlinePlus className="h-3.5 w-3.5" />
                              Create new plan
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPlans.map((plan, idx) => {
                    const parsedDate = new Date(plan.planning_date);
                    const { weekday, day, month } = formatDate(
                      plan.planning_date,
                    );
                    const isToday = toDateKey(parsedDate) === todayISO();

                    return (
                      <tr
                        key={plan.daily_plan_id}
                        onClick={() => handleAssignOperators(plan)}
                        className={`group cursor-pointer border-t border-[#C6C6C6] transition-colors duration-100 hover:bg-[#FDC94D]/10 ${
                          idx % 2 === 1 ? "bg-[#FAFAFA]/60" : "bg-white"
                        }`}
                      >
                        <td className="px-2.5 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
                              <span className="text-[10px] font-bold leading-none">
                                {day}
                              </span>
                            </div>
                            <span className="font-mono font-semibold text-[#0F1D24]">
                              {weekday}, {month} {day}
                            </span>
                          </div>
                        </td>
                        <td className="px-2.5 py-1.5 text-[#0F1D24]">
                          {plan.hall}
                        </td>
                        <td className="px-2.5 py-1.5 text-[#9B9B9B]">
                          Shift {plan.shift}
                        </td>
                        <td className="px-2.5 py-1.5">
                          {isToday ? (
                            <span className="border border-[#C6C6C6] bg-[#FDC94D]/25 px-2 py-0.5 text-[10.5px] font-bold text-[#0F1D24]">
                              Today
                            </span>
                          ) : (
                            <span className="text-[#9B9B9B]">—</span>
                          )}
                        </td>
                        <td className="px-2.5 py-1.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignOperators(plan);
                              }}
                              title="Assign operators"
                              className="flex h-6 w-6 items-center justify-center text-[#0F1D24] hover:bg-[#FDC94D]/25"
                            >
                              <HiOutlineArrowRight className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(plan.daily_plan_id);
                              }}
                              title="Delete plan"
                              className="flex h-6 w-6 items-center justify-center text-red-500 hover:bg-red-50"
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
      </main>
    </div>
  );
}
