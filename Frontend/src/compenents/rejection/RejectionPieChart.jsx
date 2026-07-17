import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FaBan } from "react-icons/fa";
import { FaArrowTrendUp, FaCircleExclamation } from "react-icons/fa6";

const COLORS = [
  "#0F1D24", "#FDC94D", "#6B8894", "#DC2626", "#9BB4BE", "#B4884A",
  "#3A5561", "#C6C6C6", "#0F1D24", "#FDC94D", "#6B8894", "#DC2626",
  "#9BB4BE", "#B4884A", "#3A5561", "#C6C6C6", "#0F1D24", "#FDC94D", "#9B9B9B",
];

const CustomTooltip = ({ active, payload, totalRejectQty }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const share = totalRejectQty ? ((item.qty / totalRejectQty) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-[180px] rounded border border-[#C6C6C6]/60 bg-white p-2 shadow-xl">
      <h3 className="mb-1 border-b border-[#C6C6C6]/40 pb-1 text-[10px] font-bold text-[#0F1D24]">
        {item.reason}
      </h3>
      <div className="space-y-0.5 text-[9px]">
        <div className="flex items-center justify-between">
          <span className="text-[#9B9B9B]">Reject Qty</span>
          <span className="font-bold text-red-600">{item.qty}</span>
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
// `allReasons`: full master list of rejection reasons — pass this (e.g. the
// rejection-reasons master, as strings or {id, name} objects) so the chart
// always shows every reason and can warn about exactly which ones have no
// rejections for the selected filters, instead of only ever knowing about
// reasons that happened to appear in `data`.
const RejectionPieChart = ({ data = [], allReasons = [], full = true }) => {
  const { merged, missingReasons, reasonCount } = useMemo(() => {
    const qtyMap = {};
    data.forEach((d) => {
      qtyMap[d.reason] = (qtyMap[d.reason] || 0) + Number(d.qty || 0);
    });

    const names = allReasons.length
      ? allReasons.map((r) => (typeof r === "string" ? r : r.name))
      : Object.keys(qtyMap);

    const missing = [];
    const filled = names.map((reason) => {
      if (!(reason in qtyMap)) missing.push(reason);
      return { reason, qty: qtyMap[reason] || 0 };
    });
    filled.sort((a, b) => b.qty - a.qty);

    return { merged: filled, missingReasons: missing, reasonCount: names.length };
  }, [data, allReasons]);

  const colorMap = useMemo(() => {
    const alphabetical = [...merged].sort((a, b) => a.reason.localeCompare(b.reason));
    return alphabetical.reduce((acc, item, i) => {
      acc[item.reason] = COLORS[i % COLORS.length];
      return acc;
    }, {});
  }, [merged]);

  const totalRejectQty = useMemo(() => merged.reduce((s, i) => s + i.qty, 0), [merged]);
  const pieSlices = useMemo(() => merged.filter((i) => i.qty > 0), [merged]);
  const highestReason = merged[0];
  const noReasonsKnown = merged.length === 0;
  const hasData = totalRejectQty > 0;

  return (
    <div
      className={`flex ${
        full ? "h-full" : ""
      } min-h-0 flex-col overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm`}
    >
      <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <FaBan className="text-[10px] text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
              Rejection Distribution
            </h2>
            <p className="text-[9px] text-[#9B9B9B]">Reject quantity by reason</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-medium uppercase tracking-wide text-[#9B9B9B]">Total Reject</p>
          <h2 className="text-sm font-extrabold text-red-600">
            {totalRejectQty}
            <span className="ml-0.5 text-[9px] font-semibold text-[#9B9B9B]">qty</span>
          </h2>
        </div>
      </div>

      <div className="grid flex-shrink-0 grid-cols-2 divide-x divide-[#C6C6C6]/40 border-y border-[#C6C6C6]/40 bg-[#F5F5F5]/70">
        <div className="flex items-center gap-1.5 px-2 py-1">
          <FaCircleExclamation className="shrink-0 text-[10px] text-red-400" />
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Top Reason</p>
            <h3 className="truncate text-[10px] font-bold text-[#0F1D24]">{hasData ? highestReason?.reason || "-" : "-"}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1">
          <FaArrowTrendUp className="shrink-0 text-[10px] text-red-500" />
          <div>
            <p className="text-[8px] uppercase tracking-wide text-[#9B9B9B]">Peak Value</p>
            <h3 className="text-[10px] font-bold text-red-600">{hasData ? highestReason?.qty || 0 : 0} qty</h3>
          </div>
        </div>
      </div>

      {!noReasonsKnown && !hasData && (
        <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-medium text-amber-700">
          <FaCircleExclamation className="shrink-0 text-[10px] text-amber-500" />
          <span>
            No rejection data for selected filters — showing all {reasonCount} reasons at 0 qty.
          </span>
        </div>
      )}

      {hasData && missingReasons.length > 0 && (
        <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-medium text-amber-700">
          <FaCircleExclamation className="shrink-0 text-[10px] text-amber-500" />
          <span className="truncate">
            No data for {missingReasons.join(", ")} — showing all {reasonCount} reasons (0 where missing).
          </span>
        </div>
      )}

      {noReasonsKnown ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-[#9B9B9B]">
          <FaCircleExclamation className="text-lg opacity-50" />
          <p className="text-[11px]">Reason list unavailable</p>
        </div>
      ) : (
        /* Body fills remaining space; pie + list both scale to the cell height */
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5 sm:flex-row">
          <div className="mx-auto h-32 w-full shrink-0 sm:mx-0 sm:h-full sm:w-[42%] sm:min-w-[150px]">
            {pieSlices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieSlices} dataKey="qty" nameKey="reason" innerRadius="42%" outerRadius="68%" paddingAngle={2} animationDuration={800} label={renderValueLabel} labelLine={false}>
                    {pieSlices.map((entry) => (
                      <Cell key={entry.reason} fill={colorMap[entry.reason]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip totalRejectQty={totalRejectQty} />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded border border-dashed border-[#C6C6C6] text-center text-[10px] text-[#9B9B9B]">
                No rejections recorded
                <br />
                for this selection
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <ul className="space-y-0.5">
              {merged.map((item) => {
                const share = totalRejectQty ? ((item.qty / totalRejectQty) * 100).toFixed(1) : 0;
                return (
                  <li key={item.reason} className="flex items-center justify-between gap-1.5 rounded px-1 py-0.5 text-[9px] hover:bg-[#F5F5F5]">
                    <div className="flex min-w-0 items-center gap-1">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: colorMap[item.reason] }} />
                      <span className="truncate text-[#0F1D24]" title={item.reason}>{item.reason}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className={`font-semibold ${item.qty ? "text-[#0F1D24]" : "text-[#9B9B9B]"}`}>{item.qty}</span>
                      <span className="w-7 text-right text-[#9B9B9B]">{share}%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
        <span className="text-[9px] text-[#9B9B9B]">{reasonCount} reasons tracked</span>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#0F1D24]" />
          <span className="text-[9px] text-[#9B9B9B]">Reject Qty</span>
        </div>
      </div>
    </div>
  );
};

export default RejectionPieChart;