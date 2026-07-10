import React, { useMemo } from "react";
import { FaChartLine, FaClock } from "react-icons/fa";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!(active && payload?.length)) return null;
  const row = payload[0].payload;

  return (
    <div className="min-w-[140px] max-w-[180px] rounded border border-slate-200 bg-white p-2 shadow-xl">
      <h4 className="mb-1 border-b border-slate-100 pb-1 text-[11px] font-bold text-slate-800">
        {label}
      </h4>
      <div className="space-y-1 text-[10px]">
        <div className="flex items-center justify-between rounded bg-blue-50 px-1.5 py-0.5">
          <span className="font-medium text-slate-600">Target</span>
          <span className="rounded bg-blue-600 px-1.5 py-0.5 font-bold text-white">
            {row.target.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between rounded bg-green-50 px-1.5 py-0.5">
          <span className="font-medium text-slate-600">Actual</span>
          <span className="rounded bg-green-600 px-1.5 py-0.5 font-bold text-white">
            {row.actual.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between rounded bg-orange-50 px-1.5 py-0.5">
          <span className="font-medium text-slate-600">Achievement</span>
          <span className="rounded bg-orange-500 px-1.5 py-0.5 font-bold text-white">
            {row.achievement}%
          </span>
        </div>
      </div>
    </div>
  );
};

// data: [{ hour, target, actual, achievement }]
const Hall1TrendChart = ({ hallCode, data = [], date, loading }) => {
  const { totalTarget, totalActual, overallAchievement } = useMemo(() => {
    const t = data.reduce((sum, item) => sum + (item.target || 0), 0);
    const a = data.reduce((sum, item) => sum + (item.actual || 0), 0);
    return {
      totalTarget: t,
      totalActual: a,
      overallAchievement: t ? ((a / t) * 100).toFixed(1) : "0.0",
    };
  }, [data]);

  const slotCount = data.length;
  const isCrowded = slotCount > 8;
  const barSize = isCrowded ? 9 : slotCount > 5 ? 12 : 16;
  const tickFontSize = isCrowded ? 8 : 9;
  const labelFontSize = isCrowded ? 7 : 8;

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-1.5 shadow-sm">
      {/* Header — extra compact */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5 rounded border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-slate-50 px-2 py-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-orange-500 shadow-sm">
            <FaChartLine className="text-[10px] text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-bold tracking-wide text-slate-800">
              Hourly Production Trend
            </h2>
            <p className="hidden items-center gap-1 truncate text-[9px] text-slate-500 sm:flex">
              <FaClock className="shrink-0 text-[8px] text-orange-500" />
              Target vs Actual — {date}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-blue-700">
              Hall-{hallCode}
            </span>
          </div>
          <div className="rounded border border-orange-200 bg-orange-100 px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-orange-700">Hourly</span>
          </div>
        </div>
      </div>

      {/* Chart — reduced height further */}
      <div className="rounded-md border border-slate-200 p-1">
        {loading && !data.length ? (
          <div className="flex h-[130px] items-center justify-center text-xs text-slate-400 sm:h-[150px] lg:h-[170px]">
            Loading...
          </div>
        ) : !data.length ? (
          <div className="flex h-[130px] items-center justify-center text-xs text-slate-400 sm:h-[150px] lg:h-[170px]">
            No entries for this date.
          </div>
        ) : (
          <div className="h-[130px] sm:h-[150px] lg:h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 14, right: 10, left: -8, bottom: 0 }}
              >
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  height={16}
                  tickMargin={2}
                  tick={{
                    fontSize: tickFontSize,
                    fontWeight: 600,
                    fill: "#475569",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  width={32}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                  }
                  tick={{ fontSize: tickFontSize, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  width={26}
                  domain={[0, 120]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: tickFontSize, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#F1F5F9" }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={5}
                  height={14}
                  wrapperStyle={{ fontSize: 8, fontWeight: 600 }}
                />

                <Bar
                  yAxisId="left"
                  dataKey="target"
                  name="Target"
                  fill="#2563EB"
                  radius={[2, 2, 0, 0]}
                  barSize={barSize}
                >
                  {!isCrowded && (
                    <LabelList
                      dataKey="target"
                      position="top"
                      content={({ x, y, width, value }) => (
                        <text
                          x={x + width / 2}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize={labelFontSize}
                          fontWeight="700"
                          fill="#1D4ED8"
                        >
                          {value.toLocaleString()}
                        </text>
                      )}
                    />
                  )}
                </Bar>
                <Bar
                  yAxisId="left"
                  dataKey="actual"
                  name="Actual"
                  fill="#16A34A"
                  radius={[2, 2, 0, 0]}
                  barSize={barSize}
                >
                  {!isCrowded && (
                    <LabelList
                      dataKey="actual"
                      position="top"
                      content={({ x, y, width, value }) => (
                        <text
                          x={x + width / 2}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize={labelFontSize}
                          fontWeight="700"
                          fill="#15803D"
                        >
                          {value.toLocaleString()}
                        </text>
                      )}
                    />
                  )}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary cards — thinner, single-line */}
      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        <div className="rounded border border-blue-100 bg-blue-50 px-1.5 py-1">
          <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-slate-500">
            Target
          </p>
          <h3 className="mt-0.5 truncate text-xs font-bold text-blue-700 sm:text-sm">
            {totalTarget.toLocaleString()}
          </h3>
        </div>
        <div className="rounded border border-green-100 bg-green-50 px-1.5 py-1">
          <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-slate-500">
            Actual
          </p>
          <h3 className="mt-0.5 truncate text-xs font-bold text-green-700 sm:text-sm">
            {totalActual.toLocaleString()}
          </h3>
        </div>
        <div className="rounded border border-orange-100 bg-orange-50 px-1.5 py-1">
          <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-slate-500">
            Achievement
          </p>
          <h3 className="mt-0.5 truncate text-xs font-bold text-orange-700 sm:text-sm">
            {overallAchievement}%
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Hall1TrendChart;
