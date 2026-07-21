import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

const DayPlanCard = ({ plan, index, onOpen, onDelete }) => {
  const parsedDate = new Date(plan.planning_date);
  const { weekday, day, month } = formatDate(plan.planning_date);
  const isToday = toDateKey(parsedDate) === todayISO();

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plan.daily_plan_id);
  };

  return (
    <motion.div
      onClick={() => onOpen(plan)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.02 }}
      className="group flex cursor-pointer items-center gap-2.5 rounded-sm border border-[#C6C6C6]/50 bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-[#0F1D24]/30 hover:shadow-[0_6px_16px_-6px_rgba(15,29,36,0.2)]"
    >
      <div className="flex h-7 w-7 flex-shrink-0 flex-col items-center justify-center rounded-sm bg-[#0F1D24] text-[#FDC94D]">
        <span className="text-[10px] font-bold leading-none">{day}</span>
      </div>

      <div className="flex flex-1 flex-col truncate">
        <span className="flex items-center gap-1.5 truncate text-[12.5px] font-bold tracking-tight text-[#0F1D24]">
          {weekday}, {month} {day}
          {isToday && (
            <span className="flex-shrink-0 rounded-full bg-[#FDC94D]/25 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Today
            </span>
          )}
        </span>
        <span className="truncate text-[10px] text-[#9B9B9B]">{plan.hall} · Shift {plan.shift}</span>
      </div>

      <HiOutlineArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-[#C6C6C6] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#0F1D24] group-hover:opacity-100" />

      <button
        onClick={handleDeleteClick}
        title="Delete plan"
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm text-[#C6C6C6] opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <HiOutlineTrash className="h-3 w-3" />
      </button>
    </motion.div>
  );
};

const EmptyStateWarning = ({ onCreate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="flex flex-col items-center justify-center rounded-sm border border-dashed border-[#C6C6C6] bg-white py-12 text-center"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm bg-red-50 text-red-500"
    >
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
        <HiOutlineExclamationTriangle className="h-6 w-6" />
      </motion.div>
    </motion.div>
    <p className="text-[13px] font-bold text-[#0F1D24]">No plans found</p>
    <p className="mt-1 max-w-xs text-[11.5px] text-[#9B9B9B]">There are no daily production plans yet. Create one to get started.</p>
    <motion.button
      onClick={onCreate}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="mt-4 flex items-center gap-1.5 rounded-sm bg-[#0F1D24] px-4 py-2 text-xs font-semibold text-[#FDC94D] shadow-[0_8px_18px_-8px_rgba(15,29,36,0.45)]"
    >
      <HiOutlinePlus className="h-3.5 w-3.5" />
      Create new plan
    </motion.button>
  </motion.div>
);

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

  useEffect(() => { fetchPlans(); }, []);

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

  return (
    <div className="min-h-screen bg-[#F7F7F5] p-2">
      <div className="mx-auto max-w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#C6C6C6] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              title="Back"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-[#C6C6C6]/70 bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
            >
              <HiOutlineArrowLeft className="h-3.5 w-3.5" />
            </button>
            <h1 className="text-base font-bold leading-tight tracking-tight text-[#0F1D24] sm:text-lg">
              Daily Production Plans
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/employee/dashboard")}
              className="flex items-center gap-1.5 rounded-sm border border-[#C6C6C6]/70 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
            >
              <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
              Go to Dashboard
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 rounded-sm bg-[#0F1D24] px-3.5 py-1.5 text-xs font-semibold text-[#FDC94D] shadow-[0_8px_18px_-8px_rgba(15,29,36,0.45)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Create new plan
            </button>
          </div>
        </div>

        {!loading && !error && plans.length > 0 && !hasTodayPlan && (
          <div className="mb-3 flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
            <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
            No plan exists for today — create one immediately.
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-xs text-[#9B9B9B]">Loading plans...</div>
        ) : error ? (
          <div className="rounded-sm border border-red-300 bg-red-50 py-8 text-center text-xs font-semibold text-red-600">{error}</div>
        ) : plans.length === 0 ? (
          <EmptyStateWarning onCreate={handleCreate} />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {plans.map((plan, i) => (
              <DayPlanCard key={plan.daily_plan_id} plan={plan} index={i} onOpen={handleOpen} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPlanPage;