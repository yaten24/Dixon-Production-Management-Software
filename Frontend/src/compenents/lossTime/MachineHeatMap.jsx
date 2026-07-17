import React, { useMemo, useState } from "react";
import { FaFire, FaExpand, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const hours = Array.from({ length: 24 }, (_, i) => i);

const getColor = (value) => {
  if (!value) return "bg-[#F5F5F5]";
  if (value <= 10) return "bg-emerald-200";
  if (value <= 20) return "bg-[#FDC94D]/50";
  if (value <= 40) return "bg-orange-400";
  return "bg-red-500 text-white";
};

const HALL_STYLES = {
  "Hall 1": { header: "bg-[#0F1D24]/10 text-[#0F1D24]", accent: "bg-[#0F1D24]" },
  "Hall 2": { header: "bg-[#FDC94D]/20 text-[#0F1D24]", accent: "bg-[#FDC94D]" },
  "Hall 3": { header: "bg-[#6B8894]/20 text-[#0F1D24]", accent: "bg-[#6B8894]" },
  "Hall 4": { header: "bg-[#B4884A]/20 text-[#0F1D24]", accent: "bg-[#B4884A]" },
  C8: { header: "bg-[#9BB4BE]/25 text-[#0F1D24]", accent: "bg-[#9BB4BE]" },
};
const DEFAULT_HALL_STYLE = { header: "bg-[#C6C6C6]/30 text-[#0F1D24]", accent: "bg-[#9B9B9B]" };
const getHallStyle = (hall) => HALL_STYLES[hall] || DEFAULT_HALL_STYLE;

const HeatMapTable = ({ data, machines, hasData, maxHeight }) => {
  const getLoss = (machine, hour) => {
    const record = data.find((item) => item.machine === machine && item.hour === hour);
    return record ? record.lossMinutes : 0;
  };

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
            <th className="sticky left-0 top-0 z-30 w-28 border border-[#C6C6C6]/50 bg-[#F5F5F5] px-1.5 py-1 text-left text-[9px] font-semibold uppercase text-[#9B9B9B]">Machine</th>
            {hours.map((hour) => (
              <th key={hour} className="sticky top-0 z-20 h-6 w-8 border border-[#C6C6C6]/50 bg-[#F5F5F5] text-[9px] font-semibold text-[#9B9B9B]">{hour}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {groups.map(([hall, hallMachines]) => {
            const style = getHallStyle(hall);
            return (
              <React.Fragment key={hall}>
                <tr>
                  <td colSpan={25} className={`sticky left-0 z-20 border border-[#C6C6C6]/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${style.header}`}>
                    {hall} &middot; {hallMachines.length} machines
                  </td>
                </tr>

                {hallMachines.map((m) => {
                  const machineName = m.name;
                  return (
                    <tr key={machineName} className="transition hover:bg-[#F5F5F5]/60">
                      <td className="sticky left-0 z-10 whitespace-nowrap border border-[#C6C6C6]/50 bg-white p-0 text-[9px] font-semibold">
                        <div className="flex items-stretch">
                          <span className={`w-1 shrink-0 ${style.accent}`} />
                          <span className="px-1.5 py-0.5 text-[#0F1D24]">{machineName}</span>
                        </div>
                      </td>
                      {hours.map((hour) => {
                        const value = getLoss(machineName, hour);
                        const showWarningGlyph = !hasData && !value;
                        return (
                          <td
                            key={hour}
                            title={showWarningGlyph ? `${machineName}\nHour : ${hour}:00\nNo data uploaded for this date` : `${machineName}\nHour : ${hour}:00\nLoss : ${value} min`}
                            className={`h-6 w-8 cursor-pointer border border-[#C6C6C6]/50 text-center text-[9px] font-semibold text-[#0F1D24] transition-all duration-150 hover:z-10 hover:scale-110 ${getColor(value)}`}
                          >
                            {showWarningGlyph ? <FaExclamationTriangle className="mx-auto text-[7px] text-amber-500" /> : value || "-"}
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
              <td colSpan={25} className="py-6 text-center text-[10px] text-[#9B9B9B]">No machines found. Check the machine master list.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Legend = ({ hasData }) => (
  <div className="flex flex-wrap gap-2.5 text-[9px] text-[#9B9B9B]">
    <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 border border-[#C6C6C6] bg-[#F5F5F5]" /><span>No Loss</span></div>
    <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 bg-emerald-200" /><span>Low</span></div>
    <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 bg-[#FDC94D]/50" /><span>Medium</span></div>
    <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 bg-orange-400" /><span>High</span></div>
    <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 bg-red-500" /><span>Critical</span></div>
    {!hasData && (
      <div className="flex items-center gap-1"><FaExclamationTriangle className="text-[8px] text-amber-500" /><span>No data uploaded</span></div>
    )}
  </div>
);

const HallLegend = () => (
  <div className="flex flex-wrap gap-2.5 text-[9px] text-[#9B9B9B]">
    {Object.entries(HALL_STYLES).map(([hall, style]) => (
      <div key={hall} className="flex items-center gap-1">
        <div className={`h-2.5 w-2.5 rounded-sm ${style.accent}`} />
        <span>{hall}</span>
      </div>
    ))}
  </div>
);

const MAX_TABLE_HEIGHT = 240;

const MachineHeatMap = ({ data, machines: machinesProp }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const machines = useMemo(() => {
    if (machinesProp && machinesProp.length) {
      return machinesProp.map((m) => (typeof m === "string" ? { name: m, hall: "Other" } : { name: m.machine_name, hall: m.hall || "Other" }));
    }
    return [...new Set(data.map((d) => d.machine))].map((name) => ({ name, hall: "Other" }));
  }, [machinesProp, data]);

  const hasData = useMemo(() => data.some((d) => d.lossMinutes > 0), [data]);

  return (
    <>
      <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500 shadow-sm">
              <FaFire className="text-[10px] text-white" />
            </div>
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">Machine Heat Map</h2>
              <p className="text-[9px] text-[#9B9B9B]">{machines.length} machines · Hourly downtime distribution</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-[#0F1D24]">24 Hours</span>
            <button onClick={() => setIsZoomed(true)} className="flex h-6 items-center gap-1 rounded bg-[#0F1D24] px-2 text-[9px] font-semibold text-[#FDC94D] transition hover:bg-[#0F1D24]/90">
              <FaExpand className="text-[9px]" />
              Zoom
            </button>
          </div>
        </div>

        {!hasData && (
          <div className="flex items-center gap-1.5 border-b border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-medium text-amber-700">
            <FaExclamationTriangle className="shrink-0 text-amber-500" />
            No downtime recorded for this date — showing all {machines.length} machines with 0.
          </div>
        )}

        <HeatMapTable data={data} machines={machines} hasData={hasData} maxHeight={MAX_TABLE_HEIGHT} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
          <Legend hasData={hasData} />
          <HallLegend />
        </div>
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-[#C6C6C6]/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500 shadow-sm">
                <FaFire className="text-sm text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#0F1D24]">Machine Heat Map · Expanded View</h2>
                <p className="text-[10px] text-[#9B9B9B]">{machines.length} machines · Hourly downtime distribution</p>
              </div>
            </div>
            <button onClick={() => setIsZoomed(false)} className="flex h-8 w-8 items-center justify-center rounded text-[#9B9B9B] transition hover:bg-[#F5F5F5]">
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

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-5 py-2">
            <Legend hasData={hasData} />
            <HallLegend />
          </div>
        </div>
      )}
    </>
  );
};

export default MachineHeatMap;