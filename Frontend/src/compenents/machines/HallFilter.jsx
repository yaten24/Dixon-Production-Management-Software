import React from "react";

const HallFilter = ({ halls, selectedHall, setSelectedHall }) => {
  return (
    <select
      value={selectedHall}
      onChange={(e) => setSelectedHall(e.target.value)}
      className="h-7 w-full rounded border border-gray-300 px-2 text-xs font-medium text-gray-700 outline-none transition focus:border-blue-500 lg:w-40"
    >
      {halls.map((hall) => (
        <option key={hall} value={hall}>
          {hall}
        </option>
      ))}
    </select>
  );
};

export default HallFilter;