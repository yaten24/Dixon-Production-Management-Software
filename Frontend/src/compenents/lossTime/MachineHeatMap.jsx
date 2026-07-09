import React from "react";
import { FaFire } from "react-icons/fa";

const hours = Array.from({ length: 24 }, (_, i) => i);

const getColor = (value) => {
  if (!value) return "bg-gray-50";
  if (value <= 10) return "bg-green-300";
  if (value <= 20) return "bg-yellow-300";
  if (value <= 40) return "bg-orange-400";
  return "bg-red-500 text-white";
};

const MAX_TABLE_HEIGHT = 260; // vertical scroll kicks in beyond this

const MachineHeatMap = ({ data }) => {
  const machines = [...new Set(data.map((item) => item.machine))];

  const getLoss = (machine, hour) => {
    const record = data.find(
      (item) => item.machine === machine && item.hour === hour
    );
    return record ? record.lossMinutes : 0;
  };

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500 shadow-sm">
            <FaFire className="text-[10px] text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
              Machine Heat Map
            </h2>
            <p className="text-[9px] text-gray-500">
              Hourly machine downtime distribution
            </p>
          </div>
        </div>

        <span className="text-[9px] font-semibold text-blue-600">24 Hours</span>
      </div>

      {/* Heatmap - both axes scrollable, fixed max height */}
      <div
        className="overflow-auto"
        style={{ maxHeight: MAX_TABLE_HEIGHT }}
      >
        <table className="w-full min-w-[820px] table-fixed border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-30 w-20 border border-gray-200 bg-gray-100 px-1.5 py-1 text-left text-[9px] font-semibold uppercase text-gray-600">
                Machine
              </th>

              {hours.map((hour) => (
                <th
                  key={hour}
                  className="sticky top-0 z-20 h-6 w-8 border border-gray-200 bg-gray-100 text-[9px] font-semibold text-gray-600"
                >
                  {hour}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {machines.map((machine) => (
              <tr key={machine} className="transition hover:bg-blue-50/40">
                <td className="sticky left-0 z-10 whitespace-nowrap border border-gray-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold">
                  {machine}
                </td>
                {hours.map((hour) => {
                  const value = getLoss(machine, hour);

                  return (
                    <td
                      key={hour}
                      title={`${machine}\nHour : ${hour}:00\nLoss : ${value} min`}
                      className={`h-6 w-8 cursor-pointer border border-gray-200 text-center text-[9px] font-semibold transition-all duration-150 hover:z-10 hover:scale-110 ${getColor(
                        value
                      )}`}
                    >
                      {value || "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Legend */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-gray-100 bg-gray-50/70 px-3 py-1.5">
        <div className="flex flex-wrap gap-2.5 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 border border-gray-300 bg-gray-50" />
            <span>No Loss</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 bg-green-300" />
            <span>Low</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 bg-yellow-300" />
            <span>Medium</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 bg-orange-400" />
            <span>High</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 bg-red-500" />
            <span>Critical</span>
          </div>
        </div>

        <span className="whitespace-nowrap text-[9px] font-semibold text-blue-600">
          Hourly Downtime Analysis
        </span>
      </div>
    </div>
  );
};

export default MachineHeatMap;