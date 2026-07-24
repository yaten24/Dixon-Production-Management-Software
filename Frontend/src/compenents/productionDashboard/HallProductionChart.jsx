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

// Flat bordered tooltip — desktop-app style, sharp corners
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;
  const actual = payload.find((p) => p.dataKey === "actual")?.value ?? 0;
  const shift = payload[0]?.payload?.shift;

  return (
    <div className="border border-[#C6C6C6] bg-white px-2.5 py-2 text-[10.5px] shadow-[0_4px_10px_rgba(15,29,36,0.14)]">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="font-bold text-[#0F1D24]">{label}</span>
        {shift && (
          <span
            className="border px-1.5 py-0.5 text-[9px] font-bold"
            style={{ background: SHIFT_COLORS[shift].swatch, borderColor: "#0F1D24", color: SHIFT_COLORS[shift].text }}
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
  const effTone =
    efficiency === null
      ? "text-[#9B9B9B] border-[#C6C6C6] bg-[#F5F5F5]"
      : efficiency >= 100
      ? "text-emerald-700 border-emerald-300 bg-emerald-50"
      : efficiency >= 70
      ? "text-amber-700 border-amber-300 bg-amber-50"
      : "text-red-700 border-red-300 bg-red-50";

  return (
    <ChartCard
      icon={<FaIndustry className="text-[10px] text-white" />}
      iconBg={accent}
      title={`${hall} — Hourly Production`}
      subtitle="Target vs Actual, hour by hour"
      onViewHall={() => onViewHall(hall)}
    >
      <div className="flex h-full min-h-0 w-full flex-col">
        {/* Legend + efficiency badge — flat bordered tokens */}
        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-1.5 border border-[#C6C6C6] bg-[#FAFAFA] px-2 py-1">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5" style={{ background: "#C6C6C6" }} />
            <span className="text-[9.5px] font-semibold text-[#9B9B9B]">Target</span>
            <span className="ml-2 h-2.5 w-2.5" style={{ background: accent }} />
            <span className="text-[9.5px] font-semibold text-[#9B9B9B]">Actual</span>
          </div>
          <div className={`border px-2 py-0.5 text-[9.5px] font-bold ${effTone}`}>
            {efficiency === null ? "No data" : `${efficiency}% efficiency`}
          </div>
        </div>

        {!hasAnyValue && (
          <div className="mb-1.5 flex-shrink-0 border border-amber-300 bg-amber-50 px-2 py-1 text-[9.5px] font-semibold text-amber-700">
            No production entries logged yet for {hall} — showing 0 across all 24 hours.
          </div>
        )}

        <div className="min-h-0 flex-1 border border-[#C6C6C6] bg-white p-1">
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
                axisLine={{ stroke: "#C6C6C6" }}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#9B9B9B", fontFamily: "ui-monospace, monospace" }}
                tickLine={false}
                axisLine={{ stroke: "#C6C6C6" }}
                width={30}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#0F1D24", opacity: 0.04 }} />

              <Bar
                dataKey="target"
                fill="#C6C6C6"
                maxBarSize={14}
                animationDuration={500}
                animationEasing="ease-out"
                onMouseEnter={(d) => setHoverHour(d.hour)}
              />
              <Bar
                dataKey="actual"
                fill={accent}
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