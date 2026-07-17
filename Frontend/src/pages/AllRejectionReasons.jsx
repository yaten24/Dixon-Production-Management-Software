import React, { useState } from "react";

import Sidebar from "../compenents/dashboard/Sidebar";

import RejectionFilters from "../compenents/rejection/RejectionFilters";
import RejectionSummaryCards from "../compenents/rejection/RejectionSummaryCards";
import RejectionTrendChart from "../compenents/rejection/RejectionTrendChart";
import RejectionPieChart from "../compenents/rejection/RejectionPieChart";
import HallWiseChart from "../compenents/rejection/HallWiseChart";
import MachineWiseBarChart from "../compenents/rejection/MachineWiseBarChart";
import RecentRejectionsModal from "../compenents/rejection/RecentRejectionsModal";
import RejectionHeatmapModal from "../compenents/rejection/RejectionHeatmapModal";

import { useRejectionDashboard } from "../hooks/useRejectionDashboard";
import { exportRejectionDataToCSV } from "../utils/exportExcel";

/* ---------------- Helpers ---------------- */

// YYYY-MM-DD in local time (matches <input type="date"> format)
const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ---------------- Component ---------------- */

const RejectionDashboard = () => {
  const {
    rejectionData,
    reasonOptions,
    recentData,

    loading,
    error,

    appliedDate,
    appliedReasonId,
    applyFilters,
    refresh,
    loadRecent,

    totalRejectQty,
    highestReason,
    hallChartData,
    highestHall,
    machineChartData,
    highestMachine,
    reasonChartRows,
    trendChartData,
  } = useRejectionDashboard();

  // Pending (unapplied) filter inputs — default to today, same as the hook's initial applied state
  const [pendingDate, setPendingDate] = useState(getTodayDate());
  const [pendingReasonId, setPendingReasonId] = useState("All");

  const [showRecent, setShowRecent] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleApply = () => {
    applyFilters(pendingDate, pendingReasonId);
  };

  const handleRefresh = () => {
    refresh();
  };

  const handleShowRecent = () => {
    loadRecent(20);
    setShowRecent(true);
  };

  const handleExport = () => {
    exportRejectionDataToCSV(rejectionData, "rejection_data.csv");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-1">
          <div
            className="
              w-full
              rounded
              border
              border-slate-200
              bg-white
              shadow-sm
              p-1
            "
          >
            <div className="space-y-2">
              {/* Filters */}
              <RejectionFilters
                selectedDate={pendingDate}
                setSelectedDate={setPendingDate}
                selectedReason={pendingReasonId}
                setSelectedReason={setPendingReasonId}
                reasonOptions={reasonOptions}
                onApply={handleApply}
                onRefresh={handleRefresh}
                onShowRecent={handleShowRecent}
                onExport={handleExport}
                onShowHeatmap={() => setShowHeatmap(true)}
              />

              {/* Error state */}
              {error && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Loading state */}
              {loading ? (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                  Loading rejection data...
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <RejectionSummaryCards
                    totalRejectQty={totalRejectQty}
                    highestReason={highestReason}
                    highestHall={highestHall}
                    highestMachine={highestMachine}
                  />

                  {/* Reason Pie + Hall Chart */}
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <RejectionPieChart data={reasonChartRows} />
                    <HallWiseChart data={hallChartData} />
                  </div>

                  {/* Machine wise bar chart — pure CSS, no chart library */}
                  <MachineWiseBarChart data={machineChartData} />

                  {/* Hourly trend — bottom */}
                  <RejectionTrendChart data={trendChartData} />
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Recent Rejections Modal */}
      {showRecent && (
        <RecentRejectionsModal
          data={recentData}
          onClose={() => setShowRecent(false)}
        />
      )}

      {/* Machine x Reason Heatmap Modal */}
      {showHeatmap && (
        <RejectionHeatmapModal
          data={rejectionData}
          onClose={() => setShowHeatmap(false)}
        />
      )}
    </div>
  );
};

export default RejectionDashboard;