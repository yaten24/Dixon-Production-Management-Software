import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../compenents/dashboard/Sidebar";
import DashboardFilters from "../compenents/productionDashboard/DashboardFilters";
import OverallProductionChart from "../compenents/productionDashboard/OverallProductionChart";
import SummaryCards from "../compenents/productionDashboard/SummaryCards";

import { HALL_ACCENT } from "../data/productionData";
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
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-1">
          <div className="mx-auto max-w-[1600px] space-y-1">
            <DashboardFilters
              date={date}
              setDate={setDate}
              onExport={handleExportExcel}
            />

            {error && (
              <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600">
                {error}
              </div>
            )}

            <SummaryCards
              overall={summary.overall}
              hallSummary={summary.hallSummary}
              hallAccent={HALL_ACCENT}
              onSelectHall={handleViewHallData}
            />

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