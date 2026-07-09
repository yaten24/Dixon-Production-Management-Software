import React, { useMemo } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

import { FaChartLine } from "react-icons/fa";

import { FaArrowTrendUp } from "react-icons/fa6";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="bg-white border border-gray-200 shadow-xl rounded-md p-4 min-w-[190px]">
      <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
        {item.date}
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Loss Time</span>

          <span className="font-bold text-blue-600">
            {item.lossMinutes} min
          </span>
        </div>
      </div>
    </div>
  );
};

const LossTrendChart = ({ data }) => {
  const totalLoss = useMemo(() => {
    return data.reduce((sum, item) => sum + item.lossMinutes, 0);
  }, [data]);

  const peakDay = useMemo(() => {
    if (!data.length) return null;

    return [...data].sort((a, b) => b.lossMinutes - a.lossMinutes)[0];
  }, [data]);

  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-blue-600 shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <FaChartLine className="text-blue-600" />

            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700">
              Daily Loss Trend
            </h2>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Daily production downtime analysis
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-500">Total Loss</p>

          <h2 className="text-2xl font-bold text-red-600">{totalLoss} min</h2>
        </div>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 border-b border-gray-200">
        <div className="p-4">
          <p className="text-[11px] uppercase text-gray-500">Peak Loss Day</p>

          <h3 className="font-bold text-base mt-1">{peakDay?.date}</h3>
        </div>

        <div className="border-l border-gray-200 p-4">
          <div className="flex justify-end items-center gap-2">
            <FaArrowTrendUp className="text-red-500" />

            <span className="text-xl font-bold text-red-600">
              {peakDay?.lossMinutes}
            </span>
          </div>

          <p className="text-right text-xs text-gray-500">Minutes</p>
        </div>
      </div>

      {/* Chart */}

      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{
              top: 15,
              right: 15,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="lossTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />

                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{
                fontSize: 11,
                fontWeight: 600,
              }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="lossMinutes"
              stroke="#2563EB"
              strokeWidth={3}
              fill="url(#lossTrend)"
              animationDuration={1200}
              animationEasing="ease-out"
              activeDot={{
                r: 7,
                stroke: "#2563EB",
                strokeWidth: 2,
                fill: "#ffffff",
              }}
              dot={{
                r: 4,
                fill: "#2563EB",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            >
              <LabelList
                dataKey="lossMinutes"
                position="top"
                offset={12}
                formatter={(value) => `${value}m`}
                style={{
                  fill: "#111827",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3">
        <span className="text-xs text-gray-500">
          Daily Production Loss Analysis
        </span>

        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-600"></div>

          <span className="text-xs text-gray-600">Loss Time (Minutes)</span>
        </div>
      </div>
    </div>
  );
};

export default LossTrendChart;
