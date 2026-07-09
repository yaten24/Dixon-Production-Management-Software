import React, { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
  ReferenceLine,
} from "recharts";

import { FaIndustry, FaArrowTrendUp } from "react-icons/fa6";

const COLORS = ["#2563EB", "#0EA5E9", "#06B6D4", "#14B8A6", "#6366F1", "#8B5CF6"];

const CustomTooltip = ({ active, payload, totalLoss }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const share = totalLoss ? ((data.lossMinutes / totalLoss) * 100).toFixed(1) : 0;

  return (
    <div className="min-w-[140px] rounded border border-gray-200 bg-white p-2 shadow-xl">
      <h3 className="mb-1.5 border-b pb-1 text-[11px] font-semibold text-gray-800">
        {data.hall}
      </h3>

      <div className="space-y-1 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Loss Time</span>
          <span className="font-bold text-red-600">{data.lossMinutes} min</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Share of Total</span>
          <span className="font-semibold text-gray-700">{share}%</span>
        </div>
      </div>
    </div>
  );
};

const HallWiseLossChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const totalLoss = useMemo(
    () => data.reduce((sum, item) => sum + item.lossMinutes, 0),
    [data]
  );

  const avgLoss = useMemo(
    () => (data.length ? totalLoss / data.length : 0),
    [data, totalLoss]
  );

  const highestHall = useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => b.lossMinutes - a.lossMinutes)[0];
  }, [data]);

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 shadow-sm">
            <FaIndustry className="text-[10px] text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
              Hall Wise Loss Time
            </h2>
            <p className="text-[9px] text-gray-500">
              Downtime comparison across halls
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-medium uppercase tracking-wide text-gray-500">
            Total Loss
          </p>
          <h2 className="text-sm font-extrabold text-red-600">
            {totalLoss}
            <span className="ml-0.5 text-[9px] font-semibold text-gray-400">min</span>
          </h2>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100 bg-gray-50/70">
        <div className="px-2.5 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-gray-500">Highest Hall</p>
          <h3 className="mt-0.5 truncate text-[10px] font-bold text-gray-800">
            {highestHall?.hall || "-"}
          </h3>
        </div>

        <div className="px-2.5 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-gray-500">Avg / Hall</p>
          <h3 className="mt-0.5 text-[10px] font-bold text-gray-800">
            {avgLoss.toFixed(0)} min
          </h3>
        </div>

        <div className="px-2.5 py-1.5">
          <div className="flex items-center gap-1">
            <FaArrowTrendUp className="text-[9px] text-red-500" />
            <p className="text-[8px] uppercase tracking-wide text-gray-500">Peak</p>
          </div>
          <h3 className="mt-0.5 text-[10px] font-bold text-red-600">
            {highestHall?.lossMinutes || 0} min
          </h3>
        </div>
      </div>

      {/* Chart */}
      <div className="p-2">
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart
            data={data}
            margin={{ top: 16, right: 10, left: 0, bottom: 0 }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

            <XAxis
              dataKey="hall"
              tick={{ fontSize: 9, fontWeight: 600, fill: "#475569" }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fontSize: 9, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              width={24}
            />

            <ReferenceLine
              y={avgLoss}
              stroke="#94A3B8"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Avg ${avgLoss.toFixed(0)}m`,
                position: "insideTopRight",
                fontSize: 8,
                fill: "#94A3B8",
                fontWeight: 600,
              }}
            />

            <Tooltip
              content={<CustomTooltip totalLoss={totalLoss} />}
              cursor={{ fill: "rgba(37,99,235,0.05)" }}
            />

            <Bar
              dataKey="lossMinutes"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
              animationDuration={800}
              animationEasing="ease-out"
              onMouseEnter={(_, i) => setActiveIndex(i)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.hall}
                  fill={COLORS[index % COLORS.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                  style={{ transition: "opacity 0.2s ease" }}
                />
              ))}

              <LabelList
                dataKey="lossMinutes"
                position="top"
                offset={4}
                fontSize={9}
                fontWeight="700"
                fill="#374151"
                formatter={(value) => `${value}m`}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-3 py-1.5">
        <p className="text-[9px] text-gray-500">Production Hall Comparison</p>

        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span className="text-[9px] text-gray-600">Loss Time (Minutes)</span>
        </div>
      </div>
    </div>
  );
};

export default HallWiseLossChart;