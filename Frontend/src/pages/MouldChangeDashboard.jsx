import React, { useMemo, useState } from "react";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import {
  mouldChangeData,
  COLORS,
} from "../data/mouldChangeData";

import DashboardHeader from "../compenents/mouldChange/DashboardHeader";
import Filters from "../compenents/mouldChange/Filters";
import HallWiseChart from "../compenents/mouldChange/HallWiseChart";
import MachineTable from "../compenents/mouldChange/MachineTable";
import RecentMouldChanges from "../compenents/mouldChange/RecentMouldChanges";
import HallAverageTime from "../compenents/mouldChange/HallAvearegeTime";

// List every hall that should appear on the chart, in display order.
// Add/remove hall names here if the plant layout changes.
const HALL_LIST = ["Hall-1", "Hall-2", "Hall-3", "Hall-4", "C-8"];

const MouldChangeDashboard = () => {
  const [selectedHall, setSelectedHall] = useState("All");

  const [searchMachine, setSearchMachine] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [selectedMachine, setSelectedMachine] = useState("All");

  const [selectedChangeRange, setSelectedChangeRange] = useState("All");

  const [selectedTimeRange, setSelectedTimeRange] = useState("All");

  const [sortBy, setSortBy] = useState("");

  const activeFilterCount = [selectedHall !== "All", selectedMachine !== "All", searchMachine, selectedChangeRange !== "All", selectedTimeRange !== "All", sortBy].filter(Boolean).length;

  const applyFilters = () => {
    console.log("Filters Applied");
  };

  const machineOptions = [...new Set(mouldChangeData.map((item) => item.machine))];

  const resetFilters = () => {
    setSelectedHall("All");
    setSelectedMachine("All");
    setSearchMachine("");
    setSelectedChangeRange("All");
    setSelectedTimeRange("All");
    setSortBy("");
  };

  /* ==========================================
      MACHINE AGGREGATION
  ========================================== */

  const filteredMachines = useMemo(() => {
    const filtered = mouldChangeData.filter((item) => {
      const hallMatch = selectedHall === "All" ? true : item.hall === selectedHall;

      const machineMatch = searchMachine === "" ? true : item.machine.toLowerCase().includes(searchMachine.toLowerCase()) || item.machineName.toLowerCase().includes(searchMachine.toLowerCase());

      return hallMatch && machineMatch;
    });

    const groupedMachines = Object.values(
      filtered.reduce((acc, item) => {
        if (!acc[item.machine]) {
          acc[item.machine] = {
            machine: item.machine,
            machineName: item.machineName,
            hall: item.hall,
            mouldChanges: 0,
            totalDuration: 0,
            avgChangeTime: 0,
            lastChange: item.changeTime,
            latestDate: item.changeDate,
          };
        }

        acc[item.machine].mouldChanges += 1;

        acc[item.machine].totalDuration += item.changeDuration;

        if (item.changeDate > acc[item.machine].latestDate) {
          acc[item.machine].latestDate = item.changeDate;

          acc[item.machine].lastChange = item.changeTime;
        }

        return acc;
      }, {})
    );

    return groupedMachines.map((machine) => ({
      ...machine,
      avgChangeTime: Math.round(machine.totalDuration / machine.mouldChanges),
    }));
  }, [selectedHall, searchMachine]);
  const totalMachines = filteredMachines.length;

  const totalMouldChanges = filteredMachines.reduce((sum, machine) => sum + machine.mouldChanges, 0);

  const avgTime = filteredMachines.length > 0 ? (filteredMachines.reduce((sum, machine) => sum + machine.avgChangeTime, 0) / filteredMachines.length).toFixed(1) : 0;

  // Hall-wise data for HallWiseChart: now includes total change-time
  // (timeMinutes) per hall, in addition to the changes count, and covers
  // every hall in HALL_LIST (including C-8).
  const hallChartData = useMemo(
    () =>
      HALL_LIST.map((hall) => {
        const hallItems = mouldChangeData.filter((item) => item.hall === hall);

        return {
          hall,
          changes: hallItems.length,
          timeMinutes: hallItems.reduce((sum, item) => sum + (item.changeDuration || 0), 0),
        };
      }),
    []
  );

  const machineChartData = [...filteredMachines].sort((a, b) => b.mouldChanges - a.mouldChanges).slice(0, 15);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}

      <Sidebar />

      {/* Main */}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}

        {/* Content */}

        <main className="flex-1 overflow-y-auto p-1">
          <DashboardHeader fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} />

          {/* <KPISection
            totalMachines={totalMachines}
            totalMouldChanges={totalMouldChanges}
            avgTime={avgTime}
          /> */}

          {/* <Filters selectedHall={selectedHall} setSelectedHall={setSelectedHall} selectedMachine={selectedMachine} setSelectedMachine={setSelectedMachine} searchMachine={searchMachine} setSearchMachine={setSearchMachine} selectedChangeRange={selectedChangeRange} setSelectedChangeRange={setSelectedChangeRange} selectedTimeRange={selectedTimeRange} setSelectedTimeRange={setSelectedTimeRange} sortBy={sortBy} setSortBy={setSortBy} machineOptions={machineOptions} resetFilters={resetFilters} applyFilters={applyFilters} activeFilterCount={activeFilterCount} /> */}

          {/* Charts */}

          {/* <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <HallWiseChart hallChartData={hallChartData} COLORS={COLORS} />

            <MachineWiseChart machineChartData={machineChartData} />
          </div> */}
          <div className="mt-2">
            <HallWiseChart hallChartData={hallChartData} COLORS={COLORS} />

            {/* <MachineWiseChart machineChartData={machineChartData} /> */}
          </div>
          {/* Machine Table */}
          {/* <HallAverageTime /> */}

          <div className="mt-2">
            <MachineTable filteredMachines={filteredMachines} />
          </div>

          {/* Bottom Section */}

          <div>
            <RecentMouldChanges mouldChangeData={mouldChangeData} />

            {/* <HallSummary mouldChangeData={mouldChangeData} /> */}
          </div>
          {/* <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentMouldChanges mouldChangeData={mouldChangeData} />

            <HallSummary mouldChangeData={mouldChangeData} />
          </div> */}
        </main>
      </div>
    </div>
  );
};

export default MouldChangeDashboard;