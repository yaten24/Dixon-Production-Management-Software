import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaChartLine } from "react-icons/fa";
import ChartCard from "./ChartCard";

const MIN_HEIGHT = 160;

// ---- Shift config ----
const SHIFT_A_START = 8;   // 08:00 (8 AM)
const SHIFT_A_END = 20;    // upto 20:00 (8 PM), exclusive
const SHIFT_COLORS = {
  A: { band: "#FEF3C7", label: "#B45309", swatch: "#F59E0B", border: "#F59E0B" }, // amber — Day
  B: { band: "#DBEAFE", label: "#1D4ED8", swatch: "#3B82F6", border: "#3B82F6" }, // blue — Night
};

const getShift = (hourIdx) =>
  hourIdx >= SHIFT_A_START && hourIdx < SHIFT_A_END ? "A" : "B";

// Build 24 slots, REORDERED to start from Shift A's start hour so the two
// shifts render as two clean, contiguous, non-split blocks left-to-right.
const buildFullDayData = (data) => {
  const map = new Map();
  (data || []).forEach((d) => {
    const key = String(d.hour).slice(0, 2).padStart(2, "0");
    map.set(key, d);
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

const OverallProductionChart = ({ data = [], onViewHall, loading }) => {
  const fullDayData = useMemo(() => buildFullDayData(data), [data]);
  const hasAnyValue = fullDayData.some((d) => d.target > 0 || d.actual > 0);

  const [hoverIdx, setHoverIdx] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 700, height: 320 });

  // ---- Responsive width AND height tracking ----
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

  // Padding scales down a bit on shorter containers
  const compact = height < 280;
  const PADDING = compact
    ? { top: 46, right: 10, bottom: 32, left: 38 }
    : { top: 62, right: 12, bottom: 40, left: 44 };

  const chartW = Math.max(width - PADDING.left - PADDING.right, 10);
  const chartH = Math.max(height - PADDING.top - PADDING.bottom, 10);

  const { bars, maxVal, yTicks, shiftSegments } = useMemo(() => {
    if (width === 0) return { bars: [], maxVal: 0, yTicks: [], shiftSegments: [] };

    const max = Math.max(
      ...fullDayData.map((d) => Math.max(d.target || 0, d.actual || 0)),
      1
    );
    const niceMax = Math.ceil(max * 1.15);

    const groupW = chartW / fullDayData.length;
    const barGap = compact ? 2 : 3;
    const barW = Math.max((groupW - barGap * 3) / 2, 2);

    const computed = fullDayData.map((d, i) => {
      const groupX = PADDING.left + groupW * i;
      const targetH = (Math.max(d.target || 0, 0) / niceMax) * chartH;
      const actualH = (Math.max(d.actual || 0, 0) / niceMax) * chartH;

      return {
        hour: d.hour,
        target: d.target,
        actual: d.actual,
        shift: d.shift,
        groupX,
        groupW,
        targetX: groupX + barGap,
        actualX: groupX + barGap * 2 + barW,
        barW,
        targetH,
        actualH,
        targetY: PADDING.top + chartH - targetH,
        actualY: PADDING.top + chartH - actualH,
      };
    });

    const tickCount = compact ? 3 : 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
      Math.round((niceMax / tickCount) * i)
    );

    // Data is reordered to start at Shift A -> exactly two segments, no wrap-split.
    const segments = [];
    computed.forEach((b) => {
      const last = segments[segments.length - 1];
      if (last && last.shift === b.shift) {
        last.endX = b.groupX + b.groupW;
        last.count += 1;
      } else {
        segments.push({
          shift: b.shift,
          startX: b.groupX,
          endX: b.groupX + b.groupW,
          count: 1,
        });
      }
    });

    return { bars: computed, maxVal: niceMax, yTicks: ticks, shiftSegments: segments };
  }, [fullDayData, chartW, chartH, width, compact, PADDING.left, PADDING.top]);

  const hovered = hoverIdx !== null ? bars[hoverIdx] : null;

  return (
    <ChartCard
      icon={<FaChartLine className="text-[10px] text-white" />}
      iconBg="#1d4ed8"
      title="Overall Production — All Halls"
      subtitle={`Combined hourly target vs actual · Day starts ${String(
        SHIFT_A_START
      ).padStart(2, "0")}:00 (Shift A)`}
      onViewHall={() => onViewHall("All")}
      full
    >
      <style>{`
        @keyframes growBar {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes fadeInLabel {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {loading ? (
        <div className="flex h-full min-h-[160px] items-center justify-center text-[11px] text-gray-400">
          Loading hourly data...
        </div>
      ) : (
        <div ref={containerRef} className="relative flex h-full min-h-0 w-full flex-col">
          {/* Legend */}
          <div className="mb-1 flex flex-shrink-0 flex-wrap items-center justify-end gap-2 pr-1">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SHIFT_COLORS.A.swatch }}
              />
              <span className="text-[10px] font-semibold text-amber-700">
                Shift A · {String(SHIFT_A_START).padStart(2, "0")}:00–
                {String(SHIFT_A_END).padStart(2, "0")}:00
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SHIFT_COLORS.B.swatch }}
              />
              <span className="text-[10px] font-semibold text-blue-700">
                Shift B · {String(SHIFT_A_END).padStart(2, "0")}:00–
                {String(SHIFT_A_START).padStart(2, "0")}:00
              </span>
            </div>
            <div className="mx-1 h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#94A3B8]" />
              <span className="text-[10px] font-medium text-gray-500">Target</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#2563EB]" />
              <span className="text-[10px] font-medium text-gray-500">Actual</span>
            </div>
          </div>

          {!hasAnyValue && (
            <div className="mb-1 flex-shrink-0 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
              No production entries found for this date — showing 0 across all 24 hours.
            </div>
          )}

          <div className="min-h-0 flex-1">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width="100%"
              height="100%"
              className="block"
              preserveAspectRatio="none"
            >
              {/* Shift background bands */}
              {shiftSegments.map((seg, i) => (
                <rect
                  key={`seg-${i}`}
                  x={seg.startX}
                  y={PADDING.top}
                  width={seg.endX - seg.startX}
                  height={chartH}
                  fill={SHIFT_COLORS[seg.shift].band}
                  opacity={0.55}
                  stroke={SHIFT_COLORS[seg.shift].border}
                  strokeOpacity={0.4}
                  strokeWidth={1}
                />
              ))}

              {/* Solid divider exactly at shift boundary */}
              {shiftSegments.length > 1 && (
                <line
                  x1={shiftSegments[1].startX}
                  x2={shiftSegments[1].startX}
                  y1={PADDING.top - (compact ? 16 : 26)}
                  y2={PADDING.top + chartH}
                  stroke="#475569"
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
                      fill="#ffffff"
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
                    <line
                      x1={PADDING.left}
                      x2={width - PADDING.right}
                      y1={y}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth={1}
                    />
                    <text
                      x={PADDING.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94A3B8"
                      fontFamily="ui-monospace, monospace"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {bars.map((b, i) => (
                <g key={i}>
                  <rect
                    x={b.targetX}
                    y={b.targetY}
                    width={b.barW}
                    height={b.targetH}
                    rx={2}
                    fill={hoverIdx === i ? "#7C8BA1" : "#94A3B8"}
                    style={{
                      transformOrigin: `${b.targetX + b.barW / 2}px ${PADDING.top + chartH}px`,
                      animation: `growBar 500ms ease-out ${i * 20}ms both`,
                      transition: "fill 150ms ease",
                    }}
                  />
                  <rect
                    x={b.actualX}
                    y={b.actualY}
                    width={b.barW}
                    height={b.actualH}
                    rx={2}
                    fill={hoverIdx === i ? "#1d4ed8" : "#2563EB"}
                    style={{
                      transformOrigin: `${b.actualX + b.barW / 2}px ${PADDING.top + chartH}px`,
                      animation: `growBar 500ms ease-out ${i * 20 + 40}ms both`,
                      transition: "fill 150ms ease",
                    }}
                  />

                  {/* Value labels */}
                  {!compact && b.target > 0 && (
                    <text
                      x={b.targetX + b.barW / 2}
                      y={b.targetY - 4}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="700"
                      fill="#64748B"
                      fontFamily="ui-monospace, monospace"
                      style={{
                        opacity: 0,
                        animation: `fadeInLabel 300ms ease-out ${i * 20 + 460}ms forwards`,
                      }}
                    >
                      {b.target}
                    </text>
                  )}
                  {!compact && b.actual > 0 && (
                    <text
                      x={b.actualX + b.barW / 2}
                      y={b.actualY - 4}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="700"
                      fill="#1d4ed8"
                      fontFamily="ui-monospace, monospace"
                      style={{
                        opacity: 0,
                        animation: `fadeInLabel 300ms ease-out ${i * 20 + 500}ms forwards`,
                      }}
                    >
                      {b.actual}
                    </text>
                  )}
                </g>
              ))}

              {/* X labels (all 24 hours, starting from Shift A start) */}
              {bars.map((b, i) => (
                <text
                  key={`label-${i}`}
                  x={b.groupX + b.groupW / 2}
                  y={height - PADDING.bottom + (compact ? 12 : 14)}
                  textAnchor="middle"
                  fontSize={compact ? "7.5" : "8.5"}
                  fontWeight="600"
                  fill="#64748B"
                >
                  {b.hour}
                </text>
              ))}

              {/* X axis title */}
              <text
                x={PADDING.left + chartW / 2}
                y={height - (compact ? 4 : 6)}
                textAnchor="middle"
                fontSize={compact ? "9" : "10"}
                fontWeight="700"
                fill="#475569"
              >
                Hour of Day (starts at Shift A)
              </text>

              {/* Y axis title (rotated) */}
              {!compact && (
                <text
                  x={14}
                  y={PADDING.top + chartH / 2}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#475569"
                  transform={`rotate(-90, 14, ${PADDING.top + chartH / 2})`}
                >
                  Quantity (Units)
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

          {/* Tooltip */}
          {hovered && (
            <div
              className="pointer-events-none absolute z-10 rounded border border-[#E2E4E9] bg-white px-2 py-1.5 text-[10px] shadow-md"
              style={{
                left: `${Math.min(
                  Math.max(
                    ((hovered.groupX + hovered.groupW / 2) / width) * 100,
                    10
                  ),
                  90
                )}%`,
                top: 4,
                transform: "translateX(-50%)",
              }}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="font-semibold text-gray-700">{hovered.hour}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white"
                  style={{ background: SHIFT_COLORS[hovered.shift].swatch }}
                >
                  Shift {hovered.shift}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Target</span>
                <span className="font-mono font-semibold text-[#64748B]">
                  {hovered.target}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Actual</span>
                <span className="font-mono font-semibold text-[#2563EB]">
                  {hovered.actual}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
};

export default OverallProductionChart;