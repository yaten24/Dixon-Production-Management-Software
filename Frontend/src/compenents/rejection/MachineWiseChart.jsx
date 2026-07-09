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
import { FaCogs } from "react-icons/fa";

// Darker green for the top offenders, fading out for the rest
const barColor = (rank, total) => {
  const t = total > 1 ? rank / (total - 1) : 0;
  const start = [52, 211, 153]; // emerald-400
  const end = [6, 78, 59]; // emerald-900
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgb(${r},${g},${b})`;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { machine, qty } = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 shadow-md">
      <p className="text-[11px] font-semibold text-slate-700">{machine}</p>
      <p className="text-xs font-bold text-green-600">{qty} Qty</p>
    </div>
  );
};

const MachineWiseChart = ({ data = [] }) => {
  const chartData = useMemo(() => {
    return [...data].sort((a, b) => Number(b.qty || 0) - Number(a.qty || 0));
  }, [data]);

  const totalRejectQty = chartData.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  const highestMachine = chartData.length > 0 ? chartData[0] : null;
  const isEmpty = chartData.length === 0;

  // Tight per-row height so many machines fit in minimal space
  const chartHeight = Math.max(180, chartData.length * 20);

  return (
    <div className="rounded border border-slate-200 bg-white p-1 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-emerald-500 to-emerald-700">
            <FaCogs className="text-[11px] text-white" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-800">
              Machine Wise Rejection Analysis
            </h2>
            <p className="text-[10px] text-slate-500">
              Rejection qty comparison across machines
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-sm font-bold leading-none text-green-600">
              {totalRejectQty}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Top Machine
            </p>
            <p className="text-[11px] font-semibold leading-none text-slate-800">
              {highestMachine?.machine || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {isEmpty ? (
        <div className="flex h-[180px] flex-col items-center justify-center gap-1.5 text-slate-400">
          <FaCogs className="text-lg opacity-40" />
          <p className="text-xs">No machine data available</p>
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto pt-1">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 4, right: 32, left: 0, bottom: 4 }}
              barCategoryGap={3}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                horizontal={false}
              />

              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                height={16}
              />

              <YAxis
                type="category"
                dataKey="machine"
                width={96}
                tick={{ fontSize: 10.5, fill: "#334155" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(16,185,129,0.06)" }}
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="qty"
                name="Reject Qty"
                radius={[0, 4, 4, 0]}
                animationDuration={800}
                maxBarSize={11}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.machine}
                    fill={
                      Number(entry.qty || 0) === 0
                        ? "#e2e8f0"
                        : barColor(index, chartData.length)
                    }
                  />
                ))}
                <LabelList
                  dataKey="qty"
                  position="right"
                  fontSize={10}
                  fontWeight={600}
                  fill="#1e293b"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MachineWiseChart;