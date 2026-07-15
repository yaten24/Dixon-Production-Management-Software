import React, { useMemo } from "react";
import { Gauge } from "lucide-react";

const VISIBLE_ROWS = 4;
const ROW_HEIGHT = 62; // compact row height in px

const Hall1MachineOEE = ({ hallCode, data = [], loading }) => {
  const sorted = useMemo(
    () => [...data].sort((a, b) => (b.oee?.oee ?? 0) - (a.oee?.oee ?? 0)),
    [data],
  );

  const isScrollable = sorted.length > VISIBLE_ROWS;
  const visibleHeight = Math.min(sorted.length, VISIBLE_ROWS) * ROW_HEIGHT;

  const badge = (oee) => {
    if (oee === undefined || oee === null) return { bg: "bg-[#C6C6C6]/30", text: "text-[#9B9B9B]" };
    if (oee >= 85) return { bg: "bg-emerald-100", text: "text-emerald-700" };
    if (oee >= 60) return { bg: "bg-amber-100", text: "text-amber-700" };
    return { bg: "bg-red-100", text: "text-red-700" };
  };

  return (
    <div className="w-full rounded border border-[#C6C6C6]/50 bg-white p-2 shadow-sm">
      <div className="mb-1 rounded border border-[#0F1D24]/15 bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] p-1.5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#0F1D24] shadow-sm">
            <Gauge className="h-4 w-4 text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-wide text-[#0F1D24]">Machine-wise OEE</h2>
            <p className="text-[10px] text-[#9B9B9B]">Hall-{hallCode} · Availability × Performance × Quality</p>
          </div>
        </div>
      </div>

      {loading && !sorted.length ? (
        <div className="flex h-24 items-center justify-center text-xs text-[#9B9B9B]">Loading...</div>
      ) : !sorted.length ? (
        <div className="flex h-24 items-center justify-center text-xs text-[#9B9B9B]">No data for this range.</div>
      ) : (
        <div
          className={`hall1-oee-scroll ${isScrollable ? "overflow-y-auto pr-1" : ""}`}
          style={{ maxHeight: visibleHeight }}
        >
          <div className="space-y-1.5">
            {sorted.map((m) => {
              const oeeVal = m.oee?.oee ?? 0;
              const { bg, text } = badge(oeeVal);
              return (
                <div key={m.machine} className="rounded border border-[#C6C6C6]/50 px-2 py-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[11px] font-semibold text-[#0F1D24]">{m.machine}</span>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${bg} ${text}`}>{oeeVal}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded bg-[#C6C6C6]/40">
                    <div
                      className={`h-full rounded transition-all duration-500 ${oeeVal >= 85 ? "bg-emerald-500" : oeeVal >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(oeeVal, 100)}%` }}
                    />
                  </div>
                  <p className="mt-0.5 truncate text-[9px] text-[#9B9B9B]">
                    A {m.oee?.availability ?? 0}% · P {m.oee?.performance ?? 0}% · Q {m.oee?.quality ?? 0}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .hall1-oee-scroll {
          scrollbar-width: thin;
          scrollbar-color: #C6C6C6 transparent;
        }
        .hall1-oee-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .hall1-oee-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .hall1-oee-scroll::-webkit-scrollbar-thumb {
          background-color: #C6C6C6;
          border-radius: 999px;
        }
        .hall1-oee-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #9B9B9B;
        }
      `}</style>
    </div>
  );
};

export default Hall1MachineOEE;