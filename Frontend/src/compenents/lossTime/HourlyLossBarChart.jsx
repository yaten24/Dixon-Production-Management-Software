import React, { useMemo, useState } from "react";
import { FaChartBar } from "react-icons/fa";

const WIDTH = 760;
const HEIGHT = 200;
const PADDING = { top: 20, right: 10, bottom: 24, left: 34 };

const HourlyLossBarChart = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const chartData = useMemo(
    () =>
      data && data.length
        ? data
        : Array.from({ length: 24 }, (_, hour) => ({ hour, lossMinutes: 0 })),
    [data]
  );

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

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const barGap = 4;
  const barWidth = plotWidth / chartData.length - barGap;

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
            <p className="text-[9px] text-gray-500">Total downtime by hour of day</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-medium uppercase tracking-wide text-gray-500">
            Peak Hour
          </p>
          <h2 className="text-sm font-extrabold text-red-600">
            {peak ? `${peak.hour}:00` : "-"}
            <span className="ml-1 text-[9px] font-semibold text-gray-400">
              ({peak?.lossMinutes || 0}m)
            </span>
          </h2>
        </div>
      </div>

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

          {chartData.map((d, i) => {
            const barHeight = (d.lossMinutes / maxValue) * plotHeight;
            const x = PADDING.left + i * (barWidth + barGap);
            const y = PADDING.top + plotHeight - barHeight;
            const isHovered = hoverIndex === i;

            return (
              <g key={d.hour}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(barWidth, 1)}
                  height={Math.max(barHeight, 0)}
                  rx={2}
                  fill={isHovered ? "#1D4ED8" : "#2563EB"}
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
                  fontSize={7.5}
                  fontWeight={600}
                  fill="#475569"
                  textAnchor="middle"
                >
                  {d.hour}
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
              {hoverIndex}:00 - {hoverIndex + 1}:00
            </p>
            <p className="font-bold text-red-600">{chartData[hoverIndex].lossMinutes} min</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-3 py-1.5">
        <p className="text-[9px] text-gray-500">24-Hour Downtime Pattern</p>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span className="text-[9px] text-gray-600">Total: {totalLoss}m</span>
        </div>
      </div>
    </div>
  );
};

export default HourlyLossBarChart;