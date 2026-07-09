import React from "react";

import {
  FaExchangeAlt,
  FaClock,
  FaIndustry,
  FaCalendarAlt,
} from "react-icons/fa";

/* ---------- design tokens (gray theme, matches HallWiseChart / MachineWiseChart / MachineTable) ----------
  base       #F3F4F6  page / outer bg
  panel      #FFFFFF  card / panel surface
  hairline   #E2E4E9  borders / grid
  blue       #2563EB  primary accent (recent activity)
  ink        #1F2430  primary text
  ink-dim    #6B7280  secondary text
------------------------------------------------------------------------------------------------- */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');
`;

const RecentMouldChanges = ({ mouldChangeData = [] }) => {
  const demoData = [
    {
      machine: "MC-001",
      hall: "Hall-1",
      oldMould: "M-101",
      newMould: "M-105",
      changeDate: "2026-06-24",
      changeTime: "09:45 AM",
      changeDuration: 22,
      operator: "Rahul",
    },
    {
      machine: "MC-021",
      hall: "Hall-2",
      oldMould: "M-205",
      newMould: "M-210",
      changeDate: "2026-06-24",
      changeTime: "09:10 AM",
      changeDuration: 18,
      operator: "Amit",
    },
    {
      machine: "MC-041",
      hall: "Hall-3",
      oldMould: "M-310",
      newMould: "M-320",
      changeDate: "2026-06-24",
      changeTime: "08:35 AM",
      changeDuration: 27,
      operator: "Sandeep",
    },
    {
      machine: "MC-061",
      hall: "Hall-4",
      oldMould: "M-410",
      newMould: "M-420",
      changeDate: "2026-06-24",
      changeTime: "08:00 AM",
      changeDuration: 15,
      operator: "Vikas",
    },
  ];

  const tableData =
    mouldChangeData.length > 0
      ? [...mouldChangeData]
          .sort((a, b) => new Date(b.changeDate) - new Date(a.changeDate))
          .slice(0, 10)
      : demoData;

  const durationStyle = (mins) => {
    if (mins >= 35) return "bg-red-50 border-red-200 text-red-600";
    if (mins >= 20) return "bg-amber-50 border-amber-200 text-amber-700";
    return "bg-emerald-50 border-emerald-200 text-emerald-600";
  };

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="bg-gray-100 border border-gray-200 shadow-xl p-1 mt-1 rounded-sm w-full"
    >
      <style>{FONT_IMPORT}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white border border-gray-200 flex items-center justify-center rounded-sm shadow-sm">
            <FaExchangeAlt className="text-[#2563EB] text-base" />
          </div>
          <div>
            <h2
              style={{ fontFamily: "'Oswald', sans-serif" }}
              className="text-base font-semibold text-gray-800 uppercase tracking-wide"
            >
              Recent Mould Changes
            </h2>
            <p className="text-[11px] text-gray-500 tracking-wide">
              Latest {tableData.length} mould change activities
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-sm shadow-sm">
          <p className="text-[9px] uppercase tracking-wider text-gray-500">
            Activities
          </p>
          <h3 className="text-sm font-semibold text-[#2563EB] font-mono">
            {tableData.length}
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">
                  #
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">
                  Machine
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">
                  Mould Change
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">
                  Operator
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Date
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Time
                </th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Duration
                </th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Index */}
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-xs text-gray-400">
                      {index + 1}
                    </span>
                  </td>

                  {/* Machine / Hall */}
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-sm text-gray-800">
                      {item.machine}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <FaIndustry className="text-gray-400 text-[10px]" />
                      {item.hall}
                    </div>
                  </td>

                  {/* Mould change */}
                  <td className="px-3 py-2.5">
                    <div className="text-sm font-mono">
                      <span className="text-gray-500">{item.oldMould}</span>
                      <span className="mx-1.5 text-gray-300">→</span>
                      <span className="font-semibold text-[#2563EB]">
                        {item.newMould}
                      </span>
                    </div>
                  </td>

                  {/* Operator */}
                  <td className="px-3 py-2.5">
                    <span className="text-sm text-gray-700">
                      {item.operator}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-gray-500">
                      <FaCalendarAlt className="text-gray-400 text-[10px]" />
                      {item.changeDate}
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-mono text-sm text-gray-700">
                      <FaClock className="text-[#2563EB] text-[11px]" />
                      {item.changeTime}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-mono font-semibold border rounded-sm ${durationStyle(
                        item.changeDuration,
                      )}`}
                    >
                      {item.changeDuration} min
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentMouldChanges;
