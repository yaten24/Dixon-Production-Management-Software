import React, { useState } from "react";
import { FaFire, FaExpand, FaTimes } from "react-icons/fa";

const hours = Array.from({ length: 24 }, (_, i) => i);

const getColor = (value) => {
  if (!value) return "bg-gray-50";
  if (value <= 10) return "bg-green-300";
  if (value <= 20) return "bg-yellow-300";
  if (value <= 40) return "bg-orange-400";
  return "bg-red-500 text-white";
};

const HeatMapTable = ({ data, maxHeight }) => {
  const machines = [...new Set(data.map((item) => item.machine))];

  const getLoss = (machine, hour) => {
    const record = data.find((item) => item.machine === machine && item.hour === hour);
    return record ? record.lossMinutes : 0;
  };

  return (
    <div className="overflow-auto" style={{ maxHeight }}>
      <table className="w-full min-w-[820px] table-fixed border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 w-24 border border-gray-200 bg-gray-100 px-1.5 py-1 text-left text-[9px] font-semibold uppercase text-gray-600">
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

          {machines.length === 0 && (
            <tr>
              <td colSpan={25} className="py-6 text-center text-[10px] text-gray-400">
                No heat map data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Legend = () => (
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
);

const MAX_TABLE_HEIGHT = 260; // vertical scroll kicks in beyond this in the card view

const MachineHeatMap = ({ data }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
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

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-blue-600">24 Hours</span>
            <button
              onClick={() => setIsZoomed(true)}
              className="flex h-6 items-center gap-1 rounded bg-blue-600 px-2 text-[9px] font-semibold text-white transition hover:bg-blue-700"
            >
              <FaExpand className="text-[9px]" />
              Zoom
            </button>
          </div>
        </div>

        <HeatMapTable data={data} maxHeight={MAX_TABLE_HEIGHT} />

        {/* Footer / Legend */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-gray-100 bg-gray-50/70 px-3 py-1.5">
          <Legend />
          <span className="whitespace-nowrap text-[9px] font-semibold text-blue-600">
            Hourly Downtime Analysis
          </span>
        </div>
      </div>

      {/* Expanded (zoomed) view */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500 shadow-sm">
                  <FaFire className="text-xs text-white" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                  Machine Heat Map · Expanded View
                </h2>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-3">
              <HeatMapTable data={data} maxHeight="70vh" />
            </div>

            <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-2">
              <Legend />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MachineHeatMap;