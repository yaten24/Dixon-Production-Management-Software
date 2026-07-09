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
import { FaChartBar } from "react-icons/fa";

const ALL_REJECTION_REASONS = [
  "Short Moulding",
  "Silver Mark",
  "Black Spot",
  "Colour Change",
  "Colour Variation",
  "Warpage",
  "Flow Mark",
  "Cut Mark",
  "Shrinkage",
  "Missing",
  "Burn Mark",
  "Weld Mark",
  "Other",
];

// Darker red for the top offenders, fading out for the rest
const barColor = (rank, total) => {
  const t = total > 1 ? rank / (total - 1) : 0;
  const start = [248, 113, 113]; // red-400
  const end = [136, 19, 55]; // rose-900
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgb(${r},${g},${b})`;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { reason, qty } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-700">{reason}</p>
      <p className="mt-0.5 text-sm font-bold text-red-600">{qty} Qty</p>
    </div>
  );
};

const RejectionReasonChart = ({ data = [] }) => {
  const chartData = useMemo(() => {
    const reasonMap = {};

    ALL_REJECTION_REASONS.forEach((reason) => {
      reasonMap[reason] = {
        reason,
        qty: 0,
      };
    });

    data.forEach((item) => {
      const qty = Number(item.qty || item.rejectQty || 0);

      if (reasonMap[item.reason]) {
        reasonMap[item.reason].qty += qty;
      }
    });

    return Object.values(reasonMap).sort((a, b) => b.qty - a.qty);
  }, [data]);

  const totalRejectQty = chartData.reduce((sum, item) => sum + item.qty, 0);
  const highestReason = chartData.length > 0 ? chartData[0] : null;
  const isEmpty = chartData.every((item) => item.qty === 0);

  // Dynamic height so 13 horizontal bars always have breathing room
  const chartHeight = Math.max(360, chartData.length * 34);

  return (
    <div className="rounded border border-slate-200 bg-white p-1 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-red-500 to-rose-600 shadow-sm">
            <FaChartBar className="text-sm text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Rejection Reason Analysis
            </h2>
            <p className="text-[11px] text-slate-500">
              Quality defect distribution by rejection reason
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total Rejection
            </p>
            <p className="text-xl font-bold text-red-600">{totalRejectQty}</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Top Reason
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {highestReason?.reason || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {isEmpty ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-slate-400">
          <FaChartBar className="text-2xl opacity-40" />
          <p className="text-sm">No rejection data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 2, right: 2, left: 0, bottom: 2 }}
            barCategoryGap={10}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              horizontal={false}
            />

            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />

            <YAxis
              type="category"
              dataKey="reason"
              width={110}
              tick={{ fontSize: 12, fill: "#334155" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "rgba(220,38,38,0.06)" }}
              content={<CustomTooltip />}
            />

            <Bar
              dataKey="qty"
              name="Reject Qty"
              radius={[0, 4, 4, 0]}
              animationDuration={1000}
              maxBarSize={20}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.reason}
                  fill={
                    entry.qty === 0
                      ? "#e2e8f0"
                      : barColor(index, chartData.length)
                  }
                />
              ))}
              <LabelList
                dataKey="qty"
                position="right"
                fontSize={12}
                fontWeight={600}
                fill="#1e293b"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RejectionReasonChart;
