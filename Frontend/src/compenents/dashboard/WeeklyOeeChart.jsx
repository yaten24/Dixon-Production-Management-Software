import React from "react";
import { TrendingUp } from "lucide-react";
import { CardShell, CardLabel } from "./CardPrimitives";

const METRICS = [
  { key: "oee", label: "OEE", color: "#0F1D24" },
  { key: "availability", label: "Availability", color: "#FDC94D" },
  { key: "performance", label: "Performance", color: "#22C55E" },
  { key: "quality", label: "Quality", color: "#3B82F6" },
];

const WeeklyOeeChart = ({ className, data = [] }) => (
  <CardShell className={className}>
    <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-1.5">
      <CardLabel icon={TrendingUp} tone="text-[#0F1D24]">
        Last 7 Days · OEE Performance
      </CardLabel>
      <div className="flex flex-wrap items-center gap-2.5">
        {METRICS.map((m) => (
          <div key={m.key} className="flex items-center gap-1 text-[9px] font-medium text-[#0F1D24]">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: m.color }} />
            {m.label}
          </div>
        ))}
      </div>
    </div>

    <div className="mt-2 flex min-h-0 flex-1 items-stretch gap-1.5 sm:gap-3">
      {data.map((d) => (
        <div key={d.day} className="flex min-h-0 flex-1 flex-col items-center">
          <div className="relative flex h-full w-full min-h-0 flex-1 items-end justify-center gap-[3px] border-b border-[#C6C6C6]/60">
            {METRICS.map((m) => (
              <div
                key={m.key}
                title={`${m.label}: ${d[m.key]}%`}
                className="w-full max-w-[9px] rounded-t-sm transition-all"
                style={{ height: `${d[m.key]}%`, backgroundColor: m.color }}
              />
            ))}
          </div>
          <span className="mt-1 flex-shrink-0 text-[9px] font-semibold text-[#9B9B9B]">{d.day}</span>
        </div>
      ))}
    </div>
  </CardShell>
);

export default WeeklyOeeChart;