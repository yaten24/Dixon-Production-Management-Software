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

// ==========================================================
// tone: "blue"/"amber" = neutral brand tones (navy/gold).
// tone: "red"/"green" = semantic (bad/good) — kept universal.
// size: "lg" = hero card (2x2), "md" = compact card (2x1).
// ==========================================================
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

// Span applies from md: (tablet, ~768px) up — same compact bento
// layout on tablet as desktop.
const SIZE_SPAN = {
  lg: "md:col-span-2 md:row-span-2",
  md: "md:col-span-2 md:row-span-1",
};

const OverviewSection = ({ hall }) => {
  const { data, loading, error, refresh } = useDashboardOverview({ hall });

  const overviewData = buildOverviewData(data);

  return (
    <section
      style={{ animation: "ovSectionIn 0.35s ease-out both" }}
      className="relative rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] p-1.5"
    >
      <style>{`
        @keyframes ovSectionIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ovSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div className="relative mb-1.5 flex flex-wrap items-center justify-between gap-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FDC94D]">
            Live Stats
          </span>
          <h2 className="text-sm font-bold tracking-tight text-[#0F1D24]">
            Today's Overview
          </h2>
          <p className="text-[11px] font-medium text-[#9B9B9B]">
            {data
              ? `Live production statistics for ${data.date}${hall ? ` · Hall ${hall}` : " · All Halls"}`
              : "Live production statistics from all manufacturing halls"}
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex h-7 items-center gap-1.5 rounded border border-[#C6C6C6]/60 bg-white px-2 text-[11px] font-semibold text-[#0F1D24] transition-all duration-300 hover:border-transparent hover:bg-[#0F1D24] hover:text-[#FDC94D] active:scale-95 disabled:opacity-60"
        >
          <span
            style={loading ? { animation: "ovSpin 0.7s linear infinite" } : undefined}
            className="flex"
          >
            <HiOutlineArrowPath className="h-3.5 w-3.5" />
          </span>
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="relative mb-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* LOADING STATE (first load, no data yet) — skeleton mirrors the final bento shape */}
      {loading && !data ? (
        <div className="relative grid grid-cols-2 gap-1.5 md:grid-cols-6 md:auto-rows-[68px]">
          {[SIZE_SPAN.lg, SIZE_SPAN.md, SIZE_SPAN.md, SIZE_SPAN.md, SIZE_SPAN.md].map((span, i) => (
            <div
              key={i}
              className={`h-20 animate-pulse rounded border border-[#C6C6C6]/50 bg-[#C6C6C6]/20 ${span}`}
            />
          ))}
        </div>
      ) : (
        /* KPI Cards — bento grid, sized by priority */
        <div className="relative grid grid-cols-2 gap-1.5 md:grid-cols-6 md:auto-rows-[68px]">
          {overviewData.map((item, index) => (
            <div key={item.id} className={SIZE_SPAN[item.size] || SIZE_SPAN.md}>
              <OverviewCard item={item} index={index} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OverviewSection;