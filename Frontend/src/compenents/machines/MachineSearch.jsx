import React from "react";
import { FaSearch } from "react-icons/fa";

const MachineSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full lg:max-w-md">
      <FaSearch size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by Machine Name / Code..."
        className="h-7 w-full rounded border border-gray-300 pl-8 pr-3 text-xs outline-none transition focus:border-blue-500"
      />
    </div>
  );
};

export default MachineSearch;