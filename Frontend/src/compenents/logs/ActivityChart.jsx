import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const data = [
  {
    module: "Production",
    activities: 485,
  },
  {
    module: "Quality",
    activities: 312,
  },
  {
    module: "HR",
    activities: 174,
  },
  {
    module: "Planning",
    activities: 221,
  },
  {
    module: "Machine",
    activities: 390,
  },
  {
    module: "Inventory",
    activities: 145,
  },
];

const colors = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

const ActivityChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Header */}

      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          Activities by Module
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Total system activity distribution
        </p>
      </div>

      {/* Chart */}

      <div className="h-80 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="module"
              tick={{
                fontSize: 12,
              }}
            />

            <YAxis
              tick={{
                fontSize: 12,
              }}
            />

            <Tooltip
              cursor={{
                fill: "rgba(37,99,235,0.08)",
              }}
            />

            <Bar dataKey="activities" radius={[8, 8, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ======================================================
            SUMMARY
      ======================================================= */}

      <div className="border-t border-slate-200 dark:border-slate-800 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total Activities
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
              {data.reduce((sum, item) => sum + item.activities, 0)}
            </h3>
          </div>

          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Highest Module
            </p>

            <h3 className="mt-2 text-lg font-bold text-blue-600">
              {
                data.reduce((a, b) => (a.activities > b.activities ? a : b))
                  .module
              }
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityChart;
