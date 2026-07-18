import React, { useEffect, useMemo, useState } from "react";

import Sidebar from "../../compenents/dashboard/Sidebar";
import Header from "../../compenents/dashboard/Header";

import MachineToolbar from "../../compenents/machines/MachineToolbar";
import MachineTable from "../../compenents/machines/MachineTable";

import {
  getAllMachines,
  updateMachineStatus,
} from "../../api/machineApi";

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedHall, setSelectedHall] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const halls = ["All", "C8", "Hall 1", "Hall 2", "Hall 3", "Hall 4"];

  // Fetch Machines
  const fetchMachines = async () => {
    try {
      setLoading(true);

      const response = await getAllMachines();

      setMachines(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Update Machine Status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateMachineStatus(id, newStatus);

      // Update Local State (No Refresh)
      setMachines((prev) =>
        prev.map((machine) =>
          machine.id === id
            ? {
                ...machine,
                status: newStatus,
              }
            : machine
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Filter Machines
  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const hallMatch =
        selectedHall === "All"
          ? true
          : machine.hall === selectedHall;

      const searchMatch =
        machine.machine_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        machine.machine_code
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return hallMatch && searchMatch;
    });
  }, [machines, selectedHall, searchTerm]);

  // Statistics
  const totalMachines = filteredMachines.length;

  const runningMachines = filteredMachines.filter(
    (m) => m.status === "Running"
  ).length;

  const stoppedMachines = filteredMachines.filter(
    (m) => m.status === "Stopped"
  ).length;

  const maintenanceMachines = filteredMachines.filter(
    (m) => m.status === "Maintenance"
  ).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">

        <div className="flex-1 p-1 space-y-1 overflow-auto">
          <MachineToolbar
            halls={halls}
            selectedHall={selectedHall}
            setSelectedHall={setSelectedHall}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            total={totalMachines}
            running={runningMachines}
            stopped={stoppedMachines}
            maintenance={maintenanceMachines}
          />

          <MachineTable
            filteredMachines={filteredMachines}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Machines;