import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FaClipboardCheck, FaArrowTrendUp, FaCircleExclamation } from "react-icons/fa6";

const PLANNED_COLOR = "#0F1D24";
const UNPLANNED_COLOR = "#FDC94D";

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const share = total ? ((item.count / total) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-[180px] rounded border border-[#C6C6C6]/60 bg-white p-2 shadow-xl">
      <h3 className="mb-1 border-b border-[#C6C6C6]/40 pb-1 text-[10px] font-bold text-[#0F1D24]">
        {item.type}
      </h3>
      <div className="space-y-0.5 text-[9px]">
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Count</span>
          <span className="font-bold" style={{ color: item.color }}>{item.count}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Share</span>
          <span className="font-semibold text-[#0F1D24]">{share}%</span>
        </div>
      </div>
    </div>
  );
};

const renderValueLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 12;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#0F1D24" fontSize={9} fontWeight={700} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {value}
    </text>
  );
};

// `full` (default true): stretches to fill the parent's height, meant to
// live inside a fixed-height grid cell so the page never needs to scroll.
const PlannedUnplannedCard = ({ plannedVsUnplanned = { planned: 0, unplanned: 0 }, full = true }) => {
  const { merged, total } = useMemo(() => {
    const planned = plannedVsUnplanned.planned || 0;
    const unplanned = plannedVsUnplanned.unplanned || 0;
    const list = [
      { type: "Planned", count: planned, color: PLANNED_COLOR },
      { type: "Unplanned", count: unplanned, color: UNPLANNED_COLOR },
    ].sort((a, b) => b.count - a.count);
    return { merged: list, total: planned + unplanned };
  }, [plannedVsUnplanned]);

  const pieSlices = useMemo(() => merged.filter((i) => i.count > 0), [merged]);
  const hasData = total > 0;
  const leading = merged[0];

  return (
    <div
      className={`flex ${
        full ? "h-full" : ""
      } min-h-0 flex-col overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm`}
    >
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaClipboardCheck className="text-[10px] text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Planned vs Unplanned
            </h2>
            <p className="text-[9px] text-[#9B9B9B]">Mould change breakdown</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-medium uppercase tracking-wide text-[#9B9B9B]">Total</p>
          <h2 className="text-sm font-extrabold text-[#0F1D24]">{total}</h2>
        </div>
      </div>

      <div className="grid flex-shrink-0 grid-cols-2 divide-x divide-[#C6C6C6]/40 border-y border-[#C6C6C6]/40 bg-[#F5F5F5]/70">
        <div className="flex items-center gap-1.5 px-2 py-1">
          <FaArrowTrendUp className="shrink-0 text-[10px]" style={{ color: leading?.color }} />
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Leading Type</p>
            <h3 className="truncate text-[10px] font-bold text-[#0F1D24]">{hasData ? leading?.type || "-" : "-"}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1">
          <FaCircleExclamation className="shrink-0 text-[10px] text-[#9B9B9B]" />
          <div>
            <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Peak Value</p>
            <h3 className="text-[10px] font-bold" style={{ color: leading?.color }}>
              {hasData ? leading?.count || 0 : 0}
            </h3>
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-medium text-amber-700">
          <FaCircleExclamation className="shrink-0 text-[10px] text-amber-500" />
          <span>No planned or unplanned mould changes recorded for this date — showing 0 for both.</span>
        </div>
      )}

      {/* Body fills remaining space; pie + list both scale to the cell height */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5 sm:flex-row">
        <div className="mx-auto h-32 w-full shrink-0 sm:mx-0 sm:h-full sm:w-[42%] sm:min-w-[150px]">
          {pieSlices.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieSlices}
                  dataKey="count"
                  nameKey="type"
                  innerRadius="42%"
                  outerRadius="68%"
                  paddingAngle={2}
                  animationDuration={800}
                  label={renderValueLabel}
                  labelLine={false}
                >
                  {pieSlices.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded border border-dashed border-[#C6C6C6] text-center text-[10px] text-[#9B9B9B]">
              No mould changes
              <br />
              for this date
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <ul className="space-y-0.5">
            {merged.map((item) => {
              const share = total ? ((item.count / total) * 100).toFixed(1) : 0;
              return (
                <li key={item.type} className="flex items-center justify-between gap-1.5 rounded px-1 py-0.5 text-[9px] hover:bg-[#F5F5F5]">
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-[#0F1D24]" title={item.type}>{item.type}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`font-semibold ${item.count ? "text-[#0F1D24]" : "text-[#9B9B9B]"}`}>{item.count}</span>
                    <span className="w-9 text-right text-[#9B9B9B]">{share}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
        <span className="text-[9px] text-[#9B9B9B]">2 types tracked</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#0F1D24]" />
            <span className="text-[9px] text-[#9B9B9B]">Planned</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#FDC94D]" />
            <span className="text-[9px] text-[#9B9B9B]">Unplanned</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannedUnplannedCard;