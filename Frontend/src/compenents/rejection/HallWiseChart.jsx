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
import { FaIndustry, FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";

// Darker blue for the top offenders, fading out for the rest
const barColor = (rank, total) => {
  const t = total > 1 ? rank / (total - 1) : 0;
  const start = [96, 165, 250]; // blue-400
  const end = [30, 58, 138]; // blue-900
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgb(${r},${g},${b})`;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { hall, qty } = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-700">{hall}</p>
      <p className="text-sm font-bold text-blue-600">{qty} Qty</p>
    </div>
  );
};

const trendIcon = (qty, avg) => {
  if (qty > avg * 1.05)
    return <FaArrowUp className="text-[10px] text-red-500" />;
  if (qty < avg * 0.95)
    return <FaArrowDown className="text-[10px] text-green-500" />;
  return <FaMinus className="text-[10px] text-slate-400" />;
};

const HallWiseChart = ({ data = [] }) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => Number(b.qty || 0) - Number(a.qty || 0)),
    [data],
  );

  const totalRejectQty = sortedData.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  const avgQty = sortedData.length > 0 ? totalRejectQty / sortedData.length : 0;
  const highestHall = sortedData.length > 0 ? sortedData[0] : null;
  const lowestHall =
    sortedData.length > 0 ? sortedData[sortedData.length - 1] : null;
  const isEmpty = sortedData.length === 0;
  const maxQty = highestHall ? Number(highestHall.qty || 0) : 0;

  return (
    <div className="flex h-full w-full flex-col rounded border border-slate-200 bg-white p-1 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm">
            <FaIndustry className="text-base text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Hall Wise Rejection Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Rejection qty comparison across halls
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-xl font-bold leading-none text-blue-600">
              {totalRejectQty}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Halls Tracked
            </p>
            <p className="text-xl font-bold leading-none text-slate-800">
              {sortedData.length}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Avg / Hall
            </p>
            <p className="text-xl font-bold leading-none text-slate-800">
              {avgQty.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
          <FaIndustry className="text-3xl opacity-40" />
          <p className="text-sm">No hall data available</p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 pt-4 lg:grid-cols-[1.5fr_1fr]">
          {/* Chart */}
          <div className="flex flex-col">
            <div className="min-h-[280px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedData}
                  margin={{ top: 24, right: 16, left: 0, bottom: 4 }}
                  barCategoryGap={28}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="hall"
                    tick={{ fontSize: 12, fill: "#475569" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                    width={32}
                  />

                  <Tooltip
                    cursor={{ fill: "rgba(37,99,235,0.06)" }}
                    content={<CustomTooltip />}
                  />

                  <Bar
                    dataKey="qty"
                    name="Reject Qty"
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                    maxBarSize={56}
                  >
                    {sortedData.map((entry, index) => (
                      <Cell
                        key={entry.hall}
                        fill={
                          Number(entry.qty || 0) === 0
                            ? "#e2e8f0"
                            : barColor(index, sortedData.length)
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="qty"
                      position="top"
                      fontSize={12}
                      fontWeight={600}
                      fill="#1e293b"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Best / Worst strip */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded bg-red-50 px-3 py-2">
                <span className="text-xs font-medium text-red-700">
                  Highest
                </span>
                <span className="text-sm font-bold text-red-700">
                  {highestHall?.hall} · {highestHall?.qty}
                </span>
              </div>
              <div className="flex items-center justify-between rounded bg-green-50 px-3 py-2">
                <span className="text-xs font-medium text-green-700">
                  Lowest
                </span>
                <span className="text-sm font-bold text-green-700">
                  {lowestHall?.hall} · {lowestHall?.qty}
                </span>
              </div>
            </div>
          </div>

          {/* Ranked breakdown list */}
          <div className="flex flex-col gap-2 rounded border border-slate-100 bg-slate-50/60 p-1">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Hall Breakdown
            </p>

            <div className="flex flex-1 flex-col justify-between gap-2">
              {sortedData.map((item, index) => {
                const qty = Number(item.qty || 0);
                const pct =
                  totalRejectQty > 0 ? (qty / totalRejectQty) * 100 : 0;
                const barPct = maxQty > 0 ? (qty / maxQty) * 100 : 0;

                return (
                  <div
                    key={item.hall}
                    className="flex items-center gap-3 rounded bg-white px-3 py-2.5 shadow-sm"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                      style={{
                        backgroundColor: barColor(index, sortedData.length),
                      }}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-semibold text-slate-700">
                          {item.hall}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                          {trendIcon(qty, avgQty)}
                          {qty}
                        </span>
                      </div>

                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded bg-slate-100">
                        <div
                          className="h-full rounded transition-all duration-700"
                          style={{
                            width: `${barPct}%`,
                            backgroundColor: barColor(index, sortedData.length),
                          }}
                        />
                      </div>
                    </div>

                    <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-400">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallWiseChart;
