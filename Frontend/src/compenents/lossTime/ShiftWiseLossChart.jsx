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
  ReferenceLine,
} from "recharts";

import { FaUsersCog } from "react-icons/fa";
import { FaArrowTrendUp, FaCircleExclamation } from "react-icons/fa6";

const COLORS = ["#2563EB", "#16A34A", "#F97316"];
const SHIFT_LABELS = { A: "Shift A", B: "Shift B", C: "Shift C" };

const CustomTooltip = ({ active, payload, totalLoss }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const share = totalLoss ? ((item.lossMinutes / totalLoss) * 100).toFixed(1) : 0;

  return (
    <div className="min-w-[160px] rounded-lg border border-gray-200 bg-white p-3 shadow-2xl">
      <h3 className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-bold text-gray-800">
        {item.shift}
      </h3>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Loss Time</span>
          <span className="font-bold text-red-600">{item.lossMinutes} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Share of Total</span>
          <span className="font-semibold text-gray-700">{share}%</span>
        </div>
      </div>
    </div>
  );
};

const ShiftWiseLossChart = ({ data }) => {
  const totalLoss = useMemo(
    () => data.reduce((sum, item) => sum + item.lossMinutes, 0),
    [data]
  );

  const avgLoss = useMemo(
    () => (data.length ? totalLoss / data.length : 0),
    [data, totalLoss]
  );

  const highestShift = useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => b.lossMinutes - a.lossMinutes)[0];
  }, [data]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
            <FaUsersCog className="text-xs text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-800">
              Shift Wise Loss Time
            </h2>
            <p className="mt-0.5 text-[10px] text-gray-500">
              Production downtime by shift
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
            Total Loss
          </p>
          <h2 className="text-xl font-extrabold text-red-600">
            {totalLoss}
            <span className="ml-0.5 text-xs font-semibold text-gray-400">min</span>
          </h2>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100 bg-gray-50/70">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <FaCircleExclamation className="shrink-0 text-sm text-red-400" />
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wide text-gray-500">Highest Shift</p>
            <h3 className="truncate text-xs font-bold text-gray-800">
              {highestShift?.shift || "-"}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5">
          <FaArrowTrendUp className="shrink-0 text-sm text-red-500" />
          <div>
            <p className="text-[9px] uppercase tracking-wide text-gray-500">Peak Value</p>
            <h3 className="text-xs font-bold text-red-600">
              {highestShift?.lossMinutes || 0} min
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
          <div>
            <p className="text-[9px] uppercase tracking-wide text-gray-500">Avg / Shift</p>
            <h3 className="text-xs font-bold text-gray-800">{avgLoss.toFixed(0)} min</h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-3">
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={data} margin={{ top: 20, right: 15, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

            <XAxis
              dataKey="shift"
              tick={{ fontSize: 10, fontWeight: 600, fill: "#475569" }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              width={30}
            />

            <ReferenceLine
              y={avgLoss}
              stroke="#94A3B8"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Avg ${avgLoss.toFixed(0)}m`,
                position: "insideTopRight",
                fontSize: 9,
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
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={entry.shift} fill={COLORS[index % COLORS.length]} />
              ))}

              <LabelList
                dataKey="lossMinutes"
                position="top"
                offset={6}
                formatter={(value) => `${value}m`}
                style={{ fill: "#111827", fontSize: 10, fontWeight: 700 }}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-4 py-2.5">
        <span className="text-[10px] text-gray-500">
          Shift-wise Production Downtime Analysis
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
            <span className="text-[10px] text-gray-600">Shift A</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[10px] text-gray-600">Shift B</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
            <span className="text-[10px] text-gray-600">Shift C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftWiseLossChart;