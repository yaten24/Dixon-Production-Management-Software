import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FaTools } from "react-icons/fa";
import { FaArrowTrendUp, FaCircleExclamation } from "react-icons/fa6";

const COLORS = [
  "#0F1D24", "#FDC94D", "#6B8894", "#DC2626", "#9BB4BE", "#B4884A",
  "#3A5561", "#C6C6C6", "#0F1D24", "#FDC94D", "#6B8894", "#DC2626",
  "#9BB4BE", "#B4884A", "#3A5561", "#C6C6C6", "#0F1D24", "#FDC94D", "#9B9B9B",
];

const CustomTooltip = ({ active, payload, totalLoss }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const share = totalLoss ? ((item.lossMinutes / totalLoss) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-[180px] rounded border border-[#C6C6C6]/60 bg-white p-2 shadow-xl">
      <h3 className="mb-1 border-b border-[#C6C6C6]/40 pb-1 text-[10px] font-bold text-[#0F1D24]">
        {item.reason}
      </h3>
      <div className="space-y-0.5 text-[9px]">
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Loss Time</span>
          <span className="font-bold text-red-600">{item.lossMinutes} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Share</span>
          <span className="font-semibold text-[#0F1D24]">{share}%</span>
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
    <text x={x} y={y} fill="#0F1D24" fontSize={9} fontWeight={700} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {value}m
    </text>
  );
};

const CHART_HEIGHT = 170;

const ReasonWisePieChart = ({ data }) => {
  const merged = useMemo(() => (!data ? [] : [...data].sort((a, b) => b.lossMinutes - a.lossMinutes)), [data]);

  const colorMap = useMemo(() => {
    if (!data) return {};
    const alphabetical = [...data].sort((a, b) => a.reason.localeCompare(b.reason));
    return alphabetical.reduce((acc, item, i) => {
      acc[item.reason] = COLORS[i % COLORS.length];
      return acc;
    }, {});
  }, [data]);

  const totalLoss = useMemo(() => merged.reduce((s, i) => s + i.lossMinutes, 0), [merged]);
  const pieSlices = useMemo(() => merged.filter((i) => i.lossMinutes > 0), [merged]);
  const highestReason = merged[0];
  const hasData = totalLoss > 0;

  return (
    <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaTools className="text-[10px] text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Reason Wise Loss Time
            </h2>
            <p className="text-[9px] text-[#9B9B9B]">Downtime distribution by reason</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-medium uppercase tracking-wide text-[#9B9B9B]">Total Loss</p>
          <h2 className="text-sm font-extrabold text-red-600">
            {totalLoss}
            <span className="ml-0.5 text-[9px] font-semibold text-[#9B9B9B]">min</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[#C6C6C6]/40 border-y border-[#C6C6C6]/40 bg-[#F5F5F5]/70">
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <FaCircleExclamation className="shrink-0 text-[10px] text-red-400" />
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Top Reason</p>
            <h3 className="truncate text-[10px] font-bold text-[#0F1D24]">{hasData ? highestReason?.reason || "-" : "-"}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <FaArrowTrendUp className="shrink-0 text-[10px] text-red-500" />
          <div>
            <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Peak Value</p>
            <h3 className="text-[10px] font-bold text-red-600">{hasData ? highestReason?.lossMinutes || 0 : 0} min</h3>
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="border-b border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-medium text-amber-700">
          No loss data recorded for this date — showing 0 for all reasons.
        </div>
      )}

      <div className="flex flex-col gap-1.5 p-1.5 sm:flex-row">
        <div className="mx-auto w-full sm:mx-0 sm:w-[200px] sm:shrink-0">
          <div style={{ width: "100%", height: CHART_HEIGHT }}>
            {pieSlices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieSlices} dataKey="lossMinutes" nameKey="reason" innerRadius={36} outerRadius={56} paddingAngle={2} animationDuration={800} label={renderValueLabel} labelLine={false}>
                    {pieSlices.map((entry) => (
                      <Cell key={entry.reason} fill={colorMap[entry.reason]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip totalLoss={totalLoss} />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded border border-dashed border-[#C6C6C6] text-center text-[10px] text-[#9B9B9B]">
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
                <li key={item.reason} className="flex items-center justify-between gap-1.5 rounded px-1 py-0.5 text-[9px] hover:bg-[#F5F5F5]">
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: colorMap[item.reason] }} />
                    <span className="truncate text-[#0F1D24]" title={item.reason}>{item.reason}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`font-semibold ${item.lossMinutes ? "text-[#0F1D24]" : "text-[#9B9B9B]"}`}>{item.lossMinutes}m</span>
                    <span className="w-7 text-right text-[#9B9B9B]">{share}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
        <span className="text-[9px] text-[#9B9B9B]">{merged.length} reasons tracked</span>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#0F1D24]" />
          <span className="text-[9px] text-[#9B9B9B]">Loss Time (Minutes)</span>
        </div>
      </div>
    </div>
  );
};

export default ReasonWisePieChart;