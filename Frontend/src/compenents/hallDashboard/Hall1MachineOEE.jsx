import React from "react";
import { Gauge } from "lucide-react";

// data: machineWise array, har item.oee = { availability, performance, quality, oee }
const Hall1MachineOEE = ({ hallCode, data = [], loading }) => {
  const sorted = [...data].sort((a, b) => (b.oee?.oee ?? 0) - (a.oee?.oee ?? 0));

  const badge = (oee) => {
    if (oee === undefined || oee === null) return { bg: "bg-slate-100", text: "text-slate-500" };
    if (oee >= 85) return { bg: "bg-emerald-100", text: "text-emerald-700" };
    if (oee >= 60) return { bg: "bg-amber-100", text: "text-amber-700" };
    return { bg: "bg-red-100", text: "text-red-700" };
  };

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-1 rounded border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-slate-50 p-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-purple-600 shadow-md">
            <Gauge className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-slate-800">Machine-wise OEE</h2>
            <p className="text-[10px] text-slate-500">Hall-{hallCode} · Availability × Performance × Quality</p>
          </div>
        </div>
      </div>

      {loading && !data.length ? (
        <div className="flex h-32 items-center justify-center text-xs text-slate-400">Loading...</div>
      ) : !sorted.length ? (
        <div className="flex h-32 items-center justify-center text-xs text-slate-400">No data for this range.</div>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {sorted.map((m) => {
            const oeeVal = m.oee?.oee ?? 0;
            const { bg, text } = badge(oeeVal);
            return (
              <div key={m.machine} className="rounded border border-slate-200 px-2.5 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{m.machine}</span>
                  <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${bg} ${text}`}>{oeeVal}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-200">
                  <div className={`h-full rounded ${oeeVal >= 85 ? "bg-emerald-500" : oeeVal >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(oeeVal, 100)}%` }} />
                </div>
                <p className="mt-1 text-[9px] text-slate-400">
                  A {m.oee?.availability ?? 0}% · P {m.oee?.performance ?? 0}% · Q {m.oee?.quality ?? 0}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Hall1MachineOEE;