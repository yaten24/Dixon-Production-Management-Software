import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { HiOutlineCube } from "react-icons/hi2";
import useProductionOverview from "../../hooks/useProductionOverview";

/* ---------- matches dashboard accent family: blue -> indigo -> purple ---------- */

const summaryConfig = [
  { key: "target", label: "Target", color: "text-blue-600", dot: "bg-blue-600" },
  { key: "actual", label: "Actual", color: "text-emerald-600", dot: "bg-emerald-600" },
  { key: "reject", label: "Reject", color: "text-red-600", dot: "bg-red-600" },
];

const ProductionChart = () => {
  const { data: productionData, loading, error, refetch } = useProductionOverview();

  const totalTarget = productionData.reduce((sum, item) => sum + item.target, 0);
  const totalActual = productionData.reduce((sum, item) => sum + item.actual, 0);
  const totalReject = productionData.reduce((sum, item) => sum + item.rejection, 0);

  const summaryValues = {
    target: `${(totalTarget / 1000).toFixed(1)}k`,
    actual: `${(totalActual / 1000).toFixed(1)}k`,
    reject: totalReject,
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
            whileHover={{ scale: 1.08, rotate: -4 }}
            transition={{ type: "spring", stiffness: 320, damping: 14 }}
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{
              background: "linear-gradient(135deg, #EFF3FF 0%, #F3EEFF 100%)",
            }}
          >
            <HiOutlineCube className="text-[15px] text-[#2563EB]" />
          </motion.div>

          <div>
            <h3 className="text-[13px] font-semibold leading-none text-slate-800">
              Production Overview
            </h3>
            <p className="mt-1 text-[10px] leading-none text-slate-500">
              Target vs Actual vs Rejection
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
          Today
        </span>
      </div>

      {/* ================= Chart / Loading / Error ================= */}

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-[220px] w-[92%] animate-pulse rounded bg-slate-100" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-[12px] text-red-600">{error}</p>
          <button
            onClick={refetch}
            className="rounded bg-red-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : productionData.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[12px] text-slate-400">Aaj ke liye koi data nahi hai</p>
        </div>
      ) : (
        <div className="flex-1 px-2.5 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={productionData}
              margin={{ top: 14, right: 8, left: -22, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#eef1f5" />

              <XAxis dataKey="hall" tick={{ fontSize: 10.5, fontWeight: 600 }} />

              <YAxis tick={{ fontSize: 9.5 }} />

              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  border: "1px solid #E2E4E9",
                  borderRadius: 8,
                  fontSize: 11,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                }}
              />

              <Legend wrapperStyle={{ fontSize: 10.5 }} iconSize={8} />

              {/* ================= TARGET ================= */}

              <Bar dataKey="target" name="Target" fill="#2563EB" maxBarSize={30} radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="target"
                  position="top"
                  formatter={(value) => `${(value / 1000).toFixed(1)}k`}
                  style={{ fontSize: 9.5, fontWeight: 600, fill: "#64748b" }}
                />
              </Bar>

              {/* ================= ACTUAL ================= */}

              <Bar dataKey="actual" name="Actual" fill="#10B981" maxBarSize={30} radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="actual"
                  position="top"
                  formatter={(value) => `${(value / 1000).toFixed(1)}k`}
                  style={{ fontSize: 9.5, fontWeight: 600, fill: "#64748b" }}
                />
              </Bar>

              {/* ================= REJECTION ================= */}

              <Bar dataKey="rejection" name="Reject" fill="#DC2626" maxBarSize={30} radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="rejection"
                  position="top"
                  style={{ fontSize: 9.5, fontWeight: 600, fill: "#94a3b8" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ================= Summary ================= */}

      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50 px-2.5 py-2.5">
        {summaryConfig.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.25 }}
            whileHover={{ y: -2 }}
            className="rounded-md border border-slate-100 bg-white px-2.5 py-1.5 shadow-sm"
          >
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
            </div>

            <h4 className={`mt-1 text-base font-bold leading-none ${item.color}`}>
              {summaryValues[item.key]}
            </h4>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProductionChart;