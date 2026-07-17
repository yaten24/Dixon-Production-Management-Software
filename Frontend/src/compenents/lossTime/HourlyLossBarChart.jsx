import React, { useMemo, useState } from "react";
import { FaChartBar } from "react-icons/fa";

const WIDTH = 760;
const HEIGHT = 210;
const PADDING = { top: 20, right: 10, bottom: 34, left: 34 };

// Shift A: 08:00 -> 20:00, Shift B: 20:00 -> 08:00 (next day)
const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];

const formatHour = (h) => `${String(h).padStart(2, "0")}:00`;

const HourlyLossBarChart = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Reorder the backend's 0-23 zero-filled array into shift order.
  const chartData = useMemo(() => {
    const byHour = new Map((data || []).map((d) => [d.hour, d.lossMinutes]));
    return ORDERED_HOURS.map((hour) => ({
      hour,
      lossMinutes: byHour.get(hour) || 0,
      shift: SHIFT_A_HOURS.includes(hour) ? "A" : "B",
    }));
  }, [data]);

  const maxValue = useMemo(
    () => Math.max(1, ...chartData.map((d) => d.lossMinutes)),
    [chartData]
  );

  const totalLoss = useMemo(
    () => chartData.reduce((sum, d) => sum + d.lossMinutes, 0),
    [chartData]
  );

  const peak = useMemo(
    () => chartData.reduce((a, b) => (b.lossMinutes > a.lossMinutes ? b : a), chartData[0]),
    [chartData]
  );

  const hasData = totalLoss > 0;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const barGap = 4;
  const barWidth = plotWidth / chartData.length - barGap;
  const shiftDividerX = PADDING.left + 12 * (barWidth + barGap) - barGap / 2;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxValue / yTicks) * i)
  );

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 shadow-sm">
            <FaChartBar className="text-[10px] text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
              Hourly Loss Time
            </h2>
            <p className="text-[9px] text-gray-500">Shift A (08:00–20:00) · Shift B (20:00–08:00)</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-medium uppercase tracking-wide text-gray-500">
            Peak Hour
          </p>
          <h2 className="text-sm font-extrabold text-red-600">
            {hasData ? formatHour(peak.hour) : "-"}
            <span className="ml-1 text-[9px] font-semibold text-gray-400">
              ({peak?.lossMinutes || 0}m)
            </span>
          </h2>
        </div>
      </div>

      {!hasData && (
        <div className="border-b border-amber-100 bg-amber-50 px-3 py-1.5 text-[9px] font-medium text-amber-700">
          No downtime recorded for this date — showing 0 for every hour.
        </div>
      )}

      {/* Chart */}
      <div className="relative p-2">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ height: HEIGHT }}>
          {tickValues.map((tick, i) => {
            const y = PADDING.top + plotHeight - (tick / maxValue) * plotHeight;
            return (
              <g key={i}>
                <line
                  x1={PADDING.left}
                  x2={WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth={1}
                />
                <text x={PADDING.left - 6} y={y + 3} fontSize={8} fill="#94A3B8" textAnchor="end">
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Shift A / Shift B segment labels */}
          <text
            x={PADDING.left + (shiftDividerX - PADDING.left) / 2}
            y={PADDING.top - 6}
            fontSize={8}
            fontWeight={700}
            fill="#2563EB"
            textAnchor="middle"
          >
            SHIFT A
          </text>
          <text
            x={shiftDividerX + (WIDTH - PADDING.right - shiftDividerX) / 2}
            y={PADDING.top - 6}
            fontSize={8}
            fontWeight={700}
            fill="#7C3AED"
            textAnchor="middle"
          >
            SHIFT B
          </text>

          {/* Divider between the two shifts */}
          <line
            x1={shiftDividerX}
            x2={shiftDividerX}
            y1={PADDING.top}
            y2={PADDING.top + plotHeight}
            stroke="#CBD5E1"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />

          {chartData.map((d, i) => {
            const barHeight = (d.lossMinutes / maxValue) * plotHeight;
            const x = PADDING.left + i * (barWidth + barGap);
            const y = PADDING.top + plotHeight - barHeight;
            const isHovered = hoverIndex === i;
            const barColor = d.shift === "A" ? "#2563EB" : "#7C3AED";
            const barColorHover = d.shift === "A" ? "#1D4ED8" : "#6D28D9";

            return (
              <g key={`${d.shift}-${d.hour}`}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(barWidth, 1)}
                  height={Math.max(barHeight, 0)}
                  rx={2}
                  fill={isHovered ? barColorHover : barColor}
                  opacity={hoverIndex === null || isHovered ? 1 : 0.55}
                  style={{ transition: "opacity 0.15s ease, fill 0.15s ease" }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                {d.lossMinutes > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    fontSize={7}
                    fontWeight="700"
                    fill="#374151"
                    textAnchor="middle"
                  >
                    {d.lossMinutes}
                  </text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={HEIGHT - PADDING.bottom + 12}
                  fontSize={7}
                  fontWeight={600}
                  fill="#475569"
                  textAnchor="middle"
                >
                  {String(d.hour).padStart(2, "0")}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute rounded border border-gray-200 bg-white px-2 py-1 text-[9px] shadow-lg"
            style={{
              left: `${
                ((PADDING.left + hoverIndex * (barWidth + barGap) + barWidth / 2) / WIDTH) * 100
              }%`,
              top: 4,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-semibold text-gray-800">
              Shift {chartData[hoverIndex].shift} · {formatHour(chartData[hoverIndex].hour)}
            </p>
            <p className="font-bold text-red-600">{chartData[hoverIndex].lossMinutes} min</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-3 py-1.5">
        <div className="flex items-center gap-2 text-[9px]">
          <span className="flex items-center gap-1 text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Shift A
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" /> Shift B
          </span>
        </div>
        <span className="text-[9px] text-gray-600">Total: {totalLoss}m</span>
      </div>
    </div>
  );
};

export default HourlyLossBarChart;