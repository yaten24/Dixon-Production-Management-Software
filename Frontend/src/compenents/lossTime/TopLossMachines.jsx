import React from "react";
import { FaCogs } from "react-icons/fa";

const TopLossMachines = ({ data }) => {
  return (
    <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#C6C6C6]/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <FaCogs className="text-sm text-[#0F1D24]" />
          <h2 className="text-xs font-bold uppercase tracking-wide text-[#0F1D24]">Top 10 Loss Machines</h2>
        </div>
        <span className="text-[10px] text-[#9B9B9B]">{data.length} Machines</span>
      </div>

      <div className="max-h-[420px] overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-[#F5F5F5]">
            <tr className="border-b border-[#C6C6C6]/50">
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase text-[#9B9B9B]">Rank</th>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase text-[#9B9B9B]">Hall</th>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase text-[#9B9B9B]">Machine</th>
              <th className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase text-[#9B9B9B]">Events</th>
              <th className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase text-[#9B9B9B]">Loss Time</th>
              <th className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase text-[#9B9B9B]">Prod. Loss</th>
            </tr>
          </thead>
          <tbody>
            {data.map((machine, index) => (
              <tr key={machine.machine} className={`border-b border-[#C6C6C6]/30 transition-colors duration-200 hover:bg-[#F5F5F5] ${index % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]/50"}`}>
                <td className="px-2 py-1.5">
                  <div className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white ${index === 0 ? "bg-red-600" : index === 1 ? "bg-orange-500" : index === 2 ? "bg-[#FDC94D] text-[#0F1D24]" : "bg-[#0F1D24]"}`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <span className="rounded border border-[#0F1D24]/15 bg-[#0F1D24]/5 px-2 py-0.5 text-[10px] font-medium text-[#0F1D24]">{machine.hall}</span>
                </td>
                <td className="px-2 py-1.5 text-[11px] font-semibold text-[#0F1D24]">{machine.machine}</td>
                <td className="px-2 py-1.5 text-center text-[11px] font-semibold text-[#0F1D24]">{machine.events}</td>
                <td className="px-2 py-1.5 text-center text-[11px] font-bold text-red-600">{machine.lossMinutes} min</td>
                <td className="px-2 py-1.5 text-center text-[11px] font-bold text-[#B4884A]">{machine.productionLoss}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-3 py-1.5">
        <span className="text-[10px] text-[#9B9B9B]">Showing Top {data.length} Machines</span>
        <span className="text-[10px] font-medium text-[#0F1D24]">Sorted by Loss Time</span>
      </div>
    </div>
  );
};

export default TopLossMachines;