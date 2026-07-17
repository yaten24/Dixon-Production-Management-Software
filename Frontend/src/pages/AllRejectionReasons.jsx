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

  // Pending (unapplied) filter inputs — separate from applied state in the hook
  const [pendingDate, setPendingDate] = useState("");
  const [pendingReasonId, setPendingReasonId] = useState("All");

  const [showRecent, setShowRecent] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleApply = () => applyFilters(pendingDate, pendingReasonId);

  const handleShowRecent = () => {
    loadRecent(20);
    setShowRecent(true);
  };

  const handleExport = () => {
    exportRejectionDataToCSV(rejectionData, "rejection_data.csv");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-100 p-1">
          <div className="w-full rounded border border-slate-200 bg-white p-1 shadow-sm">
            <div className="space-y-2">
              <RejectionFilters
                selectedDate={pendingDate}
                setSelectedDate={setPendingDate}
                selectedReason={pendingReasonId}
                setSelectedReason={setPendingReasonId}
                reasonOptions={reasonOptions}
                onApply={handleApply}
                onRefresh={refresh}
                onShowRecent={handleShowRecent}
                onExport={handleExport}
                onShowHeatmap={() => setShowHeatmap(true)}
              />

              {error && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                  Loading rejection data...
                </div>
              ) : (
                <>
                  <RejectionSummaryCards
                    totalRejectQty={totalRejectQty}
                    highestReason={highestReason}
                    highestHall={highestHall}
                    highestMachine={highestMachine}
                  />

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <RejectionPieChart data={reasonChartRows} />
                    <HallWiseChart data={hallChartData} />
                  </div>

                  <MachineWiseBarChart data={machineChartData} />

                  <RejectionTrendChart data={trendChartData} />
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {showRecent && (
        <RecentRejectionsModal
          data={recentData}
          onClose={() => setShowRecent(false)}
        />
      )}

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