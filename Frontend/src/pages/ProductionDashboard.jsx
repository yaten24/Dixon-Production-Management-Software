import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../compenents/dashboard/Sidebar";
import DashboardFilters from "../compenents/productionDashboard/DashboardFilters";
import OverallProductionChart from "../compenents/productionDashboard/OverallProductionChart";
import SummaryCards from "../compenents/productionDashboard/SummaryCards";

import { halls, HALL_ACCENT } from "../data/productionData";
import useProductionDashboard from "../hooks/useProductionDashboard";

const getToday = () => new Date().toISOString().split("T")[0];

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(getToday());

  const { summary, hourlyData, loading, error } = useProductionDashboard(date);

  const handleViewHallData = (hall) => {
    navigate(`/hall-data/${hall}`);
  };

  const handleExportExcel = () => {
    console.log("Export Excel", { date });
    // Future: Excel Export API
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Everything below fits within the viewport height — no page scroll */}
        <main className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-1">
          {/* Filters — fixed height */}
          <DashboardFilters
            date={date}
            setDate={setDate}
            onExport={handleExportExcel}
          />

          {error && (
            <div className="flex-shrink-0 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600">
              {error}
            </div>
          )}

          {/* Summary cards — always show all halls; zero-fill + warning if no data */}
          <SummaryCards
            overall={summary.overall}
            hallSummary={summary.hallSummary}
            halls={halls}
            hallAccent={HALL_ACCENT}
            onSelectHall={handleViewHallData}
          />

          {/* Chart — takes all remaining vertical space */}
          <div className="min-h-0 flex-1">
            <OverallProductionChart
              data={hourlyData}
              onViewHall={handleViewHallData}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductionDashboard;