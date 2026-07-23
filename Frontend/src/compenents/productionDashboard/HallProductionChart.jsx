import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceArea,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { FaIndustry } from "react-icons/fa";
import ChartCard from "./ChartCard";

const SHIFT_A_START = 8;
const SHIFT_A_END = 20;

const SHIFT_COLORS = {
  A: { band: "#FDC94D", swatch: "#FDC94D", text: "#0F1D24" }, // gold — Day
  B: { band: "#0F1D24", swatch: "#0F1D24", text: "#FDC94D" }, // navy — Night
};

const getShift = (hour) => (hour >= SHIFT_A_START && hour < SHIFT_A_END ? "A" : "B");

// Normalize whatever hourly rows come in for this hall into a full,
// shift-tagged 24h series starting at Shift A — same contract as
// OverallProductionChart so both charts read identically at a glance.
const buildFullDayData = (rows) => {
  const map = new Map();
  (rows || []).forEach((r) => {
    const key = String(r.hour).slice(0, 2).padStart(2, "0");
    map.set(key, r);
  });

  return Array.from({ length: 24 }, (_, i) => {
    const actualHour = (SHIFT_A_START + i) % 24;
    const key = String(actualHour).padStart(2, "0");
    const existing = map.get(key);
    return {
      hour: `${key}:00`,
      target: existing ? Number(existing.target) || 0 : 0,
      actual: existing ? Number(existing.actual) || 0 : 0,
      shift: getShift(actualHour),
    };
  });
};

const buildShiftSegments = (data) => {
  const segments = [];
  data.forEach((d) => {
    const last = segments[segments.length - 1];
    if (last && last.shift === d.shift) {
      last.endHour = d.hour;
    } else {
      segments.push({ shift: d.shift, startHour: d.hour, endHour: d.hour });
    }
  });
  return segments;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;
  const actual = payload.find((p) => p.dataKey === "actual")?.value ?? 0;
  const shift = payload[0]?.payload?.shift;

  return (
    <div className="rounded border border-[#C6C6C6]/60 bg-white px-2 py-1.5 text-[10px] shadow-md">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="font-semibold text-[#0F1D24]">{label}</span>
        {shift && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ background: SHIFT_COLORS[shift].swatch, color: SHIFT_COLORS[shift].text }}
          >
            Shift {shift}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[#9B9B9B]">Target</span>
        <span className="font-mono font-semibold text-[#9B9B9B]">{target}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[#9B9B9B]">Actual</span>
        <span className="font-mono font-semibold text-[#0F1D24]">{actual}</span>
      </div>
    </div>
  );
};

const HallProductionChart = ({ hall, rows, accent, onViewHall }) => {
  const [hoverHour, setHoverHour] = useState(null);

  const data = useMemo(() => buildFullDayData(rows), [rows]);
  const hasAnyValue = data.some((d) => d.target > 0 || d.actual > 0);
  const shiftSegments = useMemo(() => buildShiftSegments(data), [data]);

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, d) => ({ target: acc.target + d.target, actual: acc.actual + d.actual }),
        { target: 0, actual: 0 }
      ),
    [data]
  );
  const efficiency = totals.target > 0 ? Math.round((totals.actual / totals.target) * 1000) / 10 : null;
  const effTone = efficiency === null ? "text-[#9B9B9B]" : efficiency >= 100 ? "text-emerald-600" : efficiency >= 70 ? "text-amber-600" : "text-red-600";

  return (
    <ChartCard
      icon={<FaIndustry className="text-[10px] text-white" />}
      iconBg={accent}
      title={`${hall} — Hourly Production`}
      subtitle="Target vs Actual, hour by hour"
      onViewHall={() => onViewHall(hall)}
    >
      <div className="flex h-full min-h-0 w-full flex-col">
        {/* Legend + efficiency badge — same visual language as the overall chart */}
        <div className="mb-1 flex flex-shrink-0 flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: "#C6C6C6" }} />
            <span className="text-[9.5px] font-medium text-[#9B9B9B]">Target</span>
            <span className="ml-2 h-2.5 w-2.5 rounded-[2px]" style={{ background: accent }} />
            <span className="text-[9.5px] font-medium text-[#9B9B9B]">Actual</span>
          </div>
          <div className={`rounded-full border border-current/20 px-2 py-0.5 text-[9.5px] font-bold ${effTone}`}>
            {efficiency === null ? "No data" : `${efficiency}% efficiency`}
          </div>
        </div>

        {!hasAnyValue && (
          <div className="mb-1 flex-shrink-0 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[9.5px] text-amber-700">
            No production entries logged yet for {hall} — showing 0 across all 24 hours.
          </div>
        )}

        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <ComposedChart
              data={data}
              margin={{ top: 18, right: 8, left: -18, bottom: 0 }}
              onMouseLeave={() => setHoverHour(null)}
            >
              {shiftSegments.map((seg, i) => (
                <ReferenceArea
                  key={`seg-${i}`}
                  x1={seg.startHour}
                  x2={seg.endHour}
                  fill={SHIFT_COLORS[seg.shift].band}
                  fillOpacity={seg.shift === "A" ? 0.08 : 0.05}
                  ifOverflow="visible"
                />
              ))}

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

              <XAxis
                dataKey="hour"
                tick={{ fontSize: 8.5, fill: "#9B9B9B", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#9B9B9B", fontFamily: "ui-monospace, monospace" }}
                tickLine={false}
                axisLine={false}
                width={30}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#0F1D24", opacity: 0.04 }} />

              <Bar
                dataKey="target"
                fill="#C6C6C6"
                radius={[2, 2, 0, 0]}
                maxBarSize={14}
                animationDuration={500}
                animationEasing="ease-out"
                onMouseEnter={(d) => setHoverHour(d.hour)}
              />
              <Bar
                dataKey="actual"
                fill={accent}
                radius={[2, 2, 0, 0]}
                maxBarSize={14}
                animationDuration={500}
                animationBegin={80}
                animationEasing="ease-out"
                onMouseEnter={(d) => setHoverHour(d.hour)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
};

export default HallProductionChart;