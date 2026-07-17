import React, { useState } from "react";

import Sidebar from "../compenents/dashboard/Sidebar";

import RejectionFilters from "../compenents/rejection/RejectionFilters";
import RejectionTrendChart from "../compenents/rejection/RejectionTrendChart";
import RejectionPieChart from "../compenents/rejection/RejectionPieChart";
import HallWiseChart from "../compenents/rejection/HallWiseChart";
import RecentRejectionsModal from "../compenents/rejection/RecentRejectionsModal";
import RejectionHeatmapModal from "../compenents/rejection/RejectionHeatmapModal";

import { useRejectionDashboard } from "../hooks/useRejectionDashboard";
import { exportRejectionDataToCSV } from "../utils/exportExcel";

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const RejectionDashboard = () => {
  const {
    rejectionData,
    reasonOptions,
    allHalls,
    allReasonLabels,
    recentData,

    loading,
    error,

    appliedDate,
    appliedReasonId,
    applyFilters,
    refresh,
    loadRecent,

    hallChartData,
    reasonChartRows,
    trendChartData,
  } = useRejectionDashboard();

  const [pendingDate, setPendingDate] = useState(getTodayDate());
  const [pendingReasonId, setPendingReasonId] = useState("All");

  const [showRecent, setShowRecent] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleApply = () => applyFilters(pendingDate, pendingReasonId);
  const handleRefresh = () => refresh();
  const handleShowRecent = () => {
    loadRecent(20);
    setShowRecent(true);
  };
  const handleExport = () => exportRejectionDataToCSV(rejectionData, "rejection_data.csv");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Section — fixed to viewport height, no page scroll */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-1.5">
          <div className="flex h-full min-h-0 w-full flex-col rounded border border-slate-200 bg-white p-1.5 shadow-sm">
            {/* Filters — fixed height row */}
            <div className="shrink-0">
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
            </div>

            {error && (
              <div className="mt-1.5 shrink-0 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                Loading rejection data...
              </div>
            ) : (
              // Remaining height split: top row (Hall + Pie) gets more space, bottom row (trend) less.
              <div className="mt-1.5 grid min-h-0 flex-1 grid-rows-[1.5fr_1fr] gap-1.5">
                <div className="grid min-h-0 grid-cols-1 gap-1.5 lg:grid-cols-2">
                  <HallWiseChart data={hallChartData} allHalls={allHalls} />
                  <RejectionPieChart data={reasonChartRows} allReasons={allReasonLabels} />
                </div>

                <RejectionTrendChart data={trendChartData} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Recent Rejections Modal */}
      {showRecent && (
        <RecentRejectionsModal data={recentData} onClose={() => setShowRecent(false)} />
      )}

      {/* Machine x Reason Heatmap Modal */}
      {showHeatmap && (
        <RejectionHeatmapModal data={rejectionData} onClose={() => setShowHeatmap(false)} />
      )}
    </div>
  );
};

export default RejectionDashboard;