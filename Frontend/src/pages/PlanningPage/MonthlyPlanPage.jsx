import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { listMonthlyPlans, deleteMonthlyPlan } from "../../api/monthlyPlanApi";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ---------------------------------------------------------
   MonthPlanCard — flat list-row, no rounded corners / floaty hover
--------------------------------------------------------- */
const MonthPlanCard = ({ plan, onOpen, onDelete }) => {
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plan.monthly_plan_id);
  };

  return (
    <div
      onClick={() => onOpen(plan)}
      className="group flex cursor-pointer items-center gap-2.5 border border-[#C6C6C6] bg-white px-2.5 py-2 transition-colors duration-100 hover:bg-[#0F1D24]"
    >
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-[#FAFAFA] text-[#0F1D24] transition-colors duration-100 group-hover:border-[#FDC94D]/40 group-hover:bg-transparent group-hover:text-[#FDC94D]">
        <HiOutlineCalendarDays className="h-3.5 w-3.5" />
      </div>

      <span className="flex-1 truncate text-[12.5px] font-bold tracking-tight text-[#0F1D24] group-hover:text-white">
        {MONTH_NAMES[plan.plan_month - 1]} {plan.plan_year}
      </span>

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
      There are no monthly production plans yet. Create one to get started.
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
   MonthlyPlanPage — desktop-app layout: full-width top strip,
   flat panel content, grid-line list instead of floaty cards
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
    navigate(`/employee/production/plans/monthly/detail/${plan.monthly_plan_id}`);
  };

  const handleCreate = () => {
    navigate("/employee/production/plans/monthly/create");
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  const hasCurrentPlan = plans.some((p) => p.plan_month === currentMonth && p.plan_year === currentYear);
  const hasNextPlan = plans.some((p) => p.plan_month === nextMonth && p.plan_year === nextYear);

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Page-level full-width title strip */}
      <div className="w-full border-b border-[#C6C6C6] bg-white">
        <div
          className="h-[2px] w-full"
          style={{
            background: "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)",
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
            <div className="border-l border-[#C6C6C6] pl-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1D24]/60">
                Production Planning
              </span>
              <h1 className="text-[13px] font-bold tracking-tight text-[#0F1D24] leading-tight">
                Monthly Production Plans
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
        {/* Warnings — flat, bordered */}
        {!loading && !error && plans.length > 0 && !hasCurrentPlan && (
          <div className="flex items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
            <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
            No plan exists for {MONTH_NAMES[currentMonth - 1]} {currentYear} — create one immediately.
          </div>
        )}
        {!loading && !error && hasCurrentPlan && !hasNextPlan && (
          <div className="flex items-center gap-2 border border-[#FDC94D]/60 bg-[#FDC94D]/10 px-3 py-2 text-[12px] font-semibold text-[#0F1D24]">
            <HiOutlineExclamationTriangle className="h-4 w-4 flex-shrink-0" />
            No plan has been created yet for {MONTH_NAMES[nextMonth - 1]} {nextYear}.
          </div>
        )}

        {/* List */}
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
              <MonthPlanCard
                key={plan.monthly_plan_id}
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

export default MonthlyPlanPage;