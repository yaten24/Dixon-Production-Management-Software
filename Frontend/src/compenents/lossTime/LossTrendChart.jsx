import React, { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";
import { FaChartLine } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="min-w-[150px] rounded border border-[#C6C6C6]/60 bg-white p-2.5 shadow-xl">
      <h3 className="mb-1.5 border-b border-[#C6C6C6]/40 pb-1 text-xs font-semibold text-[#0F1D24]">{item.date}</h3>
      <div className="flex justify-between text-[11px]">
        <span className="text-[#9B9B9B]">Loss Time</span>
        <span className="font-bold text-red-600">{item.lossMinutes} min</span>
      </div>
    </div>
  );
};

const LossTrendChart = ({ data }) => {
  const totalLoss = useMemo(() => data.reduce((s, i) => s + i.lossMinutes, 0), [data]);
  const peakDay = useMemo(() => (!data.length ? null : [...data].sort((a, b) => b.lossMinutes - a.lossMinutes)[0]), [data]);

  return (
    <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#C6C6C6]/50 px-3 py-2">
        <div>
          <div className="flex items-center gap-1.5">
            <FaChartLine className="text-[#0F1D24]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F1D24]">Daily Loss Trend</h2>
          </div>
          <p className="mt-0.5 text-[10px] text-[#9B9B9B]">Daily production downtime analysis</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase text-[#9B9B9B]">Total Loss</p>
          <h2 className="text-lg font-bold text-red-600">{totalLoss} min</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-[#C6C6C6]/40">
        <div className="p-2.5">
          <p className="text-[9px] uppercase text-[#9B9B9B]">Peak Loss Day</p>
          <h3 className="mt-0.5 text-sm font-bold text-[#0F1D24]">{peakDay?.date}</h3>
        </div>
        <div className="border-l border-[#C6C6C6]/40 p-2.5">
          <div className="flex items-center justify-end gap-1.5">
            <FaArrowTrendUp className="text-red-500" />
            <span className="text-base font-bold text-red-600">{peakDay?.lossMinutes}</span>
          </div>
          <p className="text-right text-[10px] text-[#9B9B9B]">Minutes</p>
        </div>
      </div>

      <div className="p-2.5">
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="lossTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F1D24" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0F1D24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 600, fill: "#0F1D24" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9B9B9B" }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="lossMinutes"
              stroke="#0F1D24"
              strokeWidth={2.5}
              fill="url(#lossTrend)"
              animationDuration={1200}
              animationEasing="ease-out"
              activeDot={{ r: 6, stroke: "#0F1D24", strokeWidth: 2, fill: "#FDC94D" }}
              dot={{ r: 3.5, fill: "#0F1D24", stroke: "#fff", strokeWidth: 2 }}
            >
              <LabelList dataKey="lossMinutes" position="top" offset={10} formatter={(v) => `${v}m`} style={{ fill: "#0F1D24", fontSize: 10, fontWeight: 700 }} />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-3 py-2">
        <span className="text-[10px] text-[#9B9B9B]">Daily Production Loss Analysis</span>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#0F1D24]" />
          <span className="text-[10px] text-[#9B9B9B]">Loss Time (Minutes)</span>
        </div>
      </div>
    </div>
  );
};

export default LossTrendChart;