import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardFilters from "../compenents/productionDashboard/DashboardFilters";
import OverallProductionChart from "../compenents/productionDashboard/OverallProductionChart";
import HallChartsGrid from "../compenents/productionDashboard/HallChartsGrid";
import SummaryCards from "../compenents/productionDashboard/SummaryCards";

import { halls, HALL_ACCENT } from "../data/productionData";
import { HALL_CODE_TO_ID } from "../data/dashboardData";
import useProductionDashboard from "../hooks/useProductionDashboard";

const getToday = () => new Date().toISOString().split("T")[0];

const UserDashboard = () => {
  const navigate = useNavigate();

  // `date` is the applied filter actually sent to the hook/API.
  // `draftDate` is what the date picker shows while the user is still
  // choosing — it only becomes the real filter once "Apply" is clicked.
  // This mirrors the draft/apply pattern used on HallDashboard.
  const [date, setDate] = useState(getToday());
  const [draftDate, setDraftDate] = useState(getToday());

  // NOTE: hallHourlyData assumed here — confirm your hook actually returns
  // a { [hallName]: [{hour, target, actual}, ...] } shape for this to render.
  // `refetch` is also assumed — if useProductionDashboard doesn't expose a
  // refetch function yet, add one there (re-run the same fetch with the
  // current `date`) so the Refresh button has something to call.
  const {
    summary,
    hourlyData,
    hallHourlyData = {},
    loading,
    error,
    refetch,
  } = useProductionDashboard(date);

  const hasHallCharts = Object.keys(hallHourlyData).length > 0;

  const handleViewHallData = (hall) => {
    if (hall === "All") {
      navigate("/production/dashboard"); // "Overall" card -> overall dashboard, not a per-hall page
      return;
    }
    const hallId = HALL_CODE_TO_ID[hall];
    if (!hallId) {
      console.warn(
        `No route id found for hall "${hall}" — check HALL_CODE_TO_ID / halls list match`,
      );
      return;
    }
    navigate(`/production/halls/${hallId}`);
  };

  const handleExportExcel = () => {
    console.log("Export Excel", { date });
  };

  const handleBack = () => navigate(-1);

  const handleApplyFilters = () => setDate(draftDate);

  const handleReset = () => {
    const today = getToday();
    setDraftDate(today);
    setDate(today);
  };

  const handleRefresh = () => {
    if (refetch) {
      refetch();
    } else {
      // Fallback if the hook has no refetch: re-trigger the effect by
      // briefly toggling the date, then restoring it. Prefer adding a
      // real `refetch` to useProductionDashboard instead of relying on this.
      setDate((d) => d);
    }
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#F5F5F5]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
          <DashboardFilters
            date={draftDate}
            setDate={setDraftDate}
            onExport={handleExportExcel}
            onBack={handleBack}
            onApply={handleApplyFilters}
            onRefresh={handleRefresh}
            onReset={handleReset}
            loading={loading}
          />

          {error && (
            <div className="flex-shrink-0 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600">
              {error}
            </div>
          )}

          <SummaryCards
            overall={summary.overall}
            hallSummary={summary.hallSummary}
            halls={halls}
            hallAccent={HALL_ACCENT}
            onSelectHall={handleViewHallData}
          />

          {/* Remaining vertical space is split between the two chart sections
              so everything fits on one screen — no page-level scrollbar. */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className={`min-h-0 ${hasHallCharts ? "flex-[3]" : "flex-1"}`}>
              <OverallProductionChart
                data={hourlyData}
                onViewHall={handleViewHallData}
                loading={loading}
              />
            </div>

            {hasHallCharts && (
              <div className="min-h-0 flex-[2] overflow-hidden">
                <HallChartsGrid
                  hallHourlyData={hallHourlyData}
                  hallAccent={HALL_ACCENT}
                  onViewHall={handleViewHallData}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;