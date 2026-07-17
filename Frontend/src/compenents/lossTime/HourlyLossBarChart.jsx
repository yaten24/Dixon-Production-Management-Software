import React, { useMemo, useState } from "react";

// Shift A: 08:00 -> 20:00, Shift B: 20:00 -> 08:00 (next day)
const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];

const formatHour = (h) => `${String(h).padStart(2, "0")}:00`;

// Simple inline bar-chart icon — no external icon library needed.
const ChartIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
    <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" />
    <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
  </svg>
);

const ExpandIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
    <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);

// Pure SVG chart, sized by the caller so the same drawing logic powers
// both the compact card view and the full-page zoomed view.
const Chart = ({ chartData, maxValue, width, height, labelFontSize, valueFontSize }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const PADDING = {
    top: height * 0.1,
    right: width * 0.012,
    bottom: height * 0.16,
    left: width * 0.045,
  };

  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const barGap = plotWidth * 0.005;
  const barWidth = plotWidth / chartData.length - barGap;
  const shiftDividerX = PADDING.left + 12 * (barWidth + barGap) - barGap / 2;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxValue / yTicks) * i)
  );

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block w-full"
        style={{ height: "auto" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {tickValues.map((tick, i) => {
          const y = PADDING.top + plotHeight - (tick / maxValue) * plotHeight;
          return (
            <g key={i}>
              <line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={y}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 6}
                y={y + 3}
                fontSize={labelFontSize}
                fill="#94A3B8"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Shift A / Shift B segment labels */}
        <text
          x={PADDING.left + (shiftDividerX - PADDING.left) / 2}
          y={PADDING.top - 6}
          fontSize={labelFontSize}
          fontWeight={700}
          fill="#2563EB"
          textAnchor="middle"
        >
          SHIFT A
        </text>
        <text
          x={shiftDividerX + (width - PADDING.right - shiftDividerX) / 2}
          y={PADDING.top - 6}
          fontSize={labelFontSize}
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
                  fontSize={valueFontSize}
                  fontWeight="700"
                  fill="#374151"
                  textAnchor="middle"
                >
                  {d.lossMinutes}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={height - PADDING.bottom + 12}
                fontSize={labelFontSize}
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
              ((PADDING.left + hoverIndex * (barWidth + barGap) + barWidth / 2) / width) * 100
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
  );
};

const HourlyLossBarChart = ({ data }) => {
  const [isZoomed, setIsZoomed] = useState(false);

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

  return (
    <>
      <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 shadow-sm">
              <ChartIcon className="h-2.5 w-2.5 text-white" />
            </div>
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
                Hourly Loss Time
              </h2>
              <p className="text-[9px] text-gray-500">Shift A (08:00–20:00) · Shift B (20:00–08:00)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
            <button
              onClick={() => setIsZoomed(true)}
              className="flex h-6 items-center gap-1 rounded bg-blue-600 px-2 text-[9px] font-semibold text-white transition hover:bg-blue-700"
            >
              <ExpandIcon className="h-2.5 w-2.5" />
              Zoom
            </button>
          </div>
        </div>

        {!hasData && (
          <div className="border-b border-amber-100 bg-amber-50 px-3 py-1.5 text-[9px] font-medium text-amber-700">
            No downtime recorded for this date — showing 0 for every hour.
          </div>
        )}

        {/* Chart */}
        <div className="p-2">
          <Chart
            chartData={chartData}
            maxValue={maxValue}
            width={760}
            height={210}
            labelFontSize={8}
            valueFontSize={7}
          />
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

      {/* Expanded (zoomed) view — true full page, edge to edge */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 shadow-sm">
                <ChartIcon className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                  Hourly Loss Time · Expanded View
                </h2>
                <p className="text-[10px] text-gray-500">
                  Shift A (08:00–20:00) · Shift B (20:00–08:00)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                  Peak Hour
                </p>
                <h2 className="text-lg font-extrabold text-red-600">
                  {hasData ? formatHour(peak.hour) : "-"}
                  <span className="ml-1 text-[10px] font-semibold text-gray-400">
                    ({peak?.lossMinutes || 0}m)
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="flex h-8 w-8 items-center justify-center rounded text-gray-500 transition hover:bg-gray-100"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!hasData && (
            <div className="border-b border-amber-100 bg-amber-50 px-5 py-1.5 text-[10px] font-medium text-amber-700">
              No downtime recorded for this date — showing 0 for every hour.
            </div>
          )}

          <div className="flex flex-1 items-center overflow-hidden px-6 py-4">
            <Chart
              chartData={chartData}
              maxValue={maxValue}
              width={1400}
              height={560}
              labelFontSize={13}
              valueFontSize={12}
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-5 py-2">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-gray-500">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Shift A
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <span className="h-2 w-2 rounded-full bg-violet-600" /> Shift B
              </span>
            </div>
            <span className="text-[10px] text-gray-600">Total: {totalLoss}m</span>
          </div>
        </div>
      )}
    </>
  );
};

export default HourlyLossBarChart;