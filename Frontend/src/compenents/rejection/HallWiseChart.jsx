import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
} from "recharts";
import { FaIndustry, FaExclamationTriangle } from "react-icons/fa";

const barColor = (rank, total) => {
  const t = total > 1 ? rank / (total - 1) : 0;
  const start = [96, 165, 250];
  const end = [30, 58, 138];
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgb(${r},${g},${b})`;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { hall, qty } = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 shadow-md">
      <p className="text-[11px] font-semibold text-slate-700">{hall}</p>
      <p className="text-xs font-bold text-blue-600">{qty} Qty</p>
    </div>
  );
};

// data: [{hall, qty}] from filtered rejections
// allHalls: string[] — full list of halls that exist in the plant (from machines)
const HallWiseChart = ({ data = [], allHalls = [] }) => {
  const mergedData = useMemo(() => {
    const qtyMap = {};
    data.forEach((d) => {
      qtyMap[d.hall] = (qtyMap[d.hall] || 0) + Number(d.qty || 0);
    });

    // Base list = known halls; agar allHalls empty hai to jo bhi data mein aaya wahi use karo
    const baseHalls = allHalls.length ? allHalls : Object.keys(qtyMap);

    return baseHalls.map((hall) => ({
      hall,
      qty: qtyMap[hall] || 0,
    }));
  }, [data, allHalls]);

  const sortedData = useMemo(
    () => [...mergedData].sort((a, b) => b.qty - a.qty),
    [mergedData],
  );

  const totalRejectQty = sortedData.reduce((sum, item) => sum + item.qty, 0);
  const avgQty = sortedData.length > 0 ? totalRejectQty / sortedData.length : 0;
  const highestHall = sortedData.length > 0 ? sortedData[0] : null;
  const lowestHall = sortedData.length > 0 ? sortedData[sortedData.length - 1] : null;
  const noHallsKnown = sortedData.length === 0;
  const noData = totalRejectQty === 0 && !noHallsKnown;
  const maxQty = highestHall ? highestHall.qty : 0;

  return (
    <div className="flex h-full min-h-0 flex-col rounded border border-slate-200 bg-white p-1.5 shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-1.5 border-b border-slate-100 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm">
            <FaIndustry className="text-[11px] text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-semibold text-slate-800">
              Hall Wise Rejection
            </h2>
            <p className="text-[9px] text-slate-500">
              {sortedData.length} halls tracked
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-sm font-bold leading-none text-blue-600">
              {totalRejectQty}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Avg / Hall
            </p>
            <p className="text-sm font-bold leading-none text-slate-800">
              {avgQty.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Warning banner — halls known but no rejections recorded */}
      {noData && (
        <div className="mt-1.5 flex shrink-0 items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
          <FaExclamationTriangle className="text-[10px]" />
          No rejection data for selected filters — showing all {sortedData.length}{" "}
          halls with 0 qty.
        </div>
      )}

      {/* Body */}
      {noHallsKnown ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-400">
          <FaExclamationTriangle className="text-lg opacity-50" />
          <p className="text-xs">Hall list unavailable — check machines data</p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 pt-1.5 lg:grid-cols-[1.4fr_1fr]">
          {/* Chart */}
          <div className="min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
                barCategoryGap={18}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="hall"
                  tick={{ fontSize: 10, fill: "#475569" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  width={24}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.06)" }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="qty" name="Reject Qty" radius={[5, 5, 0, 0]} maxBarSize={40}>
                  {sortedData.map((entry, index) => (
                    <Cell
                      key={entry.hall}
                      fill={
                        entry.qty === 0
                          ? "#e2e8f0"
                          : barColor(index, sortedData.length)
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="qty"
                    position="top"
                    fontSize={10}
                    fontWeight={600}
                    fill="#1e293b"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranked breakdown list */}
          <div className="flex min-h-0 flex-col gap-1 overflow-y-auto rounded border border-slate-100 bg-slate-50/60 p-1">
            {sortedData.map((item, index) => {
              const pct = totalRejectQty > 0 ? (item.qty / totalRejectQty) * 100 : 0;
              const barPct = maxQty > 0 ? (item.qty / maxQty) * 100 : 0;

              return (
                <div
                  key={item.hall}
                  className="flex items-center gap-2 rounded bg-white px-2 py-1.5 shadow-sm"
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: barColor(index, sortedData.length) }}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[10px] font-semibold text-slate-700">
                        {item.hall}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600">
                        {item.qty}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-slate-100">
                      <div
                        className="h-full rounded transition-all duration-700"
                        style={{
                          width: `${barPct}%`,
                          backgroundColor: barColor(index, sortedData.length),
                        }}
                      />
                    </div>
                  </div>

                  <span className="w-8 shrink-0 text-right text-[9px] font-medium text-slate-400">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Best/Worst strip — only meaningful when there's real data */}
      {!noHallsKnown && !noData && (
        <div className="mt-1.5 grid shrink-0 grid-cols-2 gap-2">
          <div className="flex items-center justify-between rounded bg-red-50 px-2 py-1">
            <span className="text-[9px] font-medium text-red-700">Highest</span>
            <span className="text-[10px] font-bold text-red-700">
              {highestHall?.hall} · {highestHall?.qty}
            </span>
          </div>
          <div className="flex items-center justify-between rounded bg-green-50 px-2 py-1">
            <span className="text-[9px] font-medium text-green-700">Lowest</span>
            <span className="text-[10px] font-bold text-green-700">
              {lowestHall?.hall} · {lowestHall?.qty}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallWiseChart;