import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineExclamationTriangle,
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

/* ---------------------------------------------------------
   DayPlanCard — flat list-row, no rounded corners / floaty hover
--------------------------------------------------------- */
const DayPlanCard = ({ plan, onOpen, onDelete }) => {
  const parsedDate = new Date(plan.planning_date);
  const { weekday, day, month } = formatDate(plan.planning_date);
  const isToday = toDateKey(parsedDate) === todayISO();

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plan.daily_plan_id);
  };

  return (
    <div
      onClick={() => onOpen(plan)}
      className="group flex cursor-pointer items-center gap-2.5 border border-[#C6C6C6] bg-white px-2.5 py-2 transition-colors duration-100 hover:bg-[#0F1D24]"
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
        </span>
        <span className="truncate text-[10px] text-[#9B9B9B] group-hover:text-[#C6C6C6]">
          {plan.hall} · Shift {plan.shift}
        </span>
      </div>

      <HiOutlineArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-[#C6C6C6] opacity-0 transition-opacity duration-100 group-hover:text-[#FDC94D] group-hover:opacity-100" />

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
const EmptyStateWarning = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center border border-dashed border-[#C6C6C6] bg-white py-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center border border-red-200 bg-red-50 text-red-500">
      <HiOutlineExclamationTriangle className="h-6 w-6" />
    </div>
    <p className="text-[13px] font-bold text-[#0F1D24]">No plans found</p>
    <p className="mt-1 max-w-xs text-[11.5px] text-[#9B9B9B]">
      There are no daily production plans yet. Create one to get started.
    </p>
    <button
      onClick={onCreate}
      className="mt-4 flex items-center gap-1.5 border border-[#0F1D24] bg-[#0F1D24] px-4 py-2 text-xs font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
    >
      <HiOutlinePlus className="h-3.5 w-3.5" />
      Create new plan
    </button>
  </div>
);

/* ---------------------------------------------------------
   DailyPlanPage — desktop-app layout: full-width top strip,
   flat panel content, grid-line list instead of floaty cards
--------------------------------------------------------- */
const DailyPlanPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleOpen = (plan) =>
    navigate(`/employee/production/plans/daily/detail/${plan.daily_plan_id}`);
  const handleCreate = () =>
    navigate("/employee/production/plans/daily/create");

  const hasTodayPlan = plans.some(
    (p) => toDateKey(new Date(p.planning_date)) === todayISO(),
  );

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Page-level full-width title strip */}
      <div className="w-full border-b border-[#C6C6C6] bg-white">
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)",
          }}
        />
        <div className="flex h-[40px] w-full items-center justify-between gap-2 px-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              title="Back"
              className="flex h-6 w-6 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100"
            >
              <HiOutlineArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div className={`h-5 w-px flex-shrink-0 bg-[#C6C6C6]`} />
            <div className="hidden min-w-0 leading-tight sm:block">
              <p className="text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                Production Planning
              </p>
              <h1 className="truncate text-[12.5px] font-bold text-[#0F1D24]">
                Daily Production Plans
              </h1>
            </div>
          </div>

          <div className="flex items-stretch h-6 gap-px bg-[#C6C6C6]">
            <button
              onClick={() => navigate("/employee/dashboard")}
              className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
            >
              <HiOutlineSquares2X2 className="h-3 w-3" />
              Dashboard
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
            >
              <HiOutlinePlus className="h-3 w-3" />
              New Plan
            </button>
          </div>
        </div>
      </div>

      <main className="w-full">
        {!loading && !error && plans.length > 0 && !hasTodayPlan && (
          <div className="flex items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
            <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
            No plan exists for today — create one immediately.
          </div>
        )}

        {loading ? (
          <div className="border border-[#C6C6C6] bg-white py-10 text-center text-xs text-[#9B9B9B]">
            Loading plans...
          </div>
        ) : error ? (
          <div className="border border-red-300 bg-red-50 py-8 text-center text-xs font-semibold text-red-600">
            {error}
          </div>
        ) : plans.length === 0 ? (
          <EmptyStateWarning onCreate={handleCreate} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {plans.map((plan) => (
              <DayPlanCard
                key={plan.daily_plan_id}
                plan={plan}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DailyPlanPage;
