import React, { useMemo } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell,
} from "recharts";
import { FaCogs } from "react-icons/fa";
import { FaArrowTrendUp, FaCircleExclamation } from "react-icons/fa6";

const COLORS = ["#DC2626", "#EA580C", "#B4884A", "#0F1D24", "#0F1D24", "#0F1D24", "#0F1D24", "#0F1D24", "#0F1D24", "#0F1D24"];
const RANK_BADGE = ["bg-red-500", "bg-orange-500", "bg-[#FDC94D]"];

const CustomTooltip = ({ active, payload, totalLoss }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const share = totalLoss ? ((item.lossMinutes / totalLoss) * 100).toFixed(1) : 0;

  return (
    <div className="min-w-[180px] rounded-lg border border-[#C6C6C6]/60 bg-white p-2.5 shadow-2xl">
      <div className="mb-1.5 flex items-center justify-between border-b border-[#C6C6C6]/40 pb-1.5">
        <h3 className="text-xs font-bold text-[#0F1D24]">{item.machine}</h3>
        <span className="rounded bg-[#0F1D24]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#0F1D24]">{item.hall}</span>
      </div>
      <div className="space-y-1 text-[10px]">
        <div className="flex items-center justify-between"><span className="text-[#9B9B9B]">Loss Time</span><span className="font-bold text-red-600">{item.lossMinutes} min</span></div>
        <div className="flex items-center justify-between"><span className="text-[#9B9B9B]">Events</span><span className="font-semibold text-[#0F1D24]">{item.events}</span></div>
        <div className="flex items-center justify-between"><span className="text-[#9B9B9B]">Production Loss</span><span className="font-semibold text-[#B4884A]">{item.productionLoss}</span></div>
        <div className="mt-1 flex items-center justify-between border-t border-[#C6C6C6]/40 pt-1"><span className="text-[#9B9B9B]">Share</span><span className="font-semibold text-[#0F1D24]">{share}%</span></div>
      </div>
    </div>
  );
};

const ROW_HEIGHT = 30;
const CONTAINER_HEIGHT = 250;

const MachineWiseLossChart = ({ data }) => {
  const top10 = useMemo(() => [...data].sort((a, b) => b.lossMinutes - a.lossMinutes).slice(0, 10), [data]);
  const totalLoss = useMemo(() => top10.reduce((s, i) => s + i.lossMinutes, 0), [top10]);
  const topMachine = top10[0];
  const avgLoss = top10.length ? totalLoss / top10.length : 0;
  const chartHeight = Math.max(CONTAINER_HEIGHT, top10.length * ROW_HEIGHT);
  const isScrollable = chartHeight > CONTAINER_HEIGHT;

  return (
    <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaCogs className="text-xs text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F1D24]">Machine Wise Loss Time</h2>
            <p className="mt-0.5 text-[10px] text-[#9B9B9B]">Top 10 machines with highest downtime</p>
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
          <div className="min-w-0"><p className="text-[9px] uppercase tracking-wide text-[#9B9B9B]">Top Machine</p><h3 className="truncate text-xs font-bold text-[#0F1D24]">{topMachine?.machine || "-"}</h3></div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-2">
          <FaArrowTrendUp className="shrink-0 text-sm text-red-500" />
          <div><p className="text-[9px] uppercase tracking-wide text-[#9B9B9B]">Peak Value</p><h3 className="text-xs font-bold text-red-600">{topMachine?.lossMinutes || 0} min</h3></div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-[#0F1D24]" />
          <div><p className="text-[9px] uppercase tracking-wide text-[#9B9B9B]">Avg / Machine</p><h3 className="text-xs font-bold text-[#0F1D24]">{avgLoss.toFixed(0)} min</h3></div>
        </div>
      </div>

      <div className="overflow-y-auto p-2" style={{ height: CONTAINER_HEIGHT }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart layout="vertical" data={top10} margin={{ top: 10, right: 34, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F5F5F5" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#9B9B9B" }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="machine" width={88} tick={{ fontSize: 10, fontWeight: 600, fill: "#0F1D24" }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip totalLoss={totalLoss} />} cursor={{ fill: "rgba(15,29,36,0.05)" }} />
            <Bar dataKey="lossMinutes" radius={[0, 6, 6, 0]} maxBarSize={16} animationDuration={900} animationEasing="ease-out">
              {top10.map((item, index) => (<Cell key={item.machine} fill={COLORS[index % COLORS.length]} />))}
              <LabelList dataKey="lossMinutes" position="right" offset={6} formatter={(v) => `${v}m`} fontSize={10} fontWeight="700" fill="#0F1D24" />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-3 py-2">
        <div className="flex items-center gap-1.5">
          {top10.slice(0, 3).map((_, i) => (<span key={i} className={`h-1.5 w-1.5 rounded-full ${RANK_BADGE[i]}`} />))}
          <span className="text-[10px] text-[#9B9B9B]">{isScrollable ? "Scroll to view all 10 machines" : "Top 3 highlighted by severity"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#0F1D24]" />
          <span className="text-[10px] text-[#9B9B9B]">Loss Time (Minutes)</span>
        </div>
      </div>
    </div>
  );
};

export default MachineWiseLossChart;