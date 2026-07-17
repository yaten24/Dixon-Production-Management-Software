import React, { useMemo, useState } from "react";
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
import { FaIndustry } from "react-icons/fa6";

const COLORS = ["#0F1D24", "#3A5561", "#6B8894", "#9BB4BE", "#C6C6C6", "#FDC94D"];

const CustomTooltip = ({ active, payload, totalLoss }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const share = totalLoss ? ((data.lossMinutes / totalLoss) * 100).toFixed(1) : 0;

  return (
    <div className="min-w-[130px] rounded border border-[#C6C6C6]/60 bg-white p-2 shadow-xl">
      <h3 className="mb-1 border-b border-[#C6C6C6]/40 pb-1 text-[10px] font-bold text-[#0F1D24]">
        {data.hall}
      </h3>
      <div className="space-y-0.5 text-[9px]">
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Loss Time</span>
          <span className="font-bold text-red-600">{data.lossMinutes} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Share</span>
          <span className="font-semibold text-[#0F1D24]">{share}%</span>
        </div>
      </div>
    </div>
  );
};

const HallWiseLossChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const totalLoss = useMemo(() => data.reduce((s, i) => s + i.lossMinutes, 0), [data]);
  const avgLoss = useMemo(() => (data.length ? totalLoss / data.length : 0), [data, totalLoss]);
  const highestHall = useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => b.lossMinutes - a.lossMinutes)[0];
  }, [data]);

  return (
    <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaIndustry className="text-[10px] text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Hall Wise Loss Time
            </h2>
            <p className="text-[9px] text-[#9B9B9B]">Downtime comparison across halls</p>
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

      <div className="grid grid-cols-3 divide-x divide-[#C6C6C6]/40 border-y border-[#C6C6C6]/40 bg-[#F5F5F5]/70">
        <div className="px-2 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Highest Hall</p>
          <h3 className="mt-0.5 truncate text-[10px] font-bold text-[#0F1D24]">
            {highestHall?.hall || "-"}
          </h3>
        </div>
        <div className="px-2 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Avg / Hall</p>
          <h3 className="mt-0.5 text-[10px] font-bold text-[#0F1D24]">{avgLoss.toFixed(0)} min</h3>
        </div>
        <div className="px-2 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Peak</p>
          <h3 className="mt-0.5 text-[10px] font-bold text-red-600">{highestHall?.lossMinutes || 0} min</h3>
        </div>
      </div>

      <div className="p-1.5">
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={data} margin={{ top: 16, right: 10, left: 0, bottom: 0 }} onMouseLeave={() => setActiveIndex(null)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
            <XAxis dataKey="hall" tick={{ fontSize: 9, fontWeight: 600, fill: "#0F1D24" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9B9B9B" }} tickLine={false} axisLine={false} width={24} />
            <ReferenceLine y={avgLoss} stroke="#9B9B9B" strokeDasharray="4 4" strokeWidth={1} label={{ value: `Avg ${avgLoss.toFixed(0)}m`, position: "insideTopRight", fontSize: 8, fill: "#9B9B9B", fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip totalLoss={totalLoss} />} cursor={{ fill: "rgba(15,29,36,0.05)" }} />
            <Bar dataKey="lossMinutes" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} animationEasing="ease-out" onMouseEnter={(_, i) => setActiveIndex(i)}>
              {data.map((entry, index) => (
                <Cell key={entry.hall} fill={COLORS[index % COLORS.length]} opacity={activeIndex === null || activeIndex === index ? 1 : 0.45} style={{ transition: "opacity 0.2s ease" }} />
              ))}
              <LabelList dataKey="lossMinutes" position="top" offset={4} fontSize={9} fontWeight="700" fill="#0F1D24" formatter={(v) => `${v}m`} />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
        <p className="text-[9px] text-[#9B9B9B]">Production Hall Comparison</p>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#0F1D24]" />
          <span className="text-[9px] text-[#9B9B9B]">Loss Time (Minutes)</span>
        </div>
      </div>
    </div>
  );
};

export default HallWiseLossChart;