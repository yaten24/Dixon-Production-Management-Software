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
  HiOutlineUserGroup,
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

// ==========================================================
// Animated starfield background — pure CSS, no library
// ==========================================================
const StarsBackground = () => {
  const [stars] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.6 + 0.6,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    })),
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes dpTwinkle {
          0%, 100% { opacity: 0.12; transform: scale(0.8); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
      `}</style>
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "9999px",
            background: "#0F1D24",
            animation: `dpTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

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
      className="group flex cursor-pointer items-center gap-2 rounded-sm border border-[#C6C6C6]/50 bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-[#0F1D24]/30 hover:shadow-[0_6px_16px_-6px_rgba(15,29,36,0.2)]"
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

      <HiOutlineUserGroup className="h-3.5 w-3.5 flex-shrink-0 text-[#C6C6C6] opacity-0 transition-all duration-200 group-hover:text-[#0F1D24] group-hover:opacity-100" />

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

const DailyPlanPageForOperatorAllocation = () => {
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

  // Card click now goes straight to operator assignment — this page's
  // sole purpose is picking a plan to assign operators for.
  const handleAssignOperators = (plan) => navigate(`/employee/production/plans/${plan.daily_plan_id}/operator/allocation`);
  const handleCreate = () => navigate("/employee/production/plans/daily/create");

  const hasTodayPlan = plans.some((p) => toDateKey(new Date(p.planning_date)) === todayISO());

  return (
    <div className="relative min-h-screen bg-[#F7F7F5] p-2">
      <StarsBackground />

      <div className="relative z-10 mx-auto max-w-full">
        {/* Compact single-row header — everything fits in one line */}
        <div className="mb-3 flex flex-nowrap items-center gap-2 overflow-x-auto rounded-sm border border-[#C6C6C6]/70 bg-white px-2 py-1.5">
          <button
            onClick={() => navigate(-1)}
            title="Back"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-[#C6C6C6]/70 bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
          >
            <HiOutlineArrowLeft className="h-3.5 w-3.5" />
          </button>

          <h1 className="flex-shrink-0 truncate text-[13px] font-bold leading-none tracking-tight text-[#0F1D24]">
            Assign Operators — Daily Plans
          </h1>

          <div className="mx-0.5 h-4 w-px flex-shrink-0 bg-[#C6C6C6]" />

          <button
            onClick={() => navigate("/employee/dashboard")}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-sm border border-[#C6C6C6]/70 bg-white px-2 py-1 text-[11px] font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
          >
            <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={handleCreate}
            className="ml-auto flex flex-shrink-0 items-center gap-1.5 rounded-sm bg-[#0F1D24] px-2.5 py-1 text-[11px] font-semibold text-[#FDC94D] shadow-[0_6px_14px_-6px_rgba(15,29,36,0.45)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <HiOutlinePlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create new plan</span>
          </button>
        </div>

        {!loading && !error && plans.length > 0 && !hasTodayPlan && (
          <div className="mb-2.5 flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700">
            <HiOutlineExclamationTriangle className="h-3.5 w-3.5 flex-shrink-0" />
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
              <DayPlanCard
                key={plan.daily_plan_id}
                plan={plan}
                index={i}
                onOpen={handleAssignOperators}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPlanPageForOperatorAllocation;