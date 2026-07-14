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
// tone: "blue"/"amber" = neutral brand tones (navy/gold).
// tone: "red"/"green" = semantic (bad/good) — kept universal.
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
      className="relative mt-1 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] p-2 shadow-[0_1px_2px_rgba(15,29,36,0.04)] lg:mt-1 lg:p-2"
    >
      {/* Header */}
      <div className="relative mb-2 flex flex-wrap items-center justify-between gap-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FDC94D]">
            Live Stats
          </span>
          <h2 className="mt-0.5 text-sm font-bold tracking-tight text-[#0F1D24]">
            Today's Overview
          </h2>
          <p className="text-xs font-medium text-[#9B9B9B]">
            {data
              ? `Live production statistics for ${data.date}${hall ? ` · Hall ${hall}` : " · All Halls"}`
              : "Live production statistics from all manufacturing halls"}
          </p>
        </div>

        <motion.button
          onClick={refresh}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="flex h-8 items-center gap-1.5 rounded border border-[#C6C6C6]/60 bg-white px-2 text-xs font-semibold text-[#0F1D24] transition-all duration-300 hover:border-transparent hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-60"
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
        <div className="relative mb-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* LOADING STATE (first load, no data yet) */}
      {loading && !data ? (
        <div className="relative grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded border border-[#C6C6C6]/50 bg-[#C6C6C6]/20"
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