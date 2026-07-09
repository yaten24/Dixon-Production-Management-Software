import React from "react";
import { FaIndustry } from "react-icons/fa";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LabelList,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!(active && payload?.length)) return null;
  const row = payload[0].payload;

  return (
    <div className="min-w-[170px] rounded border border-slate-200 bg-white p-3 shadow-xl">
      <h4 className="mb-2 border-b pb-2 text-sm font-bold text-slate-800">{row.machine}</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between rounded bg-blue-50 px-2 py-1">
          <span className="font-medium text-slate-600">Target</span>
          <span className="rounded bg-blue-600 px-2 py-0.5 font-bold text-white">{row.target.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded bg-green-50 px-2 py-1">
          <span className="font-medium text-slate-600">Actual</span>
          <span className="rounded bg-green-600 px-2 py-0.5 font-bold text-white">{row.actual.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded bg-red-50 px-2 py-1">
          <span className="font-medium text-slate-600">Reject</span>
          <span className="rounded bg-red-600 px-2 py-0.5 font-bold text-white">{row.rejection}</span>
        </div>
        <div className="flex items-center justify-between rounded bg-orange-50 px-2 py-1">
          <span className="font-medium text-slate-600">Achievement</span>
          <span className="rounded bg-orange-500 px-2 py-0.5 font-bold text-white">{row.achievement}%</span>
        </div>
      </div>
    </div>
  );
};

// data: [{ machine, target, actual, rejection, achievement }]
const Hall1MachineChart = ({ hallCode, data = [], loading }) => {
  return (
    <div className="w-full rounded border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-1 rounded border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-slate-50 p-2 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
              <FaIndustry className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-slate-800">Machine Performance Dashboard</h2>
              <p className="mt-1 text-xs text-slate-500">Live Target • Actual • Rejection Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded border border-blue-200 bg-blue-100 px-3 py-1">
              <span className="text-xs font-bold text-blue-700">Hall-{hallCode}</span>
            </div>
            <div className="rounded border border-emerald-200 bg-emerald-100 px-3 py-1">
              <span className="text-xs font-bold text-emerald-700">● Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded border border-slate-200 p-2">
        {loading && !data.length ? (
          <div className="flex h-[330px] items-center justify-center text-xs text-slate-400">Loading...</div>
        ) : !data.length ? (
          <div className="flex h-[330px] items-center justify-center text-xs text-slate-400">No data for this range.</div>
        ) : (
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={data} margin={{ top: 28, right: 8, left: -12, bottom: 18 }} barGap={2} barCategoryGap="18%">
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="machine" interval={0} height={45} angle={-35} textAnchor="end" tickMargin={5}
                tick={{ fontSize: 9, fontWeight: 600, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis width={42} tick={{ fontSize: 9, fill: "#64748B" }}
                tickFormatter={(v) => v.toLocaleString()} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} height={22}
                wrapperStyle={{ fontSize: 10, paddingBottom: 4, fontWeight: 600 }} />

              <Bar dataKey="target" name="Target" fill="#2563EB" radius={[2, 2, 0, 0]} barSize={8} animationDuration={800}>
                <LabelList dataKey="target" position="top" content={({ x, y, width, value }) => (
                  <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize="7" fontWeight="700" fill="#1D4ED8">{value}</text>
                )} />
              </Bar>
              <Bar dataKey="actual" name="Actual" fill="#16A34A" radius={[2, 2, 0, 0]} barSize={8} animationDuration={800}>
                <LabelList dataKey="actual" position="top" content={({ x, y, width, value }) => (
                  <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize="7" fontWeight="700" fill="#15803D">{value}</text>
                )} />
              </Bar>
              <Bar dataKey="rejection" name="Reject" fill="#DC2626" radius={[2, 2, 0, 0]} barSize={8} animationDuration={800}>
                <LabelList dataKey="rejection" position="top" content={({ x, y, width, value }) => (
                  <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize="7" fontWeight="700" fill="#B91C1C">{value}</text>
                )} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Hall1MachineChart;