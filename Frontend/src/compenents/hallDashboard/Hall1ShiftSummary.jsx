import React from "react";
import { Clock, TrendingUp, Users } from "lucide-react";

// shiftSummary: { A: { target, actual }, B: { target, actual } }
export const Hall1ShiftSummary = ({ hallCode, shiftSummary, loading }) => {
  const shifts = shiftSummary
    ? [
        { shift: "Shift A", production: shiftSummary.A.actual, target: shiftSummary.A.target, color: "blue" },
        { shift: "Shift B", production: shiftSummary.B.actual, target: shiftSummary.B.target, color: "emerald" },
      ]
    : [];

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-1 rounded border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-slate-50 p-2 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded bg-indigo-600 shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-slate-800">Shift Summary</h2>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                Production Performance by Shift
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded border border-indigo-200 bg-indigo-100 px-3 py-1">
              <span className="text-xs font-bold text-indigo-700">Hall-{hallCode}</span>
            </div>
            <div className="rounded border border-green-200 bg-green-100 px-3 py-1">
              <span className="flex items-center gap-1 text-xs font-bold text-green-700">
                <span className="h-2 w-2 rounded bg-green-500"></span>
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading && !shiftSummary ? (
        <div className="flex h-40 items-center justify-center text-xs text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {shifts.map((item) => {
            const achievement = item.target ? ((item.production / item.target) * 100).toFixed(1) : "0.0";
            const progress = Math.min(Number(achievement), 100);
            const isBlue = item.color === "blue";

            return (
              <div key={item.shift} className="rounded border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{item.shift}</h3>
                    <p className="text-xs text-slate-500">Target: {item.target.toLocaleString()}</p>
                  </div>
                  <div className={`rounded px-3 py-1 text-xs font-bold ${isBlue ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {achievement}%
                  </div>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Production</span>
                  <span className="text-lg font-bold text-slate-800">{item.production.toLocaleString()}</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-slate-200">
                  <div className={`h-full rounded ${isBlue ? "bg-blue-600" : "bg-emerald-600"}`} style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Live Shift Performance
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};