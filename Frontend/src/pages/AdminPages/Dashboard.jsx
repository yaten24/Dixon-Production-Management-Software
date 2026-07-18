import React from "react";

import Sidebar from "../../compenents/dashboard/Sidebar";
import Header from "../../compenents/dashboard/Header";

import ProductionChart from "../../compenents/dashboard/ProductionChart";
import RejectionAnalysis from "../../compenents/dashboard/RejectionAnalysis";
import LossTimeAnalysis from "../../compenents/dashboard/LossTimeAnalysis";
import AttendanceWidget from "../../compenents/dashboard/RejectionLossTrend";
import ProductionStats from "../../compenents/dashboard/ProductionStats";
import TargetSummary from "../../compenents/dashboard/TargetSummary";

const Dashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-1">
          <div
            className="
      w-full/..
      rounded-sm
      border
      border-slate-200
      bg-white
      shadow-sm
      p-1
      lg:p-1
    "
          >
            <div className="space-y-1">
              {/* Shift A / Shift B / Overall target — plan tables se */}
              <TargetSummary />

              <ProductionStats />

              <div className="grid grid-cols-1 gap-1 xl:grid-cols-2">
                <ProductionChart />
                <RejectionAnalysis />
              </div>

              <div className="grid grid-cols-1 gap-1 xl:grid-cols-2">
                <LossTimeAnalysis />
                <AttendanceWidget />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
