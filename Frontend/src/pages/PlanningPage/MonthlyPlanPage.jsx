import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSquares2X2,
} from "react-icons/hi2";

// Brand palette (client's color reference):
// highlight #0F1D24 (deep navy)  — primary: icons, titles, hover fills
// gray      #9B9B9B              — secondary text
// accent    #FDC94D (warm gold)  — sparing highlight: eyebrow, bar, arrow-hover
// darken    #C6C6C6              — borders, dividers, neutral surfaces

/* ---------------------------------------------------------
   MonthPlanCard — single-row compact
--------------------------------------------------------- */
const MonthPlanCard = ({ plan, index, onOpen, onDelete }) => {
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plan.id);
  };

  return (
    <motion.div
      onClick={() => onOpen(plan)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.02 }}
      className="group flex cursor-pointer items-center gap-2.5 rounded border border-[#C6C6C6]/50 bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-[#0F1D24]/30 hover:shadow-[0_6px_16px_-6px_rgba(15,29,36,0.2)]"
    >
      {/* Icon */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#0F1D24] text-[#FDC94D]">
        <HiOutlineCalendarDays className="h-3.5 w-3.5" />
      </div>

      {/* Month name */}
      <span className="flex-1 truncate text-[12.5px] font-bold tracking-tight text-[#0F1D24]">
        {plan.month}
      </span>

      {/* Arrow indicator (hover) */}
      <HiOutlineArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-[#C6C6C6] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#0F1D24] group-hover:opacity-100" />

      {/* Delete — only visible on hover */}
      <button
        onClick={handleDeleteClick}
        title="Delete plan"
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[#C6C6C6] opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <HiOutlineTrash className="h-3 w-3" />
      </button>
    </motion.div>
  );
};

/* ---------------------------------------------------------
   MonthlyPlanPage — main page (compact, no modal)
--------------------------------------------------------- */
const MonthlyPlanPage = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = React.useState([
    { id: 1, month: "January" },
    { id: 2, month: "February" },
    { id: 3, month: "March" },
    { id: 4, month: "April" },
  ]);

  const handleDelete = (id) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOpen = (plan) => {
    navigate(`/monthly-plans/${plan.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] p-2">
      <div className="mx-auto max-w-full">
        {/* Single row: back + heading + dashboard + create */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#C6C6C6] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              title="Back"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-[#C6C6C6]/70 bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
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
              className="flex items-center gap-1.5 rounded-md border border-[#C6C6C6]/70 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
            >
              <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate("/employee/production/plans/monthly/create")}
              className="flex items-center gap-1.5 rounded-md bg-[#0F1D24] px-3.5 py-1.5 text-xs font-semibold text-[#FDC94D] shadow-[0_8px_18px_-8px_rgba(15,29,36,0.45)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Create new plan
            </button>
          </div>
        </div>

        {/* List */}
        {plans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#C6C6C6] py-10 text-center text-xs text-[#9B9B9B]">
            No plans yet — click "Create new plan" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {plans.map((plan, i) => (
              <MonthPlanCard
                key={plan.id}
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