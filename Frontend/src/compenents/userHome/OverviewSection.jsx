import React from "react";
import { motion } from "framer-motion";
import { HiOutlineArrowPath } from "react-icons/hi2";
import {
  HiOutlineTrendingUp,
  HiOutlineFlag,
  HiOutlineExclamationCircle,
  HiOutlineCog,
  HiOutlineClock,
} from "react-icons/hi";

import OverviewCard from "./OverviewCard";
import useDashboardOverview from "../../hooks/useDashboardOverview";

// ==========================================================
// Static presentation config (icon + colors) per metric.
// The actual numeric `value` / `subtitle` gets injected at render
// time from the live API response instead of the old static file.
// ==========================================================
const buildOverviewData = (data) => {
  if (!data) return [];

  return [
    {
      id: "target",
      title: "Total Target",
      value: data.totalTarget.toLocaleString(),
      subtitle: `Shift A: ${data.shiftBreakdown.A.target.toLocaleString()} · Shift B: ${data.shiftBreakdown.B.target.toLocaleString()}`,
      icon: HiOutlineFlag,
      iconBg: "bg-blue-600",
      valueColor: "text-blue-700",
      subtitleColor: "text-slate-500",
    },
    {
      id: "production",
      title: "Total Production",
      value: data.totalActual.toLocaleString(),
      subtitle: `Efficiency: ${data.efficiency}%`,
      icon: HiOutlineTrendingUp,
      iconBg: "bg-emerald-600",
      valueColor: "text-emerald-700",
      subtitleColor: "text-emerald-600",
    },
    {
      id: "rejection",
      title: "Total Rejection",
      value: data.totalReject.toLocaleString(),
      subtitle: `Rejection Rate: ${data.rejectionRate}%`,
      icon: HiOutlineExclamationCircle,
      iconBg: "bg-red-600",
      valueColor: "text-red-700",
      subtitleColor: "text-red-500",
    },
    {
      id: "machines",
      title: "Running Machines",
      value: `${data.machinesRunning}/${data.machinesTotal}`,
      subtitle: `${data.machinesIdle} idle · Current Shift: ${data.currentShift}`,
      icon: HiOutlineCog,
      iconBg: "bg-indigo-600",
      valueColor: "text-indigo-700",
      subtitleColor: "text-slate-500",
    },
    {
      id: "loss",
      title: "Loss Time",
      value: `${data.totalLossMinutes} min`,
      subtitle: `Across ${data.totalEntries} entries today`,
      icon: HiOutlineClock,
      iconBg: "bg-orange-600",
      valueColor: "text-orange-700",
      subtitleColor: "text-slate-500",
    },
  ];
};

const OverviewSection = ({ hall }) => {
  const { data, loading, error, refresh } = useDashboardOverview({ hall });

  const overviewData = buildOverviewData(data);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative mt-1 overflow-hidden rounded border border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/60 p-2 shadow-sm lg:mt-2 lg:p-2"
    >
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded bg-indigo-200/30 blur-3xl" />

      {/* Header */}
      <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800 lg:text-xl">
            Today's Overview
          </h2>
          <p className="text-xs text-slate-500">
            {data
              ? `Live production statistics for ${data.date}${hall ? ` · Hall ${hall}` : " · All Halls"}`
              : "Live production statistics from all manufacturing halls"}
          </p>
        </div>

        <motion.button
          onClick={refresh}
          disabled={loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-60"
        >
          <motion.span
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={
              loading
                ? { duration: 0.7, repeat: Infinity, ease: "linear" }
                : { duration: 0.2 }
            }
            className="flex"
          >
            <HiOutlineArrowPath className="h-3.5 w-3.5" />
          </motion.span>
          {loading ? "Refreshing..." : "Refresh Data"}
        </motion.button>
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="relative mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* LOADING STATE (first load, no data yet) */}
      {loading && !data ? (
        <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : (
        /* KPI Cards */
        <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-5">
          {overviewData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.06,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <OverviewCard item={item} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default OverviewSection;