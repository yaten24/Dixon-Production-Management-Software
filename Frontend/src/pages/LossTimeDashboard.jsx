import React, { useMemo, useState } from "react";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import { lossTimeData } from "../data/lossTimeData";

import {
  filterLossTimeData,
  getTotalLossMinutes,
  getProductionLoss,
  getAverageDowntime,
  getTotalEvents,
  getHighestHall,
  getHighestMachine,
  getHighestReason,
  getHallWiseLoss,
  getMachineWiseLoss,
  getReasonWiseLoss,
  getShiftWiseLoss,
  getHeatMapData,
  getRecentEvents,
  getUniqueHalls,
  getUniqueMachines,
  getUniqueReasons,
} from "../config/lossTimeHelpers";

import LossFilters from "../compenents/lossTime/LossFilters";
import LossSummaryCards from "../compenents/lossTime/LossSummaryCards";
import HallWiseLossChart from "../compenents/lossTime/HallWiseLossChart";
import MachineWiseLossChart from "../compenents/lossTime/MachineWiseLossChart";
import ReasonWisePieChart from "../compenents/lossTime/ReasonWisePieChart";
import MachineHeatMap from "../compenents/lossTime/MachineHeatMap";
import RecentLossTimeline from "../compenents/lossTime/RecentLossTimeline";

// Reusable section wrapper - proper boxed container for every dashboard block
const Section = ({ title, subtitle, children, className = "" }) => (
  <section
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
  >
    {title && (
      <div className="border-b border-gray-100 px-3 py-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[9px] text-gray-500">{subtitle}</p>
        )}
      </div>
    )}
    <div className="p-3">{children}</div>
  </section>
);

const LossTimeDashboard = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const halls = getUniqueHalls(lossTimeData);
  const machines = getUniqueMachines(lossTimeData);
  const reasons = getUniqueReasons(lossTimeData);

  const filteredData = useMemo(() => {
    return filterLossTimeData(lossTimeData, {
      fromDate,
      toDate,
      hall: selectedHall,
      machine: selectedMachine,
      shift: selectedShift,
      reason: selectedReason,
    });
  }, [fromDate, toDate, selectedHall, selectedMachine, selectedShift, selectedReason]);

  const totalLossMinutes = getTotalLossMinutes(filteredData);
  const productionLoss = getProductionLoss(filteredData);
  const averageDowntime = getAverageDowntime(filteredData);
  const totalEvents = getTotalEvents(filteredData);

  const highestHall = getHighestHall(filteredData);
  const highestMachine = getHighestMachine(filteredData);
  const highestReason = getHighestReason(filteredData);

  const hallWiseData = getHallWiseLoss(filteredData);
  const machineWiseData = getMachineWiseLoss(filteredData);
  const reasonWiseData = getReasonWiseLoss(filteredData);
  const shiftWiseData = getShiftWiseLoss(filteredData);
  const heatMapData = getHeatMapData(filteredData);
  const recentEvents = getRecentEvents(filteredData);

  const handleApplyFilters = () => {};

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedHall("");
    setSelectedMachine("");
    setSelectedShift("");
    setSelectedReason("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-1">
          <div className="mx-auto max-w-[1600px] space-y-1">
            {/* Filters Box */}
                <LossFilters
                  fromDate={fromDate}
                  toDate={toDate}
                  selectedHall={selectedHall}
                  selectedMachine={selectedMachine}
                  selectedShift={selectedShift}
                  selectedReason={selectedReason}
                  halls={halls}
                  machines={machines}
                  reasons={reasons}
                  onFromDateChange={setFromDate}
                  onToDateChange={setToDate}
                  onHallChange={setSelectedHall}
                  onMachineChange={setSelectedMachine}
                  onShiftChange={setSelectedShift}
                  onReasonChange={setSelectedReason}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />

            {/* Summary Cards Box */}
              <LossSummaryCards
                totalLossMinutes={totalLossMinutes}
                productionLoss={productionLoss}
                averageDowntime={averageDowntime}
                totalEvents={totalEvents}
                highestHall={highestHall}
                highestMachine={highestMachine}
                highestReason={highestReason}
              />

            {/* Hall + Reason Charts Row */}
            <div className="grid gap-1 xl:grid-cols-2">
              <HallWiseLossChart data={hallWiseData} />
              <ReasonWisePieChart data={reasonWiseData} />
            </div>

            {/* Machine Wise Chart */}
            <MachineWiseLossChart data={machineWiseData} />

            {/* Machine Heat Map */}
            <MachineHeatMap data={heatMapData} />

            {/* Recent Events Timeline */}
            <RecentLossTimeline data={recentEvents} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LossTimeDashboard;