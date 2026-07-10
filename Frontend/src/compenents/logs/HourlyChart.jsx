import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { hour: "06", activities: 22 },
  { hour: "07", activities: 34 },
  { hour: "08", activities: 58 },
  { hour: "09", activities: 104 },
  { hour: "10", activities: 138 },
  { hour: "11", activities: 165 },
  { hour: "12", activities: 142 },
  { hour: "13", activities: 124 },
  { hour: "14", activities: 168 },
  { hour: "15", activities: 181 },
  { hour: "16", activities: 170 },
  { hour: "17", activities: 148 },
  { hour: "18", activities: 118 },
];

const HourlyChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Header */}

      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          Hourly Activity
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          System activity throughout the day
        </p>
      </div>

      {/* Chart */}

      <div className="h-80 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{
                fontSize: 12,
              }}
            />
            <YAxis
              tick={{
                fontSize: 12,
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="activities"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{
                r: 5,
              }}
              activeDot={{
                r: 8,
              }}
            />{" "}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}

      <div className="border-t border-slate-200 dark:border-slate-800 p-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
            <p className="text-xs uppercase text-slate-500">Peak Hour</p>

            <h3 className="mt-2 text-xl font-bold text-blue-600">15:00</h3>
          </div>

          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
            <p className="text-xs uppercase text-slate-500">Peak Activities</p>

            <h3 className="mt-2 text-xl font-bold text-slate-800 dark:text-white">
              181
            </h3>
          </div>

          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
            <p className="text-xs uppercase text-slate-500">Average / Hour</p>

            <h3 className="mt-2 text-xl font-bold text-emerald-600">121</h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HourlyChart;
