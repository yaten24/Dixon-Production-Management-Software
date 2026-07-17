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
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F5F5F5]">
      <Sidebar />

      {/* Everything to the right of the sidebar fits exactly one viewport
          height — nothing here scrolls at the page level. */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-1">
        {/* Filters row — fixed height, loading indicator sits inline so it
            never adds vertical space of its own. */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="min-w-0 flex-1">
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

        {/* Remaining height split: top row (Hall + Pie) gets more space,
            bottom row (trend) less. */}
        <div className="grid min-h-0 flex-1 grid-rows-[1fr_1.5fr] gap-1.5">
          <div className="grid min-h-0 grid-cols-1 gap-1.5 xl:grid-cols-2">
            <div className="min-h-0">
              <HallWiseChart data={hallChartData} allHalls={allHalls} />
            </div>
            <div className="min-h-0">
              <RejectionPieChart data={reasonChartRows} allReasons={allReasonLabels} />
            </div>
          </div>

          <div className="min-h-0">
            <RejectionTrendChart data={trendChartData} />
          </div>
        </div>
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