import React from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

import { FaClock, FaIndustry, FaTrophy, FaBolt } from "react-icons/fa6";

/* ---------- design tokens (gray theme, matches HallWiseChart / MachineWiseChart / MachineTable) ----------
  base       #F3F4F6  page / outer bg
  panel      #FFFFFF  card / panel surface
  hairline   #E2E4E9  borders / grid
  blue       #2563EB  primary accent (time)
  amber      #F59E0B  slow / alert accent
  ink        #1F2430  primary text
  ink-dim    #6B7280  secondary text
------------------------------------------------------------------------------------------------------ */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');
`;

const fmtTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{ fontFamily: "'Inter', sans-serif" }}
        className="bg-white border border-gray-200 shadow-lg p-3 rounded-sm"
      >
        <h4
          style={{ fontFamily: "'Oswald', sans-serif" }}
          className="text-gray-800 font-semibold tracking-wide text-sm uppercase"
        >
          {data.hall}
        </h4>
        <p className="text-[#2563EB] font-semibold text-sm font-mono mt-1.5">
          avg {data.avgTime} min
        </p>
        <p className="text-gray-500 text-[11px] font-mono">
          {data.changes} changes &middot; {fmtTime(data.totalTime)} total
        </p>
      </div>
    );
  }
  return null;
};

// Groups raw mouldChangeData into per-hall average change time.
const buildHallAverages = (mouldChangeData) => {
  const grouped = mouldChangeData.reduce((acc, item) => {
    if (!acc[item.hall]) {
      acc[item.hall] = { hall: item.hall, changes: 0, totalTime: 0 };
    }
    acc[item.hall].changes += 1;
    acc[item.hall].totalTime += item.changeDuration || 0;
    return acc;
  }, {});

  return Object.values(grouped)
    .map((h) => ({
      ...h,
      avgTime: h.changes > 0 ? +(h.totalTime / h.changes).toFixed(1) : 0,
    }))
    .sort((a, b) => b.avgTime - a.avgTime);
};

const HallAverageTime = ({ mouldChangeData = [] }) => {
  const demoData = [
    { hall: "Hall-1", changes: 5, totalTime: 150 },
    { hall: "Hall-2", changes: 3, totalTime: 112 },
    { hall: "Hall-3", changes: 3, totalTime: 110 },
    { hall: "Hall-4", changes: 4, totalTime: 146 },
    { hall: "C-8", changes: 5, totalTime: 178 },
  ].map((h) => ({ ...h, avgTime: +(h.totalTime / h.changes).toFixed(1) }));

  const hallData =
    mouldChangeData.length > 0
      ? buildHallAverages(mouldChangeData)
      : [...demoData].sort((a, b) => b.avgTime - a.avgTime);

  const overallAvg =
    hallData.length > 0
      ? (
          hallData.reduce((s, h) => s + h.totalTime, 0) /
          hallData.reduce((s, h) => s + h.changes, 0)
        ).toFixed(1)
      : 0;

  const slowestHall = hallData[0] || null;
  const fastestHall = hallData[hallData.length - 1] || null;

  const barColor = (avgTime) => {
    if (avgTime >= 35) return "#EF4444";
    if (avgTime >= 25) return "#F59E0B";
    return "#2563EB";
  };

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="bg-gray-100 border border-gray-200 shadow-xl p-2 mt-2 rounded-sm w-full"
    >
      <style>{FONT_IMPORT}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white border border-gray-200 flex items-center justify-center rounded-sm shadow-sm">
            <FaClock className="text-[#2563EB] text-base" />
          </div>
          <div>
            <h2
              style={{ fontFamily: "'Oswald', sans-serif" }}
              className="text-base font-semibold text-gray-800 uppercase tracking-wide"
            >
              Hall Average Change Time
            </h2>
            <p className="text-[11px] text-gray-500 tracking-wide">
              Average mould change duration, hall by hall
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white border border-gray-200 p-2.5 rounded-sm shadow-sm">
          <p className="text-[9px] uppercase tracking-wider text-gray-500">
            Overall Average
          </p>
          <h3 className="text-lg font-semibold text-[#2563EB] font-mono mt-1">
            {overallAvg} min
          </h3>
        </div>

        <div className="bg-white border border-gray-200 p-2.5 rounded-sm shadow-sm">
          <div className="flex items-center gap-1 mb-1">
            <FaBolt className="text-emerald-500 text-[10px]" />
            <p className="text-[9px] uppercase tracking-wider text-gray-500">
              Fastest Hall
            </p>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 font-mono">
            {fastestHall?.hall || "-"}
            <span className="text-emerald-600 ml-1">
              ({fastestHall?.avgTime ?? 0}m)
            </span>
          </h3>
        </div>

        <div className="bg-white border border-gray-200 p-2.5 rounded-sm shadow-sm">
          <div className="flex items-center gap-1 mb-1">
            <FaTrophy className="text-[#EF4444] text-[10px]" />
            <p className="text-[9px] uppercase tracking-wider text-gray-500">
              Slowest Hall
            </p>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 font-mono">
            {slowestHall?.hall || "-"}
            <span className="text-red-600 ml-1">
              ({slowestHall?.avgTime ?? 0}m)
            </span>
          </h3>
        </div>
      </div>

      {/* Chart */}
      {/* <div className="border border-gray-200 bg-white p-2.5 rounded-sm shadow-sm mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaIndustry className="text-[#2563EB] text-sm" />
            <h3
              style={{ fontFamily: "'Oswald', sans-serif" }}
              className="text-xs font-semibold text-gray-800 uppercase tracking-wide"
            >
              Average Time per Hall
            </h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">minutes</span>
        </div>

        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hallData}
              margin={{ top: 24, right: 10, left: -10, bottom: 5 }}
              barCategoryGap="18%"
            >
              <CartesianGrid
                strokeDasharray="2 2"
                vertical={false}
                stroke="#EEF0F3"
              />
              <XAxis
                dataKey="hall"
                tickLine={false}
                axisLine={{ stroke: "#E2E4E9" }}
                tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />

              <Bar
                dataKey="avgTime"
                radius={[3, 3, 0, 0]}
                barSize={48}
                animationDuration={900}
              >
                <LabelList
                  dataKey="avgTime"
                  position="top"
                  formatter={(v) => `${v}m`}
                  style={{ fill: "#1F2430", fontWeight: 600, fontSize: 11 }}
                />
                {hallData.map((entry, index) => (
                  <Cell key={index} fill={barColor(entry.avgTime)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* Hall list */}
      <div className="border border-gray-200 bg-white p-2.5 rounded-sm shadow-sm">
        <div className="space-y-2">
          {hallData.map((h) => (
            <div
              key={h.hall}
              className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-sm"
            >
              <div className="flex items-center gap-2">
                <FaIndustry className="text-gray-400 text-[11px]" />
                <span className="text-sm font-semibold text-gray-800">
                  {h.hall}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                <span>{h.changes} changes</span>
                <span
                  className="px-2 py-0.5 border rounded-sm font-semibold"
                  style={{
                    color: barColor(h.avgTime),
                    borderColor: `${barColor(h.avgTime)}33`,
                    backgroundColor: `${barColor(h.avgTime)}0D`,
                  }}
                >
                  avg {h.avgTime} min
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HallAverageTime;