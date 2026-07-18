import React, { useState } from "react";
import Sidebar from "../../compenents/dashboard/Sidebar";
import DashboardHeader from "../../compenents/mouldChange/DashboardHeader";
import HallWiseMouldChange from "../../compenents/mouldChange/HallWiseMouldChange";
import PlannedUnplannedCard from "../../compenents/mouldChange/PlannedUnplannedCard";
import HourlyPlannedUnplannedChart from "../../compenents/mouldChange/HourlyPlannedUnplannedChart";
import MouldChangeHeatmap from "../../compenents/mouldChange/MouldChangeHeatmap";
import RecentMouldChangesModal from "../../compenents/mouldChange/RecentMouldChangesModel";
import useMouldChangeDashboard from "../../hooks/useMouldChangeDashboard";

const MouldChangeDashboard = () => {
  const {
    date,
    setDate,
    hall,
    setHall,
    data,
    loading,
    error,
    applyFilters,
    refresh,
    resetFilters,
  } = useMouldChangeDashboard();

  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);

  const handleApply = () => (applyFilters ? applyFilters(date, hall) : refresh());
  const handleRefresh = () => refresh();
  const handleReset = () => resetFilters();
  const handleExport = () => console.log("Export clicked");

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
            <DashboardHeader
              date={date}
              setDate={setDate}
              hall={hall}
              setHall={setHall}
              onApply={handleApply}
              onRefresh={handleRefresh}
              onReset={handleReset}
              onRecent={() => setIsRecentOpen(true)}
              onExport={handleExport}
              onHeatmap={() => setIsHeatmapOpen(true)}
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

        {/* Remaining height split: top row (Hall + Planned/Unplanned) gets
            less space, bottom row (hourly trend) more — mirrors the
            Rejection dashboard's 1fr / 1.5fr rhythm. */}
        <div className="grid min-h-0 flex-1 grid-rows-[1fr_1.5fr] gap-1.5">
          <div className="grid min-h-0 grid-cols-1 gap-1.5 xl:grid-cols-2">
            <div className="min-h-0">
              <HallWiseMouldChange hallWiseMouldChanges={data?.hallWiseMouldChanges} />
            </div>
            <div className="min-h-0">
              <PlannedUnplannedCard plannedVsUnplanned={data?.plannedVsUnplanned} />
            </div>
          </div>

          <div className="min-h-0">
            <HourlyPlannedUnplannedChart
              hourlyPlannedUnplanned={data?.hourlyPlannedUnplanned}
              peakHour={data?.peakHour}
              peakHourValue={data?.peakHourValue}
            />
          </div>
        </div>
      </div>

      {/* Recent Mould Changes Modal */}
      {isRecentOpen && (
        <RecentMouldChangesModal
          isOpen={isRecentOpen}
          onClose={() => setIsRecentOpen(false)}
          date={date}
          hall={hall}
        />
      )}

      {/* Hall x Hour Heatmap Modal */}
      {isHeatmapOpen && (
        <MouldChangeHeatmap
          isOpen={isHeatmapOpen}
          onClose={() => setIsHeatmapOpen(false)}
          date={date}
          hall={hall}
        />
      )}
    </div>
  );
};

export default MouldChangeDashboard;