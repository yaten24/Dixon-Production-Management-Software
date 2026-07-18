import React from "react";
import { Award } from "lucide-react";
import { CardShell, CardLabel } from "./CardPrimitives";

const SummaryCard = ({ className, icon, title, rows = [], footer }) => (
  <CardShell className={className}>
    <CardLabel icon={icon}>{title}</CardLabel>
    <div className="mt-1.5 flex flex-1 flex-col justify-center gap-1">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between text-[11px]">
          <span className="text-[#9B9B9B]">{r.label}</span>
          <span className="font-bold text-[#0F1D24]">{r.value}</span>
        </div>
      ))}
    </div>
    {footer && (
      <div className="mt-1 flex flex-shrink-0 items-center gap-1 rounded-sm bg-[#FDC94D]/15 px-1.5 py-1 text-[9px] font-semibold text-[#0F1D24]">
        <Award size={10} className="text-[#FDC94D]" />
        {footer}
      </div>
    )}
  </CardShell>
);

export default SummaryCard;