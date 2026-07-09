import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from "recharts";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

/* ---------- matches dashboard accent family: blue -> indigo -> purple, red kept for alert semantics ---------- */

const rejectionData = [
  { reason: "Short Shot", qty: 420 },
  { reason: "Flash", qty: 320 },
  { reason: "Sink Mark", qty: 210 },
  { reason: "Burn Mark", qty: 120 },
  { reason: "Weld Line", qty: 165 },
  { reason: "Warpage", qty: 140 },
  { reason: "Black Dot", qty: 95 },
  { reason: "Silver Mark", qty: 80 },
  { reason: "Flow Mark", qty: 70 },
  { reason: "Crack", qty: 60 },
];

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
  "#84cc16",
  "#f97316",
];

/* pops the hovered slice out slightly with a soft outer ring */
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 7}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

/* shows the % value directly on slices large enough to hold it */
const renderPercentLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.07) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.62;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 9.5, fontWeight: 700, fill: "#ffffff" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const RejectionAnalysis = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const totalReject = rejectionData.reduce((sum, item) => sum + item.qty, 0);
  const topReason = rejectionData.reduce((a, b) => (a.qty > b.qty ? a : b));
  const rejectionRate = ((totalReject / 65000) * 100).toFixed(2);

  const topFive = [...rejectionData].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const maxQty = topFive[0].qty;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
    >
      {/* ================= Header ================= */}

      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={{ type: "spring", stiffness: 320, damping: 14 }}
            className="flex h-8 w-8 items-center justify-center rounded bg-red-50"
          >
            <HiOutlineExclamationTriangle className="text-[15px] text-red-600" />
          </motion.div>

          <div>
            <h3 className="text-[13px] font-semibold leading-none text-slate-800">
              Rejection Overview
            </h3>
            <p className="mt-1 text-[10px] leading-none text-slate-500">
              Reason Wise Rejection Analysis
            </p>
          </div>
        </div>

        <span className="rounded bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
          Today
        </span>
      </div>

      {/* ================= Content ================= */}

      <div className="flex flex-1 overflow-hidden">
        {/* ================= DONUT CHART ================= */}

        <div className="flex w-[42%] min-w-[190px] items-center justify-center px-1.5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rejectionData}
                dataKey="qty"
                nameKey="reason"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={3}
                cornerRadius={4}
                strokeWidth={0}
                label={renderPercentLabel}
                labelLine={false}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {rejectionData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      filter:
                        activeIndex === null || activeIndex === index
                          ? "none"
                          : "opacity(0.45)",
                      transition: "filter 0.2s ease",
                    }}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [`${value} Nos`, "Reject Qty"]}
                contentStyle={{
                  border: "1px solid #E2E4E9",
                  borderRadius: 8,
                  fontSize: 11,
                  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
                }}
              />

              {/* Center Text */}

              <text
                x="50%"
                y="44%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
              >
                Total
              </text>

              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 20, fill: "#0f172a", fontWeight: 700 }}
              >
                {totalReject}
              </text>

              <text
                x="50%"
                y="65%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 9, fill: "#94a3b8" }}
              >
                Reject Qty
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ================= RIGHT PANEL ================= */}

        <div className="flex flex-1 flex-col justify-between px-3 py-2.5">
          {/* Top Reasons */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[12px] font-semibold text-slate-800">
                Top Reasons
              </h4>
              <span className="text-[10px] font-medium text-slate-400">
                Top 5
              </span>
            </div>

            <div className="space-y-1.5">
              {topFive.map((item, index) => {
                const pctOfTotal = ((item.qty / totalReject) * 100).toFixed(1);
                const barWidth = (item.qty / maxQty) * 100;

                return (
                  <motion.div
                    key={item.reason}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + index * 0.05, duration: 0.25 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-[11px] font-medium text-slate-700">
                          {item.reason}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-[11px] font-semibold text-slate-800">
                          {item.qty}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400">
                          ({pctOfTotal}%)
                        </span>
                      </div>
                    </div>

                    {/* level / proportion bar */}
                    <div className="mt-1 h-1 w-full overflow-hidden rounded bg-slate-100">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{
                          delay: 0.15 + index * 0.05,
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* KPI Cards */}

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {/* Highest */}

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded bg-red-50 px-2.5 py-1.5"
            >
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Highest
              </p>
              <h5 className="mt-0.5 truncate text-[12px] font-bold leading-none text-red-600">
                {topReason.reason}
              </h5>
              <p className="mt-1 text-[10px] leading-none text-slate-500">
                {topReason.qty} Nos
              </p>
            </motion.div>

            {/* Reject % */}

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded bg-orange-50 px-2.5 py-1.5"
            >
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Reject %
              </p>
              <h5 className="mt-0.5 text-base font-bold leading-none text-orange-600">
                {rejectionRate}%
              </h5>
              <p className="mt-1 text-[10px] leading-none text-slate-500">
                Overall
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RejectionAnalysis;
