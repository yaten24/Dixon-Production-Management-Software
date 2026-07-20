import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineSquares2X2,
} from "react-icons/hi2";

// Brand palette (client's color reference):
// highlight #0F1D24 (deep navy)  — primary: icons, titles, hover fills
// gray      #9B9B9B              — secondary text
// accent    #FDC94D (warm gold)  — sparing highlight: eyebrow, bar, arrow-hover
// darken    #C6C6C6              — borders, dividers, neutral surfaces

const formatDate = (isoDate) => {
  const d = new Date(isoDate + "T00:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return { weekday, day, month };
};

const todayISO = () => new Date().toISOString().split("T")[0];

/* ---------------------------------------------------------
   DayPlanCard — compact version
--------------------------------------------------------- */
const DayPlanCard = ({ plan, index, onOpen, onDelete }) => {
  const { weekday, day, month } = formatDate(plan.date);
  const isToday = plan.date === todayISO();

  const handleCardClick = () => onOpen(plan);
  const handleOpenClick = (e) => {
    e.stopPropagation();
    onOpen(plan);
  };
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plan.id);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.03 }}
      className="group relative cursor-pointer overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-transparent hover:shadow-[0_10px_22px_-8px_rgba(15,29,36,0.22)]"
    >
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[2.5px] scale-x-0 origin-left bg-[#FDC94D] transition-transform duration-300 group-hover:scale-x-100" />

      {/* Delete — only visible on hover */}
      <button
        onClick={handleDeleteClick}
        title="Delete plan"
        className="absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded text-[#C6C6C6] opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <HiOutlineTrash className="h-2.5 w-2.5" />
      </button>

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex h-8 w-8 flex-col items-center justify-center rounded bg-[#0F1D24] text-[#FDC94D] ring-[3px] ring-[#0F1D24]/5 transition-transform duration-300 group-hover:scale-105">
          <span className="text-[10px] font-bold leading-none">{day}</span>
        </div>

        <motion.div
          className="flex h-6 w-6 items-center justify-center rounded bg-[#F5F5F5] text-[#9B9B9B] opacity-0 transition-all duration-300 group-hover:bg-[#FDC94D]/20 group-hover:text-[#0F1D24] group-hover:opacity-100"
          whileHover={{ x: 2 }}
        >
          <HiOutlineArrowRight className="h-3 w-3" />
        </motion.div>
      </div>

      {/* Body */}
      <div className="relative mt-2">
        <h3 className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight text-[#0F1D24]">
          {weekday}, {month} {day}
          {isToday && (
            <span className="rounded-full bg-[#FDC94D]/25 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Today
            </span>
          )}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium leading-4 text-[#9B9B9B]">
          Daily plan
        </p>
      </div>

      {/* Divider */}
      <div className="relative mt-2 h-px w-full bg-[#C6C6C6]/40" />

      {/* Footer */}
      <button
        onClick={handleOpenClick}
        className="relative mt-2 flex w-full items-center justify-center gap-1 rounded border border-[#C6C6C6]/60 py-1.5 text-[11px] font-semibold text-[#0F1D24] transition-all duration-300 group-hover:border-transparent group-hover:bg-[#0F1D24] group-hover:text-[#FDC94D] active:scale-[0.98]"
      >
        Open
        <HiOutlineArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
};

/* ---------------------------------------------------------
   CreatePlanModal
--------------------------------------------------------- */
const CreatePlanModal = ({ open, onClose, onCreate, usedDates }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const isDuplicate = selectedDate && usedDates.includes(selectedDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || isDuplicate) return;
    onCreate(selectedDate);
    setSelectedDate("");
  };

  const handleClose = () => {
    setSelectedDate("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1D24]/55 p-5 backdrop-blur-sm"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-xs rounded-lg bg-white p-5 shadow-[0_24px_48px_-12px_rgba(15,29,36,0.3)]"
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-base font-bold text-[#0F1D24]">New Plan</h2>
              <button
                onClick={handleClose}
                className="text-[#9B9B9B] transition-colors hover:text-[#0F1D24]"
              >
                <HiOutlineXMark className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="mb-1.5 w-full rounded-md border border-[#C6C6C6] bg-[#F7F7F5] px-2.5 py-2 text-[13px] text-[#0F1D24] outline-none focus:border-[#0F1D24]"
              />
              {isDuplicate && (
                <p className="mb-3 text-[11px] font-medium text-red-500">
                  A plan already exists for this date.
                </p>
              )}
              {!isDuplicate && <div className="mb-4" />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-md border border-[#C6C6C6] py-2 text-[13px] font-semibold text-[#9B9B9B] transition-colors hover:border-[#0F1D24] hover:text-[#0F1D24]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDate || isDuplicate}
                  className="flex-[1.4] rounded-md bg-[#0F1D24] py-2 text-[13px] font-bold text-[#FDC94D] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create plan
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------------------------------------------------------
   DailyPlanPage — main page (compact + navigation)
--------------------------------------------------------- */
const DailyPlanPage = () => {
  const navigate = useNavigate();

  const seedDates = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString().split("T")[0];
  });

  const [plans, setPlans] = useState(
    seedDates.map((date, i) => ({ id: i + 1, date }))
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = (date) => {
    setPlans((prev) =>
      [{ id: Date.now(), date }, ...prev].sort((a, b) =>
        b.date.localeCompare(a.date)
      )
    );
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOpen = (plan) => {
    // e.g. navigate(`/employee/production/plans/daily/${plan.id}`)
    console.log("Opening plan:", plan.date);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] p-2">
      <div className="mx-auto max-w-full">
        {/* Single row: back + heading + dashboard + create */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#C6C6C6] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              title="Back"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-[#C6C6C6]/70 bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
            >
              <HiOutlineArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-[#0F1D24] sm:text-xl">
                Daily Production Plans
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/employee/dashboard")}
              className="flex items-center gap-1.5 rounded-md border border-[#C6C6C6]/70 bg-white px-3 py-2 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
            >
              <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
              Go to Dashboard
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-[#0F1D24] px-3.5 py-2 text-xs font-semibold text-[#FDC94D] shadow-[0_8px_18px_-8px_rgba(15,29,36,0.45)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Create new plan
            </button>
          </div>
        </div>

        {/* Grid */}
        {plans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#C6C6C6] py-12 text-center text-xs text-[#9B9B9B]">
            No plans yet — click "Create new plan" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {plans.map((plan, i) => (
              <DayPlanCard
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

      <CreatePlanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        usedDates={plans.map((p) => p.date)}
      />
    </div>
  );
};

export default DailyPlanPage;