import React from "react";
import { PieChart } from "lucide-react";
import PlannedUnplannedPie from "./PlannedUnplannedPie";

const PlannedUnplannedCard = ({ plannedVsUnplanned = { planned: 0, unplanned: 0 } }) => {
  const total = (plannedVsUnplanned.planned || 0) + (plannedVsUnplanned.unplanned || 0);

  return (
    <div className="rounded-sm border border-[#C6C6C6] bg-white">
      <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#0F1D24] text-white">
            <PieChart size={14} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#0F1D24]">Planned vs Unplanned</p>
            <p className="text-xs text-[#9B9B9B]">Mould change breakdown</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-[#9B9B9B]">TOTAL</p>
          <p className="text-sm font-bold text-[#0F1D24]">{total}</p>
        </div>
      </div>

      <PlannedUnplannedPie planned={plannedVsUnplanned.planned} unplanned={plannedVsUnplanned.unplanned} />
    </div>
  );
};

export default PlannedUnplannedCard;