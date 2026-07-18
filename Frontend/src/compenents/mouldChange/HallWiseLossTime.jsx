import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Layers } from "lucide-react";

const HallWiseLossTime = ({ hallWiseLoss = [], totalLoss = 0, highestHall = "-", avgPerHall = 0, peakHallLoss = 0 }) => {
  return (
    <div className="rounded-sm border border-[#C6C6C6] bg-white">
      <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#0F1D24] text-white"><Layers size={14} /></span>
          <div>
            <p className="text-sm font-semibold text-[#0F1D24]">Hall Wise Loss Time</p>
            <p className="text-xs text-[#9B9B9B]">Downtime comparison across halls</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-[#9B9B9B]">TOTAL LOSS</p>
          <p className="text-sm font-bold text-red-500">{totalLoss} min</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#E2E4E9] border-b border-[#C6C6C6] text-xs">
        <div className="px-3 py-2"><p className="text-[10px] font-medium text-[#9B9B9B]">HIGHEST HALL</p><p className="font-semibold text-[#0F1D24]">{highestHall}</p></div>
        <div className="px-3 py-2"><p className="text-[10px] font-medium text-[#9B9B9B]">AVG / HALL</p><p className="font-semibold text-[#0F1D24]">{avgPerHall} min</p></div>
        <div className="px-3 py-2"><p className="text-[10px] font-medium text-[#9B9B9B]">PEAK</p><p className="font-semibold text-red-500">{peakHallLoss} min</p></div>
      </div>

      <div className="w-full flex-shrink-0" style={{ height: 260, minWidth: 0 }}>
        {hallWiseLoss.length > 0 && (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={hallWiseLoss} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E4E9" />
              <XAxis dataKey="hall" tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={{ stroke: "#E2E4E9" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v} min`, "Loss Time"]} />
              <Bar dataKey="lossMinutes" fill="#FDC94D" radius={[3, 3, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6] px-3 py-1.5 text-[11px] text-[#9B9B9B]">
        <span>Production Hall Comparison</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FDC94D]" /> Loss Time (Minutes)</span>
      </div>
    </div>
  );
};

export default HallWiseLossTime;