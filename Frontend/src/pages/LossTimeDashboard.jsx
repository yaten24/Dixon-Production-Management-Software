import React from "react";

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
    loading,
    error,
  } = useLossTimeData();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-1">
          <div className="mx-auto max-w-[1600px] space-y-1">
            {/* Filters Box - date range removed, only machine + reason filters remain */}
            <LossFilters
              selectedReason={filters.reasonId}
              selectedMachine={filters.machineId}
              selectedHall={filters.hall}
              reasons={filterOptions.reasons}
              onReasonChange={(reasonId) => setFilters((f) => ({ ...f, reasonId }))}
              onMachineChange={(machineId) => setFilters((f) => ({ ...f, machineId }))}
              onApply={applyFilters}
              onReset={resetFilters}
            />

            {error && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                {error}
              </div>
            )}

            {/* Summary Cards Box */}
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

            {/* Hourly Loss Bar Chart (custom SVG, replaces machine-wise chart slot) */}
            <HourlyLossBarChart data={hourlyData} />

            {/* Machine Heat Map (with zoom) */}
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