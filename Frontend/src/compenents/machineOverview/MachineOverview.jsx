import { useMemo, useState } from "react";

import SummaryCards from "../../components/machineOverview/SummaryCards";

import OverviewHeader from "../../components/machineOverview/OverviewHeader";

import MachineGrid from "../../components/machineOverview/MachineGrid";

import { dummyMachines } from "../../data/dummyMachines";

const MachineOverview = () => {
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],

    hall: "Hall 1",

    shift: "A",

    search: "",
  });
  const [selectedMachine, setSelectedMachine] = useState(null);

  const filteredMachines = useMemo(() => {
    return dummyMachines.filter((machine) => {
      const hallMatch = machine.hall === filters.hall;

      const shiftMatch = machine.shift === filters.shift;

      const searchMatch = machine.machineCode
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      return hallMatch && shiftMatch && searchMatch;
    });
  }, [filters]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Machine Overview</h1>

        <p className="text-gray-500 mt-1">Live Monitoring Dashboard</p>
      </div>

      <SummaryCards machines={filteredMachines} />

      <OverviewHeader filters={filters} setFilters={setFilters} />

      <MachineGrid
      machines={filteredMachines}
    onSelectMachine={setSelectedMachine} />
    </div>
  );
};

export default MachineOverview;
