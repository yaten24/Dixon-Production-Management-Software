import React, { useMemo } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell, ReferenceLine,
} from "recharts";
import { FaUsersCog } from "react-icons/fa";
import { FaArrowTrendUp, FaCircleExclamation } from "react-icons/fa6";

const COLORS = ["#0F1D24", "#FDC94D", "#B4884A"];

const CustomTooltip = ({ active, payload, totalLoss }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const share = totalLoss ? ((item.lossMinutes / totalLoss) * 100).toFixed(1) : 0;

  return (
    <div className="min-w-[150px] rounded-lg border border-[#C6C6C6]/60 bg-white p-2.5 shadow-2xl">
      <h3 className="mb-1.5 border-b border-[#C6C6C6]/40 pb-1 text-xs font-bold text-[#0F1D24]">{item.shift}</h3>
      <div className="space-y-1 text-[10px]">
        <div className="flex items-center justify-between"><span className="text-[#9B9B9B]">Loss Time</span><span className="font-bold text-red-600">{item.lossMinutes} min</span></div>
        <div className="flex items-center justify-between"><span className="text-[#9B9B9B]">Share</span><span className="font-semibold text-[#0F1D24]">{share}%</span></div>
      </div>
    </div>
  );
};

const ShiftWiseLossChart = ({ data }) => {
  const totalLoss = useMemo(() => data.reduce((s, i) => s + i.lossMinutes, 0), [data]);
  const avgLoss = useMemo(() => (data.length ? totalLoss / data.length : 0), [data, totalLoss]);
  const highestShift = useMemo(() => (!data.length ? null : [...data].sort((a, b) => b.lossMinutes - a.lossMinutes)[0]), [data]);

  return (
    <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaUsersCog className="text-xs text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F1D24]">Shift Wise Loss Time</h2>
            <p className="mt-0.5 text-[10px] text-[#9B9B9B]">Production downtime by shift</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-medium uppercase tracking-wide text-[#9B9B9B]">Total Loss</p>
          <h2 className="text-lg font-extrabold text-red-600">{totalLoss}<span className="ml-0.5 text-xs font-semibold text-[#9B9B9B]">min</span></h2>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#C6C6C6]/40 border-y border-[#C6C6C6]/40 bg-[#F5F5F5]/70">
        <div className="flex items-center gap-2 px-2.5 py-2">
          <FaCircleExclamation className="shrink-0 text-sm text-red-400" />
          <div className="min-w-0"><p className="text-[9px] uppercase tracking-wide text-[#9B9B9B]">Highest Shift</p><h3 className="truncate text-xs font-bold text-[#0F1D24]">{highestShift?.shift || "-"}</h3></div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-2">
          <FaArrowTrendUp className="shrink-0 text-sm text-red-500" />
          <div><p className="text-[9px] uppercase tracking-wide text-[#9B9B9B]">Peak Value</p><h3 className="text-xs font-bold text-red-600">{highestShift?.lossMinutes || 0} min</h3></div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-[#0F1D24]" />
          <div><p className="text-[9px] uppercase tracking-wide text-[#9B9B9B]">Avg / Shift</p><h3 className="text-xs font-bold text-[#0F1D24]">{avgLoss.toFixed(0)} min</h3></div>
        </div>
      </div>

      <div className="p-2.5">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data} margin={{ top: 20, right: 15, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
            <XAxis dataKey="shift" tick={{ fontSize: 10, fontWeight: 600, fill: "#0F1D24" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9B9B9B" }} tickLine={false} axisLine={false} width={30} />
            <ReferenceLine y={avgLoss} stroke="#9B9B9B" strokeDasharray="4 4" strokeWidth={1} label={{ value: `Avg ${avgLoss.toFixed(0)}m`, position: "insideTopRight", fontSize: 9, fill: "#9B9B9B", fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip totalLoss={totalLoss} />} cursor={{ fill: "rgba(15,29,36,0.05)" }} />
            <Bar dataKey="lossMinutes" radius={[6, 6, 0, 0]} maxBarSize={44} animationDuration={900} animationEasing="ease-out">
              {data.map((entry, index) => (<Cell key={entry.shift} fill={COLORS[index % COLORS.length]} />))}
              <LabelList dataKey="lossMinutes" position="top" offset={6} formatter={(v) => `${v}m`} style={{ fill: "#0F1D24", fontSize: 10, fontWeight: 700 }} />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-3 py-2">
        <span className="text-[10px] text-[#9B9B9B]">Shift-wise Production Downtime Analysis</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-[#0F1D24]" /><span className="text-[10px] text-[#9B9B9B]">Shift A</span></div>
          <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-[#FDC94D]" /><span className="text-[10px] text-[#9B9B9B]">Shift B</span></div>
          <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-[#B4884A]" /><span className="text-[10px] text-[#9B9B9B]">Shift C</span></div>
        </div>
      </div>
    </div>
  );
};

export default ShiftWiseLossChart;