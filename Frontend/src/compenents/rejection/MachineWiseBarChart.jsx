import React, { useMemo } from "react";
import { FaCogs } from "react-icons/fa";

const barColor = (rank, total) => {
  const t = total > 1 ? rank / (total - 1) : 0;
  const start = [251, 191, 36]; // amber-400
  const end = [180, 83, 9]; // amber-800
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgb(${r},${g},${b})`;
};

const MachineWiseBarChart = ({ data = [] }) => {
  const sorted = useMemo(
    () => [...data].sort((a, b) => Number(b.qty || 0) - Number(a.qty || 0)),
    [data],
  );

  const maxQty = sorted.length ? Number(sorted[0].qty || 0) : 0;
  const total = sorted.reduce((s, i) => s + Number(i.qty || 0), 0);

  return (
    <div className="rounded border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-amber-500 to-amber-700">
            <FaCogs className="text-xs text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Machine Wise Rejection
            </h2>
            <p className="text-[10px] text-slate-500">
              Custom CSS bar chart — no chart library
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase text-slate-400">
            Total
          </p>
          <p className="text-sm font-bold text-amber-700">{total}</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-xs text-slate-400">
          No machine data available
        </div>
      ) : (
        <div
          className="flex items-end gap-3 overflow-x-auto pb-2"
          style={{ minHeight: 220 }}
        >
          {sorted.map((item, idx) => {
            const qty = Number(item.qty || 0);
            const heightPct = maxQty > 0 ? (qty / maxQty) * 100 : 0;
            return (
              <div
                key={item.machine}
                className="flex min-w-[52px] flex-col items-center gap-1"
              >
                <span className="text-[11px] font-semibold text-slate-700">
                  {qty}
                </span>
                <div className="flex h-[160px] w-8 items-end overflow-hidden rounded-t bg-slate-100">
                  <div
                    className="w-full rounded-t transition-all duration-700"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: barColor(idx, sorted.length),
                    }}
                  />
                </div>
                <span
                  className="max-w-[52px] truncate text-center text-[10px] text-slate-500"
                  title={item.machine}
                >
                  {item.machine}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MachineWiseBarChart;