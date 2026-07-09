import React from "react";

import {
  FaClock,
  FaIndustry,
  FaMicrochip,
  FaMedal,
} from "react-icons/fa6";

/* ---------- design tokens (gray theme, matches HallWiseChart / MachineWiseChart) ----------
  base       #F3F4F6  page / outer bg
  panel      #FFFFFF  card / panel surface
  hairline   #E2E4E9  borders / grid
  purple     #7C3AED  primary accent (machines)
  amber      #F59E0B  rank #1
  ink        #1F2430  primary text
  ink-dim    #6B7280  secondary text
-------------------------------------------------------------------------------------- */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');
`;

const MEDAL_COLOR = ["#F59E0B", "#9CA3AF", "#C2793D"]; // gold, silver, bronze

const MachineTable = ({ filteredMachines = [] }) => {
  const demoData = [
    {
      machine: "MC-001",
      machineName: "Injection Machine 01",
      hall: "Hall-1",
      mouldChanges: 12,
      avgChangeTime: 22,
      lastChange: "09:45 AM",
    },
    {
      machine: "MC-002",
      machineName: "Injection Machine 02",
      hall: "Hall-1",
      mouldChanges: 18,
      avgChangeTime: 31,
      lastChange: "10:20 AM",
    },
    {
      machine: "MC-021",
      machineName: "Injection Machine 21",
      hall: "Hall-2",
      mouldChanges: 25,
      avgChangeTime: 28,
      lastChange: "11:15 AM",
    },
    {
      machine: "MC-041",
      machineName: "Injection Machine 41",
      hall: "Hall-3",
      mouldChanges: 9,
      avgChangeTime: 18,
      lastChange: "01:30 PM",
    },
    {
      machine: "MC-061",
      machineName: "Injection Machine 61",
      hall: "Hall-4",
      mouldChanges: 16,
      avgChangeTime: 24,
      lastChange: "03:10 PM",
    },
  ];

  const tableData =
    filteredMachines.length > 0
      ? [...filteredMachines].sort((a, b) => b.mouldChanges - a.mouldChanges).slice(0, 10)
      : demoData.slice(0, 10);

  const getStatus = (mouldChanges) => {
    if (mouldChanges >= 15)
      return {
        label: "High",
        className: "bg-red-50 border-red-200 text-red-600",
      };

    if (mouldChanges >= 8)
      return {
        label: "Medium",
        className: "bg-amber-50 border-amber-200 text-amber-700",
      };

    return {
      label: "Normal",
      className: "bg-emerald-50 border-emerald-200 text-emerald-600",
    };
  };

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="bg-gray-100 border border-gray-200 shadow-xl p-1 rounded w-full"
    >
      <style>{FONT_IMPORT}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-1 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white border border-gray-200 flex items-center justify-center rounded-sm shadow-sm">
            <FaMicrochip className="text-[#7C3AED] text-base" />
          </div>
          <div>
            <h2
              style={{ fontFamily: "'Oswald', sans-serif" }}
              className="text-base font-semibold text-gray-800 uppercase tracking-wide"
            >
              Machine Wise Details
            </h2>
            <p className="text-[11px] text-gray-500 tracking-wide">
              Top 10 machines by mould changes
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-sm shadow-sm">
          <p className="text-[9px] uppercase tracking-wider text-gray-500">
            Showing
          </p>
          <h3 className="text-sm font-semibold text-[#7C3AED] font-mono">
            Top {tableData.length}
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">
                  Rank
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">
                  Machine
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">
                  Hall
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Changes
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Avg Time
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Last Change
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((machine, index) => {
                const status = getStatus(machine.mouldChanges);
                const medal = MEDAL_COLOR[index];

                return (
                  <tr
                    key={machine.machine}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Rank */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {medal ? (
                          <FaMedal
                            style={{ color: medal }}
                            className="text-xs"
                          />
                        ) : (
                          <span className="w-3" />
                        )}
                        <span className="font-mono font-semibold text-xs text-gray-700">
                          #{index + 1}
                        </span>
                      </div>
                    </td>

                    {/* Machine */}
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-sm text-gray-800">
                        {machine.machine}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {machine.machineName}
                      </div>
                    </td>

                    {/* Hall */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <FaIndustry className="text-gray-400 text-[11px]" />
                        <span className="text-sm text-gray-700">
                          {machine.hall}
                        </span>
                      </div>
                    </td>

                    {/* Changes */}
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 bg-purple-50 border border-purple-100 text-[#7C3AED] text-xs font-mono font-semibold rounded-sm">
                        {machine.mouldChanges}
                      </span>
                    </td>

                    {/* Avg Time */}
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-mono text-sm text-gray-700">
                        <FaClock className="text-[#2563EB] text-[11px]" />
                        {machine.avgChangeTime} min
                      </div>
                    </td>

                    {/* Last Change */}
                    <td className="px-3 py-2.5 text-center">
                      <span className="text-sm font-mono text-gray-500">
                        {machine.lastChange}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold border rounded-sm ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MachineTable;