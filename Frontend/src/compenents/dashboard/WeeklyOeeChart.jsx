import React, { useState, useRef, useEffect, useMemo } from "react";
import ChartCard from "../productionDashboard/ChartCard";

const MIN_HEIGHT = 200;
const MAX_VALUE = 100;
const OEE_COLOR = "#0F1D24";

const DAY_BAND_COLORS = ["#FFFFFF", "#0F1D2410"];

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

const Chart = ({ chartData }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 700, height: 300 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: Math.max(entry.contentRect.height, MIN_HEIGHT),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const PADDING = { top: 34, right: 16, bottom: 30, left: 34 };

  const chartW = Math.max(width - PADDING.left - PADDING.right, 10);
  const chartH = Math.max(height - PADDING.top - PADDING.bottom, 10);

  const { bars, yTicks } = useMemo(() => {
    if (width === 0) return { bars: [], yTicks: [] };

    const groupW = chartW / chartData.length;
    const barW = Math.max(groupW * 0.5, 16);

    const computed = chartData.map((d, i) => {
      const groupX = PADDING.left + groupW * i;
      const value = Math.max(Math.min(d.oee || 0, MAX_VALUE), 0);
      const barH = (value / MAX_VALUE) * chartH;
      return {
        day: d.day,
        groupX,
        groupW,
        centerX: groupX + groupW / 2,
        value,
        barX: groupX + (groupW - barW) / 2,
        barW,
        barH,
        barY: PADDING.top + chartH - barH,
      };
    });

    const tickCount = 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((MAX_VALUE / tickCount) * i));

    return { bars: computed, yTicks: ticks };
  }, [chartData, chartW, chartH, width, PADDING.left, PADDING.top]);

  const hovered = hoverIdx !== null ? bars[hoverIdx] : null;

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full">
      <style>{`
        @keyframes growBar2 { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      `}</style>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="block" preserveAspectRatio="none">
        {bars.map((g, i) => (
          <rect key={`band-${i}`} x={g.groupX} y={PADDING.top} width={g.groupW} height={chartH} fill={DAY_BAND_COLORS[i % 2]} />
        ))}

        {bars.slice(1).map((g, i) => (
          <line key={`div-${i}`} x1={g.groupX} x2={g.groupX} y1={PADDING.top} y2={PADDING.top + chartH} stroke="#D8DADE" strokeWidth={1} />
        ))}

        {yTicks.map((tick, i) => {
          const y = PADDING.top + chartH - (tick / MAX_VALUE) * chartH;
          return (
            <g key={i}>
              <line x1={PADDING.left} x2={width - PADDING.right} y1={y} y2={y} stroke="#EFEFEF" strokeWidth={1} />
              <text x={PADDING.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#9B9B9B" fontFamily="ui-monospace, monospace">
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
              rx={3}
              fill={OEE_COLOR}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.4}
              style={{
                transformOrigin: `${b.barX + b.barW / 2}px ${PADDING.top + chartH}px`,
                animation: `growBar2 500ms ease-out ${i * 40}ms both`,
                transition: "opacity 150ms ease",
              }}
            />
            {b.value > 0 && (
              <text
                x={b.barX + b.barW / 2}
                y={Math.max(b.barY - 6, PADDING.top - 2)}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill="#0F1D24"
              >
                {b.value}%
              </text>
            )}
          </g>
        ))}

        {bars.map((g, i) => (
          <text
            key={`label-${i}`}
            x={g.centerX}
            y={height - PADDING.bottom + 18}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#0F1D24"
          >
            {g.day}
          </text>
        ))}

        {bars.map((g, i) => (
          <rect
            key={`hover-${i}`}
            x={g.groupX}
            y={PADDING.top}
            width={g.groupW}
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
          className="pointer-events-none absolute z-10 rounded-md border border-[#C6C6C6] bg-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${Math.min(Math.max((hovered.centerX / width) * 100, 14), 86)}%`,
            top: 4,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold text-[#0F1D24]">{hovered.day}</div>
          <div className="font-mono font-bold" style={{ color: OEE_COLOR }}>
            OEE {hovered.value}%
          </div>
        </div>
      )}
    </div>
  );
};

const WeeklyOeeChart = ({ className, data = [], loading }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const hasData = useMemo(() => data.some((d) => (d.oee || 0) > 0), [data]);

  const bestDay = useMemo(() => data.reduce((a, b) => ((b.oee || 0) > (a?.oee ?? -1) ? b : a), null), [data]);
  const avgOee = useMemo(
    () => (data.length ? Math.round(data.reduce((sum, d) => sum + (d.oee || 0), 0) / data.length) : 0),
    [data]
  );

  return (
    <div className={`min-h-0 ${className || ""}`}>
      <ChartCard
        icon={<ChartIcon className="h-3 w-3 text-[#FDC94D]" />}
        iconBg="#0F1D24"
        title="Last 7 Days · OEE"
        subtitle="OEE = Availability × Performance × Quality"
        full
      >
        {loading ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-[11px] text-[#9B9B9B]">
            Loading weekly data...
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div className="mb-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-[#0F1D24]/20 bg-[#0F1D24]/5 px-2.5 py-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: OEE_COLOR }} />
                <span className="text-[11px] font-semibold text-[#0F1D24]">OEE</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Best Day</p>
                  <p className="text-xs font-extrabold text-[#0F1D24]">
                    {bestDay ? bestDay.day : "-"}
                    <span className="ml-1 text-[9px] font-semibold text-[#9B9B9B]">({bestDay?.oee || 0}%)</span>
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
                No performance data recorded yet — showing 0% for every day.
              </div>
            )}

            <div className="min-h-0 flex-1">
              <Chart chartData={data} />
            </div>

            <div className="mt-1 flex flex-shrink-0 items-center justify-end border-t border-[#C6C6C6]/40 pt-1">
              <span className="text-[9px] font-semibold text-[#9B9B9B]">
                Avg OEE: <span className="text-[#0F1D24]">{avgOee}%</span>
              </span>
            </div>
          </div>
        )}
      </ChartCard>

      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6]/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded shadow-sm" style={{ background: "#0F1D24" }}>
                <ChartIcon className="h-3.5 w-3.5 text-[#FDC94D]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F1D24]">Weekly OEE · Expanded View</h2>
                <p className="text-[10px] text-[#9B9B9B]">OEE = Availability × Performance × Quality — last 7 days</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Best Day</p>
                <p className="text-lg font-extrabold text-[#0F1D24]">
                  {bestDay ? bestDay.day : "-"}
                  <span className="ml-1 text-[10px] font-semibold text-[#9B9B9B]">({bestDay?.oee || 0}%)</span>
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
              No performance data recorded yet — showing 0% for every day.
            </div>
          )}

          <div className="min-h-0 flex-1 px-6 py-4">
            <Chart chartData={data} />
          </div>

          <div className="flex flex-shrink-0 items-center justify-end border-t border-[#C6C6C6]/40 bg-[#0F1D24]/[0.02] px-5 py-2">
            <span className="text-[10px] font-semibold text-[#9B9B9B]">
              Avg OEE: <span className="text-[#0F1D24]">{avgOee}%</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyOeeChart;