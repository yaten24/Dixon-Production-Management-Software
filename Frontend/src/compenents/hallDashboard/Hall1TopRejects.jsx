import React, { useMemo } from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";

const VISIBLE_ROWS = 3;
const ROW_HEIGHT = 84; // compact row height in px

export const Hall1TopRejects = ({ hallCode, data = [], loading }) => {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.reject - a.reject),
    [data],
  );

  const maxReject = sorted.length ? sorted[0].reject : 1;
  const isScrollable = sorted.length > VISIBLE_ROWS;
  const visibleHeight = Math.min(sorted.length, VISIBLE_ROWS) * ROW_HEIGHT;

  return (
    <div className="w-full rounded border border-[#C6C6C6]/50 bg-white p-2 shadow-sm">
      <div className="mb-1 rounded border border-red-200 bg-gradient-to-r from-red-50 via-white to-[#F5F5F5] p-1.5 shadow-sm">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-wide text-[#0F1D24]">Top Rejection Machines</h2>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#9B9B9B]">
                <TrendingDown className="h-3 w-3 text-red-500" />
                Highest Reject Count
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="rounded border border-red-200 bg-red-100 px-2">
              <span className="text-[10px] font-bold text-red-700">{hallCode}</span>
            </div>
            <div className="rounded border border-amber-200 bg-amber-100 px-2 py-1">
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                <span className="h-2 w-2 rounded bg-amber-500"></span>
                Alert
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading && !sorted.length ? (
        <div className="flex h-24 items-center justify-center text-xs text-[#9B9B9B]">Loading...</div>
      ) : !sorted.length ? (
        <div className="flex h-24 items-center justify-center text-xs text-[#9B9B9B]">No rejects in this range 🎉</div>
      ) : (
        <div
          className={`hall1-rejects-scroll ${isScrollable ? "overflow-y-auto pr-1" : ""}`}
          style={{ maxHeight: visibleHeight }}
        >
          <div className="space-y-1">
            {sorted.map((item, index) => {
              const percentage = item.production ? ((item.reject / item.production) * 100).toFixed(1) : "0.0";
              const progress = (item.reject / maxReject) * 100;

              return (
                <div key={item.machine} className="rounded border border-[#C6C6C6]/50 p-1">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-1">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-red-100 text-[10px] font-bold text-red-700">
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold text-[#0F1D24]">{item.machine}</h3>
                        <p className="truncate text-[10px] text-[#9B9B9B]">Production : {item.production}</p>
                      </div>
                    </div>
                    <div className="shrink-0 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      {item.reject} Reject
                    </div>
                  </div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] text-[#9B9B9B]">Reject Rate</span>
                    <span className="text-xs font-bold text-red-600">{percentage}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded bg-[#C6C6C6]/40">
                    <div className="h-full rounded bg-red-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .hall1-rejects-scroll {
          scrollbar-width: thin;
          scrollbar-color: #C6C6C6 transparent;
        }
        .hall1-rejects-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .hall1-rejects-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .hall1-rejects-scroll::-webkit-scrollbar-thumb {
          background-color: #C6C6C6;
          border-radius: 999px;
        }
        .hall1-rejects-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #9B9B9B;
        }
      `}</style>
    </div>
  );
};