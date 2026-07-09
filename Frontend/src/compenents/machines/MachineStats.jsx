import React from "react";
import {
  FaIndustry,
  FaPlayCircle,
  FaPauseCircle,
  FaTools,
} from "react-icons/fa";

import MachineStatCard from "./MachineStatCard";

const MachineStats = ({ total, running, stopped, maintenance }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
      <MachineStatCard
        title="Total Machines"
        value={total}
        icon={<FaIndustry />}
        bgColor="bg-blue-50"
        textColor="text-blue-600"
      />

      <MachineStatCard
        title="Running"
        value={running}
        icon={<FaPlayCircle />}
        bgColor="bg-green-50"
        textColor="text-green-600"
      />

      <MachineStatCard
        title="Stopped"
        value={stopped}
        icon={<FaPauseCircle />}
        bgColor="bg-red-50"
        textColor="text-red-600"
      />

      <MachineStatCard
        title="Maintenance"
        value={maintenance}
        icon={<FaTools />}
        bgColor="bg-yellow-50"
        textColor="text-yellow-600"
      />
    </div>
  );
};

export default MachineStats;