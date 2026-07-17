import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FaExclamationTriangle } from "react-icons/fa";

const COLORS = [
  "#dc2626", "#2563eb", "#f59e0b", "#10b981", "#7c3aed",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6",
  "#64748b", "#8b5cf6", "#ef4444",
];

// data: [{reason, qty}] filtered rejections
// allReasons: string[] — full list of rejection reasons (from rejection-reasons master)
const RejectionPieChart = ({ data = [], allReasons = [] }) => {
  const mergedData = useMemo(() => {
    const qtyMap = {};
    data.forEach((d) => {
      qtyMap[d.reason] = (qtyMap[d.reason] || 0) + Number(d.qty || 0);
    });

    const baseReasons = allReasons.length ? allReasons : Object.keys(qtyMap);

    return baseReasons.map((reason) => ({
      reason,
      qty: qtyMap[reason] || 0,
    }));
  }, [data, allReasons]);

  const totalRejectQty = mergedData.reduce((sum, item) => sum + item.qty, 0);
  const noReasonsKnown = mergedData.length === 0;
  const noData = totalRejectQty === 0 && !noReasonsKnown;

  const pieSlices = useMemo(
    () => [...mergedData].filter((i) => i.qty > 0).sort((a, b) => b.qty - a.qty),
    [mergedData],
  );

  const highestReason = pieSlices.length > 0 ? pieSlices[0] : null;

  return (
    <div className="flex h-full min-h-0 flex-col rounded border border-slate-200 bg-white p-1.5 shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-1.5 border-b border-slate-100 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[11px] font-semibold text-slate-800">
            Rejection Distribution
          </h2>
          <p className="text-[9px] text-slate-500">
            {mergedData.length} reasons tracked
          </p>
        </div>

        <div className="flex gap-3">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-sm font-bold leading-none text-red-600">
              {totalRejectQty}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Top Reason
            </p>
            <p className="text-[10px] font-semibold leading-none text-slate-800">
              {highestReason?.reason || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      {noData && (
        <div className="mt-1.5 flex shrink-0 items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
          <FaExclamationTriangle className="text-[10px]" />
          No rejection data for selected filters — {mergedData.length} reasons
          tracked, all at 0 qty.
        </div>
      )}

      {/* Body */}
      {noReasonsKnown ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-400">
          <FaExclamationTriangle className="text-lg opacity-50" />
          <p className="text-xs">Reason list unavailable</p>
        </div>
      ) : noData ? (
        // Zero-state: no pie possible (all 0), show the reason list with 0 qty instead
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5 overflow-y-auto pt-1 sm:grid-cols-3">
          {mergedData.map((item, idx) => (
            <div
              key={item.reason}
              className="flex flex-col items-start justify-center rounded border border-slate-100 bg-slate-50 px-2 py-1.5"
            >
              <span
                className="mb-0.5 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="truncate text-[10px] font-medium text-slate-600">
                {item.reason}
              </span>
              <span className="text-xs font-bold text-slate-400">0</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieSlices}
                dataKey="qty"
                nameKey="reason"
                innerRadius="45%"
                outerRadius="72%"
                paddingAngle={2}
                animationDuration={900}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieSlices.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [value, "Reject Qty"]}
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  fontSize: "11px",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={28}
                wrapperStyle={{ fontSize: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center KPI */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-6">
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-wide text-slate-500">
                Total
              </p>
              <h2 className="text-xl font-bold text-slate-800">{totalRejectQty}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectionPieChart;