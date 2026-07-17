import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChartBar } from "react-icons/fa";

const MIN_HEIGHT = 200;

// Shift A: 08:00 -> 20:00, Shift B: 20:00 -> 08:00 (next day) —
// identical convention + identical color palette to OverallProductionChart.
const SHIFT_A_START = 8;
const SHIFT_A_END = 20;
const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];

const SHIFT_COLORS = {
  A: { band: "#FDC94D22", label: "#0F1D24", swatch: "#FDC94D", border: "#FDC94D" }, // gold — Day
  B: { band: "#0F1D2414", label: "#0F1D24", swatch: "#0F1D24", border: "#0F1D24" }, // navy — Night
};

const getShift = (hourIdx) => (hourIdx >= SHIFT_A_START && hourIdx < SHIFT_A_END ? "A" : "B");

// Reorders whatever hour-keyed data the backend gives into shift order
// (Shift A block first, then Shift B) so the two shifts render as two
// clean contiguous segments — same approach as OverallProductionChart.
const buildShiftOrderedData = (data) => {
  const byHour = new Map();
  (data || []).forEach((d) => {
    const key = parseInt(String(d.hour).slice(0, 2), 10);
    byHour.set(key, Number(d.qty) || 0);
  });

  return ORDERED_HOURS.map((hour) => ({
    hour: `${String(hour).padStart(2, "0")}:00`,
    qty: byHour.get(hour) || 0,
    shift: getShift(hour),
  }));
};

const RejectionTrendChart = ({ data = [] }) => {
  const chartData = useMemo(() => buildShiftOrderedData(data), [data]);
  const hasAnyValue = chartData.some((d) => d.qty > 0);

  const totalRejectQty = useMemo(() => chartData.reduce((sum, d) => sum + d.qty, 0), [chartData]);
  const avgRejectQty = chartData.length > 0 ? Math.round(totalRejectQty / chartData.length) : 0;
  const highestHour = useMemo(
    () => chartData.reduce((a, b) => (b.qty > a.qty ? b : a), chartData[0]),
    [chartData],
  );

  const [hoverIdx, setHoverIdx] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 700, height: 320 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = Math.max(entry.contentRect.height, MIN_HEIGHT);
        setSize({ width: w, height: h });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;

  const compact = height < 280;
  const PADDING = compact
    ? { top: 46, right: 10, bottom: 32, left: 30 }
    : { top: 62, right: 12, bottom: 40, left: 34 };

  const chartW = Math.max(width - PADDING.left - PADDING.right, 10);
  const chartH = Math.max(height - PADDING.top - PADDING.bottom, 10);

  const { bars, maxVal, yTicks, shiftSegments } = useMemo(() => {
    if (width === 0) return { bars: [], maxVal: 0, yTicks: [], shiftSegments: [] };

    const max = Math.max(...chartData.map((d) => d.qty || 0), 1);
    const niceMax = Math.ceil(max * 1.15);

    const groupW = chartW / chartData.length;
    const barGap = compact ? 2 : 3;
    const barW = Math.max(groupW - barGap * 2, 2);

    const computed = chartData.map((d, i) => {
      const groupX = PADDING.left + groupW * i;
      const barH = (Math.max(d.qty || 0, 0) / niceMax) * chartH;

      return {
        hour: d.hour,
        qty: d.qty,
        shift: d.shift,
        groupX,
        groupW,
        barX: groupX + barGap,
        barW,
        barH,
        barY: PADDING.top + chartH - barH,
      };
    });

    const tickCount = compact ? 3 : 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((niceMax / tickCount) * i));

    const segments = [];
    computed.forEach((b) => {
      const last = segments[segments.length - 1];
      if (last && last.shift === b.shift) {
        last.endX = b.groupX + b.groupW;
        last.count += 1;
      } else {
        segments.push({ shift: b.shift, startX: b.groupX, endX: b.groupX + b.groupW, count: 1 });
      }
    });

    return { bars: computed, maxVal: niceMax, yTicks: ticks, shiftSegments: segments };
  }, [chartData, chartW, chartH, width, compact, PADDING.left, PADDING.top]);

  const hovered = hoverIdx !== null ? bars[hoverIdx] : null;

  return (
    <div className="flex h-full min-h-0 flex-col rounded border border-[#C6C6C6]/50 bg-white p-1.5 shadow-sm">
      <style>{`
        @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes fadeInLabel { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header — same layout language as OverallProductionChart's ChartCard */}
      <div className="flex shrink-0 flex-col gap-1.5 border-b border-[#C6C6C6]/40 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaChartBar className="text-[10px] text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Hourly Rejection Trend
            </h2>
            <p className="text-[9px] text-[#9B9B9B]">
              Day starts {String(SHIFT_A_START).padStart(2, "0")}:00 (Shift A)
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Total</p>
            <p className="text-xs font-bold leading-none text-red-600">{totalRejectQty}</p>
          </div>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Avg / Hr</p>
            <p className="text-xs font-bold leading-none text-[#0F1D24]">{avgRejectQty}</p>
          </div>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Peak Hour</p>
            <p className="text-[10px] font-semibold leading-none text-[#0F1D24]">
              {hasAnyValue ? highestHour.hour : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative flex h-full min-h-0 w-full flex-col">
        {/* Legend — identical structure/colors to OverallProductionChart */}
        <div className="mb-1 mt-1.5 flex flex-shrink-0 flex-wrap items-center justify-end gap-2 pr-1">
          <div className="flex items-center gap-1.5 rounded-full border border-[#FDC94D]/50 bg-[#FDC94D]/10 px-2 py-0.5">
            <span className="h-2 w-2 rounded-full" style={{ background: SHIFT_COLORS.A.swatch }} />
            <span className="text-[10px] font-semibold text-[#0F1D24]">
              Shift A · {String(SHIFT_A_START).padStart(2, "0")}:00–{String(SHIFT_A_END).padStart(2, "0")}:00
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#0F1D24]/20 bg-[#0F1D24]/5 px-2 py-0.5">
            <span className="h-2 w-2 rounded-full" style={{ background: SHIFT_COLORS.B.swatch }} />
            <span className="text-[10px] font-semibold text-[#0F1D24]">
              Shift B · {String(SHIFT_A_END).padStart(2, "0")}:00–{String(SHIFT_A_START).padStart(2, "0")}:00
            </span>
          </div>
          <div className="mx-1 h-4 w-px bg-[#C6C6C6]" />
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-red-600" />
            <span className="text-[10px] font-medium text-[#9B9B9B]">Reject Qty</span>
          </div>
        </div>

        {/* No-data warning — same style/copy pattern as OverallProductionChart */}
        {!hasAnyValue && (
          <div className="mb-1 flex-shrink-0 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
            No rejection entries found for this date — showing 0 across all 24 hours.
          </div>
        )}

        <div className="min-h-0 flex-1">
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="block" preserveAspectRatio="none">
            {/* Shift background bands */}
            {shiftSegments.map((seg, i) => (
              <rect
                key={`seg-${i}`}
                x={seg.startX}
                y={PADDING.top}
                width={seg.endX - seg.startX}
                height={chartH}
                fill={SHIFT_COLORS[seg.shift].band}
                opacity={0.7}
                stroke={SHIFT_COLORS[seg.shift].border}
                strokeOpacity={0.3}
                strokeWidth={1}
              />
            ))}

            {/* Divider exactly at the shift boundary */}
            {shiftSegments.length > 1 && (
              <line
                x1={shiftSegments[1].startX}
                x2={shiftSegments[1].startX}
                y1={PADDING.top - (compact ? 16 : 26)}
                y2={PADDING.top + chartH}
                stroke="#0F1D24"
                strokeWidth={1.5}
              />
            )}

            {/* Shift header pills */}
            {shiftSegments.map((seg, i) => {
              const cx = (seg.startX + seg.endX) / 2;
              const pillW = compact ? 56 : 70;
              const pillH = compact ? 14 : 18;
              return (
                <g key={`seg-label-${i}`}>
                  <rect
                    x={cx - pillW / 2}
                    y={PADDING.top - (compact ? 30 : 44)}
                    width={pillW}
                    height={pillH}
                    rx={pillH / 2}
                    fill={SHIFT_COLORS[seg.shift].swatch}
                  />
                  <text
                    x={cx}
                    y={PADDING.top - (compact ? 30 : 44) + pillH / 2 + 3}
                    textAnchor="middle"
                    fontSize={compact ? "8.5" : "10"}
                    fontWeight="700"
                    fill={seg.shift === "A" ? "#0F1D24" : "#FDC94D"}
                  >
                    Shift {seg.shift}
                  </text>
                </g>
              );
            })}

            {/* Grid lines + Y labels */}
            {yTicks.map((tick, i) => {
              const y = PADDING.top + chartH - (tick / maxVal) * chartH;
              return (
                <g key={i}>
                  <line x1={PADDING.left} x2={width - PADDING.right} y1={y} y2={y} stroke="#F5F5F5" strokeWidth={1} />
                  <text x={PADDING.left - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#9B9B9B" fontFamily="ui-monospace, monospace">
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Bars — single series (reject qty), semantic red, shift-tinted background does the differentiation */}
            {bars.map((b, i) => (
              <g key={i}>
                <rect
                  x={b.barX}
                  y={b.barY}
                  width={b.barW}
                  height={b.barH}
                  rx={2}
                  fill={hoverIdx === i ? "#B91C1C" : "#DC2626"}
                  style={{
                    transformOrigin: `${b.barX + b.barW / 2}px ${PADDING.top + chartH}px`,
                    animation: `growBar 500ms ease-out ${i * 20}ms both`,
                    transition: "fill 150ms ease",
                  }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{ cursor: "pointer" }}
                />

                {!compact && b.qty > 0 && (
                  <text
                    x={b.barX + b.barW / 2}
                    y={b.barY - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill="#DC2626"
                    fontFamily="ui-monospace, monospace"
                    style={{ opacity: 0, animation: `fadeInLabel 300ms ease-out ${i * 20 + 460}ms forwards` }}
                  >
                    {b.qty}
                  </text>
                )}
              </g>
            ))}

            {/* X labels — actual hour, shift-ordered */}
            {bars.map((b, i) => (
              <text
                key={`label-${i}`}
                x={b.groupX + b.groupW / 2}
                y={height - PADDING.bottom + (compact ? 12 : 14)}
                textAnchor="middle"
                fontSize={compact ? "7.5" : "8.5"}
                fontWeight="600"
                fill="#9B9B9B"
              >
                {b.hour}
              </text>
            ))}

            <text
              x={PADDING.left + chartW / 2}
              y={height - (compact ? 4 : 6)}
              textAnchor="middle"
              fontSize={compact ? "9" : "10"}
              fontWeight="700"
              fill="#0F1D24"
            >
              Hour of Day (starts at Shift A)
            </text>

            {!compact && (
              <text
                x={10}
                y={PADDING.top + chartH / 2}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#0F1D24"
                transform={`rotate(-90, 10, ${PADDING.top + chartH / 2})`}
              >
                Reject Qty
              </text>
            )}

            {/* Hover overlay */}
            {bars.map((b, i) => (
              <rect
                key={`hover-${i}`}
                x={b.groupX}
                y={PADDING.top}
                width={b.groupW}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </svg>
        </div>

        {/* Tooltip — same structure as OverallProductionChart */}
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 rounded border border-[#C6C6C6]/60 bg-white px-2 py-1.5 text-[10px] shadow-md"
            style={{
              left: `${Math.min(Math.max(((hovered.groupX + hovered.groupW / 2) / width) * 100, 10), 90)}%`,
              top: 4,
              transform: "translateX(-50%)",
            }}
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="font-semibold text-[#0F1D24]">{hovered.hour}</span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                style={{
                  background: SHIFT_COLORS[hovered.shift].swatch,
                  color: hovered.shift === "A" ? "#0F1D24" : "#FDC94D",
                }}
              >
                Shift {hovered.shift}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#9B9B9B]">Reject Qty</span>
              <span className="font-mono font-semibold text-red-600">{hovered.qty}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RejectionTrendChart;