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

// Sample hourly data — shown automatically when no real data is passed in,
// so the chart never looks empty during design/preview.
const DEMO_DATA = [
  { hour: "06:00", qty: 4 },
  { hour: "07:00", qty: 7 },
  { hour: "08:00", qty: 12 },
  { hour: "09:00", qty: 9 },
  { hour: "10:00", qty: 15 },
  { hour: "11:00", qty: 11 },
  { hour: "12:00", qty: 6 },
  { hour: "13:00", qty: 8 },
  { hour: "14:00", qty: 14 },
  { hour: "15:00", qty: 18 },
  { hour: "16:00", qty: 13 },
  { hour: "17:00", qty: 10 },
  { hour: "18:00", qty: 5 },
  { hour: "19:00", qty: 3 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { hour, qty } = payload[0].payload;
  return (
    <div className="rounded border border-slate-200 bg-white px-2.5 py-1.5 shadow-md">
      <p className="text-[11px] font-semibold text-slate-700">{hour}</p>
      <p className="text-xs font-bold text-red-600">{qty} Qty</p>
    </div>
  );
};

const RejectionTrendChart = ({ data = [] }) => {
  const isDemo = data.length === 0;
  const chartData = isDemo ? DEMO_DATA : data;

  const totalRejectQty = useMemo(
    () => chartData.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    [chartData],
  );

  const avgRejectQty =
    chartData.length > 0 ? Math.round(totalRejectQty / chartData.length) : 0;

  const highestHour = useMemo(
    () =>
      chartData.length > 0
        ? [...chartData].sort((a, b) => b.qty - a.qty)[0]
        : null,
    [chartData],
  );

  return (
    <div className="rounded border border-slate-200 bg-white p-1 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
            <FaChartLine className="text-[11px] text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-semibold text-slate-800">
                Rejection Trend Analysis
              </h2>
              {isDemo && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                  Demo Data
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Hourly rejection quantity trend
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-sm font-bold leading-none text-red-600">
              {totalRejectQty}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Avg / Hour
            </p>
            <p className="text-sm font-bold leading-none text-slate-800">
              {avgRejectQty}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Peak Hour
            </p>
            <p className="text-[11px] font-semibold leading-none text-slate-800">
              {highestHour?.hour || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center gap-1.5 text-slate-400">
          <FaChartLine className="text-lg opacity-40" />
          <p className="text-xs">No trend data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={chartData}
            margin={{ top: 24, right: 12, left: -12, bottom: 4 }}
          >
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              width={28}
            />

            <Tooltip
              cursor={{ stroke: "#dc2626", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={<CustomTooltip />}
            />

            <Area
              type="monotone"
              dataKey="qty"
              stroke="#dc2626"
              strokeWidth={2}
              fill="url(#trendFill)"
              dot={{ r: 2.5, fill: "#dc2626", strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive
              animationBegin={100}
              animationDuration={1400}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey="qty"
                position="top"
                fontSize={10}
                fontWeight={600}
                fill="#dc2626"
                offset={8}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RejectionTrendChart;