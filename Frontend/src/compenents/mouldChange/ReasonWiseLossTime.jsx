import React from "react";
import { AlertTriangle } from "lucide-react";
import { COLORS } from "../../data/mouldChangeData";

const ReasonWiseLossTime = ({ reasonWiseLoss = [], totalLoss = 0, topReason = "-", topReasonPercent = 0, hasData = true }) => {
  return (
    <div className="flex h-full flex-col rounded-sm border border-[#C6C6C6] bg-white">
      <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#0F1D24] text-white"><AlertTriangle size={14} /></span>
          <div>
            <p className="text-sm font-semibold text-[#0F1D24]">Reason Wise Loss Time</p>
            <p className="text-xs text-[#9B9B9B]">Downtime distribution by reason</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-[#9B9B9B]">TOTAL LOSS</p>
          <p className="text-sm font-bold text-red-500">{totalLoss} min</p>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[#E2E4E9] border-b border-[#C6C6C6] text-xs">
        <div className="px-3 py-2"><p className="text-[10px] font-medium text-[#9B9B9B]">TOP REASON</p><p className="truncate font-semibold text-[#0F1D24]">{topReason}</p></div>
        <div className="px-3 py-2"><p className="text-[10px] font-medium text-[#9B9B9B]">PEAK VALUE</p><p className="font-semibold text-[#0F1D24]">{topReasonPercent}%</p></div>
      </div>

      {!hasData && (
        <div className="mx-3 mt-2 rounded-sm bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700">
          No loss data recorded for this date — showing all {reasonWiseLoss.length} reasons with 0.
        </div>
      )}

      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {reasonWiseLoss.map((r, idx) => (
          <div key={r.reason} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS?.[idx % (COLORS?.length || 1)] || "#9B9B9B" }} />
              <span className="truncate text-[#0F1D24]">{r.reason}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-[#9B9B9B]">{r.lossMinutes}m</span>
              <span className="w-10 text-right font-medium text-[#0F1D24]">{r.percent}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#C6C6C6] px-3 py-1.5 text-[11px] text-[#9B9B9B]">{reasonWiseLoss.length} reasons tracked</div>
    </div>
  );
};

export default ReasonWiseLossTime;