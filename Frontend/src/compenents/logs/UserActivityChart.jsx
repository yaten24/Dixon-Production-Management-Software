import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  {
    name: "Admin",
    value: 18,
  },
  {
    name: "Production",
    value: 42,
  },
  {
    name: "Quality",
    value: 15,
  },
  {
    name: "Planning",
    value: 12,
  },
  {
    name: "HR",
    value: 8,
  },
  {
    name: "Maintenance",
    value: 5,
  },
];

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

const total = data.reduce((sum, item) => sum + item.value, 0);

const UserActivityChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Header */}

      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          User Activity
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Activity distribution by department
        </p>
      </div>

      {/* Chart */}

      <div className="h-80 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={95}
              innerRadius={55}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}

      <div className="border-t border-slate-200 dark:border-slate-800 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total Activities
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
              {total}
            </h3>
          </div>

          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Most Active
            </p>

            <h3 className="mt-2 text-lg font-bold text-blue-600">Production</h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserActivityChart;
