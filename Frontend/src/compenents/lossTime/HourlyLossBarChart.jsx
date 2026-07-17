import React, { useState, useRef, useEffect, useMemo } from "react";
import ChartCard from "../../compenents/productionDashboard/ChartCard";

const MIN_HEIGHT = 160;

// Shift A: 08:00 -> 20:00, Shift B: 20:00 -> 08:00 (next day)
const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];

const SHIFT_COLORS = {
  A: { band: "#FDC94D22", swatch: "#FDC94D", border: "#FDC94D" }, // gold — Day
  B: { band: "#0F1D2414", swatch: "#0F1D24", border: "#0F1D24" }, // navy — Night
};

const formatHour = (h) => `${String(h).padStart(2, "0")}:00`;

// Inline icons — no external icon library.
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

const buildShiftData = (data) => {
  const byHour = new Map((data || []).map((d) => [d.hour, d.lossMinutes]));
  return ORDERED_HOURS.map((hour) => ({
    hour,
    label: formatHour(hour),
    lossMinutes: byHour.get(hour) || 0,
    shift: SHIFT_A_HOURS.includes(hour) ? "A" : "B",
  }));
};

// Pure SVG chart + resize-aware layout — shared by the card and the
// full-page zoomed view so the same drawing logic powers both.
const Chart = ({ chartData }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 700, height: 260 });

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
    : { top: 58, right: 12, bottom: 40, left: 36 };

  const chartW = Math.max(width - PADDING.left - PADDING.right, 10);
  const chartH = Math.max(height - PADDING.top - PADDING.bottom, 10);

  const { bars, maxVal, yTicks, shiftSegments } = useMemo(() => {
    if (width === 0) return { bars: [], maxVal: 0, yTicks: [], shiftSegments: [] };

    const max = Math.max(...chartData.map((d) => d.lossMinutes || 0), 1);
    const niceMax = Math.ceil(max * 1.2);

    const groupW = chartW / chartData.length;
    const barGap = compact ? 3 : 5;
    const barW = Math.max(groupW - barGap, 2);

    const computed = chartData.map((d, i) => {
      const groupX = PADDING.left + groupW * i;
      const barH = (Math.max(d.lossMinutes || 0, 0) / niceMax) * chartH;
      return {
        ...d,
        groupX,
        groupW,
        barX: groupX + barGap / 2,
        barW,
        barH,
        barY: PADDING.top + chartH - barH,
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
        segments.push({ shift: b.shift, startX: b.groupX, endX: b.groupX + b.groupW, count: 1 });
      }
    });

    return { bars: computed, maxVal: niceMax, yTicks: ticks, shiftSegments: segments };
  }, [chartData, chartW, chartH, width, compact, PADDING.left, PADDING.top]);

  const hovered = hoverIdx !== null ? bars[hoverIdx] : null;

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full">
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
            y1={PADDING.top - (compact ? 16 : 26)}
            y2={PADDING.top + chartH}
            stroke="#0F1D24"
            strokeWidth={1.5}
          />
        )}

        {shiftSegments.map((seg, i) => {
          const cx = (seg.startX + seg.endX) / 2;
          const pillW = compact ? 52 : 66;
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
                x={PADDING.left - 6}
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
              x={b.barX}
              y={b.barY}
              width={b.barW}
              height={b.barH}
              rx={2}
              fill={hoverIdx === i ? "#1a2e38" : "#0F1D24"}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.6}
              style={{
                transformOrigin: `${b.barX + b.barW / 2}px ${PADDING.top + chartH}px`,
                animation: `growBar 500ms ease-out ${i * 18}ms both`,
                transition: "opacity 150ms ease, fill 150ms ease",
              }}
            />
            {!compact && b.lossMinutes > 0 && (
              <text
                x={b.barX + b.barW / 2}
                y={b.barY - 4}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill="#0F1D24"
                fontFamily="ui-monospace, monospace"
                style={{
                  opacity: 0,
                  animation: `fadeInLabel 300ms ease-out ${i * 18 + 420}ms forwards`,
                }}
              >
                {b.lossMinutes}
              </text>
            )}
          </g>
        ))}

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
            {String(b.hour).padStart(2, "0")}
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
          Hour of Day (Shift A starts 08:00)
        </text>

        {!compact && (
          <text
            x={12}
            y={PADDING.top + chartH / 2}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#0F1D24"
            transform={`rotate(-90, 12, ${PADDING.top + chartH / 2})`}
          >
            Loss (Minutes)
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

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 rounded border border-[#C6C6C6]/60 bg-white px-2 py-1.5 text-[10px] shadow-md"
          style={{
            left: `${Math.min(
              Math.max(((hovered.groupX + hovered.groupW / 2) / width) * 100, 10),
              90
            )}%`,
            top: 4,
            transform: "translateX(-50%)",
          }}
        >
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="font-semibold text-[#0F1D24]">{hovered.label}</span>
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
            <span className="text-[#9B9B9B]">Loss</span>
            <span className="font-mono font-semibold text-[#0F1D24]">
              {hovered.lossMinutes}m
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const HourlyLossBarChart = ({ data, loading }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const chartData = useMemo(() => buildShiftData(data), [data]);
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
      <ChartCard
        icon={<ChartIcon className="h-3 w-3 text-[#FDC94D]" />}
        iconBg="#0F1D24"
        title="Hourly Loss Time"
        subtitle="Shift A (08:00–20:00) · Shift B (20:00–08:00)"
        full
      >
        {loading ? (
          <div className="flex h-full min-h-[160px] items-center justify-center text-[11px] text-[#9B9B9B]">
            Loading hourly data...
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            {/* Legend + Peak + Zoom */}
            <div className="mb-1 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 pr-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-[#FDC94D]/50 bg-[#FDC94D]/10 px-2 py-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: SHIFT_COLORS.A.swatch }} />
                  <span className="text-[10px] font-semibold text-[#0F1D24]">Shift A · 08:00–20:00</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-[#0F1D24]/20 bg-[#0F1D24]/5 px-2 py-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: SHIFT_COLORS.B.swatch }} />
                  <span className="text-[10px] font-semibold text-[#0F1D24]">Shift B · 20:00–08:00</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Peak Hour</p>
                  <p className="text-xs font-extrabold text-[#0F1D24]">
                    {hasData ? formatHour(peak.hour) : "-"}
                    <span className="ml-1 text-[9px] font-semibold text-[#9B9B9B]">
                      ({peak?.lossMinutes || 0}m)
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setIsZoomed(true)}
                  className="flex h-6 items-center gap-1 rounded bg-[#0F1D24] px-2 text-[9px] font-semibold text-[#FDC94D] transition hover:bg-[#1a2e38]"
                >
                  <ExpandIcon className="h-2.5 w-2.5" />
                  Zoom
                </button>
              </div>
            </div>

            {!hasData && (
              <div className="mb-1 flex-shrink-0 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
                No downtime recorded for this date — showing 0 for every hour.
              </div>
            )}

            <div className="min-h-0 flex-1">
              <Chart chartData={chartData} />
            </div>

            <div className="mt-1 flex flex-shrink-0 items-center justify-end border-t border-[#C6C6C6]/40 pt-1">
              <span className="text-[9px] font-semibold text-[#9B9B9B]">
                Total Loss: <span className="text-[#0F1D24]">{totalLoss}m</span>
              </span>
            </div>
          </div>
        )}
      </ChartCard>

      {/* Full-page zoom view */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6]/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded shadow-sm" style={{ background: "#0F1D24" }}>
                <ChartIcon className="h-3.5 w-3.5 text-[#FDC94D]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F1D24]">Hourly Loss Time · Expanded View</h2>
                <p className="text-[10px] text-[#9B9B9B]">Shift A (08:00–20:00) · Shift B (20:00–08:00)</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Peak Hour</p>
                <p className="text-lg font-extrabold text-[#0F1D24]">
                  {hasData ? formatHour(peak.hour) : "-"}
                  <span className="ml-1 text-[10px] font-semibold text-[#9B9B9B]">
                    ({peak?.lossMinutes || 0}m)
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="flex h-8 w-8 items-center justify-center rounded text-[#9B9B9B] transition hover:bg-[#0F1D24]/5"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!hasData && (
            <div className="flex-shrink-0 border-b border-amber-100 bg-amber-50 px-5 py-1.5 text-[10px] font-medium text-amber-700">
              No downtime recorded for this date — showing 0 for every hour.
            </div>
          )}

          <div className="min-h-0 flex-1 px-6 py-4">
            <Chart chartData={chartData} />
          </div>

          <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/40 bg-[#0F1D24]/[0.02] px-5 py-2">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-[#9B9B9B]">
                <span className="h-2 w-2 rounded-full" style={{ background: SHIFT_COLORS.A.swatch }} /> Shift A
              </span>
              <span className="flex items-center gap-1 text-[#9B9B9B]">
                <span className="h-2 w-2 rounded-full" style={{ background: SHIFT_COLORS.B.swatch }} /> Shift B
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#9B9B9B]">
              Total Loss: <span className="text-[#0F1D24]">{totalLoss}m</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default HourlyLossBarChart;