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
    <div className="min-w-[140px] max-w-[180px] rounded border border-[#C6C6C6]/60 bg-white p-2 shadow-xl">
      <h4 className="mb-1 border-b border-[#C6C6C6]/40 pb-1 text-[11px] font-bold text-[#0F1D24]">
        {label}
      </h4>
      <div className="space-y-1 text-[10px]">
        <div className="flex items-center justify-between rounded bg-[#0F1D24]/5 px-1.5 py-0.5">
          <span className="font-medium text-[#9B9B9B]">Target</span>
          <span className="rounded bg-[#0F1D24] px-1.5 py-0.5 font-bold text-[#FDC94D]">
            {row.target.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between rounded bg-green-50 px-1.5 py-0.5">
          <span className="font-medium text-[#9B9B9B]">Actual</span>
          <span className="rounded bg-green-600 px-1.5 py-0.5 font-bold text-white">
            {row.actual.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between rounded bg-[#FDC94D]/20 px-1.5 py-0.5">
          <span className="font-medium text-[#9B9B9B]">Achievement</span>
          <span className="rounded bg-[#FDC94D] px-1.5 py-0.5 font-bold text-[#0F1D24]">
            {row.achievement}%
          </span>
        </div>
      </div>
    </div>
  );
};

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
    <div className="w-full rounded border border-[#C6C6C6]/50 bg-white p-1 shadow-sm">
      {/* Header */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5 rounded border border-[#FDC94D]/40 bg-gradient-to-r from-[#FDC94D]/10 via-white to-[#F5F5F5] px-2 py-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaChartLine className="text-[10px] text-[#FDC94D]" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-bold tracking-wide text-[#0F1D24]">
              Hourly Production Trend
            </h2>
            <p className="hidden items-center gap-1 truncate text-[9px] text-[#9B9B9B] sm:flex">
              <FaClock className="shrink-0 text-[8px] text-[#9B9B9B]" />
              Target vs Actual — {date}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="p-1">
            <span className="text-[9px] font-bold text-[#0F1D24]">
              {hallCode}
            </span>
          </div>
          <div className="p-1">
            <span className="text-[9px] font-bold text-[#0F1D24]">Hourly</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded border border-[#C6C6C6]/50 p-1">
        {loading && !data.length ? (
          <div className="flex h-[130px] items-center justify-center text-xs text-[#9B9B9B] sm:h-[150px] lg:h-[170px]">
            Loading...
          </div>
        ) : !data.length ? (
          <div className="flex h-[130px] items-center justify-center text-xs text-[#9B9B9B] sm:h-[150px] lg:h-[170px]">
            No entries for this date.
          </div>
        ) : (
          <div className="h-[130px] sm:h-[150px] lg:h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 14, right: 10, left: -8, bottom: 0 }}
              >
                <CartesianGrid stroke="#E4E4E4" strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  height={16}
                  tickMargin={2}
                  tick={{
                    fontSize: tickFontSize,
                    fontWeight: 600,
                    fill: "#0F1D24",
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
                  tick={{ fontSize: tickFontSize, fill: "#9B9B9B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  width={26}
                  domain={[0, 120]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: tickFontSize, fill: "#9B9B9B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#F5F5F5" }}
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
                  fill="#0F1D24"
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
                          fill="#0F1D24"
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

      {/* Summary cards */}
      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        <div className="rounded border border-[#0F1D24]/15 bg-[#0F1D24]/5 px-1.5 py-1">
          <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
            Target
          </p>
          <h3 className="mt-0.5 truncate text-xs font-bold text-[#0F1D24] sm:text-sm">
            {totalTarget.toLocaleString()}
          </h3>
        </div>
        <div className="rounded border border-green-100 bg-green-50 px-1.5 py-1">
          <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
            Actual
          </p>
          <h3 className="mt-0.5 truncate text-xs font-bold text-green-700 sm:text-sm">
            {totalActual.toLocaleString()}
          </h3>
        </div>
        <div className="rounded border border-[#FDC94D]/40 bg-[#FDC94D]/15 px-1.5 py-1">
          <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
            Achievement
          </p>
          <h3 className="mt-0.5 truncate text-xs font-bold text-[#0F1D24] sm:text-sm">
            {overallAchievement}%
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Hall1TrendChart;