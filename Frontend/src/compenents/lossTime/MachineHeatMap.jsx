import React, { useMemo, useState } from "react";
import { FaFire, FaExpand, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const hours = Array.from({ length: 24 }, (_, i) => i);

const getColor = (value) => {
  if (!value) return "bg-gray-50";
  if (value <= 10) return "bg-green-300";
  if (value <= 20) return "bg-yellow-300";
  if (value <= 40) return "bg-orange-400";
  return "bg-red-500 text-white";
};

// Distinct, visible styling per hall — used for the sticky group header row
// and a thin left accent bar on every machine row belonging to that hall.
const HALL_STYLES = {
  "Hall 1": { header: "bg-blue-100 text-blue-800", accent: "bg-blue-500" },
  "Hall 2": { header: "bg-emerald-100 text-emerald-800", accent: "bg-emerald-500" },
  "Hall 3": { header: "bg-purple-100 text-purple-800", accent: "bg-purple-500" },
  "Hall 4": { header: "bg-amber-100 text-amber-800", accent: "bg-amber-500" },
  C8: { header: "bg-rose-100 text-rose-800", accent: "bg-rose-500" },
};
const DEFAULT_HALL_STYLE = { header: "bg-gray-100 text-gray-800", accent: "bg-gray-400" };
const getHallStyle = (hall) => HALL_STYLES[hall] || DEFAULT_HALL_STYLE;

// `machines` is always the full known machine list, independent of whether
// `data` has any loss rows - this is what guarantees every machine shows up
// even when there's nothing to report for the selected date.
const HeatMapTable = ({ data, machines, hasData, maxHeight }) => {
  const getLoss = (machine, hour) => {
    const record = data.find((item) => item.machine === machine && item.hour === hour);
    return record ? record.lossMinutes : 0;
  };

  // Group machines by hall while preserving incoming order.
  const groups = useMemo(() => {
    const map = new Map();
    machines.forEach((m) => {
      const hall = m.hall || "Other";
      if (!map.has(hall)) map.set(hall, []);
      map.get(hall).push(m);
    });
    return Array.from(map.entries());
  }, [machines]);

  return (
    <div className="overflow-auto" style={{ maxHeight }}>
      <table className="w-full min-w-[860px] table-fixed border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 w-28 border border-gray-200 bg-gray-100 px-1.5 py-1 text-left text-[9px] font-semibold uppercase text-gray-600">
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
          {groups.map(([hall, hallMachines]) => {
            const style = getHallStyle(hall);
            return (
              <React.Fragment key={hall}>
                {/* Sticky, highlighted hall separator row */}
                <tr>
                  <td
                    colSpan={25}
                    className={`sticky left-0 z-20 border border-gray-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${style.header}`}
                  >
                    {hall} &middot; {hallMachines.length} machines
                  </td>
                </tr>

                {hallMachines.map((m) => {
                  const machineName = m.name;
                  return (
                    <tr key={machineName} className="transition hover:bg-blue-50/40">
                      <td className="sticky left-0 z-10 whitespace-nowrap border border-gray-200 bg-white p-0 text-[9px] font-semibold">
                        <div className="flex items-stretch">
                          <span className={`w-1 shrink-0 ${style.accent}`} />
                          <span className="px-1.5 py-0.5">{machineName}</span>
                        </div>
                      </td>
                      {hours.map((hour) => {
                        const value = getLoss(machineName, hour);
                        const showWarningGlyph = !hasData && !value;
                        return (
                          <td
                            key={hour}
                            title={
                              showWarningGlyph
                                ? `${machineName}\nHour : ${hour}:00\nNo data uploaded for this date`
                                : `${machineName}\nHour : ${hour}:00\nLoss : ${value} min`
                            }
                            className={`h-6 w-8 cursor-pointer border border-gray-200 text-center text-[9px] font-semibold transition-all duration-150 hover:z-10 hover:scale-110 ${getColor(
                              value
                            )}`}
                          >
                            {showWarningGlyph ? (
                              <FaExclamationTriangle className="mx-auto text-[7px] text-amber-400" />
                            ) : (
                              value || "-"
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}

          {machines.length === 0 && (
            <tr>
              <td colSpan={25} className="py-6 text-center text-[10px] text-gray-400">
                No machines found. Check the machine master list.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Legend = ({ hasData }) => (
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
    {!hasData && (
      <div className="flex items-center gap-1">
        <FaExclamationTriangle className="text-[8px] text-amber-400" />
        <span>No data uploaded</span>
      </div>
    )}
  </div>
);

const HallLegend = () => (
  <div className="flex flex-wrap gap-2.5 text-[9px]">
    {Object.entries(HALL_STYLES).map(([hall, style]) => (
      <div key={hall} className="flex items-center gap-1">
        <div className={`h-2.5 w-2.5 rounded-sm ${style.accent}`} />
        <span>{hall}</span>
      </div>
    ))}
  </div>
);

const MAX_TABLE_HEIGHT = 260; // vertical scroll kicks in beyond this in the card view

const MachineHeatMap = ({ data, machines: machinesProp }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Normalize machines into { name, hall } objects, preferring the explicit
  // machines list (always complete) - fall back to deriving names from
  // `data` only if no machines list was passed in.
  const machines = useMemo(() => {
    if (machinesProp && machinesProp.length) {
      return machinesProp.map((m) =>
        typeof m === "string"
          ? { name: m, hall: "Other" }
          : { name: m.machine_name, hall: m.hall || "Other" }
      );
    }
    return [...new Set(data.map((d) => d.machine))].map((name) => ({
      name,
      hall: "Other",
    }));
  }, [machinesProp, data]);

  const hasData = useMemo(() => data.some((d) => d.lossMinutes > 0), [data]);

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
                {machines.length} machines · Hourly downtime distribution
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

        {!hasData && (
          <div className="flex items-center gap-1.5 border-b border-amber-100 bg-amber-50 px-3 py-1.5 text-[9px] font-medium text-amber-700">
            <FaExclamationTriangle className="shrink-0 text-amber-500" />
            No downtime recorded for this date — showing all {machines.length} machines with 0.
          </div>
        )}

        <HeatMapTable data={data} machines={machines} hasData={hasData} maxHeight={MAX_TABLE_HEIGHT} />

        {/* Footer / Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/70 px-3 py-1.5">
          <Legend hasData={hasData} />
          <HallLegend />
        </div>
      </div>

      {/* Expanded (zoomed) view — true full page, edge to edge */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 shadow-sm">
                <FaFire className="text-sm text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                  Machine Heat Map · Expanded View
                </h2>
                <p className="text-[10px] text-gray-500">
                  {machines.length} machines · Hourly downtime distribution
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsZoomed(false)}
              className="flex h-8 w-8 items-center justify-center rounded text-gray-500 transition hover:bg-gray-100"
            >
              <FaTimes />
            </button>
          </div>

          {!hasData && (
            <div className="flex items-center gap-1.5 border-b border-amber-100 bg-amber-50 px-5 py-1.5 text-[10px] font-medium text-amber-700">
              <FaExclamationTriangle className="shrink-0 text-amber-500" />
              No downtime recorded for this date — showing all {machines.length} machines with 0.
            </div>
          )}

          <div className="flex-1 overflow-hidden px-5 py-3">
            <HeatMapTable data={data} machines={machines} hasData={hasData} maxHeight="100%" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-2">
            <Legend hasData={hasData} />
            <HallLegend />
          </div>
        </div>
      )}
    </>
  );
};

export default MachineHeatMap;