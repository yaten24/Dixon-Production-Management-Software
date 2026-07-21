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
  const [date, setDate] = useState(getToday());

  // NOTE: hallHourlyData assumed here — confirm your hook actually returns
  // a { [hallName]: [{hour, target, actual}, ...] } shape for this to render.
  const { summary, hourlyData, hallHourlyData = {}, loading, error } = useProductionDashboard(date);

  const hasHallCharts = Object.keys(hallHourlyData).length > 0;

  const handleViewHallData = (hall) => {
    if (hall === "All") {
      navigate("/production/dashboard"); // "Overall" card -> overall dashboard, not a per-hall page
      return;
    }
    const hallId = HALL_CODE_TO_ID[hall];
    if (!hallId) {
      console.warn(`No route id found for hall "${hall}" — check HALL_CODE_TO_ID / halls list match`);
      return;
    }
    navigate(`/production/halls/${hallId}`);
  };

  const handleExportExcel = () => {
    console.log("Export Excel", { date });
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#F5F5F5]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1">
          <DashboardFilters date={date} setDate={setDate} onExport={handleExportExcel} />

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
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <div className={`min-h-0 ${hasHallCharts ? "flex-[3]" : "flex-1"}`}>
              <OverallProductionChart data={hourlyData} onViewHall={handleViewHallData} loading={loading} />
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