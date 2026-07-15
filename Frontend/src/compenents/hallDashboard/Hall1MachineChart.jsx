import React, { useMemo, useState } from "react";
import { FaIndustry } from "react-icons/fa";

const ROW_HEIGHT = 52;
const MAX_VISIBLE_ROWS = 5;
const HEADER_SPACE = 6;

const BAR_CONFIG = [
  {
    key: "target",
    label: "Target",
    bar: "bg-[#0F1D24]",
    text: "text-[#0F1D24]",
    chip: "bg-[#0F1D24]/10",
  },
  {
    key: "actual",
    label: "Actual",
    bar: "bg-green-600",
    text: "text-green-700",
    chip: "bg-green-50",
  },
  {
    key: "rejection",
    label: "Reject",
    bar: "bg-red-500",
    text: "text-red-700",
    chip: "bg-red-50",
  },
];

const oeeTier = (oee) => {
  if (oee === undefined || oee === null)
    return { text: "text-[#9B9B9B]", bg: "bg-[#C6C6C6]/30" };
  if (oee >= 85) return { text: "text-emerald-700", bg: "bg-emerald-100" };
  if (oee >= 60) return { text: "text-amber-700", bg: "bg-amber-100" };
  return { text: "text-red-700", bg: "bg-red-100" };
};

const Hall1MachineChart = ({ hallCode, data = [], machines = [], loading }) => {
  const [hovered, setHovered] = useState(null);

  const nameByCode = useMemo(() => {
    const map = {};
    machines.forEach((m) => {
      map[m.machine_code] = m.machine_name || m.machine_code;
    });
    return map;
  }, [machines]);

  const enrichedData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        machineName: nameByCode[row.machine] || row.machine,
      })),
    [data, nameByCode],
  );

  const maxValue = useMemo(() => {
    let max = 0;
    enrichedData.forEach((row) => {
      max = Math.max(max, row.target || 0, row.actual || 0, row.rejection || 0);
    });
    return max || 1;
  }, [enrichedData]);

  const machineCount = enrichedData.length;
  const isScrollable = machineCount > MAX_VISIBLE_ROWS;
  const visibleHeight = Math.max(
    ROW_HEIGHT + HEADER_SPACE,
    Math.min(machineCount, MAX_VISIBLE_ROWS) * ROW_HEIGHT + HEADER_SPACE,
  );

  const formatVal = (v) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString();

  return (
    <div className="w-full rounded border border-[#C6C6C6]/50 bg-white p-1 shadow-sm">
      {/* Header */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1 rounded border border-[#0F1D24]/15 bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2 py-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaIndustry className="text-[10px] text-[#FDC94D]" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-bold tracking-wide text-[#0F1D24]">
              Machine Performance
            </h2>
            <p className="hidden truncate text-[9px] text-[#9B9B9B] sm:block">
              Target • Actual • Rejection • OEE
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="rounded border border-[#0F1D24]/15 bg-[#0F1D24]/10 px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-[#0F1D24]">
              Hall-{hallCode}
            </span>
          </div>
          <div className="rounded border border-emerald-200 bg-emerald-100 px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-emerald-700">
              ● Live
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      {!loading && enrichedData.length > 0 && (
        <div className="mb-1 flex flex-wrap items-center justify-end gap-2 px-1">
          {BAR_CONFIG.map((cfg) => (
            <div key={cfg.key} className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded ${cfg.bar}`} />
              <span className="text-[8px] font-semibold text-[#9B9B9B]">
                {cfg.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded bg-[#FDC94D]" />
            <span className="text-[8px] font-semibold text-[#9B9B9B]">OEE</span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="rounded border border-[#C6C6C6]/50 p-1">
        {loading && !enrichedData.length ? (
          <div className="flex h-[130px] items-center justify-center text-xs text-[#9B9B9B]">
            Loading...
          </div>
        ) : !enrichedData.length ? (
          <div className="flex h-[130px] items-center justify-center text-xs text-[#9B9B9B]">
            No data for this range.
          </div>
        ) : (
          <div
            className={`hall1-machine-scroll ${isScrollable ? "overflow-y-auto pr-1" : ""}`}
            style={{ maxHeight: visibleHeight }}
          >
            <div className="divide-y divide-[#C6C6C6]/30">
              {enrichedData.map((row) => {
                const tier = oeeTier(row.oee?.oee);
                const isHovered = hovered === row.machine;

                return (
                  <div
                    key={row.machine}
                    onMouseEnter={() => setHovered(row.machine)}
                    onMouseLeave={() =>
                      setHovered((h) => (h === row.machine ? null : h))
                    }
                    className={`relative rounded px-1 py-1 transition-colors ${isHovered ? "bg-[#F5F5F5]" : ""}`}
                    style={{ minHeight: ROW_HEIGHT }}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p
                        className="min-w-0 truncate text-[10px] font-semibold text-[#0F1D24]"
                        title={row.machineName}
                      >
                        {row.machineName}
                      </p>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="text-[8px] font-medium text-[#9B9B9B]">
                          Ach. {row.achievement}%
                        </span>
                        {row.oee && (
                          <span
                            className={`rounded px-1 py-[1px] text-[8px] font-bold ${tier.bg} ${tier.text}`}
                          >
                            OEE {row.oee.oee}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      {BAR_CONFIG.map((cfg) => {
                        const value = row[cfg.key] || 0;
                        const pct = Math.max(
                          2,
                          Math.min(100, (value / maxValue) * 100),
                        );
                        return (
                          <div
                            key={cfg.key}
                            className="flex items-center gap-1.5"
                          >
                            <span className="w-8 shrink-0 text-[7px] font-semibold uppercase text-[#9B9B9B]">
                              {cfg.label}
                            </span>
                            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded bg-[#C6C6C6]/30">
                              <div
                                className={`h-full rounded ${cfg.bar} transition-all duration-500 ease-out`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span
                              className={`w-9 shrink-0 text-right text-[8px] font-bold ${cfg.text}`}
                            >
                              {formatVal(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {isHovered && row.oee && (
                      <p className="mt-0.5 text-[7px] text-[#9B9B9B]">
                        A {row.oee.availability}% · P {row.oee.performance}% · Q{" "}
                        {row.oee.quality}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hall1-machine-scroll {
          scrollbar-width: thin;
          scrollbar-color: #C6C6C6 transparent;
        }
        .hall1-machine-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .hall1-machine-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .hall1-machine-scroll::-webkit-scrollbar-thumb {
          background-color: #C6C6C6;
          border-radius: 999px;
        }
        .hall1-machine-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #9B9B9B;
        }
      `}</style>
    </div>
  );
};

export default Hall1MachineChart;