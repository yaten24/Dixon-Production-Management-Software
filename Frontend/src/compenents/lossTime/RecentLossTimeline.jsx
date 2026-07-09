import React from "react";
import {
  FaClock,
  FaCogs,
  FaIndustry,
  FaExclamationTriangle,
  FaUser,
  FaBoxOpen,
} from "react-icons/fa";

const RecentLossTimeline = ({ data }) => {
  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 shadow-sm">
            <FaExclamationTriangle className="text-[10px] text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
              Recent Loss Events
            </h2>
            <p className="text-[9px] text-gray-500">
              Latest machine downtime activities
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-blue-600">
          {data.length} Events
        </span>
      </div>

      {/* Timeline */}
      <div className="max-h-[420px] space-y-2.5 overflow-y-auto p-2.5">
        {data.map((item, index) => (
          <div key={item.id} className="flex gap-2.5">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 shadow-sm">
                <FaExclamationTriangle className="text-[9px] text-white" />
              </div>

              {index !== data.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-gray-200" />
              )}
            </div>

            {/* Card */}
            <div className="mb-0.5 flex-1 rounded border border-gray-200 bg-gray-50/70 transition-all duration-200 hover:bg-white hover:shadow-sm">
              {/* Top */}
              <div className="flex items-center justify-between border-b border-gray-200 px-2.5 py-1.5">
                <div>
                  <h3 className="text-[11px] font-semibold text-gray-800">
                    {item.reason}
                  </h3>
                  <p className="mt-0.5 text-[9px] text-gray-500">{item.date}</p>
                </div>

                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                  {item.lossMinutes} min
                </span>
              </div>

              {/* Body */}
              <div className="grid grid-cols-2 gap-1.5 p-2.5 text-[10px] lg:grid-cols-4">
                <div className="flex items-center gap-1">
                  <FaIndustry className="shrink-0 text-[10px] text-blue-600" />
                  <span className="truncate">{item.hall}</span>
                </div>

                <div className="flex items-center gap-1">
                  <FaCogs className="shrink-0 text-[10px] text-green-600" />
                  <span className="truncate">{item.machine}</span>
                </div>

                <div className="flex items-center gap-1">
                  <FaClock className="shrink-0 text-[10px] text-orange-600" />
                  <span className="truncate">
                    {item.startTime} - {item.endTime}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <FaUser className="shrink-0 text-[10px] text-purple-600" />
                  <span className="truncate">{item.operator}</span>
                </div>

                <div className="flex items-center gap-1">
                  <FaBoxOpen className="shrink-0 text-[10px] text-indigo-600" />
                  <span className="truncate">{item.part}</span>
                </div>

                <div>
                  <span className="text-[8px] uppercase text-gray-500">Shift</span>
                  <p className="font-semibold text-gray-700">{item.shift}</p>
                </div>

                <div>
                  <span className="text-[8px] uppercase text-gray-500">
                    Prod Loss
                  </span>
                  <p className="font-bold text-orange-600">
                    {item.productionLoss}
                  </p>
                </div>

                <div>
                  <span className="text-[8px] uppercase text-gray-500">Status</span>
                  <span className="mt-0.5 inline-flex rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold text-green-700">
                    Resolved
                  </span>
                </div>
              </div>

              {/* Remarks */}
              {item.remarks && (
                <div className="border-t border-gray-200 bg-white px-2.5 py-1.5">
                  <p className="mb-0.5 text-[8px] uppercase text-gray-500">
                    Remarks
                  </p>
                  <p className="text-[10px] text-gray-700">{item.remarks}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-3 py-1.5">
        <span className="text-[9px] text-gray-500">
          Showing latest downtime events
        </span>

        <span className="text-[9px] font-medium text-blue-600">
          Loss Time Timeline
        </span>
      </div>
    </div>
  );
};

export default RecentLossTimeline;