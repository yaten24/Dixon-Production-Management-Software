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
import { FaIndustry, FaCircleExclamation } from "react-icons/fa6";

const COLORS = ["#0F1D24", "#3A5561", "#6B8894", "#9BB4BE", "#C6C6C6", "#FDC94D"];

// The plant always has these 5 halls — show all of them regardless of
// whether the backend returned data for every one, so the chart never
// silently drops a hall just because it had zero rejection records.
const ALL_HALLS = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C8"];

const CustomTooltip = ({ active, payload, totalRejectQty }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const share = totalRejectQty ? ((data.qty / totalRejectQty) * 100).toFixed(1) : 0;

  return (
    <div className="min-w-[130px] rounded border border-[#C6C6C6]/60 bg-white p-2 shadow-xl">
      <h3 className="mb-1 border-b border-[#C6C6C6]/40 pb-1 text-[10px] font-bold text-[#0F1D24]">
        {data.hall}
      </h3>
      <div className="space-y-0.5 text-[9px]">
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Reject Qty</span>
          <span className="font-bold text-red-600">{data.qty}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Share</span>
          <span className="font-semibold text-[#0F1D24]">{share}%</span>
        </div>
      </div>
    </div>
  );
};

// data: [{hall, qty}] from filtered rejections
// `full` (default true): stretches to fill the parent's height, meant to
// live inside a fixed-height grid cell so the page never needs to scroll.
const HallWiseChart = ({ data = [], full = true }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Always render all 5 halls — fill in 0 for any hall missing from the
  // API response instead of just showing whatever halls happened to come back.
  const { chartData, missingHalls } = useMemo(() => {
    const qtyMap = {};
    (data || []).forEach((d) => {
      qtyMap[d.hall] = (qtyMap[d.hall] || 0) + Number(d.qty || 0);
    });

    const missing = [];
    const filled = ALL_HALLS.map((hall) => {
      if (!(hall in qtyMap)) missing.push(hall);
      return { hall, qty: qtyMap[hall] || 0 };
    });
    return { chartData: filled, missingHalls: missing };
  }, [data]);

  const sortedData = useMemo(() => [...chartData].sort((a, b) => b.qty - a.qty), [chartData]);

  const hasAnyData = chartData.some((d) => d.qty > 0);
  const totalRejectQty = useMemo(() => chartData.reduce((s, i) => s + i.qty, 0), [chartData]);
  const avgQty = useMemo(() => (chartData.length ? totalRejectQty / chartData.length : 0), [chartData, totalRejectQty]);
  const highestHall = useMemo(() => (sortedData.length ? sortedData[0] : null), [sortedData]);
  const lowestHall = useMemo(() => (sortedData.length ? sortedData[sortedData.length - 1] : null), [sortedData]);

  return (
    <div
      className={`flex ${full ? "h-full" : ""} min-h-0 flex-col overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm`}
    >
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaIndustry className="text-[10px] text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Hall Wise Rejection
            </h2>
            <p className="text-[9px] text-[#9B9B9B]">Rejection comparison across halls</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-medium uppercase tracking-wide text-[#9B9B9B]">Total Reject</p>
          <h2 className="text-sm font-extrabold text-red-600">
            {totalRejectQty}
            <span className="ml-0.5 text-[9px] font-semibold text-[#9B9B9B]">qty</span>
          </h2>
        </div>
      </div>

      <div className="grid flex-shrink-0 grid-cols-3 divide-x divide-[#C6C6C6]/40 border-y border-[#C6C6C6]/40 bg-[#F5F5F5]/70">
        <div className="px-2 py-1">
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Highest Hall</p>
          <h3 className="mt-0.5 truncate text-[10px] font-bold text-[#0F1D24]">
            {highestHall?.hall || "-"}
          </h3>
        </div>
        <div className="px-2 py-1">
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Avg / Hall</p>
          <h3 className="mt-0.5 text-[10px] font-bold text-[#0F1D24]">{avgQty.toFixed(1)}</h3>
        </div>
        <div className="px-2 py-1">
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Peak</p>
          <h3 className="mt-0.5 text-[10px] font-bold text-red-600">{highestHall?.qty || 0}</h3>
        </div>
      </div>

      {missingHalls.length > 0 && (
        <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-medium text-amber-700">
          <FaCircleExclamation className="shrink-0 text-[10px] text-amber-500" />
          {hasAnyData ? (
            <span>
              No data for {missingHalls.join(", ")} — showing all {ALL_HALLS.length} halls (0 where missing).
            </span>
          ) : (
            <span>
              No rejection data uploaded for this date — showing all {ALL_HALLS.length} halls with 0.
            </span>
          )}
        </div>
      )}

      {/* Chart fills whatever space is left instead of a fixed pixel height */}
      <div className="min-h-0 flex-1 p-1.5">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sortedData} margin={{ top: 16, right: 10, left: 0, bottom: 0 }} onMouseLeave={() => setActiveIndex(null)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
            <XAxis dataKey="hall" tick={{ fontSize: 9, fontWeight: 600, fill: "#0F1D24" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9B9B9B" }} tickLine={false} axisLine={false} width={24} allowDecimals={false} />
            <ReferenceLine y={avgQty} stroke="#9B9B9B" strokeDasharray="4 4" strokeWidth={1} label={{ value: `Avg ${avgQty.toFixed(1)}`, position: "insideTopRight", fontSize: 8, fill: "#9B9B9B", fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip totalRejectQty={totalRejectQty} />} cursor={{ fill: "rgba(15,29,36,0.05)" }} />
            <Bar dataKey="qty" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} animationEasing="ease-out" onMouseEnter={(_, i) => setActiveIndex(i)}>
              {sortedData.map((entry, index) => (
                <Cell key={entry.hall} fill={entry.qty === 0 ? "#C6C6C6" : COLORS[index % COLORS.length]} opacity={activeIndex === null || activeIndex === index ? 1 : 0.45} style={{ transition: "opacity 0.2s ease" }} />
              ))}
              <LabelList dataKey="qty" position="top" offset={4} fontSize={9} fontWeight="700" fill="#0F1D24" />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {!hasAnyData ? null : (
        <div className="grid flex-shrink-0 grid-cols-2 gap-1.5 px-2.5 py-1.5">
          <div className="flex items-center justify-between rounded bg-red-50 px-2 py-1">
            <span className="text-[9px] font-medium text-red-700">Highest</span>
            <span className="text-[10px] font-bold text-red-700">
              {highestHall?.hall} · {highestHall?.qty}
            </span>
          </div>
          <div className="flex items-center justify-between rounded bg-emerald-50 px-2 py-1">
            <span className="text-[9px] font-medium text-emerald-700">Lowest</span>
            <span className="text-[10px] font-bold text-emerald-700">
              {lowestHall?.hall} · {lowestHall?.qty}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
        <p className="text-[9px] text-[#9B9B9B]">Production Hall Comparison</p>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
          <span className="text-[9px] text-[#9B9B9B]">Reject Qty</span>
        </div>
      </div>
    </div>
  );
};

export default HallWiseChart;