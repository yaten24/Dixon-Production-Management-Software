import React from "react";
import { Clock, TrendingUp, Users } from "lucide-react";

export const Hall1ShiftSummary = ({ hallCode, shiftSummary, loading }) => {
  const shifts = shiftSummary
    ? [
        { shift: "Shift A", production: shiftSummary.A.actual, target: shiftSummary.A.target, color: "navy" },
        { shift: "Shift B", production: shiftSummary.B.actual, target: shiftSummary.B.target, color: "emerald" },
      ]
    : [];

  return (
    <div className="w-full rounded border border-[#C6C6C6]/50 bg-white p-2 shadow-sm">
      <div className="mb-1 rounded border border-[#0F1D24]/15 bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] p-1.5 shadow-sm">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
              <Users className="h-4 w-4 text-[#FDC94D]" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-wide text-[#0F1D24]">Shift Summary</h2>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#9B9B9B]">
                <Clock className="h-3 w-3 text-[#9B9B9B]" />
                Production Performance by Shift
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="rounded border border-[#0F1D24]/15 bg-[#0F1D24]/10 px-2 py-0.5">
              <span className="text-[10px] font-bold text-[#0F1D24]">Hall-{hallCode}</span>
            </div>
            <div className="rounded border border-green-200 bg-green-100 px-2 py-0.5">
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-700">
                <span className="h-1.5 w-1.5 rounded bg-green-500"></span>
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading && !shiftSummary ? (
        <div className="flex h-24 items-center justify-center text-xs text-[#9B9B9B]">Loading...</div>
      ) : (
        <div className="space-y-1.5">
          {shifts.map((item) => {
            const achievement = item.target ? ((item.production / item.target) * 100).toFixed(1) : "0.0";
            const progress = Math.min(Number(achievement), 100);
            const isNavy = item.color === "navy";

            return (
              <div key={item.shift} className="rounded border border-[#C6C6C6]/50 p-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-[#0F1D24]">{item.shift}</h3>
                    <p className="text-[10px] text-[#9B9B9B]">Target: {item.target.toLocaleString()}</p>
                  </div>
                  <div className={`rounded px-2 py-0.5 text-[10px] font-bold ${isNavy ? "bg-[#0F1D24]/10 text-[#0F1D24]" : "bg-emerald-100 text-emerald-700"}`}>
                    {achievement}%
                  </div>
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] text-[#9B9B9B]">Production</span>
                  <span className="text-sm font-bold text-[#0F1D24]">{item.production.toLocaleString()}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[#C6C6C6]/40">
                  <div className={`h-full rounded transition-all duration-500 ${isNavy ? "bg-[#0F1D24]" : "bg-emerald-600"}`} style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#9B9B9B]">
                  <TrendingUp className="h-3 w-3" />
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