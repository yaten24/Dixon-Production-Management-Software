// OverviewSection.jsx
import React from "react";
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

const buildOverviewData = (data) => {
  if (!data) return [];
  return [
    {
      id: "production",
      title: "Total Production",
      value: data.totalActual.toLocaleString(),
      subtitle: `Efficiency: ${data.efficiency}%`,
      icon: HiOutlineTrendingUp,
      tone: "green",
      size: "lg",
    },
    {
      id: "target",
      title: "Total Target",
      value: data.totalTarget.toLocaleString(),
      subtitle: `A: ${data.shiftBreakdown.A.target.toLocaleString()} · B: ${data.shiftBreakdown.B.target.toLocaleString()}`,
      icon: HiOutlineFlag,
      tone: "blue",
      size: "md",
    },
    {
      id: "rejection",
      title: "Total Rejection",
      value: data.totalReject.toLocaleString(),
      subtitle: `Rate: ${data.rejectionRate}%`,
      icon: HiOutlineExclamationCircle,
      tone: "red",
      size: "md",
    },
    {
      id: "machines",
      title: "Running Machines",
      value: `${data.machinesRunning}/${data.machinesTotal}`,
      subtitle: `${data.machinesIdle} idle · Shift ${data.currentShift}`,
      icon: HiOutlineCog,
      tone: "amber",
      size: "md",
    },
    {
      id: "loss",
      title: "Loss Time",
      value: `${data.totalLossMinutes} min`,
      subtitle: `${data.totalEntries} entries today`,
      icon: HiOutlineClock,
      tone: "red",
      size: "md",
    },
  ];
};

const SIZE_SPAN = {
  lg: "md:col-span-2 md:row-span-2",
  md: "md:col-span-2 md:row-span-1",
};

// Desktop panel: sharp border, flat header strip (like a native
// app's group-box title), no card floatiness.
const OverviewSection = ({ hall }) => {
  const { data, loading, error, refresh } = useDashboardOverview({ hall });
  const overviewData = buildOverviewData(data);

  return (
    <section className="relative border border-[#C6C6C6] bg-white">
      {/* Group-box header strip */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#C6C6C6] bg-[#FAFAFA] px-2.5 py-1.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1D24]/60">
            Live Stats
          </span>
          <h2 className="text-[13px] font-bold tracking-tight text-[#0F1D24] leading-tight">
            Today's Overview
          </h2>
          <p className="text-[10.5px] font-medium text-[#9B9B9B]">
            {data
              ? `Live production statistics for ${data.date}${hall ? ` · Hall ${hall}` : " · All Halls"}`
              : "Live production statistics from all manufacturing halls"}
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex h-7 items-center gap-1.5 border border-[#C6C6C6] bg-white px-2 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-60"
        >
          <HiOutlineArrowPath
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && !loading && (
        <div className="mx-2 mt-2 border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="p-1.5">
        {loading && !data ? (
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-6 md:auto-rows-[66px]">
            {[SIZE_SPAN.lg, SIZE_SPAN.md, SIZE_SPAN.md, SIZE_SPAN.md, SIZE_SPAN.md].map((span, i) => (
              <div
                key={i}
                className={`h-20 animate-pulse border border-[#C6C6C6] bg-[#F0F0F0] ${span}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-6 md:auto-rows-[66px]">
            {overviewData.map((item) => (
              <div key={item.id} className={SIZE_SPAN[item.size] || SIZE_SPAN.md}>
                <OverviewCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OverviewSection;