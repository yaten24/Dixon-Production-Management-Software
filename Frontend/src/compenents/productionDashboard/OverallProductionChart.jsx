import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaChartLine, FaChevronRight, FaExclamationTriangle } from "react-icons/fa";

const MIN_HEIGHT = 160;

const SHIFT_A_START = 8;
const SHIFT_A_END = 20;
const SHIFT_COLORS = {
  A: { band: "#FDC94D22", label: "#0F1D24", swatch: "#FDC94D", border: "#FDC94D" }, // gold — Day
  B: { band: "#0F1D2414", label: "#0F1D24", swatch: "#0F1D24", border: "#0F1D24" }, // navy — Night
};

const getShift = (hourIdx) =>
  hourIdx >= SHIFT_A_START && hourIdx < SHIFT_A_END ? "A" : "B";

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

// ============================================================
// ChartCard — inlined here (single-file, no separate import).
// `headerExtra` lets a chart inject extra content (warning banner,
// legend chips, etc.) into the SAME header row as the title/View
// Details, instead of a second row below — that's the single-row
// header requirement below.
// ============================================================
const ChartCard = ({
  icon,
  iconBg,
  title,
  subtitle,
  onViewHall,
  full,
  hasData = true,
  emptyLabel = "No data available",
  emptyDescription = "No entries found for the selected filters.",
  headerExtra,
  children,
}) => {
  return (
    <div
      className={`flex h-full min-h-0 flex-col border bg-white p-2 ${
        hasData ? "border-[#C6C6C6]" : "border-amber-300"
      } ${full ? "w-full" : ""}`}
    >
      <div className="mb-2 flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-[#C6C6C6] pb-1.5">
        <div className="flex flex-shrink-0 items-center gap-2">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center border"
            style={{
              background: hasData ? iconBg : "#C6C6C6",
              borderColor: hasData ? iconBg : "#C6C6C6",
            }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="whitespace-nowrap text-[12.5px] font-bold text-[#0F1D24]">{title}</h3>
              {!hasData && (
                <span className="flex flex-shrink-0 items-center gap-1 border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-amber-700">
                  <FaExclamationTriangle className="text-[8px]" />
                  No Data
                </span>
              )}
            </div>
            <p className="whitespace-nowrap text-[9.5px] font-medium text-[#9B9B9B]">{subtitle}</p>
          </div>
        </div>

        {/* Extra content (warning / legend chips) shares this row,
            takes the flexible middle space between title and the
            View Details button. */}
        {headerExtra && <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">{headerExtra}</div>}

        {onViewHall && (
          <button
            onClick={onViewHall}
            className="ml-auto flex flex-shrink-0 items-center gap-1 border border-[#C6C6C6] px-2 py-1 text-[10px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
          >
            View Details
            <FaChevronRight className="text-[8px]" />
          </button>
        )}
      </div>

      {hasData ? (
        <div className="min-h-0 flex-1">{children}</div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 border border-dashed border-[#C6C6C6] bg-[#FAFAFA] px-4 py-6 text-center">
          <div className="flex h-9 w-9 items-center justify-center border border-amber-300 bg-amber-50 text-amber-500">
            <FaExclamationTriangle className="text-sm" />
          </div>
          <p className="text-[12px] font-bold text-[#0F1D24]">{emptyLabel}</p>
          <p className="max-w-xs text-[10.5px] text-[#9B9B9B]">{emptyDescription}</p>
        </div>
      )}
    </div>
  );
};

// ============================================================
// OverallProductionChart
// ============================================================
const OverallProductionChart = ({ data = [], onViewHall, loading }) => {
  const fullDayData = useMemo(() => buildFullDayData(data), [data]);
  const hasAnyValue = fullDayData.some((d) => d.target > 0 || d.actual > 0);

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
    ? { top: 26, right: 10, bottom: 40, left: 38 }
    : { top: 34, right: 12, bottom: 48, left: 44 };

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

  // Legend + no-data warning — now injected into ChartCard's own
  // header row via `headerExtra`, instead of a second row inside
  // the chart body. Shift-name pill labels above the bars were tied
  // to the old, taller top padding; since that padding just got
  // reclaimed (legend moved out), those pills are dropped too — the
  // legend chips already say "Shift A/B", so nothing is lost.
  const headerExtra = (
    <>
      {!hasAnyValue && (
        <div className="flex min-w-0 flex-1 items-center gap-1.5 border border-amber-300 bg-amber-50 px-2 py-1">
          <FaExclamationTriangle className="flex-shrink-0 text-[10px] text-amber-600" />
          <span className="truncate text-[10px] font-semibold text-amber-700">
            No production entries found for this date — showing 0 across all 24 hours.
          </span>
        </div>
      )}

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <div className="flex items-center gap-1.5 whitespace-nowrap border border-[#FDC94D] bg-[#FDC94D]/10 px-2 py-0.5">
          <span className="h-2 w-2 flex-shrink-0" style={{ background: SHIFT_COLORS.A.swatch }} />
          <span className="text-[10px] font-bold text-[#0F1D24]">
            Shift A · {String(SHIFT_A_START).padStart(2, "0")}:00–
            {String(SHIFT_A_END).padStart(2, "0")}:00
          </span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap border border-[#0F1D24] bg-[#0F1D24]/5 px-2 py-0.5">
          <span className="h-2 w-2 flex-shrink-0" style={{ background: SHIFT_COLORS.B.swatch }} />
          <span className="text-[10px] font-bold text-[#0F1D24]">
            Shift B · {String(SHIFT_A_END).padStart(2, "0")}:00–
            {String(SHIFT_A_START).padStart(2, "0")}:00
          </span>
        </div>
        <div className="mx-0.5 h-4 w-px flex-shrink-0 bg-[#C6C6C6]" />
        <div className="flex flex-shrink-0 items-center gap-1">
          <span className="h-2.5 w-2.5 bg-[#C6C6C6]" />
          <span className="whitespace-nowrap text-[10px] font-semibold text-[#9B9B9B]">Target</span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <span className="h-2.5 w-2.5 bg-[#0F1D24]" />
          <span className="whitespace-nowrap text-[10px] font-semibold text-[#9B9B9B]">Actual</span>
        </div>
      </div>
    </>
  );

  return (
    <ChartCard
      icon={<FaChartLine className="text-[10px] text-[#FDC94D]" />}
      iconBg="#0F1D24"
      title="Overall Production — All Halls"
      subtitle={`Combined hourly target vs actual · Day starts ${String(
        SHIFT_A_START
      ).padStart(2, "0")}:00 (Shift A)`}
      onViewHall={() => onViewHall("All")}
      headerExtra={headerExtra}
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
        <div className="flex h-full min-h-[160px] items-center justify-center text-[11px] text-[#9B9B9B]">
          Loading hourly data...
        </div>
      ) : (
        <div ref={containerRef} className="relative flex h-full min-h-0 w-full flex-col">
          <div className="min-h-0 flex-1">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width="100%"
              height="100%"
              className="block"
              preserveAspectRatio="none"
            >
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

              {shiftSegments.length > 1 && (
                <line
                  x1={shiftSegments[1].startX}
                  x2={shiftSegments[1].startX}
                  y1={PADDING.top}
                  y2={PADDING.top + chartH}
                  stroke="#0F1D24"
                  strokeWidth={1.5}
                />
              )}

              {yTicks.map((tick, i) => {
                const y = PADDING.top + chartH - (tick / maxVal) * chartH;
                return (
                  <g key={i}>
                    <line
                      x1={PADDING.left}
                      x2={width - PADDING.right}
                      y1={y}
                      y2={y}
                      stroke="#F5F5F5"
                      strokeWidth={1}
                    />
                    <text
                      x={PADDING.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#9B9B9B"
                      fontFamily="ui-monospace, monospace"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {bars.map((b, i) => (
                <g key={i}>
                  <rect
                    x={b.targetX}
                    y={b.targetY}
                    width={b.barW}
                    height={b.targetH}
                    fill={hoverIdx === i ? "#9B9B9B" : "#C6C6C6"}
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
                    fill={hoverIdx === i ? "#1a2e38" : "#0F1D24"}
                    style={{
                      transformOrigin: `${b.actualX + b.barW / 2}px ${PADDING.top + chartH}px`,
                      animation: `growBar 500ms ease-out ${i * 20 + 40}ms both`,
                      transition: "fill 150ms ease",
                    }}
                  />

                  {!compact && b.target > 0 && (
                    <text
                      x={b.targetX + b.barW / 2}
                      y={b.targetY - 4}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="700"
                      fill="#9B9B9B"
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
                      fill="#0F1D24"
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

              {bars.map((b, i) => (
                <text
                  key={`label-${i}`}
                  x={b.groupX + b.groupW / 2}
                  y={height - PADDING.bottom + (compact ? 14 : 16)}
                  textAnchor="middle"
                  fontSize={compact ? "8.5" : "9.5"}
                  fontWeight="700"
                  fill="#4B5563"
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
                  x={14}
                  y={PADDING.top + chartH / 2}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#0F1D24"
                  transform={`rotate(-90, 14, ${PADDING.top + chartH / 2})`}
                >
                  Quantity (Units)
                </text>
              )}

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

          {hovered && (
            <div
              className="pointer-events-none absolute z-10 border border-[#C6C6C6] bg-white px-2 py-1.5 text-[10px] shadow-[0_4px_10px_rgba(15,29,36,0.12)]"
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
                <span className="font-bold text-[#0F1D24]">{hovered.hour}</span>
                <span
                  className="border px-1.5 py-0.5 text-[9px] font-bold"
                  style={{
                    background: SHIFT_COLORS[hovered.shift].swatch,
                    borderColor: "#0F1D24",
                    color: hovered.shift === "A" ? "#0F1D24" : "#FDC94D",
                  }}
                >
                  Shift {hovered.shift}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#9B9B9B]">Target</span>
                <span className="font-mono font-semibold text-[#9B9B9B]">
                  {hovered.target}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#9B9B9B]">Actual</span>
                <span className="font-mono font-semibold text-[#0F1D24]">
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