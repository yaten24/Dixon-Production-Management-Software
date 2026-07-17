import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import useLossTimeData from "../hooks/useLossTimeData";

import LossFilters from "../compenents/lossTime/LossFilters";
import LossSummaryCards from "../compenents/lossTime/LossSummaryCards";
import HallWiseLossChart from "../compenents/lossTime/HallWiseLossChart";
import ReasonWisePieChart from "../compenents/lossTime/ReasonWisePieChart";
import HourlyLossBarChart from "../compenents/lossTime/HourlyLossBarChart";
import MachineHeatMap from "../compenents/lossTime/MachineHeatMap";
import RecentLossTimeline from "../compenents/lossTime/RecentLossTimeline";

const LossTimeDashboard = () => {
  const {
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    filterOptions,
    summary,
    hallWiseData,
    reasonWiseData,
    heatMapData,
    hourlyData,
    recentEvents,
    hasData,
    loading,
    error,
  } = useLossTimeData();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="mt-12 flex-1 overflow-y-auto p-1">
          <div className="mx-auto max-w-[1600px] space-y-1">
            {/* Filters Box - date + reason only */}
            <LossFilters
              selectedDate={filters.date}
              selectedReason={filters.reasonId}
              reasons={filterOptions.reasons}
              onDateChange={(date) => setFilters((f) => ({ ...f, date }))}
              onReasonChange={(reasonId) => setFilters((f) => ({ ...f, reasonId }))}
              onApply={applyFilters}
              onReset={resetFilters}
            />

            {error && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                {error}
              </div>
            )}

            {!loading && !error && !hasData && (
              <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800">
                <FaExclamationTriangle className="shrink-0 text-amber-500" />
                No production data uploaded by the supervisor for this date — showing 0 for all
                halls.
              </div>
            )}

            {/* Summary Cards Box - always renders, zero-filled when no data */}
            <LossSummaryCards
              totalLossMinutes={summary?.totalLossMinutes || 0}
              productionLoss={summary?.productionLoss || 0}
              averageDowntime={summary?.averageDowntime || 0}
              totalEvents={summary?.totalEvents || 0}
              highestHall={summary?.highestHall}
              highestMachine={summary?.highestMachine}
              highestReason={summary?.highestReason}
            />

            {/* Hall + Reason Charts Row */}
            <div className="grid gap-1 xl:grid-cols-2">
              <HallWiseLossChart data={hallWiseData} />
              <ReasonWisePieChart data={reasonWiseData} />
            </div>

            {/* Hourly Loss Bar Chart - shift-wise (custom SVG) */}
            <HourlyLossBarChart data={hourlyData} />

            {/* Machine Heat Map (with zoom) - always all machines */}
            <MachineHeatMap data={heatMapData} />

            {/* Recent Events Timeline */}
            <RecentLossTimeline data={recentEvents} />

            {loading && (
              <p className="py-2 text-center text-[10px] text-gray-400">Loading latest data…</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LossTimeDashboard;