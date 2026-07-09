import React from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

import {
  FaChartBar,
  FaIndustry,
  FaTrophy,
  FaClock,
  FaGaugeHigh,
} from "react-icons/fa6";

/* ---------- design tokens (gray theme) ----------
  base       #F3F4F6  page / outer bg (gray-100)
  panel      #FFFFFF  card / panel surface
  hairline   #E2E4E9  borders / grid
  amber      #F59E0B  mould-heat accent (changes)
  blue       #2563EB  data / time accent
  red        #EF4444  overload alert
  ink        #1F2430  primary text
  ink-dim    #6B7280  secondary text
-------------------------------------------------- */

const fmtTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Small reusable heading with a colored left-bar highlight
const SectionHeading = ({ icon, label, color = "#F59E0B", right }) => (
  <div className="flex items-center justify-between mb-1.5">
    <div
      className="flex items-center gap-1.5 pl-1.5 border-l-[3px]"
      style={{ borderColor: color }}
    >
      <span style={{ color }} className="text-lg">
        {icon}
      </span>
      <h3>{label}</h3>
    </div>
    {right}
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 shadow-lg p-2 rounded-sm">
        <h4 className="text-gray-800 font-bold tracking-wide text-xs uppercase">
          {data.hall}
        </h4>
        <div className="mt-1 space-y-0.5">
          <p className="text-[#B4740A] font-semibold text-xs font-mono">
            {data.changes} changes
          </p>
          <p className="text-[#2563EB] font-semibold text-xs font-mono">
            {fmtTime(data.timeMinutes)} total
          </p>
          <p className="text-gray-500 text-[10px] font-mono">
            avg {fmtTime(data.timeMinutes / data.changes)} / change
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const HallWiseChart = ({
  hallChartData = [
    { hall: "Hall A", changes: 42, timeMinutes: 1260 },
    { hall: "Hall B", changes: 35, timeMinutes: 980 },
    { hall: "Hall C", changes: 28, timeMinutes: 840 },
    { hall: "Hall D", changes: 50, timeMinutes: 1500 },
    { hall: "C-8", changes: 31, timeMinutes: 1100 },
  ],
}) => {
  const totalChanges = hallChartData.reduce((s, i) => s + i.changes, 0);
  const totalTimeMinutes = hallChartData.reduce((s, i) => s + i.timeMinutes, 0);

  const byChanges = [...hallChartData].sort((a, b) => b.changes - a.changes);
  const byTime = [...hallChartData].sort(
    (a, b) => b.timeMinutes - a.timeMinutes,
  );

  const topHall = byChanges[0] || null;
  const slowestHall = byTime[0] || null;
  const avgChangeTime = totalChanges > 0 ? totalTimeMinutes / totalChanges : 0;

  const maxTime = Math.max(...hallChartData.map((h) => h.timeMinutes), 1);

  const byAvg = [...hallChartData]
    .map((h) => ({
      ...h,
      avg: h.changes > 0 ? h.timeMinutes / h.changes : 0,
    }))
    .sort((a, b) => a.avg - b.avg);

  const overallAvg = avgChangeTime;

  const avgColor = (avg) => {
    if (avg <= overallAvg * 0.9) return "#10B981";
    if (avg <= overallAvg * 1.1) return "#F59E0B";
    return "#EF4444";
  };

  const chartData = hallChartData.map((d) => ({
    ...d,
    timeHours: +(d.timeMinutes / 60).toFixed(2),
  }));

  return (
    <div className="bg-gray-100 border border-gray-200 shadow-xl p-1 rounded w-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-1 mb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border border-gray-200 flex items-center justify-center rounded-sm shadow-sm">
              <FaIndustry className="text-[#F59E0B] text-sm" />
            </div>
            <div>
              <h2
                style={{ fontFamily: "'Sora', sans-serif" }}
                className="text-[15px] font-bold text-gray-800 uppercase tracking-wide leading-tight"
              >
                Hall Wise Analysis
              </h2>
              <p className="text-[10px] text-gray-500 tracking-wide leading-tight">
                Mould Change Performance &amp; Downtime Overview
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-sm">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-1 mb-1">
        <div className="flex items-center justify-between bg-white border border-gray-200 px-2 py-1 rounded-sm shadow-sm">
          <p className="text-lg uppercase tracking-wider text-gray-500 leading-none">
            Total Changes
          </p>
          <h3 className="text-lg font-bold text-[#B4740A] font-mono leading-none">
            {totalChanges}
          </h3>
        </div>

        <div className="flex items-center justify-between bg-white border border-gray-200 px-2 py-1 rounded-sm shadow-sm">
          <p className="text-lg uppercase tracking-wider text-gray-500 leading-none">
            Total Time
          </p>
          <h3 className="text-lg font-bold text-[#2563EB] font-mono leading-none">
            {fmtTime(totalTimeMinutes)}
          </h3>
        </div>

        <div className="flex items-center justify-between bg-white border border-gray-200 px-2 py-1 rounded-sm shadow-sm">
          <p className="text-lg uppercase tracking-wider text-gray-500 leading-none">
            Avg / Change
          </p>
          <h3 className="text-lg font-bold text-gray-800 font-mono leading-none">
            {fmtTime(avgChangeTime)}
          </h3>
        </div>

        <div className="flex items-center justify-between bg-white border border-gray-200 px-2 py-1 rounded-sm shadow-sm">
          <div className="flex items-center gap-1">
            <FaTrophy className="text-[#F59E0B] text-[8px] shrink-0" />
            <p className="text-lg uppercase tracking-wider text-gray-500 leading-none">
              Most Active
            </p>
          </div>
          <h3 className="text-lg font-bold text-gray-800 font-mono leading-none">
            {topHall?.hall || "-"}
          </h3>
        </div>

        {/* <div className="flex items-center justify-between bg-white border border-gray-200 px-2 py-1 rounded-sm shadow-sm">
          <div className="flex items-center gap-1">
            <FaClock className="text-[#EF4444] text-[8px] shrink-0" />
            <p className="text-lg uppercase tracking-wider text-gray-500 leading-none">
              Downtime
            </p>
          </div>
          <h3 className="text-lg font-bold text-gray-800 font-mono leading-none">
            {slowestHall?.hall || "-"}
          </h3>
        </div> */}
      </div>

      {/* Chart (left) + Average details (right) */}
      <div className="grid grid-cols-2 gap-1 mb-1">
        {/* LEFT: Chart */}
        <div className="border border-gray-200 bg-white p-1.5 rounded shadow-sm">
          <SectionHeading
            icon={<FaChartBar />}
            label="Changes vs. Time"
            color="#F59E0B"
            right={
              <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#F59E0B] inline-block rounded-[1px]" />
                  Changes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-0.5 bg-[#2563EB] inline-block" />
                  Hours
                </span>
              </div>
            }
          />

          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                barCategoryGap="12%"
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
                  tick={{ fontSize: 9, fill: "#6B7280", fontWeight: 600 }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: "#9CA3AF" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: "#9CA3AF" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#F3F4F6" }}
                />

                <Bar
                  yAxisId="left"
                  dataKey="changes"
                  radius={[3, 3, 0, 0]}
                  barSize={36}
                  animationDuration={900}
                >
                  <LabelList
                    dataKey="changes"
                    position="top"
                    style={{ fill: "#1F2430", fontWeight: 700, fontSize: 10 }}
                  />
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.hall === "C-8" ? "#FBBF24" : "#F59E0B"}
                      fillOpacity={entry.hall === "C-8" ? 1 : 0.9}
                    />
                  ))}
                </Bar>

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="timeHours"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: "#FFFFFF",
                    stroke: "#2563EB",
                    strokeWidth: 2,
                  }}
                  animationDuration={900}
                >
                  <LabelList
                    dataKey="timeHours"
                    position="top"
                    formatter={(v) => `${v}h`}
                    style={{ fill: "#2563EB", fontWeight: 700, fontSize: 9 }}
                    offset={10}
                  />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Average details */}
        <div className="border border-gray-200 bg-white p-1.5 rounded shadow-sm flex flex-col">
          <SectionHeading
            icon={<FaGaugeHigh />}
            label="Average / Change"
            color="#2563EB"
            right={
              <span className="text-[9px] font-mono text-gray-400">
                fleet {fmtTime(overallAvg)}
              </span>
            }
          />

          <div className="flex-1 space-y-1.5 overflow-y-auto">
            {byAvg.map((h, idx) => {
              const color = avgColor(h.avg);
              const pct = Math.max(
                6,
                (h.avg / (byAvg[byAvg.length - 1]?.avg || 1)) * 100,
              );
              return (
                <div
                  key={h.hall}
                  className="border border-gray-100 rounded-sm p-1.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[8px] font-mono font-bold w-3.5 h-3.5 flex items-center justify-center rounded-sm"
                        style={{ color, background: `${color}1A` }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          h.hall === "C-8" ? "text-[#B4740A]" : "text-gray-700"
                        }`}
                      >
                        {h.hall}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold"
                      style={{ color }}
                    >
                      {fmtTime(h.avg)}
                    </span>
                  </div>

                  <div className="relative h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}99, ${color})`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-0.5 text-[8px] font-mono text-gray-400">
                    <span>{h.changes} changes</span>
                    <span>{fmtTime(h.timeMinutes)} total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallWiseChart;
