import React, { memo, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiActivity,
  FiPlay,
  FiPause,
  FiTool,
  FiLoader,
} from "react-icons/fi";

import Sidebar from "./Sidebar";
import { getAllMachines, updateMachineStatus } from "../../api/machineApi";

// ============================================================
// THEME TOKENS — kept consistent with AdminDashboard / Sidebar / Users
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";
const MUTED = "#9B9B9B";

/* ==========================================================
   MACHINE STATUS BADGE — flat bordered chip + status dot
========================================================== */
const statusColorMap = {
  Running: "text-green-700",
  Stopped: "text-red-700",
  Idle: "text-red-700",
  Maintenance: "text-amber-700",
};

const statusDotMap = {
  Running: "bg-green-500",
  Stopped: "bg-red-500",
  Idle: "bg-red-500",
  Maintenance: "bg-amber-500",
};

const MachineStatusBadge = ({ status }) => {
  const label = status === "Idle" ? "Stopped" : status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${
        statusColorMap[status] || "text-[#0F1D24]"
      }`}
    >
      <span className={`h-1.5 w-1.5 flex-shrink-0 ${statusDotMap[status] || "bg-gray-400"}`} />
      {label}
    </span>
  );
};

/* ==========================================================
   MACHINE ACTION SELECT — flat bordered status changer
========================================================== */
const MachineActionButton = memo(({ machine, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === machine.status) return;

    try {
      setLoading(true);
      await onStatusChange(machine.id, newStatus);
    } catch (error) {
      console.log(error);
      alert("Unable to update machine status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={machine.status}
        disabled={loading}
        onChange={handleStatusChange}
        className="h-7 border border-[#C6C6C6] bg-white px-2 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] outline-none focus:border-[#0F1D24] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="Running">Running</option>
        <option value="Stopped">Stopped</option>
        <option value="Maintenance">Maintenance</option>
      </select>
      {loading && (
        <FiLoader size={11} className="ml-1.5 animate-spin text-[#9B9B9B]" />
      )}
    </div>
  );
});
MachineActionButton.displayName = "MachineActionButton";

/* ==========================================================
   NO MACHINE FOUND — flat empty state
========================================================== */
const NoMachineFound = ({ colSpan = 6 }) => (
  <tr>
    <td colSpan={colSpan} className="py-10">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-2.5 flex h-12 w-12 items-center justify-center border border-[#C6C6C6] bg-[#F9F9F9] text-[#9B9B9B]">
          <FiTool size={20} />
        </div>
        <h3 className="text-[12px] font-extrabold uppercase tracking-wide text-[#0F1D24]">
          No Machines Found
        </h3>
        <p className="mt-1 text-[10.5px] font-medium text-[#9B9B9B]">
          Try changing the hall filter or search keyword.
        </p>
      </div>
    </td>
  </tr>
);

/* ==========================================================
   MACHINE TABLE ROW — flat row, zebra + gold hover
========================================================== */
const MachineTableRow = memo(({ index, machine, onStatusChange }) => (
  <motion.tr
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.02, duration: 0.2, ease: "easeOut" }}
    className={`group border-b border-[#C6C6C6]/60 transition-colors hover:bg-[#FDF6E3] ${
      index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
    }`}
  >
    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[10.5px] font-semibold text-[#9B9B9B]">
      {index + 1}
    </td>
    <td className="px-2 py-1.5 font-semibold text-[#0F1D24]">{machine.machine_name}</td>
    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[10.5px] text-[#0F1D24]/75">
      {machine.machine_code}
    </td>
    <td className="px-2 py-1.5">
      <span className="inline-flex items-center border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24] transition-colors group-hover:border-[#0F1D24]">
        {machine.hall}
      </span>
    </td>
    <td className="px-2 py-1.5">
      <MachineStatusBadge status={machine.status} />
    </td>
    <td className="px-2 py-1.5 text-center">
      <div className="flex justify-center">
        <MachineActionButton machine={machine} onStatusChange={onStatusChange} />
      </div>
    </td>
  </motion.tr>
));
MachineTableRow.displayName = "MachineTableRow";

/* ==========================================================
   MACHINE TABLE — flat bordered table, sticky header
========================================================== */
const MachineTable = memo(({ filteredMachines, onStatusChange }) => (
  <div className="overflow-hidden border border-[#C6C6C6] bg-white">
    <div className="overflow-x-auto">
      <table className="min-w-full text-[11px]">
        <thead className="sticky top-0 z-10 border-b border-[#C6C6C6] bg-[#F5F5F5]">
          <tr>
            <th className="w-12 whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
              S.No
            </th>
            <th className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Machine Name
            </th>
            <th className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Machine Code
            </th>
            <th className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Hall
            </th>
            <th className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Status
            </th>
            <th className="px-2 py-1.5 text-center text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine, index) => (
              <MachineTableRow
                key={machine.id}
                index={index}
                machine={machine}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <NoMachineFound colSpan={6} />
          )}
        </tbody>
      </table>
    </div>
  </div>
));
MachineTable.displayName = "MachineTable";

/* ==========================================================
   MACHINE STAT CARD — flat border + left accent
========================================================== */
const MachineStatCard = ({ title, value, icon, accent }) => (
  <div
    className="flex items-center gap-2 border border-[#C6C6C6] bg-white px-2.5 py-1.5"
    style={{ borderLeft: `3px solid ${accent}` }}
  >
    <div
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#C6C6C6]"
      style={{ color: accent }}
    >
      <span className="text-[12px]">{icon}</span>
    </div>
    <div className="min-w-0 leading-tight">
      <p className="truncate text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{title}</p>
      <p className="font-mono text-[15px] font-extrabold leading-none text-[#0F1D24]">{value}</p>
    </div>
  </div>
);

/* ==========================================================
   MACHINE STATS — compact stat tile row
========================================================== */
const MachineStats = ({ total, running, stopped, maintenance }) => (
  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
    <MachineStatCard title="Total Machines" value={total} icon={<FiActivity />} accent="#2563EB" />
    <MachineStatCard title="Running" value={running} icon={<FiPlay />} accent="#16A34A" />
    <MachineStatCard title="Stopped" value={stopped} icon={<FiPause />} accent="#DC2626" />
    <MachineStatCard title="Maintenance" value={maintenance} icon={<FiTool />} accent="#EA580C" />
  </div>
);

/* ==========================================================
   HALL FILTER — flat bordered select
========================================================== */
const HallFilter = ({ halls, selectedHall, setSelectedHall }) => (
  <select
    value={selectedHall}
    onChange={(e) => setSelectedHall(e.target.value)}
    className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] lg:w-40"
  >
    {halls.map((hall) => (
      <option key={hall} value={hall}>
        {hall}
      </option>
    ))}
  </select>
);

/* ==========================================================
   MACHINE SEARCH — flat bordered search input
========================================================== */
const MachineSearch = ({ searchTerm, setSearchTerm }) => (
  <div className="relative w-full lg:max-w-xs">
    <FiSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search name, machine code..."
      className="h-8 w-full border border-[#C6C6C6] pl-8 pr-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24]"
    />
  </div>
);

/* ==========================================================
   MACHINE TOOLBAR — flat control box
========================================================== */
const MachineToolbar = ({
  halls,
  selectedHall,
  setSelectedHall,
  searchTerm,
  setSearchTerm,
  total,
  running,
  stopped,
  maintenance,
}) => (
  <div className="border border-[#C6C6C6] bg-white px-3 py-2.5">
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <HallFilter halls={halls} selectedHall={selectedHall} setSelectedHall={setSelectedHall} />
      <MachineSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="lg:ml-auto">
        <MachineStats total={total} running={running} stopped={stopped} maintenance={maintenance} />
      </div>
    </div>
  </div>
);

/* ==========================================================
   MACHINES PAGE
========================================================== */
const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedHall, setSelectedHall] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const halls = ["All", "C8", "Hall 1", "Hall 2", "Hall 3", "Hall 4"];

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateMachineStatus(id, newStatus);
      setMachines((prev) =>
        prev.map((machine) =>
          machine.id === id ? { ...machine, status: newStatus } : machine
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const hallMatch = selectedHall === "All" ? true : machine.hall === selectedHall;

      const searchMatch =
        machine.machine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.machine_code.toLowerCase().includes(searchTerm.toLowerCase());

      return hallMatch && searchMatch;
    });
  }, [machines, selectedHall, searchTerm]);

  const totalMachines = filteredMachines.length;
  const runningMachines = filteredMachines.filter((m) => m.status === "Running").length;
  const stoppedMachines = filteredMachines.filter((m) => m.status === "Stopped").length;
  const maintenanceMachines = filteredMachines.filter((m) => m.status === "Maintenance").length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-[#0F1D24]">
          <FiLoader className="animate-spin" size={16} />
          <span className="text-[11px] font-bold uppercase tracking-wide">Loading Machines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <div className="flex-1 space-y-2 overflow-auto p-2">
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

          <MachineTable filteredMachines={filteredMachines} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </div>
  );
};

export default Machines;