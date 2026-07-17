import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

import Sidebar from "../compenents/dashboard/Sidebar";

import useLossTimeData from "../hooks/useLossTimeData";

import LossFilters from "../compenents/lossTime/LossFilters";
import LossSummaryCards from "../compenents/lossTime/LossSummaryCards";
import HallWiseLossChart from "../compenents/lossTime/HallWiseLossChart";
import ReasonWisePieChart from "../compenents/lossTime/ReasonWisePieChart";
import HourlyLossBarChart from "../compenents/lossTime/HourlyLossBarChart";

const LossTimeDashboard = () => {
  const {
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    filterOptions,
    machinesList,
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

  const showWarning = !loading && !error && !hasData;

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F5F5F5]">
      <Sidebar />

      {/* Everything to the right of the sidebar fits exactly one viewport
          height — nothing here scrolls at the page level. */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-1">
        {/* Filters row — fixed height, loading indicator sits inline so it
            never adds vertical space of its own. */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            <LossFilters
              selectedDate={filters.date}
              selectedReason={filters.reasonId}
              reasons={filterOptions.reasons}
              onDateChange={(date) => setFilters((f) => ({ ...f, date }))}
              onReasonChange={(reasonId) => setFilters((f) => ({ ...f, reasonId }))}
              onApply={applyFilters}
              onReset={resetFilters}
            />
          </div>
          {loading && (
            <span className="flex-shrink-0 whitespace-nowrap text-[10px] font-medium text-[#9B9B9B]">
              Loading latest data…
            </span>
          )}
        </div>

        {error && (
          <div className="flex-shrink-0 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] text-red-600">
            {error}
          </div>
        )}


        {/* <LossSummaryCards
          totalLossMinutes={summary?.totalLossMinutes || 0}
          productionLoss={summary?.productionLoss || 0}
          averageDowntime={summary?.averageDowntime || 0}
          totalEvents={summary?.totalEvents || 0}
          highestHall={summary?.highestHall}
          highestMachine={summary?.highestMachine}
          highestReason={summary?.highestReason}
        /> */}

        {/* Remaining height split evenly: top row = hall-wise + reason-wise
            side by side, bottom row = hourly trend. */}
        <div className="grid min-h-0 flex-1 grid-rows-2 gap-1.5">
          <div className="grid min-h-0 grid-cols-1 gap-1.5 xl:grid-cols-2">
            <div className="min-h-0">
              <HallWiseLossChart data={hallWiseData} />
            </div>
            <div className="min-h-0">
              <ReasonWisePieChart data={reasonWiseData} allReasons={filterOptions.reasons} />
            </div>
          </div>

          <div className="min-h-0">
            <HourlyLossBarChart data={hourlyData} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LossTimeDashboard;