import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSquares2X2,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { listMonthlyPlans, deleteMonthlyPlan } from "../../api/monthlyPlanApi";

// Brand palette (client's color reference):
// highlight #0F1D24 (deep navy)  — primary: icons, titles, hover fills
// gray      #9B9B9B              — secondary text
// accent    #FDC94D (warm gold)  — sparing highlight: eyebrow, bar, arrow-hover
// darken    #C6C6C6              — borders, dividers, neutral surfaces

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ---------------------------------------------------------
   MonthPlanCard — single-row compact
--------------------------------------------------------- */
const MonthPlanCard = ({ plan, index, onOpen, onDelete }) => {
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plan.monthly_plan_id);
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
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm bg-[#0F1D24] text-[#FDC94D]">
        <HiOutlineCalendarDays className="h-3.5 w-3.5" />
      </div>

      <span className="flex-1 truncate text-[12.5px] font-bold tracking-tight text-[#0F1D24]">
        {MONTH_NAMES[plan.plan_month - 1]} {plan.plan_year}
      </span>

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

/* ---------------------------------------------------------
   EmptyStateWarning — animated, interactive
--------------------------------------------------------- */
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
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <HiOutlineExclamationTriangle className="h-6 w-6" />
      </motion.div>
    </motion.div>

    <p className="text-[13px] font-bold text-[#0F1D24]">No plans found</p>
    <p className="mt-1 max-w-xs text-[11.5px] text-[#9B9B9B]">
      There are no monthly production plans yet. Create one to get started.
    </p>

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

/* ---------------------------------------------------------
   MonthlyPlanPage — backend-connected + warnings
--------------------------------------------------------- */
const MonthlyPlanPage = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleOpen = (plan) => {
    navigate(`/monthly-plans/${plan.monthly_plan_id}`);
  };

  const handleCreate = () => {
    navigate("/employee/production/plans/monthly/create");
  };

  // ---- Current / next month check ----
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  const hasCurrentPlan = plans.some((p) => p.plan_month === currentMonth && p.plan_year === currentYear);
  const hasNextPlan = plans.some((p) => p.plan_month === nextMonth && p.plan_year === nextYear);

  return (
    <div className="min-h-screen bg-[#F7F7F5] p-2">
      <div className="mx-auto max-w-full">
        {/* Single row: back + heading + dashboard + create */}
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
              Monthly Production Plans
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

        {/* Warnings */}
        {!loading && !error && plans.length > 0 && !hasCurrentPlan && (
          <div className="mb-3 flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
            <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
            No plan exists for {MONTH_NAMES[currentMonth - 1]} {currentYear} — create one immediately.
          </div>
        )}
        {!loading && !error && hasCurrentPlan && !hasNextPlan && (
          <div className="mb-3 flex items-center gap-2 rounded-sm border border-[#FDC94D]/60 bg-[#FDC94D]/10 px-3 py-2 text-[12px] font-semibold text-[#0F1D24]">
            <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
            No plan has been created yet for {MONTH_NAMES[nextMonth - 1]} {nextYear}.
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="py-10 text-center text-xs text-[#9B9B9B]">Loading plans...</div>
        ) : error ? (
          <div className="rounded-sm border border-red-300 bg-red-50 py-8 text-center text-xs font-semibold text-red-600">
            {error}
          </div>
        ) : plans.length === 0 ? (
          <EmptyStateWarning onCreate={handleCreate} />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {plans.map((plan, i) => (
              <MonthPlanCard
                key={plan.monthly_plan_id}
                plan={plan}
                index={i}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyPlanPage;