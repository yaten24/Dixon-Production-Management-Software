import React from "react";
import { FaBoxes, FaClock, FaChartLine, FaPercentage } from "react-icons/fa";

const MiniCard = ({ title, value, subtitle, icon, bg }) => (
  <div className="rounded border border-[#C6C6C6]/50 bg-white p-2.5 transition-all duration-300 hover:border-[#0F1D24]/30 hover:shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#9B9B9B]">{title}</p>
        <h2 className="mt-1 text-lg font-bold text-[#0F1D24]">{value}</h2>
        <p className="mt-0.5 text-[10px] text-[#9B9B9B]">{subtitle}</p>
      </div>
      <div className={`flex h-9 w-9 items-center justify-center rounded ${bg}`}>{icon}</div>
    </div>
  </div>
);

const ProductionLossCard = ({ productionLoss, totalLossMinutes, averageDowntime, lossPercentage }) => {
  return (
    <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#C6C6C6]/50 px-3 py-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F1D24]">Production Loss Overview</h2>
          <p className="mt-0.5 text-[10px] text-[#9B9B9B]">Overall production loss KPI summary</p>
        </div>
        <span className="text-[10px] font-medium text-[#0F1D24]">Live Analysis</span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2.5 lg:grid-cols-4">
        <MiniCard title="Production Loss" value={productionLoss} subtitle="Lost Production Qty" icon={<FaBoxes size={15} className="text-white" />} bg="bg-red-500" />
        <MiniCard title="Total Downtime" value={`${totalLossMinutes}m`} subtitle="Overall Loss Time" icon={<FaClock size={15} className="text-[#FDC94D]" />} bg="bg-[#0F1D24]" />
        <MiniCard title="Avg Downtime" value={`${averageDowntime}m`} subtitle="Per Event" icon={<FaChartLine size={15} className="text-[#FDC94D]" />} bg="bg-[#0F1D24]" />
        <MiniCard title="Loss %" value={`${lossPercentage}%`} subtitle="Production Impact" icon={<FaPercentage size={15} className="text-white" />} bg="bg-orange-500" />
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-3 py-2">
        <span className="text-[10px] text-[#9B9B9B]">Production Performance Summary</span>
        <span className="text-[10px] font-medium text-[#0F1D24]">Updated from Loss Time Data</span>
      </div>
    </div>
  );
};

export default ProductionLossCard;