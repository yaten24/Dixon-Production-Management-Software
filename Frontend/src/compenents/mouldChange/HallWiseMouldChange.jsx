import React from "react";
import { Layers } from "lucide-react";

const HallWiseMouldChange = ({ hallWiseMouldChanges = [] }) => {
  const maxValue = Math.max(1, ...hallWiseMouldChanges.flatMap((h) => [h.planned, h.actual]));
  const steps = 4;
  const yTicks = Array.from({ length: steps + 1 }, (_, i) => Math.round((maxValue / steps) * i)).reverse();

  const totalPlanned = hallWiseMouldChanges.reduce((s, h) => s + h.planned, 0);
  const totalActual = hallWiseMouldChanges.reduce((s, h) => s + h.actual, 0);

  return (
    <div className="rounded-sm border border-[#C6C6C6] bg-white">
      <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#0F1D24] text-white">
            <Layers size={14} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#0F1D24]">Hall Wise Mould Change</p>
            <p className="text-xs text-[#9B9B9B]">Planned vs Actual mould changes per hall</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right text-xs">
          <div>
            <p className="text-[10px] font-medium text-[#9B9B9B]">PLANNED</p>
            <p className="font-bold text-[#0F1D24]">{totalPlanned}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-[#9B9B9B]">ACTUAL</p>
            <p className="font-bold text-[#FDC94D]">{totalActual}</p>
          </div>
        </div>
      </div>

      <div className="flex h-64 px-3 pt-4">
        <div className="flex w-8 flex-col justify-between pb-6 text-right text-[10px] text-[#9B9B9B]">
          {yTicks.map((t, idx) => (
            <span key={`ytick-${idx}`}>{t}</span>
          ))}
        </div>

        <div className="relative flex flex-1 gap-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {yTicks.map((t, idx) => (
              <div key={`grid-${idx}`} className="border-t border-dashed border-[#E2E4E9]" />
            ))}
          </div>

          {hallWiseMouldChanges.map((h) => (
            <div key={h.hall} className="relative flex flex-1 flex-col items-center justify-end pb-6">
              <div className="flex h-52 w-full items-end justify-center gap-1.5">
                <div className="group relative flex w-6 items-end justify-center">
                  <span className="pointer-events-none absolute -top-4 text-[10px] font-medium text-[#0F1D24] opacity-0 transition-opacity group-hover:opacity-100">
                    {h.planned}
                  </span>
                  <div
                    className="w-full rounded-t-sm bg-[#0F1D24] transition-all"
                    style={{ height: `${(h.planned / maxValue) * 100}%`, minHeight: h.planned > 0 ? "2px" : 0 }}
                  />
                </div>
                <div className="group relative flex w-6 items-end justify-center">
                  <span className="pointer-events-none absolute -top-4 text-[10px] font-medium text-[#0F1D24] opacity-0 transition-opacity group-hover:opacity-100">
                    {h.actual}
                  </span>
                  <div
                    className="w-full rounded-t-sm bg-[#FDC94D] transition-all"
                    style={{ height: `${(h.actual / maxValue) * 100}%`, minHeight: h.actual > 0 ? "2px" : 0 }}
                  />
                </div>
              </div>
              <span className="absolute bottom-0 text-xs font-medium text-[#0F1D24]">{h.hall}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6] px-3 py-1.5 text-[11px] text-[#9B9B9B]">
        <span>Production Hall Comparison</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#0F1D24]" /> Planned</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#FDC94D]" /> Actual</span>
        </span>
      </div>
    </div>
  );
};

export default HallWiseMouldChange;