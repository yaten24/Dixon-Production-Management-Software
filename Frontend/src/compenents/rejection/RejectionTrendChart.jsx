import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { FaChartBar } from "react-icons/fa";

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
  const chartData = data;
  const isEmpty = chartData.length === 0;

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
    <div className="flex h-full min-h-0 flex-col rounded border border-slate-200 bg-white p-1.5 shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-1.5 border-b border-slate-100 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
            <FaChartBar className="text-[10px] text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-semibold text-slate-800">
              Hourly Rejection Trend
            </h2>
            <p className="text-[9px] text-slate-500">
              {isEmpty ? "No data for selected date" : "Real-time hourly qty"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-xs font-bold leading-none text-red-600">
              {totalRejectQty}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Avg / Hr
            </p>
            <p className="text-xs font-bold leading-none text-slate-800">
              {avgRejectQty}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Peak Hour
            </p>
            <p className="text-[10px] font-semibold leading-none text-slate-800">
              {highestHour?.hour || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="min-h-0 flex-1">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
            <FaChartBar className="text-base opacity-40" />
            <p className="text-[11px] font-medium">
              No rejection data recorded for this date
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 18, right: 8, left: -18, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="hour"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                width={24}
                allowDecimals={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(220,38,38,0.06)" }}
                content={<CustomTooltip />}
              />

              <Bar dataKey="qty" name="Reject Qty" radius={[4, 4, 0, 0]} maxBarSize={28}>
                <LabelList
                  dataKey="qty"
                  position="top"
                  fontSize={9}
                  fontWeight={600}
                  fill="#dc2626"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RejectionTrendChart;