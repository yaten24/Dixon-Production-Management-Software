import React, { useMemo } from "react";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import { FaTools } from "react-icons/fa";
import { FaArrowTrendUp, FaCircleExclamation } from "react-icons/fa6";

const COLORS = [
  "#2563EB", "#16A34A", "#F59E0B", "#DC2626", "#8B5CF6", "#EC4899",
  "#06B6D4", "#14B8A6", "#F97316", "#84CC16", "#6366F1", "#E11D48",
  "#0EA5E9", "#A855F7", "#22C55E", "#EAB308", "#F43F5E", "#0891B2", "#64748B",
];

const CustomTooltip = ({ active, payload, totalLoss }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const share = totalLoss ? ((item.lossMinutes / totalLoss) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-[200px] rounded border border-gray-200 bg-white p-2.5 shadow-2xl">
      <h3 className="mb-1.5 border-b border-gray-100 pb-1 text-[11px] font-bold text-gray-800">
        {item.reason}
      </h3>

      <div className="space-y-1 text-[10px]">
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

const renderValueLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 12;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      fontSize={9}
      fontWeight={700}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {value}m
    </text>
  );
};

const CHART_HEIGHT = 190;

const ReasonWisePieChart = ({ data }) => {
  // `data` comes from the backend already zero-filled with EVERY active
  // reason - we never drop reasons here, we just sort them for display.
  const merged = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.lossMinutes - a.lossMinutes);
  }, [data]);

  const colorMap = useMemo(() => {
    if (!data) return {};
    const alphabetical = [...data].sort((a, b) => a.reason.localeCompare(b.reason));
    return alphabetical.reduce((acc, item, i) => {
      acc[item.reason] = COLORS[i % COLORS.length];
      return acc;
    }, {});
  }, [data]);

  const totalLoss = useMemo(
    () => merged.reduce((sum, item) => sum + item.lossMinutes, 0),
    [merged]
  );

  const pieSlices = useMemo(() => merged.filter((item) => item.lossMinutes > 0), [merged]);
  const highestReason = merged[0];
  const hasData = totalLoss > 0;

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 shadow-sm">
            <FaTools className="text-[10px] text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
              Reason Wise Loss Time
            </h2>
            <p className="text-[9px] text-gray-500">Downtime distribution by reason</p>
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
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-y border-gray-100 bg-gray-50/70">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <FaCircleExclamation className="shrink-0 text-[10px] text-red-400" />
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-gray-500">Top Reason</p>
            <h3 className="truncate text-[10px] font-bold text-gray-800">
              {hasData ? highestReason?.reason || "-" : "-"}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <FaArrowTrendUp className="shrink-0 text-[10px] text-red-500" />
          <div>
            <p className="text-[8px] uppercase tracking-wide text-gray-500">Peak Value</p>
            <h3 className="text-[10px] font-bold text-red-600">
              {hasData ? highestReason?.lossMinutes || 0 : 0} min
            </h3>
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="border-b border-amber-100 bg-amber-50 px-3 py-1.5 text-[9px] font-medium text-amber-700">
          No loss data recorded for this date — showing 0 for all reasons.
        </div>
      )}

      {/* Chart + Scrollable Legend - always lists every active reason */}
      <div className="flex flex-col gap-1.5 p-2 sm:flex-row">
        <div className="mx-auto w-full sm:mx-0 sm:w-[220px] sm:shrink-0">
          <div style={{ width: "100%", height: CHART_HEIGHT }}>
            {pieSlices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieSlices}
                    dataKey="lossMinutes"
                    nameKey="reason"
                    innerRadius={40}
                    outerRadius={62}
                    paddingAngle={2}
                    animationDuration={800}
                    label={renderValueLabel}
                    labelLine={false}
                  >
                    {pieSlices.map((entry) => (
                      <Cell key={entry.reason} fill={colorMap[entry.reason]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip totalLoss={totalLoss} />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded border border-dashed border-gray-200 text-center text-[10px] text-gray-400">
                No loss recorded
                <br />
                for this date
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: CHART_HEIGHT }}>
          <ul className="space-y-0.5">
            {merged.map((item) => {
              const share = totalLoss ? ((item.lossMinutes / totalLoss) * 100).toFixed(1) : 0;
              return (
                <li
                  key={item.reason}
                  className="flex items-center justify-between gap-1.5 rounded px-1 py-0.5 text-[9px] hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-1">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: colorMap[item.reason] }}
                    />
                    <span className="truncate text-gray-700" title={item.reason}>
                      {item.reason}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`font-semibold ${item.lossMinutes ? "text-gray-800" : "text-gray-400"}`}>
                      {item.lossMinutes}m
                    </span>
                    <span className="w-7 text-right text-gray-400">{share}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-3 py-1.5">
        <span className="text-[9px] text-gray-500">{merged.length} reasons tracked</span>

        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span className="text-[9px] text-gray-600">Loss Time (Minutes)</span>
        </div>
      </div>
    </div>
  );
};

export default ReasonWisePieChart;