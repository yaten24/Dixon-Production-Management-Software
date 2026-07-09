import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { HiOutlineChartBar } from "react-icons/hi2";

/* ---------- matches dashboard accent family; violet accent for header, semantic colors kept in KPIs/lines ---------- */

const trendData = [
  { day: "Mon", rejection: 180, lossTime: 35 },
  { day: "Tue", rejection: 240, lossTime: 42 },
  { day: "Wed", rejection: 150, lossTime: 28 },
  { day: "Thu", rejection: 130, lossTime: 22 },
  { day: "Fri", rejection: 210, lossTime: 48 },
  { day: "Sat", rejection: 140, lossTime: 25 },
];

const kpiConfig = [
  { key: "reject", label: "Reject", suffix: "", unit: "Total Qty", bg: "bg-red-50", color: "text-red-600" },
  { key: "loss", label: "Loss", suffix: "m", unit: "Minutes", bg: "bg-orange-50", color: "text-orange-600" },
  { key: "avgReject", label: "Avg Reject", suffix: "", unit: "Per Day", bg: "bg-blue-50", color: "text-blue-600" },
  { key: "avgLoss", label: "Avg Loss", suffix: "m", unit: "Per Day", bg: "bg-emerald-50", color: "text-emerald-600" },
];

const RejectionLossTrend = () => {
  const totalReject = trendData.reduce((sum, item) => sum + item.rejection, 0);
  const totalLoss = trendData.reduce((sum, item) => sum + item.lossTime, 0);
  const avgReject = Math.round(totalReject / trendData.length);
  const avgLoss = Math.round(totalLoss / trendData.length);

  const kpiValues = {
    reject: totalReject,
    loss: totalLoss,
    avgReject,
    avgLoss,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full min-h-[300px] flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
    >
      {/* ================= Header ================= */}

      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={{ type: "spring", stiffness: 320, damping: 14 }}
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{
              background: "linear-gradient(135deg, #F3EEFF 0%, #EFEBFB 100%)",
            }}
          >
            <HiOutlineChartBar className="text-[15px] text-[#7C3AED]" />
          </motion.div>

          <div>
            <h3 className="text-[13px] font-semibold leading-none text-slate-800">
              Rejection &amp; Loss Trend
            </h3>
            <p className="mt-1 text-[10px] leading-none text-slate-500">
              Last 6 Days Performance
            </p>
          </div>
        </div>

        <div className="rounded bg-violet-50 px-2.5 py-1 text-center">
          <p className="text-[9px] leading-none text-slate-500">Days</p>
          <h4 className="mt-0.5 text-[13px] font-bold leading-none text-violet-600">
            {trendData.length}
          </h4>
        </div>
      </div>

      {/* ================= KPI ================= */}

      <div className="grid grid-cols-2 gap-2 px-2.5 pt-2.5 lg:grid-cols-4">
        {kpiConfig.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.05, duration: 0.25 }}
            whileHover={{ y: -2 }}
            className={`rounded px-2.5 py-1.5 ${item.bg}`}
          >
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <h4 className={`mt-0.5 text-base font-bold leading-none ${item.color}`}>
              {kpiValues[item.key]}
              {item.suffix}
            </h4>
            <p className="mt-1 text-[9px] leading-none text-slate-500">{item.unit}</p>
          </motion.div>
        ))}
      </div>

      {/* ================= CHART ================= */}

      <div className="flex-1 px-2.5 pb-2.5 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trendData} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="rejectionBarFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#DC2626" stopOpacity={0.55} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#eef1f5" strokeDasharray="2 2" vertical={false} />

            <XAxis dataKey="day" tick={{ fontSize: 10.5, fontWeight: 600 }} />

            {/* left axis: rejection qty (bars) */}
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 9.5, fill: "#dc2626" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />

            {/* right axis: loss time minutes (line) — separate scale so the two are honestly comparable */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 9.5, fill: "#ea580c" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />

            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                border: "1px solid #E2E4E9",
                borderRadius: 8,
                fontSize: 11,
                boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              }}
            />

            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10.5, paddingTop: 6 }} />

            {/* ================= REJECTION (bars, left axis) ================= */}

            <Bar
              yAxisId="left"
              dataKey="rejection"
              name="Rejection Qty"
              fill="url(#rejectionBarFill)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />

            {/* ================= LOSS TIME (line, right axis) ================= */}

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="lossTime"
              name="Loss Time (Min)"
              stroke="#ea580c"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#ea580c", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 5.5, fill: "#ea580c", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RejectionLossTrend;