import React from "react";
import Sidebar from "../../compenents/dashboard/Sidebar";
import DashboardHeader from "../../compenents/mouldChange/DashboardHeader";
import HallWiseMouldChange from "../../compenents/mouldChange/HallWiseMouldChange";
import PlannedUnplannedCard from "../../compenents/mouldChange/PlannedUnplannedCard";
import HourlyLossTime from "../../compenents/mouldChange/HourlyLossTime";
import useMouldChangeDashboard from "../../hooks/useMouldChangeDashboard";

const MouldChangeDashboard = () => {
  const {
    date, setDate, reason, setReason, reasonOptions,
    data, loading, error, refresh, resetFilters,
  } = useMouldChangeDashboard();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-2 space-y-2">
          <DashboardHeader
            date={date}
            setDate={setDate}
            reason={reason}
            setReason={setReason}
            reasonOptions={reasonOptions}
            onApply={refresh}
            onRefresh={refresh}
            onReset={resetFilters}
            onRecent={() => console.log("Recent clicked")}
            onExport={() => console.log("Export clicked")}
            onHeatmap={() => console.log("Heatmap clicked")}
          />

          {error && (
            <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <HallWiseMouldChange hallWiseMouldChanges={data?.hallWiseMouldChanges} />
            <PlannedUnplannedCard plannedVsUnplanned={data?.plannedVsUnplanned} />
          </div>

          <HourlyLossTime
            hourlyLoss={data?.hourlyLoss}
            peakHour={data?.peakHour}
            peakHourValue={data?.peakHourValue}
          />

          {loading && <p className="text-center text-xs text-[#9B9B9B]">Loading...</p>}
        </main>
      </div>
    </div>
  );
};

export default MouldChangeDashboard;