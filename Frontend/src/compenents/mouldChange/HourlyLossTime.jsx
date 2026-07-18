import React, { useState } from "react";
import { BarChart3, ZoomIn } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const HourlyLossTime = ({ hourlyLoss, peakHour = "-", peakHourValue = 0 }) => {
  const [activeShift, setActiveShift] = useState("both");
  const shiftA = hourlyLoss?.shiftA || [];
  const shiftB = hourlyLoss?.shiftB || [];
  const combined = [...shiftA, ...shiftB];
  const chartData = activeShift === "A" ? shiftA : activeShift === "B" ? shiftB : combined;
  const totalLoss = combined.reduce((s, h) => s + h.lossMinutes, 0);
  const hasData = totalLoss > 0;

  return (
    <div className="rounded-sm border border-[#C6C6C6] bg-white">
      <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#0F1D24] text-white"><BarChart3 size={14} /></span>
          <div>
            <p className="text-sm font-semibold text-[#0F1D24]">Hourly Loss Time</p>
            <p className="text-xs text-[#9B9B9B]">Shift A (08:00–20:00) · Shift B (20:00–08:00)</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveShift(activeShift === "A" ? "both" : "A")} className={`flex items-center gap-1.5 rounded-full border px-3 h-7 text-xs font-medium ${activeShift === "A" ? "border-[#FDC94D] bg-[#FDC94D]" : "border-[#C6C6C6] bg-white"}`}>
            <span className="h-2 w-2 rounded-full bg-[#FDC94D]" /> Shift A · 08:00–20:00
          </button>
          <button onClick={() => setActiveShift(activeShift === "B" ? "both" : "B")} className={`flex items-center gap-1.5 rounded-full border px-3 h-7 text-xs font-medium ${activeShift === "B" ? "border-[#0F1D24] bg-[#0F1D24] text-white" : "border-[#C6C6C6] bg-white"}`}>
            <span className="h-2 w-2 rounded-full bg-[#0F1D24]" /> Shift B · 20:00–08:00
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <p className="text-[10px] font-medium text-[#9B9B9B]">PEAK HOUR</p>
            <p className="font-semibold text-[#0F1D24]">{peakHour !== "-" ? `${peakHour}:00` : "-"} ({peakHourValue}m)</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-sm bg-[#0F1D24] px-3 h-7 text-xs font-medium text-white">
            <ZoomIn size={13} /> Zoom
          </button>
        </div>
      </div>

      {!hasData && (
        <div className="mx-3 rounded-sm bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700">
          No downtime recorded for this date — showing 0 for every hour.
        </div>
      )}

      <div className="w-full flex-shrink-0" style={{ height: 280, minWidth: 0 }}>
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E4E9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9B9B9B" }} axisLine={{ stroke: "#E2E4E9" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v} min`, "Loss Time"]} />
              <Bar dataKey="lossMinutes" radius={[3, 3, 0, 0]} maxBarSize={22} fill="#FDC94D" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6] px-3 py-1.5 text-[11px] text-[#9B9B9B]">
        <span>Hour of Day (Shift A starts 08:00)</span>
        <span>Total Loss: {totalLoss}m</span>
      </div>
    </div>
  );
};

export default HourlyLossTime;