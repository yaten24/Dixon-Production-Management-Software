import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#dc2626",
  "#2563eb",
  "#f59e0b",
  "#10b981",
  "#7c3aed",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#14b8a6",
  "#64748b",
  "#8b5cf6",
  "#ef4444",
];

const RejectionPieChart = ({
  data = [],
}) => {
  const chartData = useMemo(() => {
    return [...data]
      .filter(
        (item) =>
          Number(item.qty || 0) > 0
      )
      .sort(
        (a, b) =>
          b.qty - a.qty
      );
  }, [data]);

  const totalRejectQty =
    chartData.reduce(
      (sum, item) =>
        sum +
        Number(item.qty || 0),
      0
    );

  const highestReason =
    chartData.length > 0
      ? chartData[0]
      : null;

  return (
    <div className="bg-white border border-slate-200 p-5">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 pb-4 border-b border-slate-200">

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Rejection Distribution
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Rejection percentage by defect reason
          </p>
        </div>

        <div className="flex gap-8">

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total Reject
            </p>

            <p className="text-2xl font-bold text-red-600">
              {totalRejectQty}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Top Reason
            </p>

            <p className="text-sm font-semibold text-slate-800">
              {highestReason?.reason ||
                "N/A"}
            </p>
          </div>

        </div>

      </div>

      {/* Empty State */}

      {chartData.length === 0 ? (
        <div className="h-[420px] flex items-center justify-center text-slate-400">
          No Rejection Data Available
        </div>
      ) : (
        <div className="relative">

          <ResponsiveContainer
            width="100%"
            height={450}
          >
            <PieChart>

              <Pie
                data={chartData}
                dataKey="qty"
                nameKey="reason"
                innerRadius={90}
                outerRadius={140}
                paddingAngle={2}
                animationDuration={1200}
                label={({
                  percent,
                }) =>
                  `${(
                    percent * 100
                  ).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map(
                  (
                    entry,
                    index
                  ) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip
                formatter={(
                  value
                ) => [
                  value,
                  "Reject Qty",
                ]}
                contentStyle={{
                  border:
                    "1px solid #e2e8f0",
                  background:
                    "#ffffff",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={50}
              />

            </PieChart>
          </ResponsiveContainer>

          {/* Center KPI */}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

            <div className="text-center">

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total
              </p>

              <h2 className="text-4xl font-bold text-slate-800">
                {totalRejectQty}
              </h2>

              <p className="text-xs text-slate-400">
                Rejections
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default RejectionPieChart;