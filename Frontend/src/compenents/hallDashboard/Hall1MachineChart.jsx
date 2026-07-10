import React, { useMemo, useState } from "react";
import { FaIndustry } from "react-icons/fa";

const ROW_HEIGHT = 52; // per-machine row (name + 3 bars) in px — reduced from 76
const MAX_VISIBLE_ROWS = 5;
const HEADER_SPACE = 6;

const BAR_CONFIG = [
  {
    key: "target",
    label: "Target",
    bar: "bg-blue-600",
    text: "text-blue-700",
    chip: "bg-blue-50",
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
    return { text: "text-slate-400", bg: "bg-slate-100" };
  if (oee >= 85) return { text: "text-emerald-700", bg: "bg-emerald-100" };
  if (oee >= 60) return { text: "text-amber-700", bg: "bg-amber-100" };
  return { text: "text-red-700", bg: "bg-red-100" };
};

// data: [{ machine, target, actual, rejection, achievement, oee? }]
// machines: [{ machine_code, machine_name }] — same list Hall1Stats ke dropdown mein use hoti hai
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
    <div className="w-full rounded border border-slate-200 bg-white p-1.5 shadow-sm">
      {/* Header — extra compact */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5 rounded border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-slate-50 px-2 py-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-600 shadow-sm">
            <FaIndustry className="text-[10px] text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-bold tracking-wide text-slate-800">
              Machine Performance
            </h2>
            <p className="hidden truncate text-[9px] text-slate-500 sm:block">
              Target • Actual • Rejection • OEE
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-blue-700">
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

      {/* Legend — tighter */}
      {!loading && enrichedData.length > 0 && (
        <div className="mb-1 flex flex-wrap items-center justify-end gap-2 px-1">
          {BAR_CONFIG.map((cfg) => (
            <div key={cfg.key} className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded ${cfg.bar}`} />
              <span className="text-[8px] font-semibold text-slate-500">
                {cfg.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded bg-purple-600" />
            <span className="text-[8px] font-semibold text-slate-500">OEE</span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="rounded border border-slate-200 p-1">
        {loading && !enrichedData.length ? (
          <div className="flex h-[130px] items-center justify-center text-xs text-slate-400">
            Loading...
          </div>
        ) : !enrichedData.length ? (
          <div className="flex h-[130px] items-center justify-center text-xs text-slate-400">
            No data for this range.
          </div>
        ) : (
          <div
            className={`hall1-machine-scroll ${isScrollable ? "overflow-y-auto pr-1" : ""}`}
            style={{ maxHeight: visibleHeight }}
          >
            <div className="divide-y divide-slate-100">
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
                    className={`relative rounded px-1 py-1 transition-colors ${isHovered ? "bg-slate-50" : ""}`}
                    style={{ minHeight: ROW_HEIGHT }}
                  >
                    {/* Row header: full machine name + achievement + OEE badge */}
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p
                        className="min-w-0 truncate text-[10px] font-semibold text-slate-700"
                        title={row.machineName}
                      >
                        {row.machineName}
                      </p>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="text-[8px] font-medium text-slate-400">
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

                    {/* 3 grouped horizontal bars — thinner, tighter gap */}
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
                            <span className="w-8 shrink-0 text-[7px] font-semibold uppercase text-slate-400">
                              {cfg.label}
                            </span>
                            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded bg-slate-100">
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

                    {/* Hover detail strip */}
                    {isHovered && row.oee && (
                      <p className="mt-0.5 text-[7px] text-slate-400">
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
          scrollbar-color: #CBD5E1 transparent;
        }
        .hall1-machine-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .hall1-machine-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .hall1-machine-scroll::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 999px;
        }
        .hall1-machine-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
      `}</style>
    </div>
  );
};

export default Hall1MachineChart;
