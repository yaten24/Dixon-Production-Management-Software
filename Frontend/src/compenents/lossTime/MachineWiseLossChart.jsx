import React, { useMemo } from "react";

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
} from "recharts";

import { FaCogs } from "react-icons/fa";
import { FaArrowTrendUp, FaCircleExclamation } from "react-icons/fa6";

const COLORS = ["#DC2626", "#EA580C", "#D97706", "#2563EB", "#2563EB", "#2563EB", "#2563EB", "#2563EB", "#2563EB", "#2563EB"];

const RANK_BADGE = ["bg-red-500", "bg-orange-500", "bg-amber-500"];

const CustomTooltip = ({ active, payload, totalLoss }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const share = totalLoss ? ((item.lossMinutes / totalLoss) * 100).toFixed(1) : 0;

  return (
    <div className="min-w-[200px] rounded-lg border border-gray-200 bg-white p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
        <h3 className="text-xs font-bold text-gray-800">{item.machine}</h3>
        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">
          {item.hall}
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Loss Time</span>
          <span className="font-bold text-red-600">{item.lossMinutes} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Events</span>
          <span className="font-semibold text-gray-700">{item.events}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Production Loss</span>
          <span className="font-semibold text-orange-600">{item.productionLoss}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-gray-100 pt-1.5">
          <span className="text-gray-500">Share of Total</span>
          <span className="font-semibold text-gray-700">{share}%</span>
        </div>
      </div>
    </div>
  );
};

const ROW_HEIGHT = 34;
const CONTAINER_HEIGHT = 300;

const MachineWiseLossChart = ({ data }) => {
  const top10 = useMemo(() => {
    return [...data].sort((a, b) => b.lossMinutes - a.lossMinutes).slice(0, 10);
  }, [data]);

  const totalLoss = useMemo(
    () => top10.reduce((sum, item) => sum + item.lossMinutes, 0),
    [top10]
  );

  const topMachine = top10[0];
  const avgLoss = top10.length ? totalLoss / top10.length : 0;

  const chartHeight = Math.max(CONTAINER_HEIGHT, top10.length * ROW_HEIGHT);
  const isScrollable = chartHeight > CONTAINER_HEIGHT;

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
            <FaCogs className="text-xs text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-800">
              Machine Wise Loss Time
            </h2>
            <p className="mt-0.5 text-[10px] text-gray-500">
              Top 10 machines with highest downtime
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
            Total Loss
          </p>
          <h2 className="text-xl font-extrabold text-red-600">{totalLoss}<span className="ml-0.5 text-xs font-semibold text-gray-400">min</span></h2>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100 bg-gray-50/70">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <FaCircleExclamation className="shrink-0 text-sm text-red-400" />
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wide text-gray-500">Top Machine</p>
            <h3 className="truncate text-xs font-bold text-gray-800">
              {topMachine?.machine || "-"}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5">
          <FaArrowTrendUp className="shrink-0 text-sm text-red-500" />
          <div>
            <p className="text-[9px] uppercase tracking-wide text-gray-500">Peak Value</p>
            <h3 className="text-xs font-bold text-red-600">
              {topMachine?.lossMinutes || 0} min
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
          <div>
            <p className="text-[9px] uppercase tracking-wide text-gray-500">Avg / Machine</p>
            <h3 className="text-xs font-bold text-gray-800">{avgLoss.toFixed(0)} min</h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-y-auto p-3" style={{ height: CONTAINER_HEIGHT }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart
            layout="vertical"
            data={top10}
            margin={{ top: 10, right: 34, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />

            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              type="category"
              dataKey="machine"
              width={92}
              tick={{ fontSize: 10, fontWeight: 600, fill: "#374151" }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={<CustomTooltip totalLoss={totalLoss} />}
              cursor={{ fill: "rgba(37,99,235,0.05)" }}
            />

            <Bar
              dataKey="lossMinutes"
              radius={[0, 6, 6, 0]}
              maxBarSize={18}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {top10.map((item, index) => (
                <Cell key={item.machine} fill={COLORS[index % COLORS.length]} />
              ))}

              <LabelList
                dataKey="lossMinutes"
                position="right"
                offset={6}
                formatter={(value) => `${value}m`}
                fontSize={10}
                fontWeight="700"
                fill="#111827"
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          {top10.slice(0, 3).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${RANK_BADGE[i]}`}
            />
          ))}
          <span className="text-[10px] text-gray-500">
            {isScrollable ? "Scroll to view all 10 machines" : "Top 3 highlighted by severity"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
          <span className="text-[10px] text-gray-600">Loss Time (Minutes)</span>
        </div>
      </div>
    </div>
  );
};

export default MachineWiseLossChart;