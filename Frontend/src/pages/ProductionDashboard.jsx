import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import DashboardFilters from "../compenents/productionDashboard/DashboardFilters";
import OverallProductionChart from "../compenents/productionDashboard/OverallProductionChart";
import HallChartsGrid from "../compenents/productionDashboard/HallChartsGrid";

import { halls, hallHourlyData, HALL_ACCENT } from "../data/productionData";

import { overallHourlyData } from "../config/productionHelpers";
import SummaryCards from "../compenents/productionDashboard/SummaryCards";

const ProductionDashboard = () => {
  const navigate = useNavigate();

  // ----------------------------
  // States
  // ----------------------------
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedHall, setSelectedHall] = useState("All");

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleViewHallData = (hall = selectedHall) => {
    navigate(`/hall-data/${hall}`);
  };

  const handleExportExcel = () => {
    console.log("Export Excel", {
      fromDate,
      toDate,
      selectedHall,
    });

    // Future
    // Excel Export API
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="mt-12 flex-1 overflow-y-auto p-1">
          <div className="mx-auto max-w-[1600px] space-y-1">
            {/* Filters */}
            <DashboardFilters
              fromDate={fromDate}
              toDate={toDate}
              selectedHall={selectedHall}
              setFromDate={setFromDate}
              setToDate={setToDate}
              setSelectedHall={setSelectedHall}
              halls={halls}
              onViewHall={() => handleViewHallData(selectedHall)}
              onExport={handleExportExcel}
            />

            <SummaryCards
              hallHourlyData={hallHourlyData}
              hallAccent={HALL_ACCENT}
            />

            {/* Overall Chart */}
            <OverallProductionChart
              data={overallHourlyData}
              onViewHall={handleViewHallData}
            />

            {/* Hall Charts */}
            <HallChartsGrid
              hallHourlyData={hallHourlyData}
              hallAccent={HALL_ACCENT}
              onViewHall={handleViewHallData}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductionDashboard;
