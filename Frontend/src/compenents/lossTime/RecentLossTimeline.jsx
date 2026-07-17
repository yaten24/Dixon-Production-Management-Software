import React from "react";
import { FaClock, FaCogs, FaIndustry, FaExclamationTriangle, FaUser, FaBoxOpen } from "react-icons/fa";

const RecentLossTimeline = ({ data }) => {
  return (
    <div className="overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500 shadow-sm">
            <FaExclamationTriangle className="text-[10px] text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">Recent Loss Events</h2>
            <p className="text-[9px] text-[#9B9B9B]">Latest machine downtime activities</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-[#0F1D24]">{data.length} Events</span>
      </div>

      <div className="max-h-[380px] space-y-2 overflow-y-auto p-2">
        {data.length === 0 && (
          <p className="py-6 text-center text-[10px] text-[#9B9B9B]">No loss events recorded for this date.</p>
        )}

        {data.map((item, index) => (
          <div key={item.id} className="flex gap-2">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 shadow-sm">
                <FaExclamationTriangle className="text-[9px] text-white" />
              </div>
              {index !== data.length - 1 && <div className="mt-1 w-px flex-1 bg-[#C6C6C6]" />}
            </div>

            <div className="mb-0.5 flex-1 rounded border border-[#C6C6C6]/50 bg-[#F5F5F5]/60 transition-all duration-200 hover:bg-white hover:shadow-sm">
              <div className="flex items-center justify-between border-b border-[#C6C6C6]/50 px-2 py-1.5">
                <div>
                  <h3 className="text-[11px] font-semibold text-[#0F1D24]">{item.reason}</h3>
                  <p className="mt-0.5 text-[9px] text-[#9B9B9B]">{item.date}</p>
                </div>
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">{item.lossMinutes} min</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-2 text-[10px] lg:grid-cols-4">
                <div className="flex items-center gap-1">
                  <FaIndustry className="shrink-0 text-[10px] text-[#0F1D24]" />
                  <span className="truncate text-[#0F1D24]">{item.hall}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaCogs className="shrink-0 text-[10px] text-[#0F1D24]" />
                  <span className="truncate text-[#0F1D24]">{item.machine}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="shrink-0 text-[10px] text-[#B4884A]" />
                  <span className="truncate text-[#0F1D24]">{item.startTime} - {item.endTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="shrink-0 text-[10px] text-[#0F1D24]" />
                  <span className="truncate text-[#0F1D24]">{item.operator}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaBoxOpen className="shrink-0 text-[10px] text-[#0F1D24]" />
                  <span className="truncate text-[#0F1D24]">{item.part}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase text-[#9B9B9B]">Shift</span>
                  <p className="font-semibold text-[#0F1D24]">{item.shift}</p>
                </div>
                <div>
                  <span className="text-[8px] uppercase text-[#9B9B9B]">Prod Loss</span>
                  <p className="font-bold text-red-600">{item.productionLoss}</p>
                </div>
                <div>
                  <span className="text-[8px] uppercase text-[#9B9B9B]">Status</span>
                  <span className="mt-0.5 inline-flex rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">Resolved</span>
                </div>
              </div>

              {item.remarks && (
                <div className="border-t border-[#C6C6C6]/50 bg-white px-2 py-1.5">
                  <p className="mb-0.5 text-[8px] uppercase text-[#9B9B9B]">Remarks</p>
                  <p className="text-[10px] text-[#0F1D24]">{item.remarks}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#C6C6C6]/40 bg-[#F5F5F5]/70 px-2.5 py-1">
        <span className="text-[9px] text-[#9B9B9B]">Showing latest downtime events</span>
        <span className="text-[9px] font-medium text-[#0F1D24]">Loss Time Timeline</span>
      </div>
    </div>
  );
};

export default RecentLossTimeline;