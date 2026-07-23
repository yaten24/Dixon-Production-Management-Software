import React from "react";
import { FaThLarge } from "react-icons/fa";
import HallProductionChart from "./HallProductionChart";

const HallChartsGrid = ({ hallHourlyData, hallAccent, onViewHall }) => {
  const entries = Object.entries(hallHourlyData || {});

  if (entries.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-1 rounded border border-[#C6C6C6]/50 bg-white text-center">
        <FaThLarge className="text-[18px] text-[#C6C6C6]" />
        <p className="text-[11px] font-semibold text-[#0F1D24]">No per-hall breakdown yet</p>
        <p className="text-[9.5px] text-[#9B9B9B]">Hall-wise charts will appear once production entries exist for this date.</p>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 gap-2 overflow-y-auto xl:grid-cols-2">
      {entries.map(([hall, rows]) => (
        <HallProductionChart
          key={hall}
          hall={hall}
          rows={rows}
          accent={hallAccent[hall] || "#0F1D24"}
          onViewHall={onViewHall}
        />
      ))}
    </div>
  );
};

export default HallChartsGrid;