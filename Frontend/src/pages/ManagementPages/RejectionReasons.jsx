import React, { useState } from "react";
import {
  HiOutlineExclamationTriangle,
  HiOutlineBuildingOffice2,
  HiOutlineCog6Tooth,
  HiOutlineTag,
  HiOutlineChartBarSquare,
} from "react-icons/hi2";

import Sidebar from "./Sidebar";

import RejectionFilters from "../../compenents/rejection/RejectionFilters";
import RejectionTrendChart from "../../compenents/rejection/RejectionTrendChart";
import RejectionPieChart from "../../compenents/rejection/RejectionPieChart";
import HallWiseChart from "../../compenents/rejection/HallWiseChart";
import RecentRejectionsModal from "../../compenents/rejection/RecentRejectionsModal";
import RejectionHeatmapModal from "../../compenents/rejection/RejectionHeatmapModal";

import { useRejectionDashboard } from "../../hooks/useRejectionDashboard";
import { exportRejectionDataToCSV } from "../../utils/exportExcel";

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ============================================================
// KPI stat card — navy/gold theme, matches the pattern used on
// the hourly production tracking page so both pages feel like
// one product.
// ============================================================
const KpiCard = ({ icon: Icon, label, value, sub, tone = "default" }) => {
  const toneClass =
    tone === "danger" ? "text-red-600" : tone === "ok" ? "text-green-600" : "text-[#0F1D24]";
  return (
    <div className="flex flex-1 items-center gap-3 border border-[#C6C6C6] bg-white px-3.5 py-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-[#0F1D24] text-[#FDC94D]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
        <p className={`truncate text-lg font-extrabold leading-tight ${toneClass}`}>{value}</p>
        {sub && <p className="truncate text-[9.5px] text-[#9B9B9B]">{sub}</p>}
      </div>
    </div>
  );
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

    totalRejectQty,
    highestReason,
    highestHall,
    highestMachine,
    machineChartData,

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

  const topMachines = machineChartData.slice(0, 6);
  const topMachineMax = topMachines.length ? Math.max(...topMachines.map((m) => m.qty), 1) : 1;

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#EFEFEF]">
      <Sidebar />

      {/* Everything to the right of the sidebar fits exactly one viewport
          height — nothing here scrolls at the page level. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
        {/* Page header strip */}
        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-[#0F1D24] px-3 py-2">
          <div>
            <h1 className="text-sm font-extrabold text-white">Rejection Dashboard</h1>
            <p className="text-[10px] text-white/50">
              {appliedDate || "All dates"} · {appliedReasonId === "All" ? "All reasons" : "Filtered by reason"}
            </p>
          </div>
          {loading && (
            <span className="flex items-center gap-1.5 border border-[#FDC94D]/40 bg-[#FDC94D]/10 px-2.5 py-1 text-[10px] font-semibold text-[#FDC94D]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FDC94D]" />
              Loading latest data…
            </span>
          )}
        </div>

        {error && (
          <div className="flex flex-shrink-0 items-center gap-1.5 border border-red-300 bg-red-50 px-3 py-1.5 text-[11px] text-red-800">
            <HiOutlineExclamationTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </div>
        )}


        {/* Filters row */}
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
        </div>
        
        {/* KPI row */}
        <div className="flex flex-shrink-0 gap-2">
          <KpiCard
            icon={HiOutlineExclamationTriangle}
            label="Total Rejection"
            value={totalRejectQty}
            sub="Across selected filters"
            tone={totalRejectQty > 0 ? "danger" : "ok"}
          />
          <KpiCard
            icon={HiOutlineTag}
            label="Top Reason"
            value={highestReason?.reason || "—"}
            sub={highestReason?.qty ? `${highestReason.qty} qty` : "No data"}
          />
          <KpiCard
            icon={HiOutlineBuildingOffice2}
            label="Top Hall"
            value={highestHall?.hall || "—"}
            sub={highestHall?.qty ? `${highestHall.qty} qty` : "No data"}
          />
          <KpiCard
            icon={HiOutlineCog6Tooth}
            label="Top Machine"
            value={highestMachine?.machine || "—"}
            sub={highestMachine?.qty ? `${highestMachine.qty} qty` : "No data"}
          />
        </div>


        {/* Remaining height split: top row (Hall + Pie + Top Machines) gets
            more space, bottom row (trend) less. */}
        <div className="grid min-h-0 flex-1 grid-rows-[1fr_1.5fr] gap-2">
          <div className="grid min-h-0 grid-cols-1 gap-2 xl:grid-cols-3">
            <div className="min-h-0">
              <HallWiseChart data={hallChartData} allHalls={allHalls} />
            </div>
            <div className="min-h-0">
              <RejectionPieChart data={reasonChartRows} allReasons={allReasonLabels} />
            </div>

            {/* Top Machines ranked list — new panel, same visual language
                as the other chart cards. */}
            <div className="flex min-h-0 flex-col overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
              <div className="flex flex-shrink-0 items-center gap-1.5 bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
                  <HiOutlineChartBarSquare className="h-3.5 w-3.5 text-[#FDC94D]" />
                </div>
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
                    Top Machines
                  </h2>
                  <p className="text-[9px] text-[#9B9B9B]">Highest rejection quantity</p>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {topMachines.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-[10px] text-[#9B9B9B]">
                    No machine rejection data
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {topMachines.map((m, i) => (
                      <li key={m.machine} className="flex items-center gap-2">
                        <span className="w-4 flex-shrink-0 text-[9px] font-bold text-[#9B9B9B]">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[10px] font-semibold text-[#0F1D24]" title={m.machine}>
                              {m.machine}
                            </span>
                            <span className="flex-shrink-0 font-mono text-[10px] font-bold text-red-600">
                              {m.qty}
                            </span>
                          </div>
                          <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F5F5F5]">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{ width: `${Math.max((m.qty / topMachineMax) * 100, 4)}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
                <span className="text-[9px] text-[#9B9B9B]">{machineChartData.length} machines with rejections</span>
              </div>
            </div>
          </div>

          <div className="min-h-0">
            <RejectionTrendChart data={trendChartData} loading={loading} />
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