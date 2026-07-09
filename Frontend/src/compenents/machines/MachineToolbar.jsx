import React from "react";

import HallFilter from "./HallFilter";
import MachineSearch from "./MachineSearch";
import MachineStats from "./MachineStats";

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
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded p-1">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2">
        {/* Hall Filter */}
        <HallFilter
          halls={halls}
          selectedHall={selectedHall}
          setSelectedHall={setSelectedHall}
        />

        {/* Search */}
        <MachineSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Statistics */}
        <div className="lg:ml-auto">
          <MachineStats
            total={total}
            running={running}
            stopped={stopped}
            maintenance={maintenance}
          />
        </div>
      </div>
    </div>
  );
};

export default MachineToolbar;