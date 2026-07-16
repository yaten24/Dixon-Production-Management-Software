import React from "react";
import { motion } from "framer-motion";
import { HiOutlineFlag, HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import useTargetSummary from "../../hooks/useTargetSummary";

/* ---------- matches dashboard accent family: blue -> indigo -> purple ---------- */

const ShiftCard = ({ label, icon: Icon, data, accent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.25 }}
    whileHover={{ y: -2 }}
    className={`flex-1 rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded ${accent.bg}`}
        >
          <Icon className={`text-[13px] ${accent.text}`} />
        </span>
        <p className="text-[11px] font-semibold text-slate-600">{label}</p>
      </div>
      <span className="text-[9px] font-medium text-slate-400">
        {data.totalPlans} plan{data.totalPlans === 1 ? "" : "s"}
      </span>
    </div>

    <h4 className={`mt-2 text-xl font-bold leading-none ${accent.text}`}>
      {data.targetQty.toLocaleString("en-IN")} Parts
    </h4>
    <p className="mt-1 text-[9px] leading-none text-slate-500">
      {data.plannedMachines} machine{data.plannedMachines === 1 ? "" : "s"}{" "}
      planned
    </p>
  </motion.div>
);

const TargetSummary = () => {
  const { data, loading, error, refetch } = useTargetSummary();

  if (loading) {
    return (
      <section className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[84px] flex-1 animate-pulse rounded border border-slate-200 bg-slate-100"
          />
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
        <span>{error}</span>
        <button
          onClick={refetch}
          className="rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 sm:flex-row">
      <ShiftCard
        label="Shift A"
        icon={HiOutlineSun}
        data={data.shiftA}
        accent={{ bg: "bg-blue-50", text: "text-blue-600" }}
        delay={0}
      />
      <ShiftCard
        label="Shift B"
        icon={HiOutlineMoon}
        data={data.shiftB}
        accent={{ bg: "bg-indigo-50", text: "text-indigo-600" }}
        delay={0.05}
      />
      <ShiftCard
        label="Overall Target"
        icon={HiOutlineFlag}
        data={data.overall}
        accent={{ bg: "bg-violet-50", text: "text-violet-600" }}
        delay={0.1}
      />
    </section>
  );
};

export default TargetSummary;
