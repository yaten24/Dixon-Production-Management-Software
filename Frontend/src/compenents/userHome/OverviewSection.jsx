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
// Static presentation config (icon only) per metric.
// Color has been intentionally removed here — every KPI card
// uses the same single brand accent (see OverviewCard) so the
// section reads as one consistent, professional surface instead
// of a rainbow of per-metric colors.
// The actual numeric `value` / `subtitle` gets injected at render
// time from the live API response.
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
      tone: "blue",
    },
    {
      id: "production",
      title: "Total Production",
      value: data.totalActual.toLocaleString(),
      subtitle: `Efficiency: ${data.efficiency}%`,
      icon: HiOutlineTrendingUp,
      tone: "green",
    },
    {
      id: "rejection",
      title: "Total Rejection",
      value: data.totalReject.toLocaleString(),
      subtitle: `Rejection Rate: ${data.rejectionRate}%`,
      icon: HiOutlineExclamationCircle,
      tone: "red",
    },
    {
      id: "machines",
      title: "Running Machines",
      value: `${data.machinesRunning}/${data.machinesTotal}`,
      subtitle: `${data.machinesIdle} idle · Current Shift: ${data.currentShift}`,
      icon: HiOutlineCog,
      tone: "amber",
    },
    {
      id: "loss",
      title: "Loss Time",
      value: `${data.totalLossMinutes} min`,
      subtitle: `Across ${data.totalEntries} entries today`,
      icon: HiOutlineClock,
      tone: "red",
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
      className="relative mt-1 rounded-sm border border-slate-200 bg-white p-2 shadow-sm lg:mt-2 lg:p-3"
    >
      {/* Header */}
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Today's Overview
          </h2>
          <p className="text-xs font-medium text-slate-600">
            {data
              ? `Live production statistics for ${data.date}${hall ? ` · Hall ${hall}` : " · All Halls"}`
              : "Live production statistics from all manufacturing halls"}
          </p>
        </div>

        <motion.button
          onClick={refresh}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="flex h-8 items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-60"
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
        <div className="relative mb-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* LOADING STATE (first load, no data yet) */}
      {loading && !data ? (
        <div className="relative grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-sm border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : (
        /* KPI Cards */
        <div className="relative grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          {overviewData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.25,
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