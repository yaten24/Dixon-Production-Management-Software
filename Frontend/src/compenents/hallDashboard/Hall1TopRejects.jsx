import React from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";

// data: [{ machine, reject, production }]
export const Hall1TopRejects = ({ hallCode, data = [], loading }) => {
  const maxReject = data.length ? Math.max(...data.map((item) => item.reject)) : 1;

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-1 rounded border border-red-200 bg-gradient-to-r from-red-50 via-white to-slate-50 p-2 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded bg-red-600 shadow-md">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-slate-800">Top Rejection Machines</h2>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                Highest Reject Count
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded border border-red-200 bg-red-100 px-3 py-1">
              <span className="text-xs font-bold text-red-700">Hall-{hallCode}</span>
            </div>
            <div className="rounded border border-amber-200 bg-amber-100 px-3 py-1">
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                <span className="h-2 w-2 rounded bg-amber-500"></span>
                Alert
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading && !data.length ? (
        <div className="flex h-40 items-center justify-center text-xs text-slate-400">Loading...</div>
      ) : !data.length ? (
        <div className="flex h-40 items-center justify-center text-xs text-slate-400">No rejects in this range 🎉</div>
      ) : (
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = item.production ? ((item.reject / item.production) * 100).toFixed(1) : "0.0";
            const progress = (item.reject / maxReject) * 100;

            return (
              <div key={item.machine} className="rounded border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-100 text-sm font-bold text-red-700">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{item.machine}</h3>
                      <p className="text-xs text-slate-500">Production : {item.production}</p>
                    </div>
                  </div>
                  <div className="rounded bg-red-100 px-3 py-1 text-xs font-bold text-red-700">{item.reject} Reject</div>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Reject Rate</span>
                  <span className="text-sm font-bold text-red-600">{percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-slate-200">
                  <div className="h-full rounded bg-red-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};