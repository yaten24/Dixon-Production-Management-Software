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
  Legend,
} from "recharts";
import { FaLayerGroup, FaCircleExclamation } from "react-icons/fa6";

const PLANNED_COLOR = "#0F1D24";
const ACTUAL_COLOR = "#FDC94D";

// The plant always has these 5 halls — show all of them regardless of
// whether the backend returned data for every one, so the chart never
// silently drops a hall just because it had zero mould-change records.
const ALL_HALLS = ["Hall-1", "Hall-2", "Hall-3", "Hall-4", "C-8"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const completion = data.planned > 0 ? ((data.actual / data.planned) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-w-[130px] rounded border border-[#C6C6C6]/60 bg-white p-2 shadow-xl">
      <h3 className="mb-1 border-b border-[#C6C6C6]/40 pb-1 text-[10px] font-bold text-[#0F1D24]">
        {data.hall}
      </h3>
      <div className="space-y-0.5 text-[9px]">
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Planned</span>
          <span className="font-bold text-[#0F1D24]">{data.planned}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Actual</span>
          <span className="font-bold" style={{ color: "#B98A00" }}>{data.actual}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Completion</span>
          <span className="font-semibold text-[#0F1D24]">{completion}%</span>
        </div>
      </div>
    </div>
  );
};

// `full` (default true): stretches to fill the parent's height, meant to
// live inside a fixed-height grid cell so the page never needs to scroll.
const HallWiseMouldChange = ({ hallWiseMouldChanges = [], full = true }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Always render all 5 halls — fill in 0 for any hall missing from the
  // API response instead of just showing whatever halls happened to come back.
  const { chartData, missingHalls } = useMemo(() => {
    const byHall = new Map((hallWiseMouldChanges || []).map((d) => [d.hall, d]));
    const missing = [];
    const filled = ALL_HALLS.map((hall) => {
      const existing = byHall.get(hall);
      if (!existing) missing.push(hall);
      return existing || { hall, planned: 0, actual: 0 };
    });
    return { chartData: filled, missingHalls: missing };
  }, [hallWiseMouldChanges]);

  const hasAnyData = chartData.some((d) => d.planned > 0 || d.actual > 0);

  const totalPlanned = useMemo(() => chartData.reduce((s, h) => s + h.planned, 0), [chartData]);
  const totalActual = useMemo(() => chartData.reduce((s, h) => s + h.actual, 0), [chartData]);
  const completionRate = totalPlanned > 0 ? ((totalActual / totalPlanned) * 100).toFixed(0) : 0;

  const highestHall = useMemo(() => {
    if (!chartData.length) return null;
    return [...chartData].sort((a, b) => b.actual - a.actual)[0];
  }, [chartData]);

  return (
    <div
      className={`flex ${
        full ? "h-full" : ""
      } min-h-0 flex-col overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm`}
    >
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaLayerGroup className="text-[10px] text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Hall Wise Mould Change
            </h2>
            <p className="text-[9px] text-[#9B9B9B]">Planned vs Actual per hall</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-[8px] font-medium uppercase tracking-wide text-[#9B9B9B]">Planned</p>
            <h2 className="text-sm font-extrabold text-[#0F1D24]">{totalPlanned}</h2>
          </div>
          <div>
            <p className="text-[8px] font-medium uppercase tracking-wide text-[#9B9B9B]">Actual</p>
            <h2 className="text-sm font-extrabold" style={{ color: "#B98A00" }}>{totalActual}</h2>
          </div>
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
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Completion</p>
          <h3 className="mt-0.5 text-[10px] font-bold text-[#0F1D24]">{completionRate}%</h3>
        </div>
        <div className="px-2 py-1">
          <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Peak Actual</p>
          <h3 className="mt-0.5 text-[10px] font-bold" style={{ color: "#B98A00" }}>
            {highestHall?.actual || 0}
          </h3>
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
              No mould changes recorded for this date — showing all {ALL_HALLS.length} halls with 0.
            </span>
          )}
        </div>
      )}

      {/* Chart fills whatever space is left instead of a fixed pixel height */}
      <div className="min-h-0 flex-1 p-1.5">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 16, right: 10, left: 0, bottom: 0 }}
            barGap={4}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
            <XAxis dataKey="hall" tick={{ fontSize: 9, fontWeight: 600, fill: "#0F1D24" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9B9B9B" }} tickLine={false} axisLine={false} width={24} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(15,29,36,0.05)" }} />
            <Legend
              verticalAlign="top"
              align="right"
              height={0}
              wrapperStyle={{ fontSize: 9, fontWeight: 600, color: "#9B9B9B" }}
              iconType="square"
              iconSize={7}
            />
            <Bar
              dataKey="planned"
              name="Planned"
              fill={PLANNED_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
              animationDuration={800}
              animationEasing="ease-out"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              opacity={1}
            >
              <LabelList dataKey="planned" position="top" offset={4} fontSize={9} fontWeight="700" fill="#0F1D24" />
            </Bar>
            <Bar
              dataKey="actual"
              name="Actual"
              fill={ACTUAL_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
              animationDuration={800}
              animationEasing="ease-out"
              animationBegin={80}
              onMouseEnter={(_, i) => setActiveIndex(i)}
            >
              <LabelList dataKey="actual" position="top" offset={4} fontSize={9} fontWeight="700" fill="#0F1D24" />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
        <p className="text-[9px] text-[#9B9B9B]">Production Hall Comparison</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#0F1D24]" />
            <span className="text-[9px] text-[#9B9B9B]">Planned</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#FDC94D]" />
            <span className="text-[9px] text-[#9B9B9B]">Actual</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallWiseMouldChange;