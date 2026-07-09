import React from "react";
import HallProductionChart from "./HallProductionChart";

const HallChartsGrid = ({
  hallHourlyData,
  hallAccent,
  onViewHall,
}) => {
  return (
    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      {Object.entries(hallHourlyData).map(([hall, rows]) => (
        <HallProductionChart
          key={hall}
          hall={hall}
          rows={rows}
          accent={hallAccent[hall]}
          onViewHall={onViewHall}
        />
      ))}
    </div>
  );
};

export default HallChartsGrid;