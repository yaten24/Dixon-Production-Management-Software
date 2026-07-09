import React from "react";
import { FaChartLine, FaClock } from "react-icons/fa";
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, LabelList,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!(active && payload?.length)) return null;
  const row = payload[0].payload;

  return (
    <div className="min-w-[170px] rounded border border-slate-200 bg-white p-3 shadow-xl">
      <h4 className="mb-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">{label}</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between rounded bg-blue-50 px-2 py-1">
          <span className="font-medium text-slate-600">Target</span>
          <span className="rounded bg-blue-600 px-2 py-0.5 font-bold text-white">{row.target.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded bg-green-50 px-2 py-1">
          <span className="font-medium text-slate-600">Actual</span>
          <span className="rounded bg-green-600 px-2 py-0.5 font-bold text-white">{row.actual.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded bg-orange-50 px-2 py-1">
          <span className="font-medium text-slate-600">Achievement</span>
          <span className="rounded bg-orange-500 px-2 py-0.5 font-bold text-white">{row.achievement}%</span>
        </div>
      </div>
    </div>
  );
};

// data: [{ hour, target, actual, achievement }]
const Hall1TrendChart = ({ hallCode, data = [], date, loading }) => {
  const totalTarget = data.reduce((sum, item) => sum + item.target, 0);
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const overallAchievement = totalTarget ? ((totalActual / totalTarget) * 100).toFixed(1) : "0.0";

  return (
    <div className="w-full h-full rounded border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-1 rounded border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-slate-50 p-2 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-orange-500 shadow-md">
              <FaChartLine className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-slate-800">Hourly Production Trend</h2>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <FaClock className="text-[10px] text-orange-500" />
                Target vs Actual — {date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded border border-blue-200 bg-blue-100 px-3 py-1">
              <span className="text-xs font-bold text-blue-700">Hall-{hallCode}</span>
            </div>
            <div className="rounded border border-orange-200 bg-orange-100 px-3 py-1">
              <span className="text-xs font-bold text-orange-700">Hourly</span>
            </div>
          </div>
        </div>
      </div>

      {loading && !data.length ? (
        <div className="flex h-[300px] items-center justify-center text-xs text-slate-400">Loading...</div>
      ) : !data.length ? (
        <div className="flex h-[300px] items-center justify-center text-xs text-slate-400">No entries for this date.</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 22, right: 20, left: 5, bottom: 5 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis dataKey="hour" height={30} tickMargin={6}
              tick={{ fontSize: 10, fontWeight: 600, fill: "#475569" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" width={45} tickFormatter={(v) => v.toLocaleString()}
              tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" width={38} domain={[0, 120]}
              tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} height={22}
              wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />

            <Bar yAxisId="left" dataKey="target" name="Target" fill="#2563EB" radius={[3, 3, 0, 0]} barSize={16}>
              <LabelList dataKey="target" position="top" content={({ x, y, width, value }) => (
                <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill="#1D4ED8">{value.toLocaleString()}</text>
              )} />
            </Bar>
            <Bar yAxisId="left" dataKey="actual" name="Actual" fill="#16A34A" radius={[3, 3, 0, 0]} barSize={16}>
              <LabelList dataKey="actual" position="top" content={({ x, y, width, value }) => (
                <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill="#15803D">{value.toLocaleString()}</text>
              )} />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded border border-blue-100 bg-blue-50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Today's Target</p>
          <h3 className="mt-1 text-lg font-bold text-blue-700">{totalTarget.toLocaleString()}</h3>
        </div>
        <div className="rounded border border-green-100 bg-green-50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Today's Actual</p>
          <h3 className="mt-1 text-lg font-bold text-green-700">{totalActual.toLocaleString()}</h3>
        </div>
        <div className="rounded border border-orange-100 bg-orange-50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Achievement</p>
          <h3 className="mt-1 text-lg font-bold text-orange-700">{overallAchievement}%</h3>
        </div>
      </div>
    </div>
  );
};

export default Hall1TrendChart;